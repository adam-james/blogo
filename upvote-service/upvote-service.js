const app = require("express")();
const morgan = require("morgan");
const amqp = require("amqplib");
const cache = require("./cache");
const { PORT } = process.env;

app.use(morgan("dev"));

// TODO pub/sub with post-service
// TODO 24 expirations

// Config
const AMQP_URL = "amqp://rabbitmq";
const EXCHANGE = "pubsub";
const ROUTING_KEY = "posts.new";
const QUEUE = "posts.new";

app.get("/upvotes", async (req, res) => {
  try {
    const ids = await cache.zrevrangeAsync("upvotes", 0, 9);
    const posts = [];
    for (let id of ids) {
      posts.push(await cache.hgetallAsync(`post:${id}`));
    }
    res.json({ posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.post("/upvotes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await cache.hgetallAsync(`post:${id}`);

    if (!post) {
      return res.status(404).json({ notFound: true });
    }

    const updated = {
      ...post,
      upvotes: parseInt(post.upvotes, 10) + 1
    };

    await cache.hmsetAsync(`post:${post._id}`, updated);
    await cache.zaddAsync("upvotes", updated.upvotes, post._id);

    res.json({ post: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

main();

async function main() {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    channel.assertExchange(EXCHANGE, "topic", { durable: false });

    const queue = await channel.assertQueue(QUEUE, {});

    channel.bindQueue(queue.queue, EXCHANGE, ROUTING_KEY);

    console.log("Waiting for messages...");

    channel.consume(
      queue.queue,
      msg => {
        const post = JSON.parse(msg.content.toString());
        const upvotes = 0;
        console.log(`Sub received message "${msg.content.toString()}"`);
        cache.hmset(`post:${post._id}`, { ...post, upvotes });
        cache.zadd("upvotes", upvotes, post._id);
      },
      { noAck: true }
    );

    app.listen(PORT);
    console.log(`Listening on port ${PORT}.`);
  } catch (err) {
    throw err;
  }
}

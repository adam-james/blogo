const app = require("express")();
const morgan = require("morgan");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const amqp = require("amqplib");
const { DATABASE_URL, PORT } = process.env;

// Model

const Post = mongoose.model("Post", { body: String });

// Config

const dbUrl = DATABASE_URL || "mongodb://post_service_db:27017/post-service";
mongoose.connect(dbUrl, {
  useNewUrlParser: true
});

app.use(morgan("dev"));

const AMQP_URL = "amqp://rabbitmq";
const EXCHANGE = "pubsub";
const ROUTING_KEY = "posts.new";

// Routes

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json({ posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.post("/posts", json(), async (req, res) => {
  try {
    const {
      post: { body }
    } = req.body;
    const newPost = new Post({ body });
    const post = await newPost.save();

    // PUB/SUB stuff
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();
    channel.assertExchange(EXCHANGE, "topic", { durable: false });
    channel.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(post)));

    res.status(201).json({ post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.listen(PORT);
console.log(`Listening on port ${PORT}.`);

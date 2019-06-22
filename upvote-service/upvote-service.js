const app = require("express")();
const morgan = require("morgan");
const cache = require("./cache");
const { PORT } = process.env;

app.use(morgan("dev"));

// TODO pub/sub with post-service
// TODO 24 expirations

const posts = [
  {
    _id: "5d0e214ed6c4b700287ddedc",
    body: "coffee is ready!",
    upvotes: 0
  },
  {
    _id: "5d0b2d80f7ad7b006bd9d605",
    body: "i could get used to this",
    upvotes: 0
  },
  {
    _id: "5d0b2d8bf7ad7b006bd9d606",
    body: "just put something in the readme",
    upvotes: 0
  }
];

for (let post of posts) {
  cache.hmset(`post:${post._id}`, post);
  cache.zadd("upvotes", post.upvotes, post._id);
}

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

app.listen(PORT);
console.log(`Listening on port ${PORT}.`);

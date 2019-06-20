const app = require("express")();
const morgan = require("morgan");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const { DATABASE_URL, PORT } = process.env;

// Model

const Post = mongoose.model("Post", { body: String });

// Config

const dbUrl = DATABASE_URL || "mongodb://post_service_db:27017/post-service";
mongoose.connect(dbUrl, {
  useNewUrlParser: true
});

app.use(morgan("dev"));

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
    const newPost = await new Post({ body });
    const post = await newPost.save();
    res.status(201).json({ post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.listen(PORT);
console.log(`Listening on port ${PORT}.`);

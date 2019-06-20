const app = require("express")();
const fetch = require("node-fetch");
const morgan = require("morgan");
const { json } = require("body-parser");
const { PORT, POST_SERVICE_URL } = process.env;

app.use(morgan("dev"));

app.get("/posts", async (req, res) => {
  try {
    const url = `${POST_SERVICE_URL}/posts`;
    const resp = await fetch(url);
    const { posts } = await resp.json();
    res.json({ posts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.post("/posts", json(), async (req, res) => {
  try {
    const url = `${POST_SERVICE_URL}/posts`;
    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: { "Content-Type": "application/json" }
    });
    const { post } = await resp.json();
    res.status(201).json({ post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.listen(PORT);
console.log(`Listening on port ${PORT}.`);

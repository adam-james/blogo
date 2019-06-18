const app = require("express")();
const fetch = require("node-fetch");
const pino = require("express-pino-logger")();
const port = 3000;
const { POST_SERVICE_URL } = process.env;

app.use(pino);

app.get("/posts", async (req, res) => {
  try {
    const url = `${POST_SERVICE_URL}/posts`;
    const resp = await fetch(url);
    const { posts } = await resp.json();
    res.json({ posts });
  } catch (err) {
    // TODO use pino logger
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.listen(port);
console.log(`Listening on port ${port}.`);

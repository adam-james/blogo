const app = require("express")();
const pino = require("express-pino-logger")();
const port = 5000;

app.use(pino);

app.get("/posts", (req, res) => {
  const posts = [
    { id: 1, body: "hi" },
    { id: 2, body: "bonjour" },
    { id: 3, body: "hola" }
  ];
  res.json({ posts });
});

app.listen(port);
console.log(`Listening on port ${port}.`);

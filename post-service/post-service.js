const app = require("express")();
const pino = require("express-pino-logger")();
const { PORT } = process.env;

app.use(pino);

app.get("/posts", (req, res) => {
  const posts = [
    { id: 1, body: "hi" },
    { id: 2, body: "bonjour" },
    { id: 3, body: "hola" },
    { id: 4, body: "ciao" }
  ];
  res.json({ posts });
});

app.listen(PORT);
console.log(`Listening on port ${PORT}.`);

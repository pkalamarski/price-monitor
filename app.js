const express = require("express");
const { initializeAuth } = require("./src/authorize");
const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(port, () => {
  initializeAuth();
  console.log("Ready to serve requests.");
});

require("dotenv").config();
const express = require("express");
const { checkMapping } = require("./src/checkMapping");
const { initialize } = require("./src/initialize");

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/check-mapping", async (req, res) => {
  if (!req.query.url) {
    res.send("No URL provided");
    return;
  }

  const results = await checkMapping(req.query.url);

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(results, null, 2));
});

app.listen(port, () => {
  initialize();
  console.log("Ready to serve requests");
});

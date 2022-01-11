const express = require("express");
const helmet = require("helmet");
const router = require("./routes");
require("./db.js");

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "2kb" }));

app.use("/", router);

module.exports = app;

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const api = require("./api");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = require("./config/keys").mongoURI;

mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// app.get("/test", (req, res) => res.json({ msg: "test" }));

app.use("/api", api);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));

// app.use(express.static("public"));

const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");

const Data = require("./models/Data");

router.get("/test", (req, res) => res.json({ msg: "api test" }));

router.post("/log-data", (req, res) => {
  const newData = new Data({
    suction: {
      temperature: req.body.suction.temperature,
      pressure: req.body.suction.pressure
    },
    liquid: {
      temperature: req.body.liquid.temperature,
      pressure: req.body.liquid.pressure
    }
  });

  newData.save().then(data => res.json(data));
});

router.get("/current", (req, res) => {
  Data.findOne()
    .sort({ timeStamp: -1 })
    .then(data => res.json(data));
});

module.exports = router;

const express = require("express");
const ptcalc = require("./utils");

const router = express.Router();
// const mongoose = require("mongoose");

const Data = require("./models/Data");

router.get("/test", (req, res) => res.json({ msg: "api test" }));

router.post("/log-data", (req, res) => {
  console.log(req.body);
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

  newData
    .save()
    .then(data => res.json(data))
    .catch(err => res.json(err));
});

router.get("/current", (req, res) => {
  Data.findOne()
    .sort({ timeStamp: -1 })
    .then(data => {
      const superheat =
        data.suction.temperature - ptcalc(data.suction.pressure);
      const subcooling = data.liquid.temperature - ptcalc(data.liquid.pressure);
      let dataObj = JSON.parse(JSON.stringify(data));
      dataObj.superheat = superheat;
      dataObj.subcooling = subcooling;

      res.json(dataObj);
      console.log(dataObj);
    })
    .catch(err => res.json(err));
});

router.get("/get-data", (req, res) => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);

  Data.find({ timeStamp: { $gte: startDate } })
    .sort({ timeStamp: 1 })
    .exec((err, data) => {
      if (err) {
        res.json(err);
      }
      res.json(data);
    });
});

module.exports = router;

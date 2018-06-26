const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema({
  timeStamp: {
    type: Schema.Types.Date,
    default: Date.now
  },
  suction: {
    temperature: {
      type: Schema.Types.Number
    },
    pressure: {
      type: Schema.Types.Number
    }
  },
  liquid: {
    temperature: {
      type: Schema.Types.Number
    },
    pressure: {
      type: Schema.Types.Number
    }
  }
});

module.exports = Data = mongoose.model("data", DataSchema);

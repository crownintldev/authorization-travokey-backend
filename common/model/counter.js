const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const counterSchema = new mongoose.Schema(
  {
    _id: String, // The name of the collection for which this counter is used
    seq: {
      // Last used number
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
    versionKey: false,
  }
);

counterSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Counter", counterSchema);

const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const moduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      lowercase: true,
      required: [true, "Please enter the title"],
    },
    key: {
      type: String,
      lowercase: true,
      required: [true, "Please enter the key"],
    },
    description: {
      type: String,
      lowercase: true,
      required: [true, "Please enter the description"],
    },
    updatedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);
moduleSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Module", moduleSchema);

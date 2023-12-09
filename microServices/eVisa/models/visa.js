const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const documentSchema = new mongoose.Schema({
  image: {
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  resume: {
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
});
const visa = new mongoose.Schema(
  {
    whereFrom: {
      type: String,
      trim: true,
      lowercase: true,
      required: [
        true,
        "Please enter the country from which you are travelling",
      ],
    },
    goingTo: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please enter the destination"],
    },
    category: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "Please enter the visaCategory"],
    },
    type: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please enter the visaType"],
    },
    duration: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please enter the duration"],
    },
    documents: [documentSchema],
    updatedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "",
    },
  },
  { timestamps: true, versionKey: false }
);
visa.plugin(aggregatePaginate);
module.exports = mongoose.model("Visa", visa);

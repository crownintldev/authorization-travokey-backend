const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please enter the subscription name"],
    },
    duration: {
      type: Number,
      trim: true,
      enum: [1, 3, 6, 9, 12], // Allowed file types
      required: [true, "Please provide a valid duration."],
    },
    price: {
      type: Number,
      required: [true, "Please enter the price"],
    },
    features: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "Please enter the visaCategory"],
    },
    product: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please enter the visaType"],
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
subscriptionSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Subscription", subscriptionSchema);

const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const paymentDetailsSchema = new mongoose.Schema(
  {
    payCardId: {
      type: String,
      unique: true,
    },
    referenceId: {
      type: String,
    },
    number: {
      type: String,
      required: [true, "Please enter the card Number"],
    },
    name: {
      type: String,
      required: [true, "Please provide card holder Name."],
    },
    cvc: {
      type: Number,
      required: [true, "Please enter the price"],
    },
    expiry: {
      type: String,
      required: [true, "Please enter the expiry date"],
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
paymentDetailsSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("PaymentDetail", paymentDetailsSchema);

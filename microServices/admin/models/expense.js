const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const expenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please provide an input name."],
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please provide a valid category."],
    },
    amount: {
      type: Number,
      required: [true, "Please provide a valid amount."],
    },
    remarks: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please provide a valid remarks"],
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
  {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
    versionKey: false,
  }
);

expenseSchema.plugin(aggregatePaginate);
// module.exports = mongoose.model("Expense", expenseSchema);
module.exports = expenseSchema;

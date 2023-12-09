const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const FileSchema = new mongoose.Schema({
  filename: String,
  data: Buffer,
  contentType: String,
});
const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
    },
    inputName: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please provide an input name."],
    },
    inputType: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["pdf", "jpeg", "png"], // Allowed file types
      required: [true, "Please provide a valid input type."],
    },
    inputSize: {
      type: Number,
      //   trim: true,
      //   lowercase: true,
      //   enum: ["small", "medium", "large"], // Example size values
      required: [true, "Please provide a valid input size.must be a number"],
    },
    attachments: [FileSchema],
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

documentSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Document", documentSchema);

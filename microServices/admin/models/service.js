const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const docxSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  mimeType: String,
  size: Number,
});
const attachmentSchema = new mongoose.Schema(
  {
    doc1: docxSchema,
    doc2: docxSchema,
    doc3: docxSchema,
    doc4: docxSchema,
    doc5: docxSchema,
  },
  { _id: false }
);
const serviceSchema = new mongoose.Schema(
  {
    serviceId: {
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
      type: Number,
      trim: true,
      lowercase: true,
      required: [true, "Please provide a valid category."],
    },
    remarks: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please provide a valid remarks"],
    },
    attachments: [attachmentSchema],
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

serviceSchema.plugin(aggregatePaginate);

// module.exports = mongoose.model("Service", serviceSchema);
module.exports = { serviceSchema, attachmentSchema, docxSchema };

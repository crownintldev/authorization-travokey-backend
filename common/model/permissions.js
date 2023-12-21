const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const permissionsSchema = new mongoose.Schema(
  {
    permissionId: {
      type: String,
      unique: true,
      required: [true, "Please provide a permission ID."],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description of the permission."],
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
    },
    action: [
      {
        type: String,
        enum: ["create", "read", "update", "delete"],
      },
    ],
    // subject: {
    //   type: String,
    //   unique: true,
    //   trim: true,
    // },
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

permissionsSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Permission", permissionsSchema);

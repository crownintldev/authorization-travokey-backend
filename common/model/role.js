const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const roleSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please provide title."],
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
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

roleSchema.plugin(aggregatePaginate);
// module.exports = mongoose.model("Role", roleSchema);

// Export the User model
const Role = mongoose.model("Role", roleSchema);

// Export the User model
module.exports = Role;

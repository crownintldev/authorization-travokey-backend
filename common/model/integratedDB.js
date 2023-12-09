const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const configSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
});
const IntegratedDB = new mongoose.Schema(
  {
    intDbId: {
      type: String,
      required: true,
      unique: true,
    },
    dbName: {
      type: String,
      trim: true,
      required: [true, "Please enter the Database Name"],
    },
    dbIcon: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "delete"],
      default: "pending",
    },
    description: {
      type: String,
      trim: true,
    },
    connectionDetails: {
      host: {
        type: String,
        required: [true, "Host is required!"],
      },
      port: {
        type: Number,
        required: [true, "Port is required!"],
      },
    },
    authDetails: {
      username: {
        type: String,
        required: [true, "Username is required!"],
      },
      password: {
        type: String,
        required: [true, "Password is required!"],
      },
    },

    lastAccessed: {
      type: Date,
    },
    connectionTestStatus: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
    errorLogs: [
      {
        message: String,
        timestamp: Date,
      },
    ],
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
IntegratedDB.plugin(aggregatePaginate);
module.exports = mongoose.model("IntegratedDB", IntegratedDB);

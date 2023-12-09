const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const passportDocsSchema = new mongoose.Schema(
  {
    cnic: {
      front: {
        type: String,
        unique: true,
        required: [true, "CNIC front image is required"],
      },
      back: {
        type: String,
        unique: true,
        required: [true, "CNIC back image is required"],
      },
    },
    scan: {
      passport: {
        type: ObjectId,
        ref: "Passport",
        required: [true, "Passport ID is required"],
        index: true,
      },
    },
    image: {
      type: String,
      unique: true,
      required: [true, "Passport image is required"],
    },
    frc: {
      type: String,
      unique: true,
      required: [true, "FRC image is required"],
    },
    mrc: {
      type: String,
      unique: true,
      required: [true, "MRC image is required"],
    },  
    covidCard: {
      type: String,
      unique: true,
      required: [true, "COVID card is required"],
    },
    polioCard: {
      type: String,
      unique: true,
      required: [true, "Polio card is required"],
    },
    bankStatement: {
      type: String,
      unique: true,
      required: [true, "Bank statement is required"],
    },
    maintenanceLetter: {
      type: String,
      unique: true,
      required: [true, "Maintenance letter is required"],
    },
    employmentLetter: {
      type: String,
      unique: true,
      required: [true, "Employment letter is required"],
    },
    employStatement: {
      type: String,
      unique: true,
      required: [true, "Employment statement is required"],
    },
    propertyDocs: {
      type: String,
      unique: true,
      required: [true, "Property documents are required"],
    },
    otherAssets: [
      {
        type: String,
        unique: true,
        required: [true, "Other assets are required"],
      },
    ],
    otherUploads: [
      {
        type: String,
        unique: true,
        required: [true, "Other uploads are required"],
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("PassportDoc", passportDocsSchema);

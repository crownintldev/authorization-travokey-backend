"use strict";
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secretKey = process.env.SECRET_KEY;

// Ensure that the database connections are established
// Establish the "travokey" database connection

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      default: 0,
      unique: true,
    },
    dbConnectionString: {
      type: String,
    },
    fullName: {
      type: String,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      validate: [validateEmail, "Please fill a valid email address"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "active", "block", "delete", "rejected"],
      default: "pending",
    },
    accountSetupStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    address: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["superAdmin", "admin"],
    },
    dbConfig: {
      type: String,
      enum: ["manual", "cloud"],
      default: "cloud",
    },
    dbName: {
      type: String,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    forgetPasswordAuthToken: {
      type: String,
    },
    profileImageUrl: {
      type: String,
    },
    token: {
      type: String,
    },
    dbAccess: {
      type: String,
      enum: ["allowed", "denied"],
      default: "denied",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    accountActivationDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.methods.generateAuthToken = async function (extra = "") {
  let user = this;
  let access = "auth";

  let token = jwt
    .sign(
      {
        _id: user._id.toHexString(),
        access,
        email: user.email,
      },
      secretKey,
      {
        expiresIn: "10d",
      }
    )
    .toString();
  user.token = token;
  user.lastLogin = new Date();
  return user.save().then(() => {
    return token;
  });
};

//===================== Password hash middleware =================//
UserSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});
//===================== dbConnectionString hash middleware =================//

//===================== Helper method for validating user's password =================//
UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  try {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      cb(err, isMatch);
    });
  } catch (error) {
    console.log("=========== Error in Comparing Password", error);
  }
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, secretKey);
  } catch (error) {
    return Promise.reject(error);
  }

  return User.findOne({
    _id: decoded._id,
    token: token,
  });
};

// Export the User model
const User = mongoose.model("User", UserSchema);

// Export the User model
module.exports = User;

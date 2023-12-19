const mongoose = require("mongoose");
const { requireWalk } = require("../utils/requireWalk");

// Configuration for Mongoose
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;

// Define Mongoose connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: "majority",
};

// Mongoose event handling
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected");
});

mongoose.connection.on("reconnected", () => {
  console.log("Mongoose reconnected");
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("Mongoose error: " + error);
  mongoose.disconnect();
});

// Export a function to establish the database connections
module.exports = async function (connectionString) {
  // MongoDB connection URL (You can set this in your environment variables)

  try {
    // Connect to the default database using Mongoose
    await mongoose.connect(connectionString, mongooseOptions);
    // Load your models here, after the successful connection
    let requireModels = requireWalk(__dirname + "/../model");
    requireModels();
    // (The "connectToDatabase" function wasn't used in the provided code. If you need it, uncomment and modify accordingly.)
    // Example: Connect to other databases based on your configuration
    // connectToDatabase("travokey");
  } catch (err) {
    console.log(
      "MongoDB connection error. Please make sure MongoDB is running.===",
      err
    );
    process.exit(1);
  }
};

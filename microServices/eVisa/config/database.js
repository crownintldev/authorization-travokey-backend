const mongoose = require("mongoose");

// Configuration for Mongoose
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;

// Define Mongoose connection options
const mongooseOptions = {
  useNewUrlParser: true, // Use new MongoDB driver's URL string parser instead of the older, deprecated one.
  useUnifiedTopology: true, // Use the new topology engine, which fixes several issues in the older one.
 
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
    console.log("===== MongoDB Connection Established evisa22=====");
    // Load your models here, after the successful connection
    // (The "connectToDatabase" function wasn't used in the provided code. If you need it, uncomment and modify accordingly.)
    // Example: Connect to other databases based on your configuration
    // connectToDatabase("travokey");
  } catch (err) {
    console.error(err);
    console.log(
      "MongoDB connection error. Please make sure MongoDB is running."
    );
    process.exit(1);
  }
};

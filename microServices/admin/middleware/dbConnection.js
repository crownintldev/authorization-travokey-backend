const mongoose = require("mongoose");
const { decrypt } = require("../../../common/utils/crypto");
const AppError = require("../../../common/utils/appError");
const dbConnections = {};
const { requireWalk } = require("../../../common/utils/requireWalk");
const expenseSchema = require("../models/expense");
const { serviceSchema } = require("../models/service");

mongoose.Promise = global.Promise;

const mongoOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: true,
  poolSize: 10, //handle connections to db at once
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
};

// Centralized error handler
function errorHandler(err, req, res, next) {
  console.error("An error occurred:", err);
  res.status(500).json({ error: "Internal Server Error" });
}

function validateHeaders(headers) {
  return headers["x-id"] && headers["x-user-id"] && headers["x-user-conn"];
}

const getOrEstablishConnection = async (userId, connectionString) => {
  let requireModels = requireWalk(__dirname + "/../models");
  requireModels();
  if (!dbConnections[userId]) {
    try {
      const newConnection = await mongoose.createConnection(
        connectionString,
        mongoOptions
      );

      newConnection.model("Expense", expenseSchema);
      newConnection.model("Service", serviceSchema);

      dbConnections[userId] = newConnection;
    } catch (error) {
      console.error(
        "Error establishing DB connection for user:",
        userId,
        error
      );
      throw new AppError("Establish Database connection error", 500);
    }
  }
  return dbConnections[userId];
};

async function dynamicDbConnection(req, res, next) {
  if (!validateHeaders(req.headers)) {
    res.status(400).json({ error: "Invalid or missing header information" });
    return;
  }

  try {
    const {
      "x-id": Id,
      "x-user-id": userId,
      "x-user-conn": encryptedConnectionString,
    } = req.headers;

    const connectionString = decrypt(encryptedConnectionString);
    const dbConnection = await getOrEstablishConnection(
      userId,
      connectionString
    );
    if (dbConnection) {
      req.db = dbConnection;
      req._id = Id;
      next();
    } else {
      return res.status(503).send({
        status: "error",
        message: "Db Connection Error",
      });
    }
  } catch (error) {
    // Pass errors to the centralized error handler
    next(error);
  }
}

module.exports = dynamicDbConnection;

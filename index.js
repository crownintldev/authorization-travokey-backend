"use strict";

// -----------------------------
// Environment Setup
// -----------------------------
// Import environment variables
require("dotenv").config();

// -----------------------------
// Module Imports
// -----------------------------
const express = require("express");
const cluster = require("cluster");
const os = require("os");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const helmet = require("helmet");

// Custom Module Imports
const AuthGateway = require("./routes/auth");
const UserGateway = require("./routes/user");
const ModuleGateway = require("./routes/module");
const roleGateway = require("./routes/role");
const permissionsGateway = require("./routes/permission");
const AppError = require("./common/utils/appError");
const errorController = require("./common/utils/errorController");
const connectToDb = require("./common/config/database");

// Passport Configuration
require("./common/utils/passport");

// -----------------------------
// Global Variables and Initialization
// -----------------------------
// Number of CPUs for clustering
const numCPUs = os.cpus().length;

// Database Connection URL
const url = process.env.TRAVOKEY_DBCONN;

// Establish Database Connection
connectToDb(url);

// -----------------------------
// Express App Initialization
// -----------------------------
const app = express();

// Security Middleware
app.use(helmet());

// Middleware Setup
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));

// -----------------------------
// Session and Passport Setup
// -----------------------------
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// -----------------------------
// Routes Setup
// -----------------------------
app.use("/auth", AuthGateway);
app.use("/user", UserGateway);
app.use("/module", ModuleGateway);
app.use("/permission", permissionsGateway);
app.use("/role", roleGateway);

// Base Route
app.get("/", async (req, res) => {
  try {
    res.json({ message: "Hello Travokey" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  }
});

// -----------------------------
// Error Handling
// -----------------------------
// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  throw new AppError(`Requested Url not found!`, 404);
});

// Error Controller
app.use(errorController);

// -----------------------------
// Server Initialization
// -----------------------------
if (cluster.isMaster) {
  // Fork worker processes for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker process exits
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Start the server in worker processes
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is listening on port ${PORT}`);
  });
}

// -----------------------------
// Miscellaneous/Comments
// -----------------------------
// Add any additional comments or temporarily unused code here

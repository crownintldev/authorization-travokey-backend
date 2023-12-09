"use strict";

// Environment Variables
require("dotenv").config();
const helmet = require("helmet");

// Module Imports
const express = require("express");
const cluster = require("cluster");
const os = require("os");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Custom Module Imports
const AuthGateway = require("./gateway/index");
const UserGateway = require("./gateway/user");
const VisaGateway = require("./gateway/visaRoutes");
const DocumentGateway = require("./gateway/documentRoutes");
const SubscriptionGateway = require("./gateway/subscription");
const IntegratedDb = require("./gateway/integratedDb");
const ModuleGateway = require("./gateway/module");

const AppError = require("./common/utils/appError");
const errorController = require("./common/utils/errorController");
const connectToDb = require("./common/config/database");
const { authenticate } = require("./common/middleware/authenticate");
const { default: axios } = require("axios");

// Number of CPUs
const numCPUs = os.cpus().length;
require("./common/utils/passport");
const url = process.env.TRAVOKEY_DBCONN;
// Database Connection
connectToDb(url);

// Initialize Express App
const app = express();
// Enable various security headers using Helmet middleware
app.use(helmet());
// Middlewares
app.use(cors());
app.use(passport.initialize());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true, // Set to true for HTTPS
      httpOnly: true, // Prevent client-side access
    },
  })
);
app.use(express.json()); // for parsing application/json
app.use(passport.session());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));

// Routes ==================================
app.use("/auth", AuthGateway);
app.use("/user", UserGateway);
app.use("/visa", VisaGateway);
app.use("/document", DocumentGateway);
app.use("/subscription", SubscriptionGateway);
app.use("/db", IntegratedDb);
app.use("/module", ModuleGateway);

// Proxy endpoints
app.use(
  "/admin",
  authenticate,
  createProxyMiddleware({
    target: process.env.API_ADMIN_URL,
    changeOrigin: true,
    pathRewrite: { [`^/admin`]: "" },
    onProxyReq: (proxyReq, req) => {
      // Forward the user details as headers
      if (req.user) {
        proxyReq.setHeader("X-Id", req.user._id);
        proxyReq.setHeader("X-User-Id", req.user.userId);
        proxyReq.setHeader("X-User-Conn", req.user.dbConnectionString);
        proxyReq.setHeader("X-User-Token", req.user.token);
        // Add other user details as required
      }

      if (req.is("multipart/form-data")) {
        // Handling multipart/form-data for streaming files
        // This might involve directly streaming the raw request input stream
        // or reconstructing the multipart payload with boundary
        // NOTE: This is complex and requires handling multipart boundaries and data format

        const contentType = req.headers["content-type"];
        proxyReq.setHeader("Content-Type", contentType);

        req.pipe(proxyReq); // Pipe the request input stream directly
      } else {
        if (req.body) {
          let bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
          proxyReq.end(); // End the request
        }
      }
    },
  })
);
app.use(
  "/evisa",
  createProxyMiddleware({
    target: process.env.API_EVISA_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/evisa`]: "",
    },
  })
);
app.get("/", async (req, res) => {
  try {
    // const response = await axios.get(
    //   `https://airlabs.co/api/v9/flights?api_key=e2930e1b-e1a9-468d-bb43-001bb7e8abcd`
    // );
    res.json({ message: "Hello Travokey" });
    // cluster.worker.kill();
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("An error occurred");
  }
});

//Routes end======================================
app.all("*", (req, res, next) => {
  throw new AppError(`Requested Url not found!`, 404);
});
app.use(errorController);

// Start Server
const PORT = process.env.PORT;
// app.listen(PORT, function () {
//   console.log(
//     `Server running on http://localhost:${PORT} Process ${process.pid}`
//   );
// });
// Check if the current process is the master process
if (cluster.isMaster) {
  // Fork worker processes
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker process exits
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Start the Express app in each worker process
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is listening on port ${PORT}`);
  });
}

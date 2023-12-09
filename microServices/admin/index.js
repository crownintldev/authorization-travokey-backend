require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConnectionMiddleware = require("./middleware/dbConnection");
const AppError = require("../../common/utils/appError");
const logger = require("morgan");
const errorController = require("../../common/utils/errorController");
const ExpenseRoutes = require("./routes/expenseRoutes");
const ServiceRoutes = require("./routes/serviceRoutes");
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

// Use CORS middleware to allow cross-origin requests
app.use(cors());
app.use(express.json());
app.use(logger("dev"));
// Use the middleware before any route that requires dynamic database connection

// Mount your router after setting up all your middlewares
app.use(router);

// Routes ==================================
app.use("/api", dbConnectionMiddleware, ExpenseRoutes);
app.use("/api", dbConnectionMiddleware, ServiceRoutes);
// app.use("/api", ExpenseRoutes);
app.use(errorController);

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Admin Server is running on port ${port}`);
});

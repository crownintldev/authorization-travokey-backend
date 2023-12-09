require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AppError = require("../../common/utils/appError");
const logger = require("morgan");
const connectToDb = require("./config/database");
const Routes = require("./routes/index");
const errorController = require("../../common/utils/errorController");

const app = express();
const port = process.env.PORT;

// Use CORS middleware to allow cross-origin requests
app.use(cors());
app.use(express.json());
app.use(logger("dev"));
const url = process.env.EVISADBCONN;
// Database Connection
connectToDb(url);
// Use the middleware before any route that requires dynamic database connection

// Mount your router after setting up all your middlewares
app.use(Routes);
//Routes end======================================
app.all("*", (req, res, next) => {
  throw new AppError(`Requested Url not found!`, 404);
});
app.use(errorController);
// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Admin Server is running on port ${port}`);
});

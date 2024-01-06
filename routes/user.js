const express = require("express");
const router = express.Router();
const usersJoi = require("../common/utils/validation/users");

const { authenticate } = require("../common/middleware/authenticate");
const {
  handleUserAccountStatus,
  handleUserDbStatus,
  getUsers,
  getDbUsers,
  handleCreateApp,
} = require("../common/controllers/userController");
router.post(
  "/userAccountStatus",
  usersJoi.handleUserAccountStatus,
  authenticate,
  handleUserAccountStatus
);
router.post(
  "/userDbStatus",
  usersJoi.handleUserDbStatus,
  authenticate,
  handleUserDbStatus
);
router.post("/getDbUsers", authenticate, getDbUsers);
router.post("/getAllUsers", authenticate, getUsers);
router.post(
  "/createApp",
  // usersJoi.handleCreateApp,
  authenticate,
  handleCreateApp
);

module.exports = router;

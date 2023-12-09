const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  authCheck,
  changePassword,
  forgetPassword,
  setNewPassword,
} = require("../common/controllers/authControllers");
const { authenticate } = require("../common/middleware/authenticate");
const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per windowMs
});

router.post("/signup", signUp);
router.post("/login", signIn);
router.get("/me", authenticate, authCheck);
router.put("/changePassword", authenticate, changePassword);
router.post("/forgetPassword", authenticate, forgetPassword);
router.post("/setNewPassword", authenticate, setNewPassword);

module.exports = router;

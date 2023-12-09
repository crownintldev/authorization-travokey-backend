const express = require("express");
const router = express.Router();

const { authenticate } = require("../common/middleware/authenticate");
const {
  addSubscription,
  editSubscription,
  deleteSubscription,
  getSubscription,
} = require("../common/controllers/subscriptionController");

router.post("/addSubscription", authenticate, addSubscription);
router.post("/editSubscription", authenticate, editSubscription);
router.post("/deleteSubscription", authenticate, deleteSubscription);
router.post("/getSubscription", authenticate, getSubscription);

module.exports = router;
  
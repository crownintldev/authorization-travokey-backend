const express = require("express");
const router = express.Router();

const { authenticate } = require("../common/middleware/authenticate");
const {
  addModule,
  editModule,
  deleteModule,
  getModule,
} = require("../common/controllers/moduleController");

router.post("/addmodule", authenticate, addModule);
router.post("/editmodule", authenticate, editModule);
router.post("/deletemodule", authenticate, deleteModule);
router.post("/getmodule", authenticate, getModule);

module.exports = router;

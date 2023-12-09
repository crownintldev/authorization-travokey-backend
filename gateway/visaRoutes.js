const express = require("express");
const router = express.Router();

const {
  addVisa,
  editVisa,
  deleteVisa,
} = require("../common/controllers/visaController");
const { authenticate } = require("../common/middleware/authenticate");
// editVisa perform both add and edit
router.post("/addVisa", authenticate, editVisa);
router.post("/editVisa", authenticate, editVisa);
router.post("/deleteVisa", authenticate, deleteVisa);

module.exports = router;

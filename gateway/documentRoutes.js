const express = require("express");
const router = express.Router();

const {
  addDocument,
  editDocument,
  deleteDocument,
  getDocument,
} = require("../common/controllers/documentController");
const { authenticate } = require("../common/middleware/authenticate");

router.post("/addDocument", authenticate, addDocument);
router.post("/editDocument", authenticate, editDocument);
router.post("/deleteDocument", authenticate, deleteDocument);
router.post("/getDocument", authenticate, getDocument);


module.exports = router;

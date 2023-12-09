const express = require("express");
const router = express.Router();
const documentUploader = require("../../../common/middleware/documentUploader");
const upload = require("../../../common/utils/multer");
const {
  getService,
  addService,
  editService,
  deleteService,
} = require("../controllers/serviceController");
const customizedUpload = upload(/pdf|doc|png|txt|jpg|jpeg|docx/, 5000000);

const docUpload = customizedUpload.array("attachments", 5);

router.post("/addService", docUpload, documentUploader, addService);
router.post("/editService", docUpload, documentUploader, editService);
router.post("/deleteService", deleteService);
router.post("/getService", getService);

module.exports = router;

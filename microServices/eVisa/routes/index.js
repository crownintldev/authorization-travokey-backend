const express = require("express");
const router = express.Router();
const upload = require("../../../common/utils/multer");
const countryList = require("../../../common/constantsJson/countries");
const documentUploader = require("../middleware/documentUploader");
const {
  addVisa,
  getVisa,
  getSearchDetails,
} = require("../controllers/visaController");
const customizedUpload = upload(/pdf|doc|png|txt|jpg|jpeg|docx/, 5000000);
const docUpload = customizedUpload.fields([
  { name: "category", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);
router.post("/uploaddoc", docUpload, documentUploader, addVisa);
router.get("/getuploaddoc/:query", getVisa);

router.get("/getCountriesList/:query", (req, res) => {
  try {
    res.send({
      status: 200,
      message: "Record fetch Successfully",
      Record: countryList,
    });
  } catch (error) {
    console.error("Error in getCountriesList:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/searchResults", (req, res) => {
  res.send({
    success: true,
  });
});

module.exports = router;

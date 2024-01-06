const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = (allowedTypes, maximumSize) => {
  return multer({
    storage: storage,
    limits: { fileSize: maximumSize || 1000000 },
    fileFilter: (req, file, cb) => {
      const filetypes = allowedTypes || /jpeg|pdf|jpg|png|gif|webp|docx/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = filetypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Error: Only PDF, DOC, or DOCX files are allowed!"));
      }
    },
  });
};

module.exports = upload;

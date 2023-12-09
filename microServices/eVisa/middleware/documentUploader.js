const documentUploader = (req, res, next) => {
  let responseData = null;
  if (req.files && req.files.length < 6 && req.files.length > 0) {
    let files = req.files;
    responseData = files.map((file, index) => ({
      [`doc${index + 1}`]: {
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
      },
    }));
  }
  req.files = responseData;
  next();
};
module.exports = documentUploader;

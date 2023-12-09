const express = require("express");
const router = express.Router();

const { authenticate } = require("../common/middleware/authenticate");

router.post("/addmodule", authenticate);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  addRole,
  getRole,
  getRoleList,
} = require("../common/controllers/roleController");
const { authenticate } = require("../common/middleware/authenticate");
const abilityProvider = require("../common/middleware/abilityProvider");

router.post("/addRole", authenticate, abilityProvider, addRole);
router.get("/getRole", authenticate, abilityProvider, getRoleList);

module.exports = router;

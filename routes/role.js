const express = require("express");
const router = express.Router();

const {
  addRole,
  getRole,
  getRoleList,
} = require("../common/controllers/roleController");
const { authenticate } = require("../common/middleware/authenticate");
const abilityProvider = require("../common/middleware/abilityProvider");

// router.post("/addRole", authenticate, abilityProvider, addRole);
router.post("/addRole", addRole);
router.get("/getRole/:query", authenticate, abilityProvider, getRole);

module.exports = router;

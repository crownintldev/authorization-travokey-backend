const express = require("express");
const router = express.Router();

const {
  addPermission,
  getPermission,
  getPermissionDetails,
} = require("../common/controllers/permissionController");
const { authenticate } = require("../common/middleware/authenticate");
const abilityProvider = require("../common/middleware/abilityProvider");

router.post("/addPermission", authenticate, abilityProvider, addPermission);
router.get("/getPermission/:query", authenticate, abilityProvider, getPermissionDetails);
// router.get("/getPermission", authenticate, abilityProvider, getPermission);

module.exports = router;

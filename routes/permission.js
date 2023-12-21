const express = require("express");
const router = express.Router();

const {
  addPermission,
  getPermission,
  getPermissionDetailsWithId,
} = require("../common/controllers/permissionController");
const { authenticate } = require("../common/middleware/authenticate");
const abilityProvider = require("../common/middleware/abilityProvider");

router.post("/addPermission", authenticate, abilityProvider, addPermission);
router.get(
  "/getPermissionDetailsWithId/:query",
  authenticate,
  abilityProvider,
  getPermissionDetailsWithId
);
router.get(
  "/getPermission/:query",
  authenticate,
  abilityProvider,
  getPermission
);

module.exports = router;

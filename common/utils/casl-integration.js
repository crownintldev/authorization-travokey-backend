const { Ability, AbilityBuilder } = require("@casl/ability");

const defineAbilitiesFor = (user) => {
  const { can, build } = new AbilityBuilder(Ability);
  console.log("===user ===", user);
  // Check if the user has administrative privileges
  if (
    user.accountType === "administrative" &&
    user.status === "active" &&
    user.dbAccess === "allowed"
  ) {
    can("manage", "All");
  } else if (
    user.accountType === "staff" &&
    user.status === "active" &&
    user.dbAccess === "allowed"
  ) {
    // Define abilities based on permissions and modules
    user.permissionsDetails.forEach((permission) => {
      can(permission.action, permission.subject, {
        module: permission.module,
      });
    });
  }

  return build();
};

module.exports = { defineAbilitiesFor };

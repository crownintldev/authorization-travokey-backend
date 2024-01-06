const { Ability, AbilityBuilder } = require("@casl/ability");

const defineAbilitiesFor = (user) => {
  const { can, build } = new AbilityBuilder(Ability);
  // Check if the user has administrative privileges
  if (user.accountType === "administrative") {
    let hasAdministrativeManageAll = user.permissionsDetails?.some(
      (permissionDetail) =>
        permissionDetail.permission === "administrative" &&
        permissionDetail.actions?.includes("manageAll")
    );
    if (hasAdministrativeManageAll) {
      can("manageAll", "administrative", {
        module: "all",
      });
    }
  } else if (user.accountType === "staff") {
    user.permissionsDetails.length > 0 &&
      user.permissionsDetails.forEach((permissionDetail) => {
        if (Array.isArray(permissionDetail.actions)) {
          permissionDetail.actions.forEach((action) => {
            can(action, permissionDetail.permission, {
              module: permissionDetail.module,
            });
          });
        }
      });
  }

  return build();
};

module.exports = { defineAbilitiesFor };

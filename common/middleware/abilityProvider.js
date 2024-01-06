const {
  AbilityBuilder,
  Ability,
  subject: defineSubject,
} = require("@casl/ability");

const abilityProvider = (req, res, next) => {
  const ability = req.ability;
  const user = req.user;

  function determineActionType(req) {
    switch (req.method) {
      case "POST":
        return "create";
      case "GET":
        return "read";
      case "PUT":
        return "write";
      case "DELETE":
        return "delete";
      default:
        return "read";
    }
  }

  function determineModuleKey(req, perm) {
    let actionType = undefined;
    if (perm.permission === "administrative") {
      actionType = "manageAll";
      perm["module"] = "all";
    } else {
      actionType = determineActionType(req);
    }
    let module = req.path.includes(`/${perm.module || "settings"}`)
      ? perm.module
      : "all";
    if (module && actionType) {
      return { module, actionType };
    }
  }

  function determineAction(req, user, ability) {
    console.log("===ability rules", ability.rules);
    for (const perm of user.permissionsDetails || []) {
      const { module, actionType } = determineModuleKey(req, perm);

      for (const action of perm.actions || []) {
        const subjectInstance = defineSubject(perm.permission, { module });

        if (ability.can(actionType, subjectInstance)) {
          console.log(
            "====subjectInstance",
            action,
            actionType,
            perm.permission,
            module
          );
          return { actionType, permission: perm.permission, module };
        }
      }
    }
    return null;
  }

  const permission = determineAction(req, user, ability);

  if (permission) {
    console.log("Allowed Permission:", permission);
    next(); // User has permission, proceed with the request
  } else {
    res.status(403).send({ message: "Access Denied", status: "ERROR" });
  }
};

module.exports = abilityProvider;

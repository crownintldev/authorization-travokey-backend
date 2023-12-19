const { subject } = require("@casl/ability");

const abilityProvider = (req, res, next) => {
  const ability = req.ability;
  const action = determineAction(req);
  const subjectType = determineSubject(req);
  const moduleKey = determineModuleKey(req);

  const docs = subject(subjectType, {
    module: moduleKey,
  }); //  “docs” type instance
  if (ability.can(action, docs)) {
    next();
  } else {
    res.status(403).send({ message: "Access Denied", status: "ERROR" });
  }
};

function determineAction(req) {
  // Logic based on HTTP method
  switch (req.method) {
    case "POST":
      return "create";
    case "GET":
      return "read";
    case "PUT":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "read";
  }
}

function determineSubject(req) {
  // Logic based on URL path
  if (req.path.includes("/role/getRole") || req.path.includes("/me")) {
    return "All";
  }
  if (req.path.includes("/products")) return "Product";
  if (req.path.includes("/invoices")) return "Invoice";
  if (req.path.includes("/reports")) return "Report";
  return "All"; // Fallback subject
}

function determineModuleKey(req) {
  // Example: determine the module key from the request
  // Modify this logic based on how your modules are defined in the request
  if (req.path.includes("/accountsApp")) {
    return "accountsapp";
  }
  // Add logic for other modules
  return "accountsapp"; // Fallback module key
}

module.exports = abilityProvider;

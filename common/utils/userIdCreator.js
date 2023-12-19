const AppError = require("./appError");

function sanitizeAndFormatFullName(fullName = "") {
  if (typeof fullName !== "string") {
    throw new AppError("Something bad happened full name must be string", 409);
  }
  // Remove any unwanted characters (e.g., special characters)
  const sanitized = fullName.replace(/[^\w\s]/gi, "");

  // Replace spaces with underscores (or another character if preferred)
  const formatted = sanitized.replace(/\s+/g, "_").toLowerCase();

  // Append a unique number - using a current timestamp
  const uniqueNumber = Date.now();

  return `${formatted}_${uniqueNumber}`;
}

module.exports = { sanitizeAndFormatFullName };

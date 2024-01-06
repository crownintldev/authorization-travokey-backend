const crypto = require("crypto");
const AppError = require("./appError");
const algorithm = "aes-256-cbc"; // Using AES algorithm in CBC mode
const key = process.env.CRYPTO_SECRET_KEY; // Must be 256 bits (32 characters)
const ivLength = 16; // AES block size
if (
  !process.env.CRYPTO_SECRET_KEY ||
  process.env.CRYPTO_SECRET_KEY.length !== 32
) {
  throw new AppError(
    "CRYPTO_SECRET_KEY must be set and be 32 characters long.",
    409
  );
}

function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
module.exports = { encrypt, decrypt };

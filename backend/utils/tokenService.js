/**
 * Token Service
 * Handles JWT token generation and verification
 * Manages access tokens and refresh tokens
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Generate Access Token
 * Short-lived token for API authentication
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
};

/**
 * Generate temporary token for 2FA verification flow
 */
const generateTwoFactorTempToken = (userId) => {
  return jwt.sign({ userId, type: "2fa_temp" }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_2FA_TEMP_EXPIRY || "10m",
  });
};

/**
 * Generate Refresh Token
 * Long-lived token for obtaining new access tokens
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

/**
 * Verify 2FA temporary token
 */
const verifyTwoFactorTempToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (decoded.type !== "2fa_temp") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired temporary token");
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

/**
 * Generate random token for password reset, email verification, etc.
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash token for secure storage
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateTwoFactorTempToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyTwoFactorTempToken,
  verifyRefreshToken,
  generateSecureToken,
  hashToken,
};

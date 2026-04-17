/**
 * Validation Middleware
 * Uses express-validator for input validation
 */

const { body, validationResult } = require("express-validator");
const { isStrongPassword } = require("../utils/validators");

/**
 * Handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error(
          "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character",
        );
      }
      return true;
    }),

  validate,
];

/**
 * Login validation rules
 */
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  validate,
];

/**
 * Email validation rules
 */
const emailValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  validate,
];

/**
 * Password reset validation rules
 */
const passwordResetValidation = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error(
          "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character",
        );
      }
      return true;
    }),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validate,
];

/**
 * OTP validation rules
 */
const otpValidation = [
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),

  validate,
];

/**
 * 2FA setup token validation rules
 */
const tokenValidation = [
  body("token")
    .notEmpty()
    .withMessage("Verification token is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification token must be 6 digits")
    .isNumeric()
    .withMessage("Verification token must contain only numbers"),

  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
  emailValidation,
  passwordResetValidation,
  otpValidation,
  tokenValidation,
  validate,
};

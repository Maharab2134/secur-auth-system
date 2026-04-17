/**
 * User Routes
 */

const express = require("express");
const router = express.Router();
const {
  getProfile,
  getLoginHistory,
  setup2FA,
  verify2FASetup,
  disable2FA,
  changePassword,
} = require("../controllers/userController");
const { protect, requireVerified } = require("../middleware/auth");
const { tokenValidation } = require("../middleware/validation");

// All routes are protected
router.use(protect);
router.use(requireVerified);

// Profile routes
router.get("/profile", getProfile);
router.get("/login-history", getLoginHistory);

// 2FA routes
router.post("/setup-2fa", setup2FA);
router.post("/verify-2fa-setup", tokenValidation, verify2FASetup);
router.post("/disable-2fa", disable2FA);

// Password management
router.put("/change-password", changePassword);

module.exports = router;

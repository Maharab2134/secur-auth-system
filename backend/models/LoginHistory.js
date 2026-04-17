/**
 * Login History Model
 * Tracks all login attempts for security monitoring
 * Stores IP, device info, location, and login status
 */

import { Schema, model } from "mongoose";

const loginHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
    },

    // Login Status
    success: {
      type: Boolean,
      required: true,
    },

    failureReason: {
      type: String,
      enum: [
        "invalid_credentials",
        "account_locked",
        "2fa_failed",
        "account_not_verified",
        null,
      ],
      default: null,
    },

    // Device Information
    ipAddress: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
    },

    device: {
      type: {
        type: String, // 'desktop', 'mobile', 'tablet'
      },
      browser: String,
      os: String,
      platform: String,
    },

    // Location Information (from IP)
    location: {
      country: String,
      region: String,
      city: String,
      timezone: String,
    },

    // Timestamps
    loginTime: {
      type: Date,
      default: Date.now,
    },

    // Security Flags
    suspiciousActivity: {
      type: Boolean,
      default: false,
    },

    newDevice: {
      type: Boolean,
      default: false,
    },

    newLocation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "login_history",
  },
);

// Index for efficient queries
loginHistorySchema.index({ userId: 1, loginTime: -1 });
loginHistorySchema.index({ ipAddress: 1 });
loginHistorySchema.index({ success: 1 });

// TTL index to auto-delete old records after 90 days
loginHistorySchema.index({ loginTime: 1 }, { expireAfterSeconds: 7776000 });

const LoginHistory = model("LoginHistory", loginHistorySchema);

export default LoginHistory;

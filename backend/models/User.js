/**
 * User Model
 * Defines user schema with security features:
 * - Password hashing
 * - 2FA support
 * - Account lockout mechanism
 * - Login attempt tracking
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default in queries
    },

    // 2FA Configuration
    twoFactorSecret: {
      type: String,
      select: false, // Keep 2FA secret hidden
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorTempSecret: {
      type: String,
      select: false,
    },

    // Account Security
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Account Lockout Mechanism
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: {
      type: Date,
      default: null,
    },

    // Password Reset
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // Email Verification
    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // Refresh Token Storage
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800, // 7 days in seconds
        },
      },
    ],

    // Security Metadata
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },

    lastLogin: {
      type: Date,
    },

    lastLoginIP: {
      type: String,
    },

    lastLoginDevice: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "users",
  },
);

/**
 * Pre-save middleware to hash password
 * Only hashes if password is modified
 */
userSchema.pre("save", async function (next) {
  // Only hash password if it's new or modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 12,
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare password for login
 * @param {string} candidatePassword - Password to check
 * @returns {boolean} - True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

/**
 * Method to check if account is locked
 * @returns {boolean} - True if account is currently locked
 */
userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

/**
 * Method to increment failed login attempts
 * Locks account after max attempts reached
 */
userSchema.methods.incrementFailedAttempts = async function () {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCK_TIME) || 15; // minutes

  // If account is already locked and lock time has passed, reset attempts
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    return await this.updateOne({
      $set: {
        failedLoginAttempts: 1,
        accountLockedUntil: null,
      },
    });
  }

  // Increment failed attempts
  const updates = {
    $inc: { failedLoginAttempts: 1 },
  };

  // Lock account if max attempts reached
  if (this.failedLoginAttempts + 1 >= maxAttempts) {
    updates.$set = {
      accountLockedUntil: new Date(Date.now() + lockTime * 60 * 1000),
    };
  }

  return await this.updateOne(updates);
};

/**
 * Method to reset failed login attempts
 * Called after successful login
 */
userSchema.methods.resetFailedAttempts = async function () {
  return await this.updateOne({
    $set: {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    },
  });
};

/**
 * Index for faster queries
 */
userSchema.index({ accountLockedUntil: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;

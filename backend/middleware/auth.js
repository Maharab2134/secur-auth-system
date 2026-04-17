/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

const { verifyAccessToken } = require('../utils/tokenService');
const User = require('../models/User');

/**
 * Verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.'
      });
    }
    
    try {
      // Verify token
      const decoded = verifyAccessToken(token);
      
      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token is invalid.'
        });
      }
      
      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated.'
        });
      }
      
      // Attach user to request
      req.user = user;
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.'
      });
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Check if user is verified
 */
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address first.'
    });
  }
  next();
};

/**
 * Check if 2FA is enabled and verified
 */
const require2FA = (req, res, next) => {
  if (req.user.twoFactorEnabled && !req.session?.twoFactorVerified) {
    return res.status(403).json({
      success: false,
      message: 'Two-factor authentication required.'
    });
  }
  next();
};

module.exports = {
  protect,
  requireVerified,
  require2FA
};
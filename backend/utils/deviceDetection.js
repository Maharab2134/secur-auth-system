/**
 * Device Detection Utility
 * Detects device information, location from IP
 * Used for security monitoring and alerts
 */

const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

/**
 * Parse user agent to extract device info
 */
const parseUserAgent = (userAgentString) => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    platform: result.device.type || 'desktop',
    type: result.device.type || 'desktop'
  };
};

/**
 * Get location from IP address
 */
const getLocationFromIP = (ipAddress) => {
  // Handle localhost
  if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
    return {
      country: 'Local',
      region: 'Local',
      city: 'Local',
      timezone: 'Local'
    };
  }
  
  const geo = geoip.lookup(ipAddress);
  
  if (geo) {
    return {
      country: geo.country || 'Unknown',
      region: geo.region || 'Unknown',
      city: geo.city || 'Unknown',
      timezone: geo.timezone || 'Unknown'
    };
  }
  
  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'Unknown'
  };
};

/**
 * Extract IP address from request
 * Handles various proxy scenarios
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip;
};

/**
 * Generate device fingerprint
 */
const generateDeviceFingerprint = (ipAddress, userAgent) => {
  const crypto = require('crypto');
  const fingerprint = `${ipAddress}-${userAgent}`;
  return crypto.createHash('md5').update(fingerprint).digest('hex');
};

/**
 * Check if login is from new device
 */
const isNewDevice = (user, currentFingerprint) => {
  // Implementation would check against stored device fingerprints
  // For now, simplified version
  return false; // You can enhance this based on your needs
};

/**
 * Check if login is from new location
 */
const isNewLocation = (user, currentLocation) => {
  if (!user.lastLoginIP) return true;
  
  const lastLocation = getLocationFromIP(user.lastLoginIP);
  
  return lastLocation.country !== currentLocation.country ||
         lastLocation.city !== currentLocation.city;
};

module.exports = {
  parseUserAgent,
  getLocationFromIP,
  getClientIP,
  generateDeviceFingerprint,
  isNewDevice,
  isNewLocation
};
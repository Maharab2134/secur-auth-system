/**
 * Device Detection Utility
 * Detects device information, location from IP
 * Used for security monitoring and alerts
 */

const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^::1$/,
  /^fc00:/i,
  /^fd00:/i,
  /^fe80:/i,
];

const normalizeIP = (rawIP = '') => {
  if (!rawIP) return '';

  let ip = rawIP.trim();

  // Common IPv4-mapped IPv6 format: ::ffff:1.2.3.4
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  // Remove brackets and port if present, e.g. [::1]:1234 or 1.2.3.4:5678
  ip = ip.replace(/^\[|\]$/g, '');
  if (ip.includes(':') && ip.includes('.') && ip.lastIndexOf(':') > ip.lastIndexOf('.')) {
    ip = ip.slice(0, ip.lastIndexOf(':'));
  }

  return ip;
};

const isPrivateIP = (ipAddress) => {
  const ip = normalizeIP(ipAddress);
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
};

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
  const normalizedIP = normalizeIP(ipAddress);

  // Handle localhost
  if (!normalizedIP || normalizedIP === 'localhost' || isPrivateIP(normalizedIP)) {
    return {
      country: 'Private Network',
      region: 'Private Network',
      city: 'Unknown',
      timezone: 'Unknown'
    };
  }
  
  const geo = geoip.lookup(normalizedIP);
  
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
  const candidates = [
    req.headers['cf-connecting-ip'],
    req.headers['x-client-ip'],
    req.headers['x-real-ip'],
    req.headers['x-forwarded-for']?.split(',')[0],
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.ip,
  ];

  for (const candidate of candidates) {
    const ip = normalizeIP(candidate);
    if (ip) return ip;
  }

  return 'unknown';
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
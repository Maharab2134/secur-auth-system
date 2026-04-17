/**
 * Email Service
 * Sends transactional emails using Nodemailer
 * Supports password reset, verification, and security alerts
 */

const nodemailer = require("nodemailer");

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email verification
 */
const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Secure Auth System" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering with our Secure Auth System.</p>
              <p>Please click the button below to verify your email address:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 Secure Auth System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending verification email: ${error.message}`);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const expiryMinutes = process.env.PASSWORD_RESET_EXPIRY || 15;

  const mailOptions = {
    from: `"Secure Auth System" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3cd; border-left: 4px solid #f5576c; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We received a request to reset your password.</p>
              <p>Click the button below to create a new password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in ${expiryMinutes} minutes</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Secure Auth System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending password reset email: ${error.message}`);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Send 2FA OTP email
 */
const send2FAEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Secure Auth System" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Your Two-Factor Authentication Code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Two-Factor Authentication</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your verification code is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>This code will expire in 5 minutes.</strong></p>
              <p>If you didn't attempt to log in, please secure your account immediately.</p>
            </div>
            <div class="footer">
              <p>© 2024 Secure Auth System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ 2FA email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending 2FA email: ${error.message}`);
    throw new Error("Failed to send 2FA email");
  }
};

/**
 * Send suspicious login alert
 */
const sendSuspiciousLoginAlert = async (email, name, loginDetails) => {
  const transporter = createTransporter();
  const { ipAddress, device, location, timestamp } = loginDetails;

  const mailOptions = {
    from: `"Secure Auth System" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "🚨 Security Alert: New Login Detected",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Security Alert</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <div class="alert-box">
                <strong>⚠️ We detected a new login to your account</strong>
              </div>
              <p>A login was just detected from a new device or location:</p>
              <div class="details">
                <div class="detail-row">
                  <strong>IP Address:</strong>
                  <span>${ipAddress}</span>
                </div>
                <div class="detail-row">
                  <strong>Device:</strong>
                  <span>${device.browser} on ${device.os}</span>
                </div>
                <div class="detail-row">
                  <strong>Location:</strong>
                  <span>${location.city}, ${location.country}</span>
                </div>
                <div class="detail-row">
                  <strong>Time:</strong>
                  <span>${new Date(timestamp).toLocaleString()}</span>
                </div>
              </div>
              <p><strong>If this was you, you can safely ignore this email.</strong></p>
              <p>If you don't recognize this activity, please secure your account immediately:</p>
              <center>
                <a href="${process.env.FRONTEND_URL}/change-password" class="button">Change Password Now</a>
              </center>
            </div>
            <div class="footer">
              <p>© 2024 Secure Auth System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Suspicious login alert sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending suspicious login alert: ${error.message}`);
    // Don't throw error - login should succeed even if email fails
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FAEmail,
  sendSuspiciousLoginAlert,
};

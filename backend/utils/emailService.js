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
    from: `"AuthNova - Trust Refined" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your Email - AuthNova",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
            .header { background: linear-gradient(135deg, #22d3ee 0%, #10b981 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 600; }
            .brand-text { font-size: 13px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; font-weight: 500; margin-bottom: 20px; color: #0f172a; }
            .message { color: #475569; margin-bottom: 30px; font-size: 15px; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22d3ee 0%, #10b981 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3); }
            .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(34, 211, 238, 0.4); }
            .divider { border-top: 1px solid #e2e8f0; margin: 25px 0; }
            .link-text { color: #475569; font-size: 13px; margin: 15px 0; }
            .link-url { color: #22d3ee; word-break: break-all; font-family: monospace; font-size: 12px; }
            .info-box { background: #f0f9ff; border-left: 4px solid #22d3ee; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .info-box strong { color: #0369a1; }
            .footer { background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
            .footer-brand { color: #22d3ee; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="wrapper">
              <div class="header">
                <h1>🔐</h1>
                <h1>Verify Your Email</h1>
                <p class="brand-text">AuthNova - Trust Refined</p>
              </div>
              <div class="content">
                <p class="greeting">Hello ${name}! 👋</p>
                <p class="message">Thank you for joining AuthNova. We're excited to have you on board!</p>
                <p class="message">To complete your registration, please verify your email address by clicking the button below:</p>
                <div class="button-container">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p class="message">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p class="link-text"><span class="link-url">${verificationUrl}</span></p>
                <div class="info-box">
                  <strong>⏱️ Link Expires:</strong> This verification link will expire in 24 hours. If you need a new one, simply request a new verification email.
                </div>
                <p class="message">If you didn't create this account, you can safely ignore this email or let us know.</p>
              </div>
              <div class="footer">
                <p>© 2024 <span class="footer-brand">AuthNova</span>. Security-first authentication platform.</p>
                <p style="margin-top: 10px; color: #94a3b8;">This is an automated message, please don't reply to this email.</p>
              </div>
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
    from: `"AuthNova - Trust Refined" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset Your Password - AuthNova",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
            .header { background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 600; }
            .brand-text { font-size: 13px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; font-weight: 500; margin-bottom: 20px; color: #0f172a; }
            .message { color: #475569; margin-bottom: 20px; font-size: 15px; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
            .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4); }
            .divider { border-top: 1px solid #e2e8f0; margin: 25px 0; }
            .link-text { color: #475569; font-size: 13px; margin: 15px 0; }
            .link-url { color: #f97316; word-break: break-all; font-family: monospace; font-size: 12px; }
            .warning-box { background: #fef2f2; border-left: 4px solid #f97316; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .warning-box strong { color: #991b1b; display: block; margin-bottom: 10px; }
            .warning-box ul { margin-left: 20px; color: #7f1d1d; font-size: 14px; }
            .warning-box li { margin: 8px 0; }
            .footer { background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
            .footer-brand { color: #f97316; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="wrapper">
              <div class="header">
                <h1>🔑</h1>
                <h1>Password Reset</h1>
                <p class="brand-text">AuthNova - Trust Refined</p>
              </div>
              <div class="content">
                <p class="greeting">Hello ${name}! 🛡️</p>
                <p class="message">We received a request to reset your password. If this was you, click the button below to create a new password:</p>
                <div class="button-container">
                  <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                <p class="message">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p class="link-text"><span class="link-url">${resetUrl}</span></p>
                <div class="warning-box">
                  <strong>⚠️ Important Security Information:</strong>
                  <ul>
                    <li>This reset link will expire in <strong>${expiryMinutes} minutes</strong></li>
                    <li>If you didn't request this reset, your account is still secure</li>
                    <li>Your password will only change if you complete the reset process</li>
                    <li>Never share this link with anyone else</li>
                  </ul>
                </div>
                <p class="message">If you have any questions or need assistance, contact our support team.</p>
              </div>
              <div class="footer">
                <p>© 2024 <span class="footer-brand">AuthNova</span>. Security-first authentication platform.</p>
                <p style="margin-top: 10px; color: #94a3b8;">This is an automated message, please don't reply to this email.</p>
              </div>
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
    from: `"AuthNova - Trust Refined" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Your Two-Factor Authentication Code - AuthNova",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
            .header { background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 600; }
            .brand-text { font-size: 13px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; font-weight: 500; margin-bottom: 20px; color: #0f172a; }
            .message { color: #475569; margin-bottom: 20px; font-size: 15px; }
            .otp-container { text-align: center; margin: 35px 0; }
            .otp-box { background: linear-gradient(135deg, #f0f9ff 0%, #f0fdfa 100%); border: 2px dashed #22d3ee; padding: 30px; border-radius: 10px; display: inline-block; }
            .otp-label { font-size: 13px; color: #0369a1; font-weight: 500; margin-bottom: 15px; display: block; }
            .otp-code { font-size: 42px; font-weight: 700; color: #0369a1; letter-spacing: 6px; font-family: 'Courier New', monospace; }
            .timer { color: #64748b; font-size: 13px; margin-top: 15px; }
            .security-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .security-box strong { color: #166534; }
            .security-box p { color: #15803d; font-size: 14px; margin: 8px 0; }
            .footer { background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
            .footer-brand { color: #22d3ee; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="wrapper">
              <div class="header">
                <h1>🔐</h1>
                <h1>2FA Code</h1>
                <p class="brand-text">AuthNova - Trust Refined</p>
              </div>
              <div class="content">
                <p class="greeting">Hello ${name}! 🔑</p>
                <p class="message">You requested a login. Here's your two-factor authentication code:</p>
                <div class="otp-container">
                  <div class="otp-box">
                    <span class="otp-label">Your Code:</span>
                    <div class="otp-code">${otp}</div>
                    <div class="timer">⏱️ Expires in 5 minutes</div>
                  </div>
                </div>
                <p class="message">Enter this code in the login window to proceed. This code is valid for 5 minutes only.</p>
                <div class="security-box">
                  <strong>🛡️ Security Notice:</strong>
                  <p>If you didn't request this code or attempt to log in, your account may be at risk.</p>
                  <p style="margin-top: 12px;"><strong>Take action immediately:</strong> Change your password in your account settings.</p>
                </div>
                <p class="message"><strong>Remember:</strong> AuthNova will never ask you to share this code with anyone. Never reply with your code.</p>
              </div>
              <div class="footer">
                <p>© 2024 <span class="footer-brand">AuthNova</span>. Security-first authentication platform.</p>
                <p style="margin-top: 10px; color: #94a3b8;">This is an automated message, please don't reply to this email.</p>
              </div>
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
  const formattedTime = new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const mailOptions = {
    from: `"AuthNova - Trust Refined" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "🚨 Security Alert: New Login Detected - AuthNova",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 600; }
            .brand-text { font-size: 13px; opacity: 0.9; }
            .alert-banner { background: #fef2f2; border-left: 5px solid #f97316; padding: 15px 20px; margin: 0 -30px 30px -30px; }
            .alert-text { color: #991b1b; font-weight: 600; font-size: 15px; }
            .content { padding: 0 30px 30px 30px; }
            .greeting { font-size: 16px; font-weight: 500; margin-bottom: 20px; color: #0f172a; }
            .message { color: #475569; margin-bottom: 15px; font-size: 15px; }
            .details-box { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #cbd5e1; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 500; color: #0f172a; font-size: 14px; }
            .detail-value { color: #475569; text-align: right; font-size: 14px; word-break: break-word; max-width: 60%; }
            .action-box { background: #fef2f2; border: 2px dashed #f97316; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .action-title { color: #991b1b; font-weight: 600; margin-bottom: 12px; font-size: 15px; }
            .button-container { text-align: center; margin: 25px 0; }
            .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
            .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4); }
            .safe-message { color: #166534; background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 15px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
            .footer { background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
            .footer-brand { color: #f97316; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="wrapper">
              <div class="header">
                <h1>🚨</h1>
                <h1>Security Alert</h1>
                <p class="brand-text">AuthNova - Trust Refined</p>
              </div>
              <div class="alert-banner">
                <p class="alert-text">⚠️ We detected a new login to your account</p>
              </div>
              <div class="content">
                <p class="greeting">Hello ${name},</p>
                <p class="message">We detected a login attempt from a new device or location. Here are the details:</p>
                
                <div class="details-box">
                  <div class="detail-row">
                    <span class="detail-label">📍 Location:</span>
                    <span class="detail-value">${location.city}, ${location.country}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">🌐 IP Address:</span>
                    <span class="detail-value">${ipAddress}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">💻 Device:</span>
                    <span class="detail-value">${device.browser} on ${device.os}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">⏰ Time:</span>
                    <span class="detail-value">${formattedTime}</span>
                  </div>
                </div>
                
                <div class="safe-message">
                  ✅ <strong>If this was you:</strong> You can safely ignore this email. Your account is secure.
                </div>
                
                <div class="action-box">
                  <p class="action-title">⚡ Didn't recognize this login?</p>
                  <p style="color: #991b1b; margin-bottom: 15px; font-size: 14px;">If you don't recognize this activity, immediately secure your account by changing your password.</p>
                  <div class="button-container">
                    <a href="${process.env.FRONTEND_URL}/security-center" class="button">Go to Security Center</a>
                  </div>
                </div>
                
                <p class="message">For your security, we recommend:</p>
                <ul style="color: #475569; margin: 15px 0 15px 25px; font-size: 14px;">
                  <li style="margin: 8px 0;">Review all active sessions in your Security Center</li>
                  <li style="margin: 8px 0;">Enable two-factor authentication if not already active</li>
                  <li style="margin: 8px 0;">Use a unique, strong password with special characters</li>
                </ul>
              </div>
              <div class="footer">
                <p>© 2024 <span class="footer-brand">AuthNova</span>. Security-first authentication platform.</p>
                <p style="margin-top: 10px; color: #94a3b8;">This is an automated message, please don't reply to this email.</p>
              </div>
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

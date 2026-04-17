# 🔐 Secure Authentication System

A production-level, full-stack secure authentication system with advanced security features including JWT authentication, two-factor authentication (2FA), account lockout mechanisms, and comprehensive security monitoring.

## 🎯 Project Overview

This project demonstrates enterprise-grade authentication and security practices suitable for real-world applications. Built for university demonstration and production deployment.

### **Tech Stack**

**Frontend:**
- React.js 18
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (Access + Refresh Tokens)
- Bcrypt for password hashing
- Nodemailer for emails
- Speakeasy for 2FA

## ✨ Key Features

### 🔒 Authentication Features
- ✅ User Registration with email verification
- ✅ Secure Login with JWT tokens
- ✅ Access & Refresh token mechanism
- ✅ Two-Factor Authentication (2FA)
  - Email OTP
  - Google Authenticator support
- ✅ Password reset via email
- ✅ Remember me functionality

### 🛡️ Security Features
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Strong password validation
- ✅ Account lockout after failed attempts (5 attempts, 15 min lock)
- ✅ Rate limiting on all endpoints
- ✅ XSS protection with Helmet
- ✅ Input validation and sanitization
- ✅ Secure HTTP headers
- ✅ CORS protection
- ✅ Login history tracking
- ✅ New device/location detection
- ✅ Suspicious login email alerts

### 📊 Additional Features
- ✅ User profile management
- ✅ Login history with details (IP, device, location)
- ✅ Password change functionality
- ✅ Email notifications
- ✅ Beautiful, responsive UI
- ✅ Protected routes

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Git

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd secure-auth-system
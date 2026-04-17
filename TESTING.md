# 🧪 Testing Guide

## Manual Testing Checklist

### ✅ Authentication Flow Tests

#### Test 1: User Registration
- [ ] Open registration page
- [ ] Enter valid user data
- [ ] Submit form
- [ ] Verify success message
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Verify redirect to login

**Expected Result**: User created and email sent

#### Test 2: Password Validation
- [ ] Try password: "weak" → Should fail
- [ ] Try password: "WeakPass" → Should fail (no number/special char)
- [ ] Try password: "Weak123" → Should fail (no special char)
- [ ] Try password: "Weak123!" → Should pass ✓

**Expected Result**: Only strong passwords accepted

#### Test 3: Duplicate Email
- [ ] Register with existing email
- [ ] Should show error message

**Expected Result**: "Email already registered"

#### Test 4: Login Success
- [ ] Enter correct credentials
- [ ] Click login
- [ ] Should redirect to dashboard

**Expected Result**: Successful login, dashboard displayed

#### Test 5: Login Failure
- [ ] Enter wrong password
- [ ] Should show error message
- [ ] Login attempts counter should increment

**Expected Result**: Login failed with error message

#### Test 6: Account Lockout
- [ ] Enter wrong password 5 times
- [ ] Account should be locked
- [ ] Try correct password
- [ ] Should show lockout message

**Expected Result**: Account locked for 15 minutes

#### Test 7: Password Reset Flow
- [ ] Click "Forgot Password"
- [ ] Enter email
- [ ] Check email for reset link
- [ ] Click reset link
- [ ] Enter new password
- [ ] Login with new password

**Expected Result**: Password successfully reset

#### Test 8: Expired Reset Token
- [ ] Request password reset
- [ ] Wait 16 minutes
- [ ] Try to use reset link
- [ ] Should show expired message

**Expected Result**: "Invalid or expired reset token"

### ✅ Two-Factor Authentication Tests

#### Test 9: Enable 2FA
- [ ] Login to dashboard
- [ ] Go to Security tab
- [ ] Click "Enable 2FA"
- [ ] Scan QR code with Google Authenticator
- [ ] Enter 6-digit code
- [ ] Verify 2FA enabled

**Expected Result**: 2FA successfully enabled

#### Test 10: 2FA Login
- [ ] Logout
- [ ] Login with credentials
- [ ] Check email for OTP
- [ ] Enter OTP code
- [ ] Should access dashboard

**Expected Result**: Successful 2FA login

#### Test 11: Invalid OTP
- [ ] Login with credentials
- [ ] Enter wrong OTP
- [ ] Should show error

**Expected Result**: "Invalid or expired verification code"

#### Test 12: Disable 2FA
- [ ] Go to Security tab
- [ ] Click "Disable 2FA"
- [ ] Enter password
- [ ] Verify 2FA disabled

**Expected Result**: 2FA successfully disabled

### ✅ Security Tests

#### Test 13: JWT Token Expiry
- [ ] Login successfully
- [ ] Wait 16 minutes (access token expires)
- [ ] Make API request
- [ ] Token should auto-refresh

**Expected Result**: Request succeeds with new token

#### Test 14: Invalid Token
- [ ] Manually modify token in cookies
- [ ] Make API request
- [ ] Should redirect to login

**Expected Result**: "Invalid or expired token"

#### Test 15: Rate Limiting
- [ ] Make 6 login requests quickly
- [ ] Should be rate limited

**Expected Result**: "Too many requests"

#### Test 16: XSS Protection
- [ ] Try entering `<script>alert('xss')</script>` in name field
- [ ] Should be sanitized

**Expected Result**: Script tags removed

#### Test 17: SQL Injection Protection
- [ ] Try email: `admin' OR '1'='1`
- [ ] Should be handled safely

**Expected Result**: Invalid email format error

### ✅ Dashboard Tests

#### Test 18: Profile Display
- [ ] Login to dashboard
- [ ] Verify profile information displayed
- [ ] Check account statistics

**Expected Result**: All data displayed correctly

#### Test 19: Login History
- [ ] Go to Login History tab
- [ ] Verify recent logins shown
- [ ] Check IP, device, location data

**Expected Result**: Login history with details

#### Test 20: Change Password
- [ ] Go to Security tab
- [ ] Click "Change Password"
- [ ] Enter current and new password
- [ ] Submit
- [ ] Logout and login with new password

**Expected Result**: Password successfully changed

### ✅ Email Tests

#### Test 21: Verification Email
- [ ] Register new account
- [ ] Check email received
- [ ] Verify email formatting
- [ ] Click link works

**Expected Result**: Professional email received

#### Test 22: Password Reset Email
- [ ] Request password reset
- [ ] Check email received
- [ ] Verify link works
- [ ] Check 15-minute expiry mentioned

**Expected Result**: Reset email with working link

#### Test 23: Suspicious Login Alert
- [ ] Login from different location/device
- [ ] Check email for alert
- [ ] Verify details are correct

**Expected Result**: Security alert email received

#### Test 24: 2FA OTP Email
- [ ] Login with 2FA enabled
- [ ] Check email for OTP
- [ ] Verify 6-digit code
- [ ] Check 5-minute expiry

**Expected Result**: OTP email received

### ✅ UI/UX Tests

#### Test 25: Responsive Design
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)

**Expected Result**: Works on all screen sizes

#### Test 26: Form Validation
- [ ] Leave fields empty
- [ ] Should show validation errors
- [ ] Enter invalid email
- [ ] Should show format error

**Expected Result**: Client-side validation working

#### Test 27: Loading States
- [ ] Click submit button
- [ ] Should show loading spinner
- [ ] Button should be disabled

**Expected Result**: Loading indicators displayed

#### Test 28: Error Messages
- [ ] Trigger various errors
- [ ] Check error messages are clear
- [ ] Verify toast notifications

**Expected Result**: User-friendly error messages

### ✅ Performance Tests

#### Test 29: Page Load Time
- [ ] Measure initial load time
- [ ] Should be under 3 seconds

**Expected Result**: Fast page loads

#### Test 30: API Response Time
- [ ] Monitor API response times
- [ ] Should be under 500ms

**Expected Result**: Quick API responses

---

## API Testing with Postman

### Import Collection

```json
{
  "info": {
    "name": "Secure Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:5000/api/auth/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:5000/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
# Password Reset Feature - Testing Guide

## Overview
This guide provides step-by-step instructions for testing the complete password reset flow in the GlobalStock application.

## Prerequisites

### 1. Backend Configuration
1. Navigate to `backend/` directory
2. Copy `.env.example` to `.env` (if you haven't already):
   ```bash
   cp .env.example .env
   ```
3. Configure email settings in `.env`:

#### For Gmail (Recommended for Testing):
```env
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password
```

**To get Gmail App-Specific Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (Custom name)" → Enter "GlobalStock"
5. Click "Generate"
6. Copy the 16-character password (remove spaces)
7. Paste into `EMAIL_PASS` in `.env`

#### For Other Email Providers:
```env
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

### 2. Development Mode (No Email Configuration)
If you don't configure email settings, the system will log password reset links to the **server console** instead of sending emails. This is useful for local testing.

## Testing Steps

### Test 1: Request Password Reset

1. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Navigate to Forgot Password page:**
   - Go to http://localhost:5173/login
   - Click "Forgot Password?" link
   - Or directly visit: http://localhost:5173/forgot-password

3. **Submit password reset request:**
   - Enter a valid user email address (an email that exists in your database)
   - Click "Send Reset Link"
   - Should see success message: "Check Your Email"

4. **Verify email was sent:**
   - **With Email Configured:** Check your inbox for email from GlobalStock
   - **Without Email (Dev Mode):** Check backend server console for reset link
   
   Example console output:
   ```
   ========================================
   PASSWORD RESET EMAIL (Development Mode)
   ========================================
   To: user@example.com
   Subject: Password Reset Request

   Reset link: http://localhost:5173/reset-password/abc123def456...
   ========================================
   ```

### Test 2: Reset Password with Valid Token

1. **Get the reset link:**
   - From email (if configured)
   - Or from server console (dev mode)
   - Format: `http://localhost:5173/reset-password/[TOKEN]`

2. **Click the reset link or paste in browser**
   - Should open the Reset Password page
   - Should see "Create New Password" form

3. **Enter new password:**
   - New Password: Enter a password (min. 6 characters)
   - Confirm Password: Re-enter the same password
   - Observe password strength indicator

4. **Submit the form:**
   - Click "Reset Password"
   - Should see success message with green checkmark
   - Should auto-redirect to login page after 2 seconds

5. **Test login with new password:**
   - On login page, enter the email and NEW password
   - Should successfully log in
   - Should redirect to appropriate page (/profile or /products)

6. **Verify confirmation email:**
   - Check inbox for "Password Reset Successful" confirmation
   - Or check server console in dev mode

### Test 3: Invalid/Expired Token

1. **Try using an expired token:**
   - Wait 1 hour after requesting reset
   - Click the reset link again
   - Should see error: "Invalid or expired reset token"

2. **Try using a token twice:**
   - Complete password reset successfully
   - Try using the same reset link again
   - Should see error: "Invalid or expired reset token"

3. **Try using a malformed token:**
   - Visit: `http://localhost:5173/reset-password/invalid-token-here`
   - Should see error: "Invalid or expired reset token"

### Test 4: Form Validation

1. **Test password requirements:**
   - Enter password less than 6 characters → Should show error
   - Enter password ≥ 6 characters → Should clear error

2. **Test password matching:**
   - Enter password in first field
   - Enter different password in confirm field
   - Should show error: "Passwords do not match"
   - Make them match → Error should disappear

3. **Test password strength indicator:**
   - Enter "123456" → Should show "Weak" (orange)
   - Enter "MyPass123" → Should show "Good" (blue)
   - Enter "MyP@ssw0rd!" → Should show "Strong" (green)

4. **Test empty fields:**
   - Try submitting with empty fields
   - Should show validation errors

### Test 5: Security Features

1. **Test email enumeration prevention:**
   - Request reset for non-existent email
   - Should still show "Check Your Email" (don't reveal if email exists)
   - No email should be sent
   - Check server console - should see no reset link

2. **Test token hashing:**
   - Request password reset
   - Check MongoDB database:
     ```javascript
     db.users.findOne({ email: "test@example.com" })
     ```
   - Verify `resetPasswordToken` is hashed (not plain text)
   - Verify `resetPasswordExpire` is set (Date object)

3. **Test token cleanup:**
   - Successfully reset password
   - Check database again:
     ```javascript
     db.users.findOne({ email: "test@example.com" })
     ```
   - Verify `resetPasswordToken` is undefined/null
   - Verify `resetPasswordExpire` is undefined/null

## Expected Behavior Summary

### Successful Flow:
1. User submits email → Success message + email sent
2. User clicks link → Reset password form appears
3. User enters new password → Success message + auto redirect
4. User logs in with new password → Successful authentication

### Error Cases:
- Non-existent email → Success message (security - no enumeration)
- Expired token (>1 hour) → "Invalid or expired reset token"
- Already used token → "Invalid or expired reset token"
- Malformed token → "Invalid or expired reset token"
- Password mismatch → "Passwords do not match"
- Too short password → "Password must be at least 6 characters"

## Troubleshooting

### Email Not Sending?
1. Check `.env` file exists in `backend/` directory
2. Verify `EMAIL_USER` and `EMAIL_PASS` are set correctly
3. For Gmail: Ensure App-Specific Password is used (not regular password)
4. Check server console for error messages
5. Try dev mode (no email config) to test without email

### Reset Link Not Working?
1. Verify `FRONTEND_URL` in `.env` matches your frontend URL
2. Check token hasn't expired (>1 hour)
3. Check token hasn't been used already
4. Check server console for errors

### Form Not Submitting?
1. Open browser DevTools → Console tab
2. Check for JavaScript errors
3. Verify API is responding: Check Network tab
4. Check backend server is running

### Database Issues?
1. Ensure MongoDB is running
2. Check `MONGO_URI` in `.env` is correct
3. Verify user exists in database:
   ```bash
   mongosh
   use globalstock
   db.users.findOne({ email: "test@example.com" })
   ```

## API Endpoints Reference

### POST `/api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### PUT `/api/auth/reset-password/:token`
**Request:**
```json
{
  "password": "newPassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

## Security Best Practices Implemented

✅ Tokens are cryptographically random (crypto.randomBytes)
✅ Tokens are SHA256 hashed before database storage
✅ Tokens expire after 1 hour
✅ Tokens are single-use (cleared after successful reset)
✅ Email enumeration is prevented (same response for all emails)
✅ Passwords are hashed with bcrypt before storage
✅ Password minimum length requirement (6 characters)
✅ Reset confirmation email sent after successful reset

## Notes

- Reset tokens are valid for **1 hour** from generation time
- Tokens are **single-use** - attempting to use a token twice will fail
- The system does **not reveal** whether an email exists in the database
- In development mode without email config, reset links are logged to server console
- Password strength indicator is client-side only (validation is server-side)
- The application automatically redirects to login 2 seconds after successful reset

## Next Steps After Testing

1. **Production Email Setup:**
   - Use a professional email service (SendGrid, Mailgun, AWS SES)
   - Update `.env` with production email credentials
   - Test email delivery in production environment

2. **UI Customization:**
   - Customize email templates in `backend/utils/emailService.util.js`
   - Update logo and branding in emails
   - Modify success/error messages as needed

3. **Additional Security:**
   - Consider adding rate limiting for password reset requests
   - Add CAPTCHA for forgot password form (prevent bots)
   - Log all password reset attempts for security monitoring

4. **Monitoring:**
   - Set up alerts for failed password reset attempts
   - Monitor email delivery success rates
   - Track password reset completion rates

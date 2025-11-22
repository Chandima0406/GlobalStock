import nodemailer from 'nodemailer';

/**
 * Create email transporter
 * Configure with your email service credentials
 */
const createTransporter = () => {
  // For development: Use Ethereal (fake SMTP service)
  // For production: Use real email service (Gmail, SendGrid, etc.)
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment && !process.env.EMAIL_USER) {
    console.log('⚠️  EMAIL_USER not configured. Email sending will be simulated.');
    console.log('💡 To send real emails, add EMAIL_USER and EMAIL_PASS to .env');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Password reset URL with token
 * @param {string} userName - User's name
 */
export const sendPasswordResetEmail = async (email, resetUrl, userName = 'User') => {
  const transporter = createTransporter();

  // If no transporter, log to console (development mode)
  if (!transporter) {
    console.log('\n📧 ========== PASSWORD RESET EMAIL ==========');
    console.log(`To: ${email}`);
    console.log(`Subject: Password Reset - GlobalStock`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log('===========================================\n');
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: `"GlobalStock" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - GlobalStock',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Hi ${userName},</p>
          
          <p style="font-size: 16px;">
            You requested to reset your password for your GlobalStock account. 
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              ⚠️ <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If you didn't request this password reset, please ignore this email. 
            Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} GlobalStock. All rights reserved.<br>
            This is an automated email, please do not reply.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${userName},

You requested to reset your password for your GlobalStock account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} GlobalStock. All rights reserved.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send password reset confirmation email
 * @param {string} email - Recipient email
 * @param {string} userName - User's name
 */
export const sendPasswordResetConfirmation = async (email, userName = 'User') => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n📧 ========== PASSWORD RESET CONFIRMATION ==========');
    console.log(`To: ${email}`);
    console.log(`Subject: Password Successfully Reset`);
    console.log('===================================================\n');
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: `"GlobalStock" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Successfully Reset - GlobalStock',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✅ Password Updated</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Hi ${userName},</p>
          
          <p style="font-size: 16px;">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          
          <div style="background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #0c5460;">
              🔒 <strong>Security Tip:</strong> If you didn't make this change, please contact our support team immediately.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} GlobalStock. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    // Don't throw error for confirmation email - password was already reset
    return { success: false, error: error.message };
  }
};

export default {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
};

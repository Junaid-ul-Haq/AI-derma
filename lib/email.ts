import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'AI Dermatology Platform'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Email templates
export function getDoctorApprovalEmail(name: string, email: string, password: string, loginUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .credentials { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .warning { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Doctor Account Approved</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Congratulations! Your doctor registration has been approved by the administrator.</p>
          <p>You can now access your doctor dashboard using the following credentials:</p>
          
          <div class="credentials">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <span class="warning">${password}</span></p>
          </div>
          
          <p class="warning">⚠️ Please change your password after first login for security.</p>
          
          <a href="${loginUrl}" class="button">Login to Dashboard</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            If you did not request this account, please contact support immediately.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getOTPEmail(name: string, otp: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .otp-box { background: white; padding: 30px; text-align: center; border-radius: 5px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
        .warning { color: #dc2626; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset OTP</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>You have requested to reset your password. Use the following OTP to verify your identity:</p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0;">Your OTP Code:</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>This OTP will expire in 10 minutes.</p>
          
          <p class="warning">⚠️ If you did not request this password reset, please ignore this email or contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getWelcomeEmail(name: string, loginUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .feature-item:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to AI Dermatology Platform! 🎉</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>We're thrilled to have you join our platform! Your account has been successfully created.</p>
          
          <div class="features">
            <h3 style="margin-top: 0; color: #667eea;">What you can do:</h3>
            <div class="feature-item">
              <strong>📸 Upload Skin Images:</strong> Get AI-powered analysis of your skin conditions
            </div>
            <div class="feature-item">
              <strong>📋 View Reports:</strong> Access detailed health reports and insights
            </div>
            <div class="feature-item">
              <strong>👨‍⚕️ Book Consultations:</strong> Connect with certified dermatologists
            </div>
            <div class="feature-item">
              <strong>🔒 Secure Profile:</strong> Manage your personal information safely
            </div>
          </div>
          
          <p>Get started by logging into your account:</p>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to Your Dashboard</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you have any questions or need assistance, feel free to contact our support team.
          </p>
          
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            Welcome aboard!<br>
            The AI Dermatology Platform Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}






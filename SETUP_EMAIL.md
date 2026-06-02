# Email Setup Guide

This application uses Nodemailer for sending emails. You need to configure SMTP settings in your `.env` file.

## Required Environment Variables

Add these to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=AI Dermatology Platform

# Application URL (for email links)
NEXTAUTH_URL=http://localhost:3000
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Alternative: Use OAuth2** (more secure for production)

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Testing Email

After setting up, test the email functionality by:
1. Registering as a doctor
2. Approving the doctor from admin panel
3. Check if the approval email is sent

## Troubleshooting

- **Connection timeout**: Check firewall settings
- **Authentication failed**: Verify SMTP credentials
- **Emails in spam**: Configure SPF/DKIM records for your domain (production)








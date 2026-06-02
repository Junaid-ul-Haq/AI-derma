# Admin Setup Guide

## Quick Fix for Admin Not Working

### 1. Check Your .env File

Make sure you have these variables set:

```env
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-admin-password
```

**IMPORTANT**: The email must match EXACTLY (case-insensitive) when you login.

### 2. Create Admin User Account

1. Go to `/auth/signup` (User tab)
2. Register with the email that matches `ADMIN_EMAIL` in your `.env`
3. Use any password (it will be hashed)
4. After registration, login with that email and password

### 3. Verify Admin Login

1. Go to `/auth/signin` (User tab)
2. Login with your admin email and password
3. You should be redirected to `/admin/dashboard`

### 4. Troubleshooting

**Problem: "Access Denied" or redirects to /upload**

**Solution:**
- Check browser console for role value
- Verify `ADMIN_EMAIL` in `.env` matches your login email exactly
- Make sure you're logging in as a USER (not doctor)
- Clear browser cache and cookies
- Restart the dev server after changing `.env`

**Problem: Role is "USER" instead of "ADMIN"**

**Solution:**
- The email comparison is case-insensitive but must match
- Check for extra spaces in `.env` file
- Restart the server after changing `.env`
- Try logging out and logging back in

**Problem: Session not persisting**

**Solution:**
- Check if `NEXTAUTH_SECRET` is set in `.env`
- Make sure `NEXTAUTH_URL` is set correctly
- Clear browser cookies and try again

### 5. Manual Admin Check

To verify admin status, check the browser console when on `/admin/dashboard`. You should see:
- `userRole: "ADMIN"`
- `userEmail: "your-admin-email@example.com"`

### 6. Test Admin APIs

Test if admin APIs work:
```bash
# After logging in as admin, open browser console and run:
fetch('/api/admin/doctors')
  .then(r => r.json())
  .then(console.log)
```

If you get `{ error: 'Unauthorized' }`, the role is not being set correctly.








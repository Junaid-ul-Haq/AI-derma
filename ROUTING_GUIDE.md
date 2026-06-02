# Routing Structure Guide

This document explains the routing structure and how navigation works in the application.

## File Structure

```
fyp/
├── app/
│   ├── page.tsx                    # Home/Landing page (public)
│   ├── layout.tsx                   # Root layout with Header
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx            # Sign in page (public)
│   │   └── signup/
│   │       └── page.tsx            # Sign up page (public)
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx            # Admin dashboard (protected)
│   ├── doctor/
│   │   └── dashboard/
│   │       └── page.tsx            # Doctor dashboard (protected)
│   └── upload/
│       └── page.tsx                # User upload page (protected)
├── middleware.ts                   # Route protection middleware
└── lib/
    └── auth.ts                     # NextAuth configuration
```

## Route Protection

### Middleware (`middleware.ts`)
- Protects all routes except public ones
- Redirects unauthenticated users to `/auth/signin`
- Redirects authenticated users based on their role:
  - **ADMIN** → `/admin/dashboard`
  - **DOCTOR** → `/doctor/dashboard`
  - **USER** → `/upload`

### Public Routes
- `/` - Landing page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/api/*` - API routes
- Static files and assets

### Protected Routes
- `/admin/*` - Only accessible to ADMIN role
- `/doctor/*` - Only accessible to DOCTOR role
- `/upload` - Only accessible to USER role

## Authentication Flow

### User Registration
1. User signs up at `/auth/signup`
2. After successful registration → redirects to `/auth/signin`
3. User signs in → redirects to `/upload` (user dashboard)

### Doctor Registration
1. Doctor signs up at `/auth/signup?type=doctor`
2. After successful registration → redirects to `/auth/signin?type=doctor`
3. Admin approves doctor → doctor receives email with temporary password
4. Doctor signs in → redirects to `/doctor/dashboard`

### Admin Login
1. Admin signs in at `/auth/signin`
2. After successful login → redirects to `/admin/dashboard`

## Navigation Behavior

### Using `router.replace()` instead of `router.push()`
- All redirects use `router.replace()` to prevent back button issues
- This replaces the current history entry instead of adding a new one
- Prevents users from going back to login pages after authentication

### Redirect Logic
- **After Login**: Users are redirected based on their role
- **Unauthorized Access**: Middleware redirects to appropriate signin page
- **Role Mismatch**: Users are redirected to their correct dashboard

## Key Features

1. **Automatic Redirects**: Middleware handles all route protection automatically
2. **Role-Based Access**: Each role has access only to their designated routes
3. **No Back Button Issues**: Using `replace()` instead of `push()` prevents navigation problems
4. **Proper History Management**: Browser history is maintained correctly

## Testing Routes

### Test User Flow
1. Go to `/auth/signup` → Create account
2. Sign in → Should redirect to `/upload`
3. Try accessing `/admin/dashboard` → Should redirect to `/upload`
4. Try accessing `/doctor/dashboard` → Should redirect to `/upload`

### Test Doctor Flow
1. Go to `/auth/signup?type=doctor` → Register as doctor
2. Wait for admin approval
3. Sign in with temporary password → Should redirect to `/doctor/dashboard`
4. Try accessing `/admin/dashboard` → Should redirect to `/doctor/dashboard`
5. Try accessing `/upload` → Should redirect to `/doctor/dashboard`

### Test Admin Flow
1. Sign in as admin → Should redirect to `/admin/dashboard`
2. Try accessing `/doctor/dashboard` → Should redirect to `/admin/dashboard`
3. Try accessing `/upload` → Should redirect to `/admin/dashboard`

## Troubleshooting

### Issue: Back button goes to localhost:3000
**Solution**: All redirects now use `router.replace()` instead of `router.push()`

### Issue: Wrong dashboard after login
**Solution**: Check middleware.ts - it handles role-based redirects automatically

### Issue: Can access unauthorized routes
**Solution**: Middleware should protect routes. Check that middleware.ts is in the root directory

### Issue: Redirect loops
**Solution**: Ensure dashboard pages check roles correctly and use `router.replace()`


# Complete Routing Structure

## URL Structure

### User Routes
- **`/user/dashboard`** - Main user dashboard (USER role only)
- **`/upload`** - Upload page for users (accessible from dashboard)

### Doctor Routes  
- **`/doctor/dashboard`** - Doctor dashboard (DOCTOR role only)

### Admin Routes
- **`/admin/dashboard`** - Admin dashboard (ADMIN role only)
- **`/admin/doctors`** - Manage doctors
- **`/admin/users`** - Manage users
- **`/admin/payments`** - Payment management

### Public Routes
- **`/`** - Landing page
- **`/auth/signin`** - Sign in page
- **`/auth/signup`** - Sign up page

## Authentication Flow

### When USER logs in:
1. Login at `/auth/signin`
2. Redirects to → **`/user/dashboard`**
3. Can access `/upload` from dashboard

### When DOCTOR logs in:
1. Login at `/auth/signin?type=doctor`
2. Redirects to → **`/doctor/dashboard`**
3. Cannot access `/user/dashboard` or `/upload`

### When ADMIN logs in:
1. Login at `/auth/signin`
2. Redirects to → **`/admin/dashboard`**
3. Cannot access `/user/dashboard` or `/doctor/dashboard`

## Route Protection

### Middleware Protection
- `/user/*` - Only USER role can access
- `/doctor/*` - Only DOCTOR role can access  
- `/admin/*` - Only ADMIN role can access
- `/upload` - Only USER role can access

### Automatic Redirects
- If USER tries to access `/doctor/dashboard` → Redirects to `/user/dashboard`
- If DOCTOR tries to access `/user/dashboard` → Redirects to `/doctor/dashboard`
- If ADMIN tries to access `/user/dashboard` → Redirects to `/admin/dashboard`
- If authenticated user visits `/auth/signin` → Redirects to their dashboard

## File Structure

```
app/
├── user/
│   └── dashboard/
│       └── page.tsx          # User dashboard
├── doctor/
│   └── dashboard/
│       └── page.tsx           # Doctor dashboard
├── admin/
│   ├── dashboard/
│   │   └── page.tsx           # Admin dashboard
│   ├── doctors/
│   │   └── page.tsx           # Manage doctors
│   └── users/
│       └── page.tsx           # Manage users
├── upload/
│   └── page.tsx               # Upload page (for users)
└── auth/
    ├── signin/
    │   └── page.tsx           # Sign in
    └── signup/
        └── page.tsx           # Sign up
```

## Key Points

1. **Users** → `/user/dashboard` (NOT `/upload`)
2. **Doctors** → `/doctor/dashboard` (NOT `/user/dashboard`)
3. **Admins** → `/admin/dashboard` (NOT `/user/dashboard` or `/doctor/dashboard`)
4. **Upload page** (`/upload`) is accessible from user dashboard but redirects non-users
5. All routes are protected by middleware
6. Role-based redirects happen automatically


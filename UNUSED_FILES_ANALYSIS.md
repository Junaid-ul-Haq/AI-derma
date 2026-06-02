# Unused Files Analysis

This document lists all files that are currently **NOT being used** in the project.

## ✅ DELETION COMPLETED

All verified unused files have been deleted on: $(Get-Date)

### Deleted Files:
1. ✅ `/app/api/test-db/route.ts` - Database test endpoint (only in docs)
2. ✅ `/app/api/doctors/test/route.ts` - Doctor test endpoint
3. ✅ `/app/api/doctors/debug/route.ts` - Debug endpoint
4. ✅ `/app/api/doctors/fix-status/route.ts` - Status fix endpoint
5. ✅ `/app/api/admin/doctors/fix-status/route.ts` - Admin status fix endpoint
6. ✅ `/fyp/curl` - Empty file
7. ✅ `/app/doctor/upload/` - Empty directory
8. ✅ `/fyp/styles/` - Empty directory

---

## Original Analysis (Before Deletion)

## Summary
- **Total Unused Files**: 12 files
- **Categories**: API Routes (7), Pages (2), Directories (2), Other (1)

---

## 1. Unused API Routes (Development/Debug Endpoints)

These are test/debug endpoints that are not called from the frontend:

### `/app/api/test-db/route.ts`
- **Status**: Unused in production
- **Purpose**: Database connection testing
- **Usage**: Only mentioned in documentation (DATABASE_FIXES.md, README.md)
- **Recommendation**: Keep for development, remove in production

### `/app/api/doctors/test/route.ts`
- **Status**: Unused
- **Purpose**: Test endpoint to check doctors
- **Usage**: No frontend calls found
- **Recommendation**: Remove or keep for development only

### `/app/api/doctors/debug/route.ts`
- **Status**: Unused
- **Purpose**: Comprehensive debug endpoint for doctor status
- **Usage**: No frontend calls found
- **Recommendation**: Remove or keep for development only

### `/app/api/doctors/fix-status/route.ts`
- **Status**: Unused
- **Purpose**: Fix endpoint to set all doctors to APPROVED status
- **Usage**: No frontend calls found
- **Recommendation**: Remove or keep for development only

### `/app/api/admin/doctors/fix-status/route.ts`
- **Status**: Unused
- **Purpose**: Admin endpoint to update all doctors to APPROVED
- **Usage**: No frontend calls found
- **Recommendation**: Remove or keep for development only

### `/app/api/admin/doctors/diagnose/route.ts`
- **Status**: **USED** (via `/admin/doctors/diagnose` page)
- **Purpose**: Diagnose doctor database issues
- **Usage**: Called from `app/admin/doctors/diagnose/page.tsx`
- **Recommendation**: **KEEP** - This is actively used

### `/app/api/upload/route.ts`
- **Status**: **USED**
- **Purpose**: File upload endpoint
- **Usage**: Called from multiple places:
  - `app/user/upload/page.tsx`
  - `app/upload/page.tsx`
  - `app/auth/signup/page.tsx`
  - `components/ProfileSidebar.tsx`
- **Recommendation**: **KEEP** - This is actively used

---

## 2. Unused Pages

### `/app/upload/page.tsx`
- **Status**: Potentially unused (duplicate functionality)
- **Purpose**: Standalone upload page
- **Usage**: Functionality duplicated in `/app/user/upload/page.tsx`
- **Note**: This page redirects authenticated users to dashboards, so it's only accessible to unauthenticated users
- **Recommendation**: Consider removing if `/user/upload` is the preferred route

---

## 3. Empty Directories

### `/app/admin/users/[id]/`
- **Status**: Empty directory
- **Purpose**: Previously used for user detail pages
- **Usage**: Replaced by modal in `app/admin/users/page.tsx`
- **Recommendation**: **DELETE** - Directory is empty and unused

### `/app/admin/doctors/[id]/`
- **Status**: Empty directory
- **Purpose**: Previously used for doctor detail pages
- **Usage**: Replaced by modal in `app/admin/doctors/page.tsx`
- **Recommendation**: **DELETE** - Directory is empty and unused

### `/app/doctor/upload/`
- **Status**: Empty directory
- **Purpose**: Unknown (possibly planned feature)
- **Usage**: No files found
- **Recommendation**: **DELETE** - Directory is empty

---

## 4. Other Files

### `/fyp/curl`
- **Status**: Empty file
- **Purpose**: Unknown
- **Usage**: No content
- **Recommendation**: **DELETE** - Empty file

### `/fyp/styles/`
- **Status**: Empty directory
- **Purpose**: Possibly for custom styles
- **Usage**: No files found
- **Recommendation**: **DELETE** - Empty directory

---

## 5. Library Files Status

### `/lib/mongodb.ts`
- **Status**: **USED**
- **Purpose**: MongoDB client for NextAuth adapter
- **Usage**: Imported in `lib/auth.ts` for MongoDBAdapter
- **Recommendation**: **KEEP** - Required for authentication

---

## Files That ARE Being Used (For Reference)

### Components (All Used)
- ✅ `components/Alert.tsx` - Used via AlertProvider
- ✅ `components/AlertProvider.tsx` - Used in Providers
- ✅ `components/DashboardSidebar.tsx` - Used in all dashboards
- ✅ `components/Header.tsx` - Used in layout
- ✅ `components/ProfileSidebar.tsx` - Used in Header
- ✅ `components/Providers.tsx` - Used in layout
- ✅ `components/Hero.jsx` - Used in landing page
- ✅ `components/WhyImportant.tsx` - Used in landing page
- ✅ `components/HowItWorks.tsx` - Used in landing page
- ✅ `components/Features.tsx` - Used in landing page
- ✅ `components/AIReport.tsx` - Used in landing page
- ✅ `components/TrustSafety.tsx` - Used in landing page
- ✅ `components/Footer.tsx` - Used in landing page

### Models (All Used)
- ✅ `models/User.ts` - Used in multiple API routes
- ✅ `models/Doctor.ts` - Used in multiple API routes
- ✅ `models/Consultation.ts` - Used in consultation routes
- ✅ `models/OTP.ts` - Used in OTP verification

### API Routes (Mostly Used)
- ✅ All auth routes (`/api/auth/*`)
- ✅ All consultation routes (`/api/consultations/*`)
- ✅ All doctor routes (`/api/doctors/*`) except test/debug ones
- ✅ All admin routes (`/api/admin/*`) except fix-status
- ✅ All user routes (`/api/user/*`)
- ✅ Upload route (`/api/upload`)

---

## Recommendations

### Safe to Delete Immediately:
1. `/app/admin/users/[id]/` (empty directory)
2. `/app/admin/doctors/[id]/` (empty directory)
3. `/app/doctor/upload/` (empty directory)
4. `/fyp/curl` (empty file)
5. `/fyp/styles/` (empty directory)

### Consider Removing (Development/Debug):
1. `/app/api/test-db/route.ts` - Keep for dev, remove in production
2. `/app/api/doctors/test/route.ts` - Remove if not needed
3. `/app/api/doctors/debug/route.ts` - Remove if not needed
4. `/app/api/doctors/fix-status/route.ts` - Remove if not needed
5. `/app/api/admin/doctors/fix-status/route.ts` - Remove if not needed

### Review Before Removing:
1. `/app/upload/page.tsx` - Check if this standalone page is needed or if `/user/upload` is sufficient

---

## Notes

- The analysis was performed by checking:
  - Import statements across all files
  - API route calls from frontend components
  - Next.js routing structure
  - File references in documentation

- Some files may be used indirectly or in ways not easily detectable through static analysis.

- Test/debug endpoints might be useful during development but should be removed or secured in production.


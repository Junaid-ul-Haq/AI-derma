@echo off
echo ========================================
echo Fixing MongoDB URI in .env.local
echo ========================================
echo.

echo Found issue: MongoDB URI has line break
echo Current: 
echo   MONGODB_URI=mongodb://localhost:27017
echo   /skin-disease-detection
echo.
echo Fixing to single line...

REM Create backup
copy .env.local .env.local.backup >nul 2>&1

REM Create fixed version
(
echo # MongoDB connection string
echo MONGODB_URI=mongodb://localhost:27017/skin-disease-detection
echo.
echo # Public app name
echo NEXT_PUBLIC_APP_NAME=Skinova
echo.
echo # NextAuth Configuration
echo NEXTAUTH_URL=http://localhost:3000
echo NEXTAUTH_SECRET=dd978becf555888298ad3b42d09c8eb14d3f6dac23c5bf00c267b6d22aa708c4
echo ADMIN_EMAIL=admin1@gmail.com
echo ADMIN_PASSWORD=admin@123
echo.
echo # SMTP Email Configuration
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=muhammadjunaidulhaq2028@gmail.com
echo SMTP_PASS=kxfv tuvu pddm mgwp
echo SMTP_FROM_NAME=AI Dermatology Platform
) > .env.local

echo.
echo ✅ Fixed .env.local file
echo MongoDB URI is now on single line
echo.
echo Now run: npm run dev
echo You should see: "Database: Connected successfully"
echo.

pause

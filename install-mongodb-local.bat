@echo off
echo ========================================
echo MongoDB Local Installation Guide
echo ========================================
echo.

echo MongoDB is not installed on your system.
echo Follow these steps to install MongoDB:
echo.

echo 1. Download MongoDB Community Server:
echo    https://www.mongodb.com/try/download/community
echo.
echo 2. During installation:
echo    - Choose "Complete" installation
echo    - Install "MongoDB Compass" (optional GUI tool)
echo    - Install "MongoDB as a Service"
echo.
echo 3. After installation, restart this script
echo.

echo 4. Alternative: Use MongoDB Atlas (Cloud - No installation needed)
echo    - Visit: https://www.mongodb.com/cloud/atlas/register
echo    - Create free account
echo    - Create free cluster
echo    - Get connection string
echo    - Update .env.local file
echo.

echo For now, let's set up a cloud database...
echo.

pause
call setup-mongodb-atlas.bat

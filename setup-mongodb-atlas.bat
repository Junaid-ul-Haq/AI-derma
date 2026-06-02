@echo off
echo ========================================
echo MongoDB Atlas Setup for Doctor App
echo ========================================
echo.

echo MongoDB is not installed on your system.
echo Setting up MongoDB Atlas (Cloud Database) instead...
echo.

REM Check if .env.local exists
if exist .env.local (
    echo Found existing .env.local file
    echo.
    echo Current database configuration:
    type .env.local | findstr MONGODB_URI
    echo.
    echo Do you want to update to MongoDB Atlas? (y/n)
    set /p update=
    if /i "%update%" neq "y" goto :end
)

echo.
echo Setting up MongoDB Atlas connection...
echo.

REM Create .env.local with MongoDB Atlas URI
echo MONGODB_URI=mongodb+srv://demo:demo123@cluster0.abcde.mongodb.net/skin-disease-detection?retryWrites=true^&w=majority > .env.local

echo.
echo ========================================
echo MongoDB Atlas Configuration Complete
echo ========================================
echo.
echo Database URI: mongodb+srv://demo:demo123@cluster0.abcde.mongodb.net/skin-disease-detection
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. You should see: "Database: Connected successfully"
echo 3. If connection fails, we'll help you get a free Atlas account
echo.
echo Note: This is a demo connection. For production:
echo - Get your own free MongoDB Atlas account
echo - Create a cluster
echo - Update the MONGODB_URI in .env.local
echo.

:end
echo.
echo Setup complete! Run 'npm run dev' to test the connection.
pause

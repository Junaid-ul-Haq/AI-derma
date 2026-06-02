@echo off
echo ========================================
echo Database Connection Setup Helper
echo ========================================
echo.

echo Checking current MongoDB status...
netstat -an | findstr :27017 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB is already running on port 27017
    goto :check_env
) else (
    echo ❌ MongoDB is not running
    echo.
    echo Starting MongoDB...
    
    REM Create data directories
    if not exist "C:\data\db" mkdir "C:\data\db" 2>nul
    if not exist "C:\data\log" mkdir "C:\data\log" 2>nul
    
    REM Start MongoDB
    start "MongoDB" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db" --logpath "C:\data\log\mongod.log"
    
    echo Waiting for MongoDB to start...
    timeout /t 5 >nul
    
    REM Check if started
    netstat -an | findstr :27017 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ MongoDB started successfully
    ) else (
        echo ❌ Failed to start MongoDB
        echo Please check:
        echo 1. MongoDB is installed at "C:\Program Files\MongoDB\Server\7.0\bin\"
        echo 2. Port 27017 is not blocked
        echo 3. You have administrator privileges
    )
)

:check_env
echo.
echo Checking database configuration...
echo.

REM Create .env.local file with proper MongoDB URI
echo MONGODB_URI=mongodb://localhost:27017/skin-disease-detection > .env.local
echo ✅ Created .env.local with MongoDB URI
echo.

echo ========================================
echo Database Connection Information:
echo ========================================
echo.
echo MongoDB URI: mongodb://localhost:27017/skin-disease-detection
echo Database Name: skin-disease-detection
echo Port: 27017
echo.
echo Next steps:
echo 1. Keep this terminal open (MongoDB running)
echo 2. Open new terminal for the application
echo 3. Run: npm run dev
echo 4. The app should now connect to database
echo.
echo To stop MongoDB later: Close this terminal or run: taskkill /f /im mongod.exe
echo.

pause

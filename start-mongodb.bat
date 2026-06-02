@echo off
echo ========================================
echo Starting MongoDB for Doctor App
echo ========================================
echo.

REM Try starting MongoDB as service
net start MongoDB
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB started as service
    goto :success
)

echo.
echo Service start failed, trying manual start...
echo.

REM Create data directory if it doesn't exist
if not exist "C:\data\db" mkdir "C:\data\db"
if not exist "C:\data\log" mkdir "C:\data\log"

REM Try manual start
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db" --logpath "C:\data\log\mongod.log" --install

REM Wait a moment
timeout /t 3 >nul

REM Try to start as service again
net start MongoDB
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB started successfully
    goto :success
)

echo ❌ Failed to start MongoDB
echo Please check:
echo 1. MongoDB is installed correctly
echo 2. No other MongoDB instances are running
echo 3. Ports 27017-27019 are available
goto :end

:success
echo.
echo ✅ MongoDB is running on port 27017
echo You can now access the application
echo Doctors should appear in user dashboard

:end
echo.
pause

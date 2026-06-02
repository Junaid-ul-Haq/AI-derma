# Database Connection Setup Guide

## Problem
The application cannot connect to MongoDB database, causing:
- ❌ No doctors appear in user dashboard
- ❌ All API calls return 500 errors
- ❌ Database connection refused errors

## Solution Steps

### Step 1: Start MongoDB Database

**Option A: Use Setup Script (Recommended)**
```bash
# Run the automated setup script
.\setup-database.bat
```

**Option B: Manual MongoDB Start**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually (if service fails)
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### Step 2: Verify MongoDB is Running
```bash
# Check if MongoDB is listening on port 27017
netstat -an | findstr :27017

# Should show output like:
# TCP    127.0.0.1:27017    0.0.0.0:0    LISTENING
```

### Step 3: Set Environment Variable
Create `.env.local` file in project root with:
```
MONGODB_URI=mongodb://localhost:27017/skin-disease-detection
```

### Step 4: Start Application
```bash
npm run dev
```

## Troubleshooting

### If MongoDB Service Fails:
1. **Check Installation**: Ensure MongoDB is installed at `C:\Program Files\MongoDB\Server\7.0\bin\`
2. **Permissions**: Run command prompt as Administrator
3. **Port Conflicts**: Ensure port 27017 is not in use
4. **Data Directory**: Create `C:\data\db` directory manually if needed

### If Connection Still Fails:
1. **Check MongoDB Process**: `tasklist | findstr mongod`
2. **Check Logs**: Look at `C:\data\log\mongod.log`
3. **Restart MongoDB**: Stop and start the service
4. **Firewall**: Ensure port 27017 is not blocked

## Expected Result After Fix
✅ MongoDB running on port 27017
✅ Application connects successfully  
✅ Doctors appear in user dashboard
✅ All APIs work correctly
✅ Payment system functions

## Quick Test
After setup, visit: http://localhost:3000/api/doctors
Should return JSON with doctor data instead of 500 error.

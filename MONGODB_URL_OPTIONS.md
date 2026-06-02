# MongoDB URL String Options

## Option 1: Local MongoDB (Recommended for Development)
```
MONGODB_URI=mongodb://localhost:27017/skin-disease-detection
```

## Option 2: MongoDB Atlas (Cloud Database)
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/skin-disease-detection?retryWrites=true&w=majority
```

## Option 3: MongoDB Atlas with Specific Settings
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/skin-disease-detection?retryWrites=true&w=majority&appName=Cluster0
```

## How to Set Up:

### For Local MongoDB:
1. Install MongoDB Community Server
2. Start MongoDB service: `net start MongoDB`
3. Use this URL in `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/skin-disease-detection
   ```

### For MongoDB Atlas (Cloud):
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster
4. Get connection string from Atlas dashboard
5. Replace `<username>` and `<password>` with your Atlas credentials
6. Use in `.env.local`

## URL Format Breakdown:

### Local MongoDB:
```
mongodb://localhost:27017/skin-disease-detection
│         │         │        │                    │
│         │         │        │                    └── Database Name
│         │         │        └─────────────────────── Port
│         │         └─────────────────────────────── Host (localhost)
│         └─────────────────────────────────────── Protocol (mongodb)
└─────────────────────────────────────────────── Full URL
```

### MongoDB Atlas:
```
mongodb+srv://user:pass@cluster.mongodb.net/db?options
│              │    │    │                    │       │
│              │    │    │                    │       └── Connection Options
│              │    │    │                    └────────── Database Name
│              │    │    └─────────────────────────────── Atlas Cluster
│              │    └─────────────────────────────────── Password
│              └─────────────────────────────────────── Username
└─────────────────────────────────────────────── Protocol (mongodb+srv)
```

## Quick Setup:

### Create .env.local file:
```bash
# For local development
MONGODB_URI=mongodb://localhost:27017/skin-disease-detection

# OR for MongoDB Atlas (get your own credentials)
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.abcde.mongodb.net/skin-disease-detection?retryWrites=true&w=majority
```

### Test Connection:
After setting up, run:
```bash
npm run dev
```

You should see:
```
Database: Creating new connection...
Database: Connecting to: mongodb://localhost:27017/skin-disease-detection
========================================
Database: Connected successfully
Database: Ready for operations
========================================
```

## Troubleshooting:
- **ECONNREFUSED**: MongoDB not running (start service)
- **Authentication failed**: Wrong username/password in URL
- **Database not found**: Wrong database name in URL
- **Network timeout**: Wrong cluster URL or network issues

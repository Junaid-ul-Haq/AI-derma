import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  console.log('To fix: Create .env.local file with: MONGODB_URI=mongodb://localhost:27017/skin-disease-detection');
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Database: Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      maxPoolSize: 10,
    };

    console.log('Database: Creating new connection...');
    console.log('Database: Connecting to:', MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@')); // Hide credentials
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('========================================');
      console.log('Database: Connected successfully');
      console.log('Database: Ready for operations');
      console.log('========================================');
      return mongoose;
    }).catch((error) => {
      console.error('========================================');
      console.error('Database: Connection error:', error.message);
      console.error('Database: Connection failed');
      console.error('========================================');
      
      // Provide helpful error messages
      if (error.message.includes('ECONNREFUSED')) {
        console.error('Solution: Start MongoDB service or use MongoDB Atlas');
        console.error('Local: Run "net start MongoDB" as Administrator');
        console.error('Atlas: Update MONGODB_URI in .env.local to cloud database');
      } else if (error.message.includes('ENOTFOUND')) {
        console.error('Solution: Check network connection or database URL');
      } else if (error.message.includes('authentication')) {
        console.error('Solution: Check database credentials in MONGODB_URI');
      }
      
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('Database: Connection failed:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
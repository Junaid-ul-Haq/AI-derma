/**
 * Admin Seeder Script
 * Creates the admin user in MongoDB Atlas using credentials from .env.local
 *
 * Run with:  node scripts/seed-admin.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── 1. Load .env.local manually ──────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env.local not found at', envPath);
  process.exit(1);
}

const envLines = fs.readFileSync(envPath, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  env[key] = value;
}

const MONGODB_URI  = env['MONGODB_URI'];
const ADMIN_EMAIL  = env['ADMIN_EMAIL'];
const ADMIN_PASSWORD = env['ADMIN_PASSWORD'];

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ERROR: Missing one of MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD in .env.local');
  console.error('Found:', { MONGODB_URI: !!MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD: !!ADMIN_PASSWORD });
  process.exit(1);
}

// ── 2. Mongoose User schema (mirrors models/User.ts) ────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, maxlength: 50 },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true, minlength: 6 },
    profileImage: { type: String, default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ── 3. Seed ───────────────────────────────────────────────────────────────────
async function seedAdmin() {
  console.log('\n========================================');
  console.log('  Admin Seeder');
  console.log('========================================');

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected.\n');

  const normalizedEmail = ADMIN_EMAIL.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    console.log(`Admin account already exists for: ${normalizedEmail}`);
    console.log('No changes made. You can sign in now.\n');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    name: 'Admin',
    email: normalizedEmail,
    password: hashedPassword,
  });

  console.log('Admin user created successfully!');
  console.log('----------------------------------------');
  console.log('  Email   :', normalizedEmail);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('  Role    : ADMIN (assigned at login via ADMIN_EMAIL env var)');
  console.log('----------------------------------------\n');
  console.log('You can now sign in at:  http://localhost:3000/auth/signin\n');

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('Seeder failed:', err.message);
  process.exit(1);
});

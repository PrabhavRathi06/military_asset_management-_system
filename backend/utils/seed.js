// =============================================
// utils/seed.js
// Database Seed Script
//
// Run this ONCE to populate demo data:
//   cd backend
//   node utils/seed.js
//
// Creates:
//   - 3 Army Bases
//   - 5 Asset Types (weapons, vehicles, ammo)
//   - 3 Users (one per role)
//   - Initial Inventory for each base
// =============================================

require('dotenv').config(); // Load .env from current directory (backend/)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Base = require('../models/Base');
const Asset = require('../models/Asset');
const Inventory = require('../models/Inventory');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');
};

const seedDatabase = async () => {
  await connectDB();

  // ---- Clear existing data ----
  console.log('🗑️  Clearing existing seed data...');
  await User.deleteMany({});
  await Base.deleteMany({});
  await Asset.deleteMany({});
  await Inventory.deleteMany({});

  // ---- Create 3 Bases ----
  console.log('🏕️  Creating bases...');
  const bases = await Base.insertMany([
    { name: 'Alpha Base', location: 'Rajasthan, India' },
    { name: 'Bravo Base', location: 'Punjab, India' },
    { name: 'Charlie Base', location: 'Ladakh, India' },
  ]);

  const [alphaBase, bravoBase, charlieBase] = bases;
  console.log(`   ✓ Created ${bases.length} bases`);

  // ---- Create 5 Asset Types ----
  console.log('🔫 Creating asset types...');
  const assets = await Asset.insertMany([
    { name: 'M16 Rifle', type: 'Weapon', unit: 'Piece', description: 'Standard assault rifle' },
    { name: 'AK-47', type: 'Weapon', unit: 'Piece', description: 'Automatic assault rifle' },
    { name: 'Humvee', type: 'Vehicle', unit: 'Vehicle', description: 'Multi-purpose tactical vehicle' },
    { name: '9mm Ammunition', type: 'Ammunition', unit: 'Round', description: '9mm pistol ammunition' },
    { name: 'Body Armor', type: 'Equipment', unit: 'Piece', description: 'Level III ballistic vest' },
  ]);

  const [rifle, ak47, humvee, ammo, armor] = assets;
  console.log(`   ✓ Created ${assets.length} asset types`);

  // ---- Create 3 Users (one per role) ----
  console.log('👤 Creating users...');

  // Hash passwords manually since we're using insertMany (not .save())
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const commanderPass = await bcrypt.hash('Commander@123', 10);
  const logisticsPass = await bcrypt.hash('Logistics@123', 10);

  const users = await User.insertMany([
    {
      name: 'System Admin',
      email: 'admin@military.com',
      passwordHash: adminPass,
      role: 'Admin',
      baseId: null,
    },
    {
      name: 'Col. Ravi Kumar',
      email: 'commander@military.com',
      passwordHash: commanderPass,
      role: 'BaseCommander',
      baseId: alphaBase._id,
    },
    {
      name: 'Lt. Priya Singh',
      email: 'logistics@military.com',
      passwordHash: logisticsPass,
      role: 'LogisticsOfficer',
      baseId: bravoBase._id,
    },
  ]);
  console.log(`   ✓ Created ${users.length} users`);

  // ---- Create Inventory (initial stock at each base) ----
  console.log('📦 Creating initial inventory...');
  await Inventory.insertMany([
    // Alpha Base inventory
    { assetId: rifle._id, baseId: alphaBase._id, openingBalance: 100, currentStock: 100 },
    { assetId: humvee._id, baseId: alphaBase._id, openingBalance: 15, currentStock: 15 },
    { assetId: ammo._id, baseId: alphaBase._id, openingBalance: 5000, currentStock: 5000 },
    { assetId: armor._id, baseId: alphaBase._id, openingBalance: 80, currentStock: 80 },

    // Bravo Base inventory
    { assetId: ak47._id, baseId: bravoBase._id, openingBalance: 75, currentStock: 75 },
    { assetId: humvee._id, baseId: bravoBase._id, openingBalance: 10, currentStock: 10 },
    { assetId: ammo._id, baseId: bravoBase._id, openingBalance: 3000, currentStock: 3000 },

    // Charlie Base inventory
    { assetId: rifle._id, baseId: charlieBase._id, openingBalance: 60, currentStock: 60 },
    { assetId: armor._id, baseId: charlieBase._id, openingBalance: 50, currentStock: 50 },
    { assetId: ammo._id, baseId: charlieBase._id, openingBalance: 2000, currentStock: 2000 },
  ]);
  console.log(`   ✓ Created initial inventory for all bases`);

  // ---- Summary ----
  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('   Admin          → admin@military.com     / Admin@123');
  console.log('   BaseCommander  → commander@military.com / Commander@123');
  console.log('   LogisticsOfficer → logistics@military.com / Logistics@123');

  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

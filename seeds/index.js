'use strict';

const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

// ─── Resolve packages from server/node_modules ───────────────────────────────
// seeds/ lives outside server/ so we borrow server's node_modules
const serverRequire = createRequire(path.resolve(__dirname, '../server/package.json'));
const mongoose = serverRequire('mongoose');

// ─── Load environment variables from root .env ───────────────────────────────
const envCandidates = [
  path.resolve(__dirname, '../.env'),
];

for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const eqIdx = trimmed.indexOf('=');
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

// ─── Import individual seed modules ──────────────────────────────────────────
const { seedRoles } = require('./roles.seed');
const { seedUsers } = require('./users.seed');
const { seedCategories } = require('./categories.seed');
const { seedProducts } = require('./products.seed');

// ─── Configuration ────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zylo';

// ─── Main Runner ──────────────────────────────────────────────────────────────
async function runSeed() {
  const args = process.argv.slice(2);
  const clean = args.includes('--clean');
  const onlyRoles = args.includes('--roles');
  const onlyUsers = args.includes('--users');
  const onlyCategories = args.includes('--categories');
  const onlyProducts = args.includes('--products');
  const runAll = !onlyRoles && !onlyUsers && !onlyCategories && !onlyProducts;

  console.log('====================================================');
  console.log('🌱  ZYLO Database Seeder');
  console.log('====================================================');
  console.log(`📡  MongoDB: ${MONGO_URI}`);
  if (clean) console.log('⚠️   Mode: CLEAN — collections will be wiped before seeding');
  console.log('----------------------------------------------------\n');

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection;
  console.log('✓ Connected to MongoDB.\n');

  try {
    if (runAll || onlyRoles) {
      console.log('▶ [1/4] Roles');
      await seedRoles(db, clean);
      console.log('');
    }

    if (runAll || onlyUsers) {
      console.log('▶ [2/4] Users');
      await seedUsers(db, clean);
      console.log('');
    }

    if (runAll || onlyCategories) {
      console.log('▶ [2/3] Categories');
      await seedCategories(db, clean);
      console.log('');
    }

    if (runAll || onlyProducts) {
      console.log('▶ [3/3] Products');
      await seedProducts(db, clean);
      console.log('');
    }

    // ─── Summary ───────────────────────────────────────────────────────────
    console.log('----------------------------------------------------');
    console.log('📊  Collection counts after seeding:');
    console.log(`    Users      : ${await db.collection('users').countDocuments()}`);
    console.log(`    Categories : ${await db.collection('categories').countDocuments()}`);
    console.log(`    Products   : ${await db.collection('products').countDocuments()}`);
    console.log('====================================================');
    console.log('✨  Seeding completed successfully!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌  Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runSeed();

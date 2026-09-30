const path = require('path');
const { createRequire } = require('module');
const serverRequire = createRequire(path.resolve(__dirname, '../server/package.json'));
const bcrypt = serverRequire('bcryptjs');
const crypto = require('crypto');

/**
 * Resolve a seed password from the environment. Dev defaults are only allowed
 * outside production so real deployments never get well-known credentials.
 */
function seedPassword(envName, devDefault) {
  const value = process.env[envName];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${envName} must be set when seeding in production`);
  }
  return devDefault;
}

/**
 * Seed users collection
 * @param {import('mongoose').Connection} db
 * @param {boolean} clean
 */
async function seedUsers(db, clean = false) {
  const usersCollection = db.collection('users');

  if (clean) {
    console.log('  🧹 Cleaning users collection...');
    await usersCollection.deleteMany({});
  }

  const saltRounds = 12;
  const salt = await bcrypt.genSalt(saltRounds);
  const now = new Date();

  const adminPassword = seedPassword('SEED_ADMIN_PASSWORD', 'AdminPassword123!');
  const customerPassword = seedPassword('SEED_CUSTOMER_PASSWORD', 'CustomerPassword123!');

  const userRecords = [
    {
      name: 'System Administrator',
      email: 'admin@zylo.internal',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Test Customer',
      email: 'customer@zylo.internal',
      password: customerPassword,
      role: 'CUSTOMER',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      isActive: true,
      isEmailVerified: true,
    },
  ];

  console.log(`  👤 Seeding ${userRecords.length} users...`);

  for (const record of userRecords) {
    const existing = await usersCollection.findOne({ email: record.email.toLowerCase() });
    const passwordHash = await bcrypt.hash(record.password, salt);

    if (existing) {
      await usersCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: record.name,
            passwordHash,
            role: record.role,
            isActive: record.isActive,
            isEmailVerified: record.isEmailVerified,
            updatedAt: now,
          },
        }
      );
      console.log(`    ↳ Updated: ${record.email} (${record.role})`);
    } else {
      const id = crypto.randomUUID();
      await usersCollection.insertOne({
        _id: id,
        name: record.name,
        email: record.email.toLowerCase(),
        passwordHash,
        role: record.role,
        isActive: record.isActive,
        isEmailVerified: record.isEmailVerified,
        addresses: [],
        createdAt: now,
        updatedAt: now,
      });
      console.log(`    ↳ Created: ${record.email} (${record.role}) [ID: ${id}]`);
    }
  }

  console.log('  ✓ Users seeding completed.');
}

module.exports = { seedUsers };

const path = require('path');
const { createRequire } = require('module');
const serverRequire = createRequire(path.resolve(__dirname, '../server/package.json'));
const bcrypt = serverRequire('bcryptjs');
const crypto = require('crypto');

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

  const userRecords = [
    {
      name: 'System Administrator',
      email: 'admin@zylo.internal',
      password: 'AdminPassword123!',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Test Customer',
      email: 'customer@zylo.internal',
      password: 'CustomerPassword123!',
      role: 'CUSTOMER',
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'CustomerPassword123!',
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

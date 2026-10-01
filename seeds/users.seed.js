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
  const supportPassword = seedPassword('SEED_SUPPORT_PASSWORD', 'SupportPassword123!');

  const rolesCollection = db.collection('roles');
  const superAdminRole = await rolesCollection.findOne({ key: 'super_admin' });
  const supportRole = await rolesCollection.findOne({ key: 'customer_support' });

  const userRecords = [
    {
      name: 'System Administrator',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@zylo.internal',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      accountType: 'STAFF',
      roleIds: superAdminRole ? [superAdminRole._id.toString()] : [],
      userCode: 'ZY-0001',
      designation: 'Platform Super Administrator',
      isActive: true,
      status: 'ACTIVE',
      isEmailVerified: true,
      mustChangePassword: true,
    },
    {
      name: 'Support Agent',
      firstName: 'Support',
      lastName: 'Agent',
      email: 'support@zylo.internal',
      password: supportPassword,
      role: 'SUPPORT_AGENT',
      accountType: 'STAFF',
      roleIds: supportRole ? [supportRole._id.toString()] : [],
      userCode: 'ZY-0002',
      designation: 'Customer Care Executive',
      isActive: true,
      status: 'ACTIVE',
      isEmailVerified: true,
      mustChangePassword: true,
    },
    {
      name: 'Test Customer',
      firstName: 'Test',
      lastName: 'Customer',
      email: 'customer@zylo.internal',
      password: customerPassword,
      role: 'CUSTOMER',
      accountType: 'CUSTOMER',
      roleIds: [],
      isActive: true,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
    {
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      accountType: 'CUSTOMER',
      roleIds: [],
      isActive: true,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  ];

  console.log(`  👤 Seeding ${userRecords.length} users...`);

  for (const record of userRecords) {
    const existing = await usersCollection.findOne({ email: record.email.toLowerCase() });
    const passwordHash = await bcrypt.hash(record.password, salt);
    const securityFields = {
      hasPassword: true,
      passwordChangedAt: new Date(now.getTime() - 1000),
      mustChangePassword: Boolean(record.mustChangePassword),
      failedLoginAttempts: 0,
      lockUntil: null,
    };

    if (existing) {
      await usersCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: record.name,
            firstName: record.firstName,
            lastName: record.lastName,
            passwordHash,
            role: record.role,
            accountType: record.accountType,
            roleIds: record.roleIds,
            userCode: record.userCode,
            designation: record.designation,
            isActive: record.isActive,
            status: record.status,
            isEmailVerified: record.isEmailVerified,
            ...securityFields,
            updatedAt: now,
          },
          $unset: { previousPasswordHash: 1 },
        }
      );
      console.log(`    ↳ Updated: ${record.email} (${record.role}) [accountType: ${record.accountType}]`);
    } else {
      const id = crypto.randomUUID();
      await usersCollection.insertOne({
        _id: id,
        name: record.name,
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email.toLowerCase(),
        passwordHash,
        role: record.role,
        accountType: record.accountType,
        roleIds: record.roleIds,
        userCode: record.userCode,
        designation: record.designation,
        isActive: record.isActive,
        status: record.status,
        isEmailVerified: record.isEmailVerified,
        ...securityFields,
        mfaEnabled: false,
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

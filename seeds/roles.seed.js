const crypto = require('crypto');

const SEED_ROLES = [
  {
    name: 'Super Admin',
    key: 'super_admin',
    description: 'Root platform authority with unrestricted access across all present and future administrative capabilities.',
    isSystem: true,
    status: 'ACTIVE',
    permissions: ['*'],
  },
  {
    name: 'Administrator',
    key: 'admin',
    description: 'Supervises operations, staff invitations, catalog, orders, and customer dispute resolution.',
    isSystem: true,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'users.view', 'users.invite', 'users.edit', 'users.activate', 'users.delete',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.assign', 'audit_logs.view',
      'products.view', 'products.create', 'products.edit', 'products.delete', 'products.publish',
      'products.import', 'products.export', 'categories.view', 'categories.create', 'categories.edit',
      'categories.delete', 'brands.view', 'brands.create', 'brands.edit', 'brands.delete',
      'inventory.view', 'inventory.adjust', 'inventory.export', 'orders.view', 'orders.edit',
      'orders.cancel', 'orders.refund', 'orders.export', 'returns.view', 'returns.approve',
      'payments.view', 'customers.view', 'customers.edit', 'customers.activate', 'customers.export',
      'reviews.view', 'reviews.approve', 'reviews.delete', 'coupons.view', 'coupons.create',
      'coupons.edit', 'coupons.delete', 'reports.view', 'reports.export', 'settings.view',
    ],
  },
  {
    name: 'Operations Manager',
    key: 'operations_manager',
    description: 'Manages orders, returns, inventory stock, customer data, and operational reporting.',
    isSystem: false,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'products.view', 'inventory.view', 'inventory.adjust', 'orders.view',
      'orders.edit', 'orders.cancel', 'orders.export', 'returns.view', 'returns.approve',
      'customers.view', 'reports.view', 'reports.export',
    ],
  },
  {
    name: 'Catalog Manager',
    key: 'catalog_manager',
    description: 'Responsible for product catalog creation, categories, brand partnerships, and stock checks.',
    isSystem: false,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'products.view', 'products.create', 'products.edit', 'products.delete',
      'products.publish', 'products.import', 'products.export', 'categories.view', 'categories.create',
      'categories.edit', 'categories.delete', 'brands.view', 'brands.create', 'brands.edit',
      'brands.delete', 'inventory.view', 'inventory.adjust', 'inventory.export',
    ],
  },
  {
    name: 'Order Manager',
    key: 'order_manager',
    description: 'Processes sales orders, status updates, cancellations, and order exports.',
    isSystem: false,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'products.view', 'inventory.view', 'orders.view', 'orders.edit',
      'orders.cancel', 'orders.export', 'returns.view', 'customers.view',
    ],
  },
  {
    name: 'Customer Support',
    key: 'customer_support',
    description: 'Resolves customer inquiries, inspects order histories, and moderates reviews.',
    isSystem: false,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'products.view', 'orders.view', 'returns.view', 'customers.view',
      'customers.edit', 'customers.activate', 'reviews.view', 'reviews.approve', 'reviews.delete',
    ],
  },
  {
    name: 'Marketing Manager',
    key: 'marketing_manager',
    description: 'Creates coupons, promotional campaigns, analyzes reviews, and monitors sales velocity.',
    isSystem: false,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'products.view', 'customers.view', 'reviews.view', 'coupons.view',
      'coupons.create', 'coupons.edit', 'coupons.delete', 'reports.view',
    ],
  },
  {
    name: 'Finance Manager',
    key: 'finance_manager',
    description: 'Oversees customer refunds, payment reconciliation, returns, and financial reports.',
    isSystem: false,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'orders.view', 'orders.refund', 'orders.export', 'returns.view',
      'returns.approve', 'payments.view', 'customers.view', 'reports.view', 'reports.export',
    ],
  },
  {
    name: 'Warehouse Manager',
    key: 'warehouse_manager',
    description: 'Manages physical warehouse inventory adjustments, order fulfillment status, and stock checks.',
    isSystem: false,
    status: 'ACTIVE',
    permissions: [
      'dashboard.view', 'products.view', 'inventory.view', 'inventory.adjust', 'orders.view', 'orders.edit',
    ],
  },
];

async function seedRoles(db, clean = false) {
  const rolesCollection = db.collection('roles');

  if (clean) {
    console.log('  🧹 Cleaning roles collection...');
    await rolesCollection.deleteMany({});
  }

  const now = new Date();
  console.log(`  🛡️  Seeding ${SEED_ROLES.length} administrative roles...`);

  for (const roleDef of SEED_ROLES) {
    const existing = await rolesCollection.findOne({ key: roleDef.key });
    if (existing) {
      await rolesCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: roleDef.name,
            description: roleDef.description,
            isSystem: roleDef.isSystem,
            status: roleDef.status,
            updatedAt: now,
          },
        }
      );
      console.log(`    ↳ Verified: ${roleDef.name} (${roleDef.key})`);
    } else {
      const id = crypto.randomUUID();
      await rolesCollection.insertOne({
        _id: id,
        name: roleDef.name,
        key: roleDef.key,
        description: roleDef.description,
        permissions: roleDef.permissions,
        status: roleDef.status,
        isSystem: roleDef.isSystem,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`    ↳ Created: ${roleDef.name} (${roleDef.key}) [ID: ${id}]`);
    }
  }

  console.log('  ✓ Roles seeding completed.');
}

module.exports = { seedRoles, SEED_ROLES };

const crypto = require('crypto');

/**
 * Seed categories collection
 * @param {import('mongoose').Connection} db
 * @param {boolean} clean
 */
async function seedCategories(db, clean = false) {
  const categoriesCollection = db.collection('categories');

  if (clean) {
    console.log('  🧹 Cleaning categories collection...');
    await categoriesCollection.deleteMany({});
  }

  const now = new Date();

  const categoryRecords = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Cutting-edge gadgets, audio gear, and personal computing.',
      isActive: true,
      displayOrder: 1,
    },
    {
      name: 'Audio & Acoustics',
      slug: 'audio',
      description: 'Audiophile headphones, wireless earbuds, and studio speakers.',
      isActive: true,
      displayOrder: 2,
    },
    {
      name: 'Apparel & Streetwear',
      slug: 'apparel',
      description: 'Minimalist designer apparel, outerwear, and statement pieces.',
      isActive: true,
      displayOrder: 3,
    },
    {
      name: 'Wearables & Watches',
      slug: 'wearables',
      description: 'Smart watches, fitness trackers, and precision timepieces.',
      isActive: true,
      displayOrder: 4,
    },
    {
      name: 'Home & Workspace',
      slug: 'home-workspace',
      description: 'Ergonomic workspace accessories, lighting, and modern decor.',
      isActive: true,
      displayOrder: 5,
    },
  ];

  console.log(`  📂 Seeding ${categoryRecords.length} categories...`);

  for (const record of categoryRecords) {
    const existing = await categoriesCollection.findOne({ slug: record.slug });

    if (existing) {
      await categoriesCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: record.name,
            description: record.description,
            isActive: record.isActive,
            displayOrder: record.displayOrder,
            updatedAt: now,
          },
        }
      );
      console.log(`    ↳ Updated category: ${record.name} (/category/${record.slug})`);
    } else {
      const id = crypto.randomUUID();
      await categoriesCollection.insertOne({
        _id: id,
        ...record,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`    ↳ Created category: ${record.name} [ID: ${id}]`);
    }
  }

  console.log('  ✓ Categories seeding completed.');
}

module.exports = { seedCategories };

const crypto = require('crypto');

/**
 * Seed products collection
 * @param {import('mongoose').Connection} db
 * @param {boolean} clean
 */
async function seedProducts(db, clean = false) {
  const productsCollection = db.collection('products');
  const categoriesCollection = db.collection('categories');

  if (clean) {
    console.log('  🧹 Cleaning products collection...');
    await productsCollection.deleteMany({});
  }

  const now = new Date();

  // Fetch category IDs for relational mapping
  const electronics = await categoriesCollection.findOne({ slug: 'electronics' });
  const audio = await categoriesCollection.findOne({ slug: 'audio' });
  const apparel = await categoriesCollection.findOne({ slug: 'apparel' });
  const wearables = await categoriesCollection.findOne({ slug: 'wearables' });
  const workspace = await categoriesCollection.findOne({ slug: 'home-workspace' });

  const productRecords = [
    {
      title: 'ZYLO Horizon ANC Wireless Headphones',
      slug: 'zylo-horizon-anc-wireless-headphones',
      sku: 'ZYL-AUD-001',
      description: 'Studio-grade hybrid active noise cancelling with custom 40mm titanium drivers and 45-hour battery life.',
      price: 299.99,
      compareAtPrice: 349.99,
      costPrice: 140.0,
      stock: 65,
      categoryId: audio?._id || null,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      ],
      tags: ['audio', 'wireless', 'anc', 'premium'],
      isFeatured: true,
      isActive: true,
      rating: 4.9,
      reviewCount: 128,
    },
    {
      title: 'ZYLO Pulse Chrono Smartwatch',
      slug: 'zylo-pulse-chrono-smartwatch',
      sku: 'ZYL-WR-002',
      description: 'Aerospace-grade titanium bezel, sapphire crystal screen, dual-frequency GPS, and 14-day battery reserve.',
      price: 399.0,
      compareAtPrice: 449.0,
      costPrice: 190.0,
      stock: 40,
      categoryId: wearables?._id || null,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      ],
      tags: ['wearables', 'titanium', 'fitness', 'smartwatch'],
      isFeatured: true,
      isActive: true,
      rating: 4.8,
      reviewCount: 94,
    },
    {
      title: 'Minimalist Matte Aluminum Mechanical Keyboard',
      slug: 'minimalist-matte-aluminum-mechanical-keyboard',
      sku: 'ZYL-WRK-003',
      description: 'CNC anodized aluminum body, hot-swappable lubricated linear switches, and sound-dampening silicone gasket mount.',
      price: 189.5,
      compareAtPrice: 219.0,
      costPrice: 85.0,
      stock: 82,
      categoryId: workspace?._id || null,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      ],
      tags: ['workspace', 'keyboard', 'mechanical', 'aluminum'],
      isFeatured: false,
      isActive: true,
      rating: 4.7,
      reviewCount: 56,
    },
    {
      title: 'Precision Wool Blend Technical Trench Coat',
      slug: 'precision-wool-blend-technical-trench-coat',
      sku: 'ZYL-APP-004',
      description: 'Water-repellent structured wool blend with magnetic storm flap closures and laser-cut internal passport pockets.',
      price: 450.0,
      compareAtPrice: 520.0,
      costPrice: 210.0,
      stock: 25,
      categoryId: apparel?._id || null,
      images: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
      ],
      tags: ['apparel', 'outerwear', 'minimalist', 'wool'],
      isFeatured: true,
      isActive: true,
      rating: 5.0,
      reviewCount: 31,
    },
    {
      title: 'ZYLO Ultra-Slim 100W GaN Fast Charger',
      slug: 'zylo-ultra-slim-100w-gan-fast-charger',
      sku: 'ZYL-ELC-005',
      description: 'Next-gen Gallium Nitride (GaN) fast charger with 3x USB-C Power Delivery ports and foldable travel prongs.',
      price: 69.99,
      compareAtPrice: 89.99,
      costPrice: 28.0,
      stock: 150,
      categoryId: electronics?._id || null,
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
      ],
      tags: ['electronics', 'gan', 'charger', 'travel'],
      isFeatured: false,
      isActive: true,
      rating: 4.8,
      reviewCount: 78,
    },
  ];

  console.log(`  📦 Seeding ${productRecords.length} catalog products...`);

  for (const record of productRecords) {
    const existing = await productsCollection.findOne({ sku: record.sku });

    if (existing) {
      await productsCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            title: record.title,
            slug: record.slug,
            description: record.description,
            price: record.price,
            compareAtPrice: record.compareAtPrice,
            costPrice: record.costPrice,
            stock: record.stock,
            categoryId: record.categoryId,
            images: record.images,
            tags: record.tags,
            isFeatured: record.isFeatured,
            isActive: record.isActive,
            rating: record.rating,
            reviewCount: record.reviewCount,
            updatedAt: now,
          },
        }
      );
      console.log(`    ↳ Updated product: ${record.title} (${record.sku})`);
    } else {
      const id = crypto.randomUUID();
      await productsCollection.insertOne({
        _id: id,
        ...record,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`    ↳ Created product: ${record.title} [ID: ${id}]`);
    }
  }

  console.log('  ✓ Products seeding completed.');
}

module.exports = { seedProducts };

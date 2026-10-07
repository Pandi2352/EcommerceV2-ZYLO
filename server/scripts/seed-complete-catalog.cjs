const mongoose = require('mongoose');

async function seedCompleteCatalog() {
  await mongoose.connect('mongodb://127.0.0.1:27017/zylo');
  const db = mongoose.connection.db;

  const categories = await db.collection('categories').find({}).toArray();
  const brands = await db.collection('brands').find({}).toArray();

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  const brandMap = {};
  brands.forEach((b) => {
    brandMap[b.slug] = b._id;
  });

  console.log('Categories found:', Object.keys(catMap).length);
  console.log('Brands found:', Object.keys(brandMap).length);

  // 1. RE-CATEGORIZE & ENRICH EXISTING PRODUCTS WITH 3-4 MULTI-IMAGES
  const updates = [
    {
      slug: 'apple-iphone-16-pro-max',
      catSlug: 'smartphones-foldables',
      brandSlug: 'apple',
      images: [
        { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
        { url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 4 },
      ],
    },
    {
      slug: 'apple-macbook-pro-16-m3-max',
      catSlug: 'laptops-notebooks',
      brandSlug: 'apple',
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'dell-xps-16-oled-laptop',
      catSlug: 'laptops-notebooks',
      brandSlug: 'dell-technologies',
      images: [
        { url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'razer-blade-16-gaming-laptop',
      catSlug: 'gaming-laptops',
      brandSlug: 'razer',
      images: [
        { url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'asus-rog-zephyrus-g16-gaming-laptop',
      catSlug: 'gaming-laptops',
      brandSlug: 'asus-rog',
      images: [
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'samsung-galaxy-s24-ultra-5g',
      catSlug: 'smartphones-foldables',
      brandSlug: 'samsung',
      images: [
        { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'sony-wh-1000xm5-wireless-headphones',
      catSlug: 'wireless-noise-canceling-headphones',
      brandSlug: 'sony',
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'apple-airpods-max',
      catSlug: 'wireless-noise-canceling-headphones',
      brandSlug: 'apple',
      images: [
        { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'sennheiser-momentum-4-wireless-headphones',
      catSlug: 'wireless-noise-canceling-headphones',
      brandSlug: 'sennheiser',
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'sony-wf-1000xm5-noise-canceling-earbuds',
      catSlug: 'audio-sound-systems',
      brandSlug: 'sony',
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'sonos-era-300-spatial-audio-speaker',
      catSlug: 'studio-monitors-hifi-speakers',
      brandSlug: 'sonos',
      images: [
        { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'sony-playstation-5-pro-console',
      catSlug: 'nextgen-gaming-consoles',
      brandSlug: 'sony',
      images: [
        { url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'nike-air-jordan-1-retro-high-og',
      catSlug: 'mens-designer-wear',
      brandSlug: 'nike',
      images: [
        { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'nike-tech-fleece-full-zip-windrunner',
      catSlug: 'mens-designer-wear',
      brandSlug: 'nike',
      images: [
        { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'nike-pegasus-41-road-running-shoes',
      catSlug: 'cardio-strength-equipment',
      brandSlug: 'nike',
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'adidas-ultraboost-light-running-shoes',
      catSlug: 'sports-fitness-outdoors',
      brandSlug: 'adidas',
      images: [
        { url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'adidas-predator-elite-firm-ground-cleats',
      catSlug: 'sports-fitness-outdoors',
      brandSlug: 'adidas',
      images: [
        { url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'puma-velocity-nitro-3-running-shoes',
      catSlug: 'cardio-strength-equipment',
      brandSlug: 'puma',
      images: [
        { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'under-armour-project-rock-training-hoodie',
      catSlug: 'sports-fitness-outdoors',
      brandSlug: 'under-armour',
      images: [
        { url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'dyson-v15-detect-cordless-vacuum',
      catSlug: 'home-living',
      brandSlug: 'dyson',
      images: [
        { url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'breville-barista-touch-espresso-machine',
      catSlug: 'specialty-espresso-coffee',
      brandSlug: 'breville',
      images: [
        { url: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'kitchenaid-artisan-5-quart-stand-mixer',
      catSlug: 'kitchen-dining-culinary',
      brandSlug: 'kitchenaid',
      images: [
        { url: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'rolex-submariner-date-41mm',
      catSlug: 'luxury-chronographs',
      brandSlug: 'rolex',
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'garmin-fenix-7-pro-solar-multisport-watch',
      catSlug: 'smart-watches-wearables',
      brandSlug: 'garmin',
      images: [
        { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'samsung-galaxy-watch-7-ultra',
      catSlug: 'smart-watches-wearables',
      brandSlug: 'samsung',
      images: [
        { url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'lego-technic-ferrari-daytona-sp3',
      catSlug: 'books-fine-stationery',
      brandSlug: 'lego',
      images: [
        { url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'lego-star-wars-millennium-falcon-ucs',
      catSlug: 'books-fine-stationery',
      brandSlug: 'lego',
      images: [
        { url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'canon-eos-r5-mark-ii-mirrorless-camera',
      catSlug: 'electronics-computing',
      brandSlug: 'canon',
      images: [
        { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    {
      slug: 'leica-q3-compact-full-frame-camera',
      catSlug: 'electronics-computing',
      brandSlug: 'leica',
      images: [
        { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'nikon-z8-mirrorless-camera-body',
      catSlug: 'electronics-computing',
      brandSlug: 'nikon',
      images: [
        { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'sony-alpha-a7r-v-full-frame-camera',
      catSlug: 'electronics-computing',
      brandSlug: 'sony',
      images: [
        { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'gopro-hero13-black-action-camera',
      catSlug: 'outdoor-camping-trekking',
      brandSlug: 'gopro',
      images: [
        { url: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'logitech-mx-master-3s-wireless-mouse',
      catSlug: 'electronics-computing',
      brandSlug: 'logitech',
      images: [
        { url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'samsung-65-neo-qled-4k-smart-tv',
      catSlug: 'home-living',
      brandSlug: 'samsung',
      images: [
        { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'lg-c4-65-4k-oled-evo-smart-tv',
      catSlug: 'home-living',
      brandSlug: 'lg-electronics',
      images: [
        { url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      slug: 'apple-ipad-air-11-m2',
      catSlug: 'electronics-computing',
      brandSlug: 'apple',
      images: [
        { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
  ];

  for (const u of updates) {
    const catId = catMap[u.catSlug];
    const brandId = brandMap[u.brandSlug];
    if (catId && brandId) {
      await db.collection('products').updateOne(
        { slug: u.slug },
        {
          $set: {
            categoryId: catId,
            brandId: brandId,
            images: u.images,
            thumbnailUrl: u.images[0].url,
          },
        }
      );
      console.log(`Updated [${u.slug}] -> Cat: ${u.catSlug}, Imgs: ${u.images.length}`);
    }
  }

  // 2. SEED NEW AUTHENTIC PRODUCTS FOR ALL REMAINING EMPTY CATEGORIES
  const newProducts = [
    // Women's Luxury Collection
    {
      name: 'Prada Re-Nylon Technical Trench Coat',
      slug: 'prada-re-nylon-technical-trench-coat',
      sku: 'PRD-RN-001',
      description: 'An iconic silhouette tailored from sustainable regenerated nylon with rain-repellent finish, horn buttons, and refined waist cinch.',
      shortDescription: 'Regenerated technical nylon trench coat with luxury tailoring.',
      catSlug: 'womens-luxury-collection',
      brandSlug: 'nike', // partner or luxury
      basePrice: 2450,
      salePrice: 2199,
      stockQuantity: 14,
      lowStockThreshold: 3,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Material', value: '100% Regenerated Econyl Nylon' },
        { key: 'Lining', value: 'Cupro Satin' },
        { key: 'Closure', value: 'Double Breasted Horn Buttons' },
        { key: 'Origin', value: 'Made in Italy' },
      ],
    },
    // Modern Furniture
    {
      name: 'Herman Miller Aeron Ergonomic Chair Onyx',
      slug: 'herman-miller-aeron-ergonomic-chair-onyx',
      sku: 'HML-AER-002',
      description: 'The pinnacle of ergonomic seating. Featuring PostureFit SL sacral support, 8Z Pellicle breathable mesh, and fully adjustable 3D armrests.',
      shortDescription: 'Ergonomic task chair with PostureFit SL and breathable Pellicle suspension.',
      catSlug: 'modern-furniture',
      brandSlug: 'razer',
      basePrice: 1695,
      salePrice: 1495,
      stockQuantity: 22,
      lowStockThreshold: 5,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1580481077195-c999818b625a?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Frame', value: 'Recycled Ocean-Bound Plastic & Aluminum' },
        { key: 'Mechanism', value: 'Harmonic 2 Tilt with Forward Angle' },
        { key: 'Max Weight Capacity', value: '350 lbs (159 kg)' },
        { key: 'Warranty', value: '12-Year 24/7 Official Manufacturer' },
      ],
    },
    // Smart Home Lighting
    {
      name: 'Philips Hue Play Gradient Smart Lightstrip 65"',
      slug: 'philips-hue-play-gradient-smart-lightstrip-65',
      sku: 'PHL-HUE-003',
      description: 'Surround your screen with fluid gradients of reactive smart light that seamlessly sync with music, films, and video games in 16M colours.',
      shortDescription: 'Reactive gradient smart lighting strip for immersive cinema.',
      catSlug: 'smart-home-lighting',
      brandSlug: 'lg-electronics',
      basePrice: 249,
      salePrice: 219,
      stockQuantity: 35,
      lowStockThreshold: 8,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Luminous Flux', value: '1100 lumens @ 4000K' },
        { key: 'Protocol', value: 'Zigbee 3.0 & Bluetooth LE' },
        { key: 'Color Spectrum', value: '16 Million Colors + Tunable White' },
      ],
    },
    // Organic Facial Care
    {
      name: 'Aesop Resurrection Aromatique Hand & Face Balm 500ml',
      slug: 'aesop-resurrection-aromatique-balm-500ml',
      sku: 'AES-RES-004',
      description: 'A rich formulation containing botanical extracts of Mandarin Rind, Rosemary Leaf, and Cedar Atlas to nourish, soften, and hydrate fatigued skin.',
      shortDescription: 'Botanical skin and hand hydration balm with citrus notes.',
      catSlug: 'organic-facial-care',
      brandSlug: 'dyson',
      basePrice: 110,
      salePrice: 95,
      stockQuantity: 40,
      lowStockThreshold: 10,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1608248597359-2169b18361b2?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Aroma', value: 'Citrus, Woody, Herbaceous' },
        { key: 'Key Ingredients', value: 'Mandarin Rind, Rosemary Leaf, Cedar Atlas' },
        { key: 'Volume', value: '500 mL / 17.2 fl oz' },
      ],
    },
    // Artisan Fragrances
    {
      name: 'Le Labo Santal 33 Eau de Parfum 100ml',
      slug: 'le-labo-santal-33-eau-de-parfum-100ml',
      sku: 'LEL-SAN-005',
      description: 'An intoxicating fragrance of cardamom, iris, violet, ambrox, cedarwood, and leather that evokes the spirit of the American West.',
      shortDescription: 'Iconic smoky sandalwood and leather artisanal fragrance.',
      catSlug: 'artisan-fragrances',
      brandSlug: 'dyson',
      basePrice: 320,
      salePrice: null,
      stockQuantity: 18,
      lowStockThreshold: 4,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Concentration', value: 'Eau de Parfum (20% Parfum Oil)' },
        { key: 'Top Notes', value: 'Violet Accord, Cardamom' },
        { key: 'Heart Notes', value: 'Iris, Papyrus, Ambrox' },
        { key: 'Base Notes', value: 'Cedarwood, Leather, Sandalwood' },
      ],
    },
    // Smart Connected Home Gyms
    {
      name: 'Peloton Bike+ Ultimate Smart Cardio Studio',
      slug: 'peloton-bike-plus-ultimate-smart-cardio-studio',
      sku: 'PLT-BK-006',
      description: 'Featuring a 23.8" rotating HD anti-reflective touchscreen, Auto-Follow digital resistance, Apple GymKit integration, and premium front-facing soundbar.',
      shortDescription: 'Connected indoor cycling studio with 360-degree rotating HD display.',
      catSlug: 'smart-connected-fitness',
      brandSlug: 'garmin',
      basePrice: 2495,
      salePrice: 2195,
      stockQuantity: 12,
      lowStockThreshold: 2,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Screen', value: '23.8" 1080p Rotating Multi-Touch Glass' },
        { key: 'Resistance', value: 'Digitally Controlled Magnetic Eddy Current' },
        { key: 'Audio', value: '4-Channel Audio System with Tweeters & Woofers' },
      ],
    },
    // Swiss Automatic Timepieces
    {
      name: 'Omega Speedmaster Professional Moonwatch Co-Axial',
      slug: 'omega-speedmaster-professional-moonwatch-co-axial',
      sku: 'OMG-SPD-007',
      description: 'The legendary Moonwatch. Equipped with the Co-Axial Master Chronometer Calibre 3861, Hesalite crystal, and historic dot-over-ninety bezel.',
      shortDescription: 'Master Chronometer certified manual-wind space chronograph.',
      catSlug: 'swiss-automatic-watches',
      brandSlug: 'rolex',
      basePrice: 7000,
      salePrice: 6650,
      stockQuantity: 8,
      lowStockThreshold: 2,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Movement', value: 'Omega Calibre 3861 Manual-Wind Co-Axial' },
        { key: 'Case Diameter', value: '42 mm Stainless Steel' },
        { key: 'Power Reserve', value: '50 Hours' },
        { key: 'Magnetic Resistance', value: '15,000 Gauss' },
      ],
    },
    // Prosumer Dual-Boiler Machines
    {
      name: 'La Marzocco Micra Dual Boiler Espresso Machine',
      slug: 'la-marzocco-micra-dual-boiler-espresso-machine',
      sku: 'LMZ-MIC-008',
      description: 'Handcrafted in Florence. Independent dual boilers with PID temperature control, integrated rotary pump, saturated group head, and cool-touch steam wand.',
      shortDescription: 'Commercial performance miniaturized for domestic espresso perfection.',
      catSlug: 'prosumer-espresso-machines',
      brandSlug: 'breville',
      basePrice: 3900,
      salePrice: null,
      stockQuantity: 6,
      lowStockThreshold: 2,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Boilers', value: 'Dual Boiler (0.29L Coffee / 1.6L Steam)' },
        { key: 'Pump Type', value: 'Commercial Rotary Vane Pump' },
        { key: 'Pre-Infusion', value: 'Electronic Programmable Infusion' },
      ],
    },
    // Artisan Cast Iron Cookware
    {
      name: 'Le Creuset Signature Round Dutch Oven 5.5 Qt Cerise',
      slug: 'le-creuset-signature-round-dutch-oven-5-5qt-cerise',
      sku: 'LEC-DCH-009',
      description: 'The quintessential French enamelled cast iron cocotte. Perfect for braising, baking artisan sourdough loaves, slow simmers, and roasting.',
      shortDescription: 'Vibrant enamelled cast iron Dutch oven with lifetime warranty.',
      catSlug: 'cast-iron-cookware',
      brandSlug: 'kitchenaid',
      basePrice: 420,
      salePrice: 350,
      stockQuantity: 28,
      lowStockThreshold: 5,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1584990347449-399a9b70868f?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Capacity', value: '5.5 Quarts (5.3 Litres)' },
        { key: 'Heat Resistance', value: 'Safe up to 500°F (260°C)' },
        { key: 'Compatibility', value: 'Induction, Gas, Electric, Ceramic, Oven' },
      ],
    },
    // Spatial Computing & VR Headsets
    {
      name: 'Apple Vision Pro Spatial Computing Headset 512GB',
      slug: 'apple-vision-pro-spatial-computing-headset-512gb',
      sku: 'APL-VSN-010',
      description: 'Revolutionary spatial computer that seamlessly blends digital content with your physical space. Controlled by your eyes, hands, and voice with dual micro-OLED displays.',
      shortDescription: 'Spatial computing glass headset with 23M ultra-high-resolution pixels.',
      catSlug: 'virtual-reality-headsets',
      brandSlug: 'apple',
      basePrice: 3699,
      salePrice: null,
      stockQuantity: 9,
      lowStockThreshold: 2,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Display System', value: '23 Million Pixel Micro-OLED 3D' },
        { key: 'Chipset', value: 'Apple M2 8-core CPU + R1 Sensor Chip' },
        { key: 'Sensors', value: '12 Cameras, 5 Sensors, 6 Microphones' },
      ],
    },
    // Electric Urban Mobility
    {
      name: 'Segway SuperScooter GT2 High-Performance E-Scooter',
      slug: 'segway-superscooter-gt2-high-performance-e-scooter',
      sku: 'SGW-GT2-011',
      description: 'Dual 3000W peak motors, transparent OLED display, dynamic traction control, front and rear double-wishbone suspension, and up to 43.5 mph top speed.',
      shortDescription: 'Dual motor 6000W peak all-terrain electric performance scooter.',
      catSlug: 'electric-urban-mobility',
      brandSlug: 'garmin',
      basePrice: 2999,
      salePrice: 2699,
      stockQuantity: 10,
      lowStockThreshold: 3,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Top Speed', value: '43.5 mph (70 km/h)' },
        { key: 'Battery Range', value: 'Up to 56 Miles (90 km)' },
        { key: 'Acceleration', value: '0 to 30 mph in 3.9 seconds' },
        { key: 'Braking', value: 'Hydraulic Disc Brakes Front & Rear' },
      ],
    },
    // Fine Fountain Pens & Leather Notebooks
    {
      name: 'Montblanc Meisterstuck 149 Gold-Coated Fountain Pen',
      slug: 'montblanc-meisterstuck-149-gold-coated-fountain-pen',
      sku: 'MTB-149-012',
      description: 'The pinnacle of writing culture. Handcrafted since 1924 with deep black precious resin, gold-coated fittings, white star emblem, and hand-crafted Au 750 / 18K solid gold nib.',
      shortDescription: 'Handcrafted luxury fountain pen with 18K solid gold nib.',
      catSlug: 'fountain-pens-leather-journals',
      brandSlug: 'lego',
      basePrice: 1050,
      salePrice: null,
      stockQuantity: 15,
      lowStockThreshold: 4,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
    },
    // Root Category Showcase: Fashion & Apparel
    {
      name: 'Burberry Kensington Heritage Mid-Length Trench Coat',
      slug: 'burberry-kensington-heritage-trench-coat',
      sku: 'BUR-KEN-001',
      description: 'The iconic trench coat made in Castleford from weatherproof cotton gabardine, invented by Thomas Burberry in 1879.',
      shortDescription: 'Classic weatherproof cotton gabardine trench coat with vintage check lining.',
      catSlug: 'fashion-apparel',
      brandSlug: 'nike',
      basePrice: 2590,
      salePrice: 2290,
      stockQuantity: 20,
      lowStockThreshold: 4,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Material', value: '100% Cotton Gabardine' },
        { key: 'Lining', value: '100% Cotton Vintage Check' },
        { key: 'Origin', value: 'Made in Yorkshire, England' },
      ],
    },
    // Root Category Showcase: Beauty & Skincare
    {
      name: 'Dyson Supersonic Nural Intelligent Hair Dryer',
      slug: 'dyson-supersonic-nural-intelligent-hair-dryer',
      sku: 'DYS-NUR-002',
      description: 'Automatically adapts heat to enhance natural shine and protect scalp health. Equipped with ToF sensors and intelligent heat control.',
      shortDescription: 'Intelligent scalp-protecting hair dryer with smart attachment learning.',
      catSlug: 'beauty-skincare',
      brandSlug: 'dyson',
      basePrice: 499,
      salePrice: 449,
      stockQuantity: 30,
      lowStockThreshold: 5,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Motor', value: 'Dyson Digital Motor V9 (110,000 RPM)' },
        { key: 'Airflow', value: '13.3 litres / second' },
        { key: 'Weight', value: '680 grams' },
      ],
    },
    // Root Category Showcase: Watches & Fine Horology
    {
      name: 'Patek Philippe Calatrava Clous de Paris White Gold',
      slug: 'patek-philippe-calatrava-clous-de-paris',
      sku: 'PTK-CAL-003',
      description: 'The epitome of the round wristwatch. Guilloche hobnail bezel with charcoal gray dial, white gold hands, and manufacture calibre 30-255 PS.',
      shortDescription: 'White gold haute horlogerie dress watch with Clous de Paris hobnail bezel.',
      catSlug: 'watches-fine-horology',
      brandSlug: 'rolex',
      basePrice: 32500,
      salePrice: null,
      stockQuantity: 5,
      lowStockThreshold: 1,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Movement', value: 'Patek Philippe Calibre 30-255 PS Manual-Wind' },
        { key: 'Power Reserve', value: '65 Hours Dual-Barrel' },
        { key: 'Hallmark', value: 'Patek Philippe Seal Certified' },
      ],
    },
    // Root Category Showcase: Gaming, Consoles & VR
    {
      name: 'Asus ROG Ally X 24GB Handheld Gaming Console',
      slug: 'asus-rog-ally-x-24gb-handheld-gaming-console',
      sku: 'ROG-ALX-004',
      description: 'Powered by AMD Ryzen Z1 Extreme, 24GB high-speed LPDDR5X-7500 RAM, 1TB NVMe SSD, massive 80Wh battery, and 7-inch 120Hz FreeSync Premium display.',
      shortDescription: 'Flagship PC gaming handheld with 80Wh battery and 24GB RAM.',
      catSlug: 'gaming-vr-esports',
      brandSlug: 'asus-rog',
      basePrice: 799,
      salePrice: 749,
      stockQuantity: 28,
      lowStockThreshold: 5,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Processor', value: 'AMD Ryzen Z1 Extreme (8 Cores, 16 Threads)' },
        { key: 'Memory', value: '24GB LPDDR5X-7500 MHz' },
        { key: 'Display', value: '7-inch FHD (1920x1080) 120Hz IPS Gorilla Glass' },
      ],
    },
    // Root Category Showcase: Automotive & Electric Mobility
    {
      name: 'Tesla Wall Connector Universal Level 2 EV Charger',
      slug: 'tesla-wall-connector-universal-ev-charger',
      sku: 'TSL-WLL-005',
      description: 'Up to 44 miles of range added per hour. Integrated J1772 magic dock adapter charges all North American electric vehicles. Wi-Fi connected.',
      shortDescription: 'Level 2 home charging station compatible with Tesla and all EV brands.',
      catSlug: 'automotive-electric-mobility',
      brandSlug: 'garmin',
      basePrice: 580,
      salePrice: 550,
      stockQuantity: 22,
      lowStockThreshold: 4,
      trackInventory: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=800&q=80', isPrimary: false, displayOrder: 3 },
      ],
      specifications: [
        { key: 'Power Output', value: 'Up to 11.5 kW / 48A output' },
        { key: 'Cable Length', value: '24 Feet (7.3 meters)' },
        { key: 'Enclosure', value: 'NEMA Type 3R Rated (Indoor & Outdoor)' },
      ],
    },
  ];

  for (const p of newProducts) {
    const catId = catMap[p.catSlug];
    const brandId = brandMap[p.brandSlug];
    if (!catId || !brandId) {
      console.warn('Skipping', p.name, 'no cat/brand:', p.catSlug, p.brandSlug);
      continue;
    }

    const doc = {
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      shortDescription: p.shortDescription,
      categoryId: catId,
      brandId: brandId,
      tags: [p.catSlug, p.brandSlug, 'premium', 'curated'],
      basePrice: p.basePrice,
      salePrice: p.salePrice || null,
      currency: 'USD',
      trackInventory: p.trackInventory,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      allowBackorders: false,
      images: p.images,
      thumbnailUrl: p.images[0].url,
      specifications: p.specifications,
      hasVariants: false,
      variants: [],
      status: 'PUBLISHED',
      isFeatured: true,
      isNewArrival: true,
      ratingAverage: 4.9,
      ratingCount: 32,
      seo: {
        metaTitle: `${p.name} | ZYLO Store`,
        metaDescription: p.shortDescription,
        keywords: [p.name, p.catSlug],
        canonicalUrl: `/products/${p.slug}`,
        ogImage: p.images[0].url,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('products').updateOne(
      { slug: p.slug },
      { $set: doc },
      { upsert: true }
    );
    console.log(`Upserted [${p.slug}] into [${p.catSlug}] with ${p.images.length} images.`);
  }

  // 3. FINAL VERIFICATION SUMMARY
  const finalCats = await db.collection('categories').find({}).toArray();
  const finalProds = await db.collection('products').find({}).toArray();

  const finalMap = {};
  finalCats.forEach((c) => {
    finalMap[c._id.toString()] = { name: c.name, slug: c.slug, count: 0 };
  });

  finalProds.forEach((p) => {
    const cId = p.categoryId ? p.categoryId.toString() : 'none';
    if (finalMap[cId]) finalMap[cId].count++;
  });

  console.log('\n=========================================');
  console.log('FINAL CATALOG STATUS:');
  console.log('Total Products:', finalProds.length);
  Object.values(finalMap).forEach((c) => {
    console.log(`- ${c.name} (${c.slug}): ${c.count} products`);
  });

  const lowImages = finalProds.filter((p) => !p.images || p.images.length < 2);
  console.log('Products with fewer than 2 images:', lowImages.length);
  console.log('=========================================');

  await mongoose.disconnect();
}

seedCompleteCatalog().catch(console.error);

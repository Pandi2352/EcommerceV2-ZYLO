import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { BrandsService } from './brands.service';

interface BrandSeedDef {
  name: string;
  slug: string;
  description: string;
  countryOfOrigin: string;
  website: string;
  logoUrl: string;
  bannerUrl: string;
  isFeatured: boolean;
  displayOrder: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    ogImage: string;
  };
}

export const SEED_BRANDS: BrandSeedDef[] = [
  {
    name: 'Apple',
    slug: 'apple',
    description: 'Pioneering consumer electronics, personal computing, iPhone smartphones, iPads, and MacBooks engineered in California.',
    countryOfOrigin: 'United States',
    website: 'https://www.apple.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1510519138161-5844a492b45f?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 1,
    seo: {
      metaTitle: 'Apple Products & Hardware | Official Store at ZYLO',
      metaDescription: 'Shop genuine Apple devices: iPhones, MacBooks, iPads, and Apple Watch with express shipping.',
      keywords: ['apple', 'iphone', 'macbook', 'ipad', 'apple watch', 'zylo apple'],
      canonicalUrl: 'https://zylo.com/brands/apple',
      ogImage: 'https://images.unsplash.com/photo-1510519138161-5844a492b45f?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Sony',
    slug: 'sony',
    description: 'World-renowned Japanese manufacturer of PlayStation gaming consoles, Alpha mirrorless cameras, and industry-leading noise-canceling headphones.',
    countryOfOrigin: 'Japan',
    website: 'https://www.sony.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 2,
    seo: {
      metaTitle: 'Sony Audio, PlayStation & Alpha Cameras | ZYLO',
      metaDescription: 'Experience master acoustic engineering, PlayStation gear, and Alpha camera systems from Sony.',
      keywords: ['sony', 'playstation', 'wh-1000xm5', 'alpha cameras', 'bravia'],
      canonicalUrl: 'https://zylo.com/brands/sony',
      ogImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    description: 'Global electronics powerhouse creating Galaxy smartphones, neo-QLED televisions, and next-generation smart home appliances.',
    countryOfOrigin: 'South Korea',
    website: 'https://www.samsung.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 3,
    seo: {
      metaTitle: 'Samsung Galaxy, OLED Displays & Smart Tech | ZYLO',
      metaDescription: 'Discover the latest Samsung Galaxy Ultra smartphones, Tab tablets, and Smart Monitor displays.',
      keywords: ['samsung', 'galaxy', 'qled', 'oled tv', 'galaxy buds'],
      canonicalUrl: 'https://zylo.com/brands/samsung',
      ogImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Nike',
    slug: 'nike',
    description: 'Iconic footwear, athletic apparel, and cutting-edge sportswear engineered for elite athletes and daily runners worldwide.',
    countryOfOrigin: 'United States',
    website: 'https://www.nike.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 4,
    seo: {
      metaTitle: 'Nike Athletic Sneakers, Running Shoes & Sportswear | ZYLO',
      metaDescription: 'Shop Nike Air Max, Pegasus running shoes, Tech Fleece, and performance training apparel.',
      keywords: ['nike', 'air max', 'jordan', 'running shoes', 'dri-fit'],
      canonicalUrl: 'https://zylo.com/brands/nike',
      ogImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Adidas',
    slug: 'adidas',
    description: 'German sports heritage brand bringing innovative Boost cushioning, Samba classics, and high-performance athletic apparel.',
    countryOfOrigin: 'Germany',
    website: 'https://www.adidas.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 5,
    seo: {
      metaTitle: 'Adidas Originals, Ultraboost & Sportswear | ZYLO',
      metaDescription: 'Find authentic Adidas Ultraboost running sneakers, Originals streetwear, and performance gear.',
      keywords: ['adidas', 'ultraboost', 'samba', 'gazelle', 'originals'],
      canonicalUrl: 'https://zylo.com/brands/adidas',
      ogImage: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Rolex',
    slug: 'rolex',
    description: 'Swiss luxury watchmaker renowned for precision chronometers, horological heritage, and iconic Oyster Perpetual timepieces.',
    countryOfOrigin: 'Switzerland',
    website: 'https://www.rolex.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Rolex_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 6,
    seo: {
      metaTitle: 'Rolex Luxury Chronometers & Automatic Timepieces | ZYLO',
      metaDescription: 'Explore the horological mastery of Rolex Submariner, Daytona, and Datejust luxury watches.',
      keywords: ['rolex', 'luxury watches', 'submariner', 'swiss chronometer'],
      canonicalUrl: 'https://zylo.com/brands/rolex',
      ogImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Dyson',
    slug: 'dyson',
    description: 'British technology trailblazer famous for cyclonic cordless vacuums, Supersonic hair dryers, and HEPA air purification systems.',
    countryOfOrigin: 'United Kingdom',
    website: 'https://www.dyson.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Dyson_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 7,
    seo: {
      metaTitle: 'Dyson Cordless Vacuums, Hair Care & Air Purifiers | ZYLO',
      metaDescription: 'Shop Dyson V15 vacuum cleaners, Airwrap multi-stylers, and advanced HEPA air purifiers.',
      keywords: ['dyson', 'cordless vacuum', 'airwrap', 'supersonic', 'air purifier'],
      canonicalUrl: 'https://zylo.com/brands/dyson',
      ogImage: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Bose',
    slug: 'bose',
    description: 'Acoustic research leader engineering QuietComfort active noise cancelling headphones, soundbars, and portable outdoor speakers.',
    countryOfOrigin: 'United States',
    website: 'https://www.bose.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Bose_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 8,
    seo: {
      metaTitle: 'Bose QuietComfort Noise-Cancelling Audio | ZYLO',
      metaDescription: 'Immerse yourself in legendary sound with Bose QuietComfort Ultra headphones and smart soundbars.',
      keywords: ['bose', 'quietcomfort', 'noise cancelling', 'bluetooth speaker', 'soundbar'],
      canonicalUrl: 'https://zylo.com/brands/bose',
      ogImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Lego',
    slug: 'lego',
    description: 'Danish family company inspiring creative building through interlocking brick sets, Star Wars collections, and Technic engineering models.',
    countryOfOrigin: 'Denmark',
    website: 'https://www.lego.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/LEGO_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 9,
    seo: {
      metaTitle: 'LEGO Sets, Star Wars & Technic Architecture | ZYLO',
      metaDescription: 'Shop official LEGO building sets, collector icons, Technic supercars, and kids creative playsets.',
      keywords: ['lego', 'lego star wars', 'technic', 'lego sets', 'toys'],
      canonicalUrl: 'https://zylo.com/brands/lego',
      ogImage: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Razer',
    slug: 'razer',
    description: 'For Gamers. By Gamers. High-performance gaming laptops, optical mechanical keyboards, wireless mice, and Chroma RGB gear.',
    countryOfOrigin: 'United States',
    website: 'https://www.razer.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/40/Razer_snake_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 10,
    seo: {
      metaTitle: 'Razer Gaming Laptops, Mice, Keyboards & Audio | ZYLO',
      metaDescription: 'Elevate your esports setup with Razer Blade laptops, DeathAdder mice, and BlackWidow keyboards.',
      keywords: ['razer', 'razer blade', 'deathadder', 'gaming keyboard', 'chroma rgb'],
      canonicalUrl: 'https://zylo.com/brands/razer',
      ogImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Breville',
    slug: 'breville',
    description: 'Australian kitchen innovation brand delivering third-wave specialty espresso machines, smart ovens, and citrus juicers.',
    countryOfOrigin: 'Australia',
    website: 'https://www.breville.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Breville_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 11,
    seo: {
      metaTitle: 'Breville Barista Espresso Machines & Smart Ovens | ZYLO',
      metaDescription: 'Master cafe-quality espresso at home with the Breville Barista Touch and smart countertop ovens.',
      keywords: ['breville', 'barista touch', 'espresso machine', 'smart oven', 'coffee maker'],
      canonicalUrl: 'https://zylo.com/brands/breville',
      ogImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Asus ROG',
    slug: 'asus-rog',
    description: 'Republic of Gamers: award-winning gaming motherboards, Zephyrus gaming laptops, and ultra-fast high refresh OLED monitors.',
    countryOfOrigin: 'Taiwan',
    website: 'https://rog.asus.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 12,
    seo: {
      metaTitle: 'ASUS ROG Gaming Laptops, Monitors & Components | ZYLO',
      metaDescription: 'Shop ASUS ROG Zephyrus laptops, ROG Swift 360Hz monitors, and hardcore gaming components.',
      keywords: ['asus', 'rog', 'zephyrus', 'gaming laptop', 'rog swift'],
      canonicalUrl: 'https://zylo.com/brands/asus-rog',
      ogImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'LG Electronics',
    slug: 'lg-electronics',
    description: 'South Korean leader in self-lit OLED televisions, UltraGear gaming monitors, and energy-efficient connected appliances.',
    countryOfOrigin: 'South Korea',
    website: 'https://www.lg.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 13,
    seo: {
      metaTitle: 'LG OLED evo TVs, UltraGear Monitors & Appliances | ZYLO',
      metaDescription: 'Experience infinite contrast with LG OLED evo series TVs and high-speed UltraGear monitors.',
      keywords: ['lg', 'oled tv', 'c3 oled', 'ultragear', 'smart home'],
      canonicalUrl: 'https://zylo.com/brands/lg-electronics',
      ogImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Canon',
    slug: 'canon',
    description: 'Japanese photography authority crafting EOS R full-frame mirrorless camera bodies, legendary RF lenses, and fine-art printers.',
    countryOfOrigin: 'Japan',
    website: 'https://www.canon.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canon_wordmark.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 14,
    seo: {
      metaTitle: 'Canon EOS R Mirrorless Cameras & RF Lenses | ZYLO',
      metaDescription: 'Capture cinematic brilliance with Canon EOS R5, R6 Mark II, and professional RF L-series optics.',
      keywords: ['canon', 'eos r5', 'mirrorless camera', 'rf lens', 'photography'],
      canonicalUrl: 'https://zylo.com/brands/canon',
      ogImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Dell Technologies',
    slug: 'dell-technologies',
    description: 'Leading producer of XPS infinity-edge ultrabooks, Latitude enterprise machines, and Alienware esports hardware.',
    countryOfOrigin: 'United States',
    website: 'https://www.dell.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 15,
    seo: {
      metaTitle: 'Dell XPS Laptops, Alienware & UltraSharp Monitors | ZYLO',
      metaDescription: 'Power your workflow with Dell XPS 15 ultrabooks and color-accurate UltraSharp 4K USB-C displays.',
      keywords: ['dell', 'xps 13', 'xps 15', 'alienware', 'ultrasharp'],
      canonicalUrl: 'https://zylo.com/brands/dell-technologies',
      ogImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Puma',
    slug: 'puma',
    description: 'Fast athletic performance footwear, Motorsport racing collections with Ferrari & Porsche, and urban lifestyle apparel.',
    countryOfOrigin: 'Germany',
    website: 'https://www.puma.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma-Logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 16,
    seo: {
      metaTitle: 'Puma Running Shoes, Nitro Sneakers & Sportswear | ZYLO',
      metaDescription: 'Shop Puma Nitro marathon shoes, motorsport apparel, and lifestyle tracksuits with fast shipping.',
      keywords: ['puma', 'puma nitro', 'running sneakers', 'motorsport', 'sportswear'],
      canonicalUrl: 'https://zylo.com/brands/puma',
      ogImage: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Sennheiser',
    slug: 'sennheiser',
    description: 'German audio masters crafting pristine open-back audiophile headphones, Momentum wireless earbuds, and broadcast microphones.',
    countryOfOrigin: 'Germany',
    website: 'https://www.sennheiser.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Sennheiser_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 17,
    seo: {
      metaTitle: 'Sennheiser Momentum Wireless & Audiophile Headphones | ZYLO',
      metaDescription: 'Audiophile grade acoustic performance with Sennheiser HD 660S2 and Momentum True Wireless 4.',
      keywords: ['sennheiser', 'momentum 4', 'audiophile', 'headphones', 'hd 600'],
      canonicalUrl: 'https://zylo.com/brands/sennheiser',
      ogImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Logitech',
    slug: 'logitech',
    description: 'Swiss productivity & peripheral champion creating MX Master ergonomic mice, MX Keys keyboards, and StreamCam webcams.',
    countryOfOrigin: 'Switzerland',
    website: 'https://www.logitech.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 18,
    seo: {
      metaTitle: 'Logitech MX Master Mice, Keyboards & Ergonomic Tools | ZYLO',
      metaDescription: 'Boost desktop productivity with Logitech MX Master 3S, MX Mechanical, and 4K Brio webcams.',
      keywords: ['logitech', 'mx master 3s', 'mx keys', 'ergonomic mouse', 'brio webcam'],
      canonicalUrl: 'https://zylo.com/brands/logitech',
      ogImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'GoPro',
    slug: 'gopro',
    description: 'Rugged waterproof 5.3K action cameras with HyperSmooth stabilization engineered for extreme sports and outdoor adventures.',
    countryOfOrigin: 'United States',
    website: 'https://www.gopro.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/GoPro_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 19,
    seo: {
      metaTitle: 'GoPro HERO Action Cameras & Adventure Accessories | ZYLO',
      metaDescription: 'Capture your wildest outdoor moments with GoPro HERO12 Black and waterproof stabilization rigs.',
      keywords: ['gopro', 'hero12', 'action camera', 'hypersmooth', '4k video'],
      canonicalUrl: 'https://zylo.com/brands/gopro',
      ogImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Under Armour',
    slug: 'under-armour',
    description: 'Pioneers of moisture-wicking HeatGear and ColdGear compression base layers, athletic training shoes, and fitness apparel.',
    countryOfOrigin: 'United States',
    website: 'https://www.underarmour.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 20,
    seo: {
      metaTitle: 'Under Armour HeatGear Compression & Training Apparel | ZYLO',
      metaDescription: 'Built for intense athletes: Under Armour compression shirts, running shoes, and gym apparel.',
      keywords: ['under armour', 'heatgear', 'compression shirt', 'gym clothes', 'curry shoes'],
      canonicalUrl: 'https://zylo.com/brands/under-armour',
      ogImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Leica',
    slug: 'leica',
    description: 'Legendary German optical craft producing M-system rangefinders, timeless handcrafted cameras, and world-class optical glass.',
    countryOfOrigin: 'Germany',
    website: 'https://www.leica-camera.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Leica_Camera_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 21,
    seo: {
      metaTitle: 'Leica M-System Cameras & Summilux Prime Optics | ZYLO',
      metaDescription: 'Step into legendary photography with Leica M11 rangefinders, Q3 compacts, and precision lenses.',
      keywords: ['leica', 'leica m11', 'leica q3', 'rangefinder', 'summilux'],
      canonicalUrl: 'https://zylo.com/brands/leica',
      ogImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Nikon',
    slug: 'nikon',
    description: 'Japanese imaging master delivering Z-mount full frame mirrorless systems, Nikkor high-resolution lenses, and pro sports bodies.',
    countryOfOrigin: 'Japan',
    website: 'https://www.nikon.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Nikon_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1502982720700-bfff97f2da8d?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 22,
    seo: {
      metaTitle: 'Nikon Z8, Z9 Mirrorless Cameras & Nikkor Optics | ZYLO',
      metaDescription: 'Pro-grade high resolution photography and 8K video capture with Nikon Z-series cameras.',
      keywords: ['nikon', 'nikon z8', 'nikon z9', 'nikkor lenses', 'mirrorless'],
      canonicalUrl: 'https://zylo.com/brands/nikon',
      ogImage: 'https://images.unsplash.com/photo-1502982720700-bfff97f2da8d?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'KitchenAid',
    slug: 'kitchenaid',
    description: 'American culinary icon famed for the Artisan tilt-head stand mixer, heavy-duty culinary attachments, and precision blenders.',
    countryOfOrigin: 'United States',
    website: 'https://www.kitchenaid.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/KitchenAid_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 23,
    seo: {
      metaTitle: 'KitchenAid Artisan Stand Mixers & Culinary Tools | ZYLO',
      metaDescription: 'Elevate home baking with iconic KitchenAid Artisan 5-quart mixers and versatile pasta attachments.',
      keywords: ['kitchenaid', 'stand mixer', 'artisan mixer', 'baking tools', 'kitchen appliances'],
      canonicalUrl: 'https://zylo.com/brands/kitchenaid',
      ogImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Sonos',
    slug: 'sonos',
    description: 'Premium wireless multi-room smart audio systems, Dolby Atmos soundbars, and high-fidelity streaming home speakers.',
    countryOfOrigin: 'United States',
    website: 'https://www.sonos.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Sonos_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1600&auto=format&fit=crop&q=80',
    isFeatured: false,
    displayOrder: 24,
    seo: {
      metaTitle: 'Sonos Arc Soundbars & Multi-Room Wireless Speakers | ZYLO',
      metaDescription: 'Transform living room acoustics with Sonos Arc, Era 300 spatial speakers, and Sub mini.',
      keywords: ['sonos', 'sonos arc', 'era 300', 'wireless sound system', 'dolby atmos'],
      canonicalUrl: 'https://zylo.com/brands/sonos',
      ogImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    name: 'Garmin',
    slug: 'garmin',
    description: 'Leader in multi-satellite GPS sports smartwatches, solar endurance fitness trackers, and outdoor navigation instrumentation.',
    countryOfOrigin: 'United States',
    website: 'https://www.garmin.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Garmin_logo.svg',
    bannerUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1600&auto=format&fit=crop&q=80',
    isFeatured: true,
    displayOrder: 25,
    seo: {
      metaTitle: 'Garmin Fenix, Forerunner GPS Running Watches | ZYLO',
      metaDescription: 'Train harder with Garmin Fenix 7 Pro, Forerunner 965, and long-lasting solar GPS smartwatches.',
      keywords: ['garmin', 'fenix 7', 'forerunner 965', 'gps smartwatch', 'running watch'],
      canonicalUrl: 'https://zylo.com/brands/garmin',
      ogImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&auto=format&fit=crop&q=80',
    },
  },
];

@Injectable()
export class BrandsSeedService implements OnModuleInit {
  private readonly logger = new Logger(BrandsSeedService.name);

  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    private readonly brandsService: BrandsService,
  ) {}

  async onModuleInit() {
    try {
      await this.seed();
    } catch (err: any) {
      this.logger.error(`Error during brand auto-seeding: ${err?.message}`, err?.stack);
    }
  }

  async seed(): Promise<{ seeded: number; existing: number }> {
    const count = await this.brandModel.countDocuments();
    if (count > 0) {
      this.logger.log(`Brand collection already populated with ${count} brands. Skipping seed.`);
      return { seeded: 0, existing: count };
    }

    this.logger.log('Brand collection empty. Seeding 25 premier global brands...');
    let seeded = 0;

    for (const def of SEED_BRANDS) {
      await this.brandsService.create({
        name: def.name,
        slug: def.slug,
        description: def.description,
        countryOfOrigin: def.countryOfOrigin,
        website: def.website,
        logoUrl: def.logoUrl,
        bannerUrl: def.bannerUrl,
        isFeatured: def.isFeatured,
        status: 'ACTIVE',
        displayOrder: def.displayOrder,
        seo: def.seo,
      });
      seeded++;
    }

    this.logger.log(`Successfully seeded ${seeded} global premier brands.`);
    return { seeded, existing: 0 };
  }
}

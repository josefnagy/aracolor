#!/usr/bin/env node

/**
 * Migration script: imports existing numbered reference images into data/references.json.
 *
 * Usage: node scripts/migrateRefImages.js
 *
 * - Scans public/resources/img/ref/{folder}/ for numbered .jpg images
 * - Creates reference entries keeping existing file paths (no file rename)
 * - Sets carousel: true for the first N images per category (matching current carousel counts)
 * - Reads dimensions via sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const WEBROOT = path.join(__dirname, '../public');
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'references.json');
const CONFIG_FILE = path.join(__dirname, '../config/ref-categories.json');

// Current carousel counts from reference.pug
const CATEGORIES = [
  { slug: 'sterky', carouselCount: 20 },
  { slug: 'koupelny', carouselCount: 20 },
  { slug: 'malby', carouselCount: 20 },
  { slug: 'fasady', carouselCount: 3 },
  { slug: 'myti_fasad', carouselCount: 10 },
  { slug: 'tapety', carouselCount: 2 },
];

async function migrate() {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

  const data = {
    version: 1,
    categories: {},
    images: {},
  };

  for (const cat of CATEGORIES) {
    const folder = path.join(WEBROOT, 'resources/img/ref', cat.slug);
    const thumbFolder = path.join(folder, 'thumbs');

    if (!fs.existsSync(folder)) {
      console.log(`Skipping ${cat.slug} - folder not found`);
      continue;
    }

    // Find all numbered jpg images
    const files = fs.readdirSync(folder)
      .filter(f => /^\d+\.jpg$/i.test(f))
      .sort((a, b) => parseInt(a) - parseInt(b));

    if (files.length === 0) {
      console.log(`Skipping ${cat.slug} - no images found`);
      continue;
    }

    const imageIds = [];
    const title = config[cat.slug]?.title || cat.slug;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const num = parseInt(file);
      const id = `ref_${cat.slug}_${num}`;
      const src = `/resources/img/ref/${cat.slug}/${file}`;
      const thumbFile = path.join(thumbFolder, file);
      const thumb = fs.existsSync(thumbFile)
        ? `/resources/img/ref/${cat.slug}/thumbs/${file}`
        : null;

      // Read image dimensions
      let width = null;
      let height = null;
      let size = null;
      try {
        const fullPath = path.join(folder, file);
        const stat = fs.statSync(fullPath);
        size = stat.size;
        const metadata = await sharp(fullPath).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch (err) {
        console.warn(`  Warning: could not read metadata for ${file}: ${err.message}`);
      }

      data.images[id] = {
        category: cat.slug,
        src,
        thumb,
        carousel: i < cat.carouselCount,
        order: i,
        uploadedAt: new Date().toISOString(),
        size,
        width,
        height,
      };

      imageIds.push(id);
    }

    data.categories[cat.slug] = {
      title,
      heroImageId: imageIds[0] || null,
      imageIds,
    };

    const carouselCount = imageIds.filter(id => data.images[id].carousel).length;
    console.log(`${cat.slug}: ${imageIds.length} images, ${carouselCount} carousel`);
  }

  // Write output
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`\nWrote ${DATA_FILE}`);
  console.log(`Total: ${Object.keys(data.images).length} images across ${Object.keys(data.categories).length} categories`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

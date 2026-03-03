#!/usr/bin/env node

/**
 * Backfill size, width, and height metadata for existing images in images.json.
 * Idempotent — skips images that already have all three fields.
 *
 * Usage: node scripts/backfillMetadata.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DATA_FILE = path.join(__dirname, '../data/images.json');
const WEBROOT = path.join(__dirname, '../public');

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('data/images.json not found');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const imageIds = Object.keys(data.images);

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const id of imageIds) {
    const img = data.images[id];

    // Skip if already has all metadata
    if (img.size && img.width && img.height) {
      skipped++;
      continue;
    }

    const filePath = path.join(WEBROOT, img.src);

    if (!fs.existsSync(filePath)) {
      console.warn(`  MISSING: ${filePath}`);
      missing++;
      continue;
    }

    try {
      const stat = fs.statSync(filePath);
      const metadata = await sharp(filePath).metadata();

      img.size = stat.size;
      img.width = metadata.width;
      img.height = metadata.height;
      updated++;
    } catch (err) {
      console.warn(`  ERROR processing ${id}: ${err.message}`);
    }
  }

  // Atomic write: write to .tmp then rename
  const tmpFile = DATA_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, DATA_FILE);

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}, Missing: ${missing}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

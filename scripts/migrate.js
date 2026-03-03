/**
 * Migration script: scans existing images in public/resources/img/bs/
 * and generates data/images.json for the admin system.
 *
 * Preserves existing filenames to avoid breaking the static site.
 * Run once: node scripts/migrate.js
 */

const fs = require('fs');
const path = require('path');

const WEBROOT = process.env.WEBROOT || path.join(__dirname, '../public');
const BS_DIR = path.join(WEBROOT, 'resources/img/bs');
const OUTPUT_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'images.json');

const categories = require(path.join(__dirname, '../config/categories.json'));

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

function scanCategory(slug) {
  const dir = path.join(BS_DIR, slug);
  if (!fs.existsSync(dir)) {
    console.log(`  [skip] ${slug}: directory not found`);
    return [];
  }

  const files = fs.readdirSync(dir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    if (!VALID_EXTENSIONS.includes(ext)) return false;

    // Skip stray files that don't match the category naming pattern
    const prefix = slug;
    if (!f.startsWith(prefix + '-')) {
      console.log(`  [skip] ${slug}/${f}: doesn't match naming pattern`);
      return false;
    }
    return true;
  });

  // Sort by numeric suffix
  files.sort((a, b) => {
    const numA = extractNumber(a);
    const numB = extractNumber(b);
    return numA - numB;
  });

  return files;
}

function extractNumber(filename) {
  const match = filename.match(/-(\d+)\.\w+$/);
  return match ? parseInt(match[1], 10) : 0;
}

function main() {
  console.log('Aracolor Migration Script');
  console.log('='.repeat(40));
  console.log(`Scanning: ${BS_DIR}\n`);

  if (!fs.existsSync(BS_DIR)) {
    console.error(`ERROR: ${BS_DIR} not found`);
    process.exit(1);
  }

  const data = {
    version: 1,
    categories: {},
    images: {},
  };

  let totalImages = 0;

  for (const [slug, config] of Object.entries(categories)) {
    const files = scanCategory(slug);
    console.log(`${config.title} (${slug}): ${files.length} images`);

    const imageIds = [];

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const filePath = path.join(BS_DIR, slug, filename);
      const stat = fs.statSync(filePath);

      // Use filename without extension as ID, but append extension suffix
      // for non-jpg files to avoid collisions (e.g., concrete-1.jpg vs concrete-1.png)
      const baseName = path.basename(filename, path.extname(filename));
      const ext = path.extname(filename).toLowerCase();
      const id = ext === '.jpg' ? baseName : `${baseName}_${ext.slice(1)}`;

      const src = `/resources/img/bs/${slug}/${filename}`;

      // Skip duplicate IDs (shouldn't happen with the suffix logic)
      if (data.images[id]) {
        console.log(`  [warn] ${slug}/${filename}: duplicate ID ${id}, skipping`);
        continue;
      }

      data.images[id] = {
        category: slug,
        src,
        order: i,
        uploadedAt: stat.mtime.toISOString(),
      };

      imageIds.push(id);
    }

    data.categories[slug] = {
      title: config.title,
      heroImageId: imageIds.length > 0 ? imageIds[0] : null,
      imageIds,
    };

    totalImages += files.length;
  }

  // Write output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log(`\nTotal: ${totalImages} images across ${Object.keys(categories).length} categories`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main();

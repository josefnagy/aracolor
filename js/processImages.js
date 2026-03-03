const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');
const { execSync } = require('child_process');

const sourceFolder = 'source_images';
const archiveFolder = path.join(sourceFolder, 'archive');
const outputBase = 'public/resources/img/bs';

const categoryMap = {
  otocento: 'ottocento',
  travertino: 'travertino-romano',
  encanto: 'encanto',
  marmolino: 'marmolino',
};

const MAX_DIMENSION = 1600;
const MAX_FILE_SIZE = 750 * 1024; // 750KB
const INITIAL_QUALITY = 80;
const QUALITY_STEP = 5;

const VALID_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.heic'];

function parseSourceImages() {
  const files = fs.readdirSync(sourceFolder).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return VALID_EXTENSIONS.includes(ext);
  });

  const groups = {};

  files.forEach(fileName => {
    const match = fileName.match(/^([a-zA-Z]+)/);
    if (!match) return;

    const category = match[1].toLowerCase();
    if (!categoryMap[category]) return;

    // extract numeric suffix for sorting
    const numMatch = fileName.match(/^[a-zA-Z]+(\d+)?/);
    const num = numMatch && numMatch[1] ? parseInt(numMatch[1], 10) : 1;

    if (!groups[category]) groups[category] = [];
    groups[category].push({ fileName, num });
  });

  // sort each group numerically
  Object.keys(groups).forEach(cat => {
    groups[cat].sort((a, b) => a.num - b.num);
  });

  return groups;
}

function getExistingImages(outputDir, prefix) {
  if (!fs.existsSync(outputDir)) return [];

  return fs.readdirSync(outputDir)
    .filter(f => f.startsWith(prefix + '-') && f.endsWith('.jpg'))
    .map(f => {
      const match = f.match(/-(\d+)\.jpg$/);
      return { fileName: f, num: match ? parseInt(match[1], 10) : 0 };
    })
    .sort((a, b) => a.num - b.num);
}

function renameExisting(outputDir, prefix, existing, offset) {
  // rename in reverse order to avoid collisions
  for (let i = existing.length - 1; i >= 0; i--) {
    const item = existing[i];
    const oldPath = path.join(outputDir, item.fileName);
    const newNum = item.num + offset;
    const newPath = path.join(outputDir, `${prefix}-${newNum}.jpg`);
    fs.renameSync(oldPath, newPath);
  }
}

function convertHeicToJpeg(heicPath) {
  const tmpPath = heicPath.replace(/\.heic$/i, '_converted.jpg');
  execSync(`sips -s format jpeg "${heicPath}" --out "${tmpPath}"`, { stdio: 'pipe' });
  return tmpPath;
}

async function processImage(inputPath, outputPath) {
  let actualInput = inputPath;
  let tmpFile = null;

  if (path.extname(inputPath).toLowerCase() === '.heic') {
    actualInput = convertHeicToJpeg(inputPath);
    tmpFile = actualInput;
  }

  let quality = INITIAL_QUALITY;

  try {
    while (quality > 0) {
      const buffer = await sharp(actualInput)
        .rotate()
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();

      if (buffer.length <= MAX_FILE_SIZE || quality <= 10) {
        fs.writeFileSync(outputPath, buffer);
        return { size: buffer.length, quality };
      }

      quality -= QUALITY_STEP;
    }
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

async function processCategory(category, files) {
  const mappedName = categoryMap[category];
  const outputDir = path.join(outputBase, mappedName);

  console.log(chalk.blue(`\n--- Processing ${category} → ${mappedName} ---`));
  console.log(chalk.gray(`  ${files.length} new images`));

  // ensure output folder exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(chalk.yellow(`  Created ${outputDir}`));
  }

  // handle existing images
  const existing = getExistingImages(outputDir, mappedName);
  if (existing.length > 0) {
    console.log(chalk.gray(`  ${existing.length} existing images, renumbering...`));
    renameExisting(outputDir, mappedName, existing, files.length);
  }

  // process new images
  for (let i = 0; i < files.length; i++) {
    const srcFile = files[i].fileName;
    const srcPath = path.join(sourceFolder, srcFile);
    const outNum = i + 1;
    const outPath = path.join(outputDir, `${mappedName}-${outNum}.jpg`);

    const result = await processImage(srcPath, outPath);
    const sizeKB = (result.size / 1024).toFixed(0);
    console.log(chalk.green(`  ${srcFile} → ${mappedName}-${outNum}.jpg (${sizeKB}KB, q${result.quality})`));
  }

  // archive originals
  if (!fs.existsSync(archiveFolder)) {
    fs.mkdirSync(archiveFolder, { recursive: true });
  }

  files.forEach(f => {
    const src = path.join(sourceFolder, f.fileName);
    const dest = path.join(archiveFolder, f.fileName);
    fs.renameSync(src, dest);
  });

  console.log(chalk.gray(`  Archived ${files.length} originals to ${archiveFolder}`));

  const totalImages = files.length + existing.length;
  console.log(chalk.blue(`  Total: ${totalImages} images in ${outputDir}`));
}

async function main() {
  console.log(chalk.bold('Image Processing Script'));
  console.log(chalk.gray('='.repeat(40)));

  const groups = parseSourceImages();

  for (const category of Object.keys(groups)) {
    await processCategory(category, groups[category]);
  }

  console.log(chalk.bold.green('\nDone!'));
}

main().catch(err => {
  console.error(chalk.red('Error:'), err);
  process.exit(1);
});

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MAX_DIMENSION = 1600;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const INITIAL_QUALITY = 80;
const QUALITY_STEP = 5;

/**
 * Process an image buffer: auto-rotate, resize, compress to JPEG.
 * Iteratively reduces quality until file is under MAX_FILE_SIZE.
 *
 * @param {Buffer} inputBuffer - Raw image buffer from multer
 * @param {string} outputPath - Destination path for processed JPEG
 * @returns {Promise<{size: number, quality: number}>}
 */
async function processImage(inputBuffer, outputPath) {
  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let quality = INITIAL_QUALITY;

  while (quality > 0) {
    const buffer = await sharp(inputBuffer)
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
}

module.exports = { processImage };

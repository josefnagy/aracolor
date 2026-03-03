const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PROCESSING_FILE = path.join(__dirname, '../../config/processing.json');

const DEFAULTS = {
  maxDimension: 1600,
  maxFileSizeKB: 1024,
  initialQuality: 80,
  qualityStep: 5,
};

function getConfig() {
  try {
    if (fs.existsSync(PROCESSING_FILE)) {
      const raw = fs.readFileSync(PROCESSING_FILE, 'utf-8');
      return { ...DEFAULTS, ...JSON.parse(raw) };
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULTS;
}

/**
 * Process an image buffer: auto-rotate, resize, compress to JPEG.
 * Iteratively reduces quality until file is under max file size.
 *
 * @param {Buffer} inputBuffer - Raw image buffer from multer
 * @param {string} outputPath - Destination path for processed JPEG
 * @returns {Promise<{size: number, quality: number, width: number, height: number}>}
 */
async function processImage(inputBuffer, outputPath) {
  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const config = getConfig();
  const maxFileSize = config.maxFileSizeKB * 1024;
  let quality = config.initialQuality;

  while (quality > 0) {
    const { data: buffer, info } = await sharp(inputBuffer)
      .rotate()
      .resize(config.maxDimension, config.maxDimension, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer({ resolveWithObject: true });

    if (buffer.length <= maxFileSize || quality <= 10) {
      fs.writeFileSync(outputPath, buffer);
      return { size: buffer.length, quality, width: info.width, height: info.height };
    }

    quality -= config.qualityStep;
  }
}

module.exports = { processImage };

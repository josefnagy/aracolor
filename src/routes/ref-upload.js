const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const refDataStore = require('../services/refDataStore');
const { processImage } = require('../services/imageProcessor');
const { generateId } = require('../utils/idGenerator');
const refConfigStore = require('../services/refConfigStore');

const router = express.Router();

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

const WEBROOT = process.env.WEBROOT || path.join(__dirname, '../../public');
const ARCHIVE_DIR = process.env.ARCHIVE_DIR || path.join(WEBROOT, 'archive');

router.post('/ref-upload', upload.array('files', 50), async (req, res) => {
  const { category } = req.body;

  const categoryConfig = refConfigStore.readCategories();
  if (!category || !categoryConfig[category]) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const backup = refDataStore.getBackup();
  const writtenFiles = [];
  const results = [];

  try {
    for (const file of req.files) {
      const id = generateId();
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const outputPath = path.join(WEBROOT, 'resources/img/ref', category, `${id}.jpg`);
      const thumbOutputPath = path.join(WEBROOT, 'resources/img/ref', category, 'thumbs', `${id}.jpg`);
      const archivePath = path.join(ARCHIVE_DIR, 'ref', category, `${id}_original${ext}`);

      // Ensure directories exist
      for (const p of [archivePath, outputPath, thumbOutputPath]) {
        const dir = path.dirname(p);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      // Save original to archive
      fs.writeFileSync(archivePath, file.buffer);
      writtenFiles.push(archivePath);

      // Process full-size image
      const result = await processImage(file.buffer, outputPath);
      writtenFiles.push(outputPath);

      // Create thumbnail (400px max dimension)
      const { data: thumbBuffer } = await require('sharp')(file.buffer)
        .rotate()
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer({ resolveWithObject: true });
      fs.writeFileSync(thumbOutputPath, thumbBuffer);
      writtenFiles.push(thumbOutputPath);

      const src = `/resources/img/ref/${category}/${id}.jpg`;
      const thumb = `/resources/img/ref/${category}/thumbs/${id}.jpg`;
      await refDataStore.addImage(id, category, src, {
        thumb,
        size: result.size,
        width: result.width,
        height: result.height,
      });

      results.push({
        id,
        src,
        thumb,
        size: result.size,
        quality: result.quality,
        width: result.width,
        height: result.height,
      });
    }

    res.json({ ok: true, images: results });
  } catch (err) {
    await refDataStore.restoreBackup(backup);
    for (const f of writtenFiles) {
      try { fs.unlinkSync(f); } catch {}
    }
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message && err.message.startsWith('Unsupported file type')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dataStore = require('../services/dataStore');
const { processImage } = require('../services/imageProcessor');
const { generateId } = require('../utils/idGenerator');
const configStore = require('../services/configStore');

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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
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

router.post('/upload', upload.array('files', 50), async (req, res) => {
  const { category } = req.body;

  const categoryConfig = configStore.readCategories();
  if (!category || !categoryConfig[category]) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const backup = dataStore.getBackup();
  const writtenFiles = [];
  const results = [];

  try {
    // Process files sequentially to avoid memory pressure
    for (const file of req.files) {
      const id = generateId();
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const outputPath = path.join(WEBROOT, 'resources/img/bs', category, `${id}.jpg`);
      const archivePath = path.join(ARCHIVE_DIR, category, `${id}_original${ext}`);

      // Ensure archive dir exists
      const archiveDir = path.dirname(archivePath);
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      // Save original to archive
      fs.writeFileSync(archivePath, file.buffer);
      writtenFiles.push(archivePath);

      // Process and save
      const result = await processImage(file.buffer, outputPath);
      writtenFiles.push(outputPath);

      const src = `/resources/img/bs/${category}/${id}.jpg`;
      await dataStore.addImage(id, category, src, {
        size: result.size,
        width: result.width,
        height: result.height,
      });

      results.push({
        id,
        src,
        size: result.size,
        quality: result.quality,
        width: result.width,
        height: result.height,
      });
    }

    res.json({ ok: true, images: results });
  } catch (err) {
    // Rollback: restore JSON and delete written files
    await dataStore.restoreBackup(backup);
    for (const f of writtenFiles) {
      try { fs.unlinkSync(f); } catch {}
    }
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
});

// Handle multer errors
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

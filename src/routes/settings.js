const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '../../config/users.json');
const PROCESSING_FILE = path.join(__dirname, '../../config/processing.json');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const CATEGORIES_FILE = path.join(__dirname, '../../config/categories.json');

const PROCESSING_DEFAULTS = {
  maxDimension: 1600,
  maxFileSizeKB: 1024,
  initialQuality: 80,
  qualityStep: 5,
};

// Change password
router.post('/settings/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = usersData.users.find(u => u.username === req.user.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);

  const tmpFile = USERS_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(usersData, null, 2));
  fs.renameSync(tmpFile, USERS_FILE);

  res.json({ ok: true });
});

// Get processing config
router.get('/settings/processing', (req, res) => {
  if (fs.existsSync(PROCESSING_FILE)) {
    const config = JSON.parse(fs.readFileSync(PROCESSING_FILE, 'utf-8'));
    res.json({ ...PROCESSING_DEFAULTS, ...config });
  } else {
    res.json(PROCESSING_DEFAULTS);
  }
});

// Save processing config
router.put('/settings/processing', (req, res) => {
  const { maxDimension, maxFileSizeKB, initialQuality, qualityStep } = req.body;

  const config = {
    maxDimension: Number(maxDimension) || PROCESSING_DEFAULTS.maxDimension,
    maxFileSizeKB: Number(maxFileSizeKB) || PROCESSING_DEFAULTS.maxFileSizeKB,
    initialQuality: Number(initialQuality) || PROCESSING_DEFAULTS.initialQuality,
    qualityStep: Number(qualityStep) || PROCESSING_DEFAULTS.qualityStep,
  };

  const tmpFile = PROCESSING_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(config, null, 2));
  fs.renameSync(tmpFile, PROCESSING_FILE);

  res.json({ ok: true });
});

// Export data files
router.get('/settings/export/:type', (req, res) => {
  const { type } = req.params;

  let filePath;
  let filename;

  if (type === 'images') {
    filePath = path.join(DATA_DIR, 'images.json');
    filename = 'images.json';
  } else if (type === 'categories') {
    filePath = CATEGORIES_FILE;
    filename = 'categories.json';
  } else {
    return res.status(400).json({ error: 'Invalid export type' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, filename);
});

module.exports = router;

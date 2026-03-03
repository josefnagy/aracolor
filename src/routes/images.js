const express = require('express');
const path = require('path');
const fs = require('fs');
const dataStore = require('../services/dataStore');

const router = express.Router();

const WEBROOT = process.env.WEBROOT || path.join(__dirname, '../../public');

router.post('/reorder', async (req, res) => {
  const { category, orderedIds } = req.body;

  if (!category || !Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'category and orderedIds required' });
  }

  try {
    await dataStore.reorderImages(category, orderedIds);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/set-hero', async (req, res) => {
  const { category, imageId } = req.body;

  if (!category || !imageId) {
    return res.status(400).json({ error: 'category and imageId required' });
  }

  try {
    await dataStore.setHero(category, imageId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/image/:id', async (req, res) => {
  const { id } = req.params;

  const data = dataStore.getData();
  const image = data.images[id];
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Delete processed file (keep archive)
  const processedPath = path.join(WEBROOT, image.src);
  if (fs.existsSync(processedPath)) {
    fs.unlinkSync(processedPath);
  }

  const removed = await dataStore.removeImage(id);
  res.json({ ok: true, removed });
});

module.exports = router;

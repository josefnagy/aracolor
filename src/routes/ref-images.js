const express = require('express');
const path = require('path');
const fs = require('fs');
const refDataStore = require('../services/refDataStore');

const router = express.Router();

const WEBROOT = process.env.WEBROOT || path.join(__dirname, '../../public');

router.post('/ref-reorder', async (req, res) => {
  const { category, orderedIds } = req.body;

  if (!category || !Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'category and orderedIds required' });
  }

  try {
    await refDataStore.reorderImages(category, orderedIds);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/ref-set-hero', async (req, res) => {
  const { category, imageId } = req.body;

  if (!category || !imageId) {
    return res.status(400).json({ error: 'category and imageId required' });
  }

  try {
    await refDataStore.setHero(category, imageId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/ref-carousel', async (req, res) => {
  const { imageId, value } = req.body;

  if (!imageId || value === undefined) {
    return res.status(400).json({ error: 'imageId and value required' });
  }

  try {
    await refDataStore.setCarousel(imageId, value);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/ref-image/:id', async (req, res) => {
  const { id } = req.params;

  const data = refDataStore.getData();
  const image = data.images[id];
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Delete processed file and thumbnail (keep archive)
  const processedPath = path.join(WEBROOT, image.src);
  if (fs.existsSync(processedPath)) {
    fs.unlinkSync(processedPath);
  }

  if (image.thumb) {
    const thumbPath = path.join(WEBROOT, image.thumb);
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
  }

  const removed = await refDataStore.removeImage(id);
  res.json({ ok: true, removed });
});

module.exports = router;

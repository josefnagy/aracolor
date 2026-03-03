const express = require('express');
const dataStore = require('../services/dataStore');
const configStore = require('../services/configStore');

const router = express.Router();

router.get('/categories', (req, res) => {
  const data = dataStore.getData();
  const categoryConfig = configStore.readCategories();

  // Merge config titles with live data
  const categories = {};
  for (const [slug, config] of Object.entries(categoryConfig)) {
    const catData = data.categories[slug] || { heroImageId: null, imageIds: [] };
    categories[slug] = {
      title: config.title,
      description: config.description || '',
      heroImageId: catData.heroImageId,
      imageIds: catData.imageIds,
    };
  }

  res.json({
    categories,
    images: data.images,
  });
});

router.post('/categories', async (req, res) => {
  const { title, slug, description } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'title and slug required' });
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format' });
  }

  try {
    await configStore.addCategory(slug, title, description || '');
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/categories/:slug', async (req, res) => {
  const { slug } = req.params;
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title required' });
  }

  try {
    await configStore.renameCategory(slug, title, description);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/categories/:slug', async (req, res) => {
  const { slug } = req.params;
  const data = dataStore.getData();
  const catData = data.categories[slug];

  // Only allow deleting empty categories
  if (catData && catData.imageIds && catData.imageIds.length > 0) {
    return res.status(400).json({ error: 'Cannot delete category with images. Remove all images first.' });
  }

  try {
    await configStore.removeCategory(slug);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/categories/reorder', async (req, res) => {
  const { orderedSlugs } = req.body;

  if (!Array.isArray(orderedSlugs)) {
    return res.status(400).json({ error: 'orderedSlugs array required' });
  }

  try {
    await configStore.reorderCategories(orderedSlugs);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

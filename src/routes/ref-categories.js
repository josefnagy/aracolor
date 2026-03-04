const express = require('express');
const refDataStore = require('../services/refDataStore');
const refConfigStore = require('../services/refConfigStore');

const router = express.Router();

router.get('/ref-categories', (req, res) => {
  const data = refDataStore.getData();
  const categoryConfig = refConfigStore.readCategories();

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

router.post('/ref-categories', async (req, res) => {
  const { title, slug, description } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'title and slug required' });
  }

  if (!/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format' });
  }

  try {
    await refConfigStore.addCategory(slug, title, description || '');
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/ref-categories/:slug', async (req, res) => {
  const { slug } = req.params;
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title required' });
  }

  try {
    await refConfigStore.renameCategory(slug, title, description);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/ref-categories/:slug', async (req, res) => {
  const { slug } = req.params;
  const data = refDataStore.getData();
  const catData = data.categories[slug];

  if (catData && catData.imageIds && catData.imageIds.length > 0) {
    return res.status(400).json({ error: 'Cannot delete category with images. Remove all images first.' });
  }

  try {
    await refConfigStore.removeCategory(slug);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/ref-categories/reorder', async (req, res) => {
  const { orderedSlugs } = req.body;

  if (!Array.isArray(orderedSlugs)) {
    return res.status(400).json({ error: 'orderedSlugs array required' });
  }

  try {
    await refConfigStore.reorderCategories(orderedSlugs);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

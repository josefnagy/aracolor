const express = require('express');
const pricelistStore = require('../services/pricelistStore');

const router = express.Router();

// ── Category routes ──

router.post('/pricelist/categories', async (req, res) => {
  const { id, title, column } = req.body;

  if (!id || !title || !column) {
    return res.status(400).json({ error: 'id, title and column required' });
  }

  try {
    await pricelistStore.addCategory(id, title, column);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/pricelist/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { title, column } = req.body;

  try {
    await pricelistStore.updateCategory(id, { title, column });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/pricelist/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pricelistStore.removeCategory(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/pricelist/categories/reorder', async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds array required' });
  }

  try {
    await pricelistStore.reorderCategories(orderedIds);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Item routes ──

router.post('/pricelist/categories/:catId/items', async (req, res) => {
  const { catId } = req.params;
  const { name, price, note } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name required' });
  }

  try {
    const item = await pricelistStore.addItem(catId, { name, price, note });
    res.json({ ok: true, item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/pricelist/categories/:catId/items/:itemId', async (req, res) => {
  const { catId, itemId } = req.params;
  const { name, price, note } = req.body;

  try {
    await pricelistStore.updateItem(catId, itemId, { name, price, note });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/pricelist/categories/:catId/items/:itemId', async (req, res) => {
  const { catId, itemId } = req.params;

  try {
    await pricelistStore.removeItem(catId, itemId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/pricelist/categories/:catId/items/reorder', async (req, res) => {
  const { catId } = req.params;
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds array required' });
  }

  try {
    await pricelistStore.reorderItems(catId, orderedIds);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

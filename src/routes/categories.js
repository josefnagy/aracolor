const express = require('express');
const path = require('path');
const dataStore = require('../services/dataStore');

const router = express.Router();

const categoryConfig = require(path.join(__dirname, '../../config/categories.json'));

router.get('/categories', (req, res) => {
  const data = dataStore.getData();

  // Merge config titles with live data
  const categories = {};
  for (const [slug, config] of Object.entries(categoryConfig)) {
    const catData = data.categories[slug] || { heroImageId: null, imageIds: [] };
    categories[slug] = {
      title: config.title,
      heroImageId: catData.heroImageId,
      imageIds: catData.imageIds,
    };
  }

  res.json({
    categories,
    images: data.images,
  });
});

module.exports = router;

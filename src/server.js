const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dataStore = require('./services/dataStore');
const configStore = require('./services/configStore');
const pricelistStore = require('./services/pricelistStore');
const refDataStore = require('./services/refDataStore');
const refConfigStore = require('./services/refConfigStore');
const { authMiddleware } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const imagesRoutes = require('./routes/images');
const settingsRoutes = require('./routes/settings');
const pricelistRoutes = require('./routes/pricelist');
const refCategoriesRoutes = require('./routes/ref-categories');
const refUploadRoutes = require('./routes/ref-upload');
const refImagesRoutes = require('./routes/ref-images');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('short'));
app.use(cookieParser());
app.use(express.json());

// Serve static site images (webroot/resources) so dashboard can display them
const WEBROOT = process.env.WEBROOT || path.join(__dirname, '../public');
app.use('/resources', express.static(path.join(WEBROOT, 'resources')));

// Public image data for the marketing site (merges titles from categories config)
app.get('/api/images', (req, res) => {
  const data = dataStore.getData();
  const categoryConfig = configStore.readCategories();

  const categories = {};
  // Merge config titles into data categories, include config-only (empty) categories
  for (const [slug, config] of Object.entries(categoryConfig)) {
    const catData = data.categories[slug] || { heroImageId: null, imageIds: [] };
    categories[slug] = { ...catData, title: config.title, description: config.description || '' };
  }
  // Include any data-only categories not in config (safety fallback)
  for (const [slug, catData] of Object.entries(data.categories)) {
    if (!categories[slug]) categories[slug] = catData;
  }

  res.json({ ...data, categories });
});

// Public pricelist data for the marketing site
app.get('/api/pricelist', (req, res) => {
  res.json(pricelistStore.getData());
});

// Public references data for the marketing site
app.get('/api/references', (req, res) => {
  const data = refDataStore.getData();
  const categoryConfig = refConfigStore.readCategories();

  const categories = {};
  for (const [slug, config] of Object.entries(categoryConfig)) {
    const catData = data.categories[slug] || { heroImageId: null, imageIds: [] };
    categories[slug] = { ...catData, title: config.title, description: config.description || '' };
  }
  for (const [slug, catData] of Object.entries(data.categories)) {
    if (!categories[slug]) categories[slug] = catData;
  }

  res.json({ ...data, categories });
});

// Public auth routes (login)
app.use('/api', authRoutes);

// Protected API routes
app.use('/api', authMiddleware, categoriesRoutes);
app.use('/api', authMiddleware, uploadRoutes);
app.use('/api', authMiddleware, imagesRoutes);
app.use('/api', authMiddleware, settingsRoutes);
app.use('/api', authMiddleware, pricelistRoutes);
app.use('/api', authMiddleware, refCategoriesRoutes);
app.use('/api', authMiddleware, refUploadRoutes);
app.use('/api', authMiddleware, refImagesRoutes);

// Serve Vue SPA from dist/
const distPath = path.join(__dirname, '..', 'dist');
app.use('/admin', express.static(distPath));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server after loading data
Promise.all([dataStore.load(), pricelistStore.load(), refDataStore.load()]).then(() => {
  app.listen(PORT, () => {
    console.log(`aracolor-admin running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

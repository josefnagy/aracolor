const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dataStore = require('./services/dataStore');
const { authMiddleware } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const imagesRoutes = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('short'));
app.use(cookieParser());
app.use(express.json());

// Serve static site images (webroot/resources) so dashboard can display them
const WEBROOT = process.env.WEBROOT || path.join(__dirname, '../public');
app.use('/resources', express.static(path.join(WEBROOT, 'resources')));

// Public image data for the marketing site
app.get('/api/images', (req, res) => {
  res.json(dataStore.getData());
});

// Public auth routes (login)
app.use('/api', authRoutes);

// Protected API routes
app.use('/api', authMiddleware, categoriesRoutes);
app.use('/api', authMiddleware, uploadRoutes);
app.use('/api', authMiddleware, imagesRoutes);

// Serve Vue SPA from dist/
const distPath = path.join(__dirname, '..', 'dist');
app.use('/admin', express.static(distPath));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server after loading data
dataStore.load().then(() => {
  app.listen(PORT, () => {
    console.log(`aracolor-admin running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

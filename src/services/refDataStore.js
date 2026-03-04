const fs = require('fs');
const path = require('path');
const refConfigStore = require('./refConfigStore');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'references.json');

const MAX_CAROUSEL_PER_CATEGORY = 20;

let data = null;
let writeChain = Promise.resolve();

const emptyData = () => ({
  version: 1,
  categories: {},
  images: {},
});

async function load() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    data = JSON.parse(raw);
  } else {
    data = emptyData();
    await save();
  }
}

function getData() {
  return data;
}

function save() {
  writeChain = writeChain.then(() => atomicWrite());
  return writeChain;
}

async function atomicWrite() {
  const tmpFile = DATA_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, DATA_FILE);
}

async function addImage(id, category, src, metadata = {}) {
  const cat = data.categories[category];
  if (!cat) {
    const config = refConfigStore.readCategories();
    const displayTitle = config[category]?.title || category;
    data.categories[category] = {
      title: displayTitle,
      heroImageId: id,
      imageIds: [id],
    };
  } else {
    cat.imageIds.unshift(id);
    if (!cat.heroImageId) {
      cat.heroImageId = id;
    }
  }

  data.images[id] = {
    category,
    src,
    thumb: metadata.thumb || null,
    carousel: false,
    order: 0,
    uploadedAt: new Date().toISOString(),
    size: metadata.size || null,
    width: metadata.width || null,
    height: metadata.height || null,
  };

  reindexOrders(category);
  await save();
}

async function removeImage(id) {
  const image = data.images[id];
  if (!image) return null;

  const { category } = image;
  const cat = data.categories[category];

  cat.imageIds = cat.imageIds.filter(iid => iid !== id);

  if (cat.heroImageId === id) {
    cat.heroImageId = cat.imageIds.length > 0 ? cat.imageIds[0] : null;
  }

  delete data.images[id];

  reindexOrders(category);
  await save();

  return image;
}

async function reorderImages(category, orderedIds) {
  const cat = data.categories[category];
  if (!cat) throw new Error('Category not found');

  const existing = new Set(cat.imageIds);
  for (const id of orderedIds) {
    if (!existing.has(id)) throw new Error(`Image ${id} not in category ${category}`);
  }
  if (orderedIds.length !== cat.imageIds.length) {
    throw new Error('orderedIds length mismatch');
  }

  cat.imageIds = orderedIds;
  reindexOrders(category);
  await save();
}

async function setHero(category, imageId) {
  const cat = data.categories[category];
  if (!cat) throw new Error('Category not found');
  if (!cat.imageIds.includes(imageId)) {
    throw new Error(`Image ${imageId} not in category ${category}`);
  }

  cat.heroImageId = imageId;
  await save();
}

async function setCarousel(imageId, value) {
  const image = data.images[imageId];
  if (!image) throw new Error('Image not found');

  if (value) {
    // Count current carousel images in this category
    const cat = data.categories[image.category];
    if (!cat) throw new Error('Category not found');
    const carouselCount = cat.imageIds.filter(id => data.images[id]?.carousel).length;
    if (carouselCount >= MAX_CAROUSEL_PER_CATEGORY) {
      throw new Error(`Maximum ${MAX_CAROUSEL_PER_CATEGORY} carousel images per category`);
    }
  }

  image.carousel = !!value;
  await save();
}

function reindexOrders(category) {
  const cat = data.categories[category];
  if (!cat) return;
  cat.imageIds.forEach((id, index) => {
    if (data.images[id]) {
      data.images[id].order = index;
    }
  });
}

function getBackup() {
  return JSON.parse(JSON.stringify(data));
}

function restoreBackup(backup) {
  data = backup;
  return save();
}

module.exports = {
  load,
  getData,
  save,
  addImage,
  removeImage,
  reorderImages,
  setHero,
  setCarousel,
  getBackup,
  restoreBackup,
};

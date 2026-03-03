const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '../../config');
const CATEGORIES_FILE = path.join(CONFIG_DIR, 'categories.json');

let writeChain = Promise.resolve();

function readCategories() {
  const raw = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveCategories(data) {
  writeChain = writeChain.then(() => {
    const tmpFile = CATEGORIES_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
    fs.renameSync(tmpFile, CATEGORIES_FILE);
  });
  return writeChain;
}

function addCategory(slug, title, description = '') {
  const data = readCategories();
  if (data[slug]) throw new Error('Category already exists');
  data[slug] = { title, description };
  return saveCategories(data);
}

function renameCategory(slug, title, description) {
  const data = readCategories();
  if (!data[slug]) throw new Error('Category not found');
  data[slug].title = title;
  if (description !== undefined) data[slug].description = description;
  return saveCategories(data);
}

function removeCategory(slug) {
  const data = readCategories();
  if (!data[slug]) throw new Error('Category not found');
  delete data[slug];
  return saveCategories(data);
}

function reorderCategories(orderedSlugs) {
  const data = readCategories();
  const reordered = {};
  for (const slug of orderedSlugs) {
    if (!data[slug]) throw new Error(`Unknown category: ${slug}`);
    reordered[slug] = data[slug];
  }
  // Include any categories not in orderedSlugs at the end
  for (const [slug, val] of Object.entries(data)) {
    if (!reordered[slug]) reordered[slug] = val;
  }
  return saveCategories(reordered);
}

module.exports = {
  readCategories,
  saveCategories,
  addCategory,
  renameCategory,
  removeCategory,
  reorderCategories,
};

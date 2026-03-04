const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'pricelist.json');

let data = null;
let writeChain = Promise.resolve();

const emptyData = () => ({
  version: 1,
  categories: [],
});

function generateItemId() {
  return `price_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

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

// ── Category operations ──

async function addCategory(id, title, column) {
  if (data.categories.find(c => c.id === id)) {
    throw new Error('Category already exists');
  }
  if (column !== 'left' && column !== 'right') {
    throw new Error('Column must be "left" or "right"');
  }
  const order = data.categories.length;
  data.categories.push({ id, title, column, order, items: [] });
  await save();
}

async function updateCategory(id, updates) {
  const cat = data.categories.find(c => c.id === id);
  if (!cat) throw new Error('Category not found');
  if (updates.title !== undefined) cat.title = updates.title;
  if (updates.column !== undefined) {
    if (updates.column !== 'left' && updates.column !== 'right') {
      throw new Error('Column must be "left" or "right"');
    }
    cat.column = updates.column;
  }
  await save();
}

async function removeCategory(id) {
  const cat = data.categories.find(c => c.id === id);
  if (!cat) throw new Error('Category not found');
  if (cat.items.length > 0) {
    throw new Error('Cannot delete category with items. Remove all items first.');
  }
  data.categories = data.categories.filter(c => c.id !== id);
  reindexCategoryOrders();
  await save();
}

async function reorderCategories(orderedIds) {
  const existing = new Set(data.categories.map(c => c.id));
  for (const id of orderedIds) {
    if (!existing.has(id)) throw new Error(`Category ${id} not found`);
  }
  if (orderedIds.length !== data.categories.length) {
    throw new Error('orderedIds length mismatch');
  }
  const catMap = {};
  data.categories.forEach(c => { catMap[c.id] = c; });
  data.categories = orderedIds.map(id => catMap[id]);
  reindexCategoryOrders();
  await save();
}

function reindexCategoryOrders() {
  data.categories.forEach((cat, i) => { cat.order = i; });
}

// ── Item operations ──

async function addItem(catId, item) {
  const cat = data.categories.find(c => c.id === catId);
  if (!cat) throw new Error('Category not found');
  const newItem = {
    id: generateItemId(),
    name: item.name || '',
    price: item.price || '',
    note: item.note || '',
    order: cat.items.length,
  };
  cat.items.push(newItem);
  await save();
  return newItem;
}

async function updateItem(catId, itemId, updates) {
  const cat = data.categories.find(c => c.id === catId);
  if (!cat) throw new Error('Category not found');
  const item = cat.items.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found');
  if (updates.name !== undefined) item.name = updates.name;
  if (updates.price !== undefined) item.price = updates.price;
  if (updates.note !== undefined) item.note = updates.note;
  await save();
}

async function removeItem(catId, itemId) {
  const cat = data.categories.find(c => c.id === catId);
  if (!cat) throw new Error('Category not found');
  const idx = cat.items.findIndex(i => i.id === itemId);
  if (idx === -1) throw new Error('Item not found');
  cat.items.splice(idx, 1);
  reindexItemOrders(cat);
  await save();
}

async function reorderItems(catId, orderedIds) {
  const cat = data.categories.find(c => c.id === catId);
  if (!cat) throw new Error('Category not found');
  const existing = new Set(cat.items.map(i => i.id));
  for (const id of orderedIds) {
    if (!existing.has(id)) throw new Error(`Item ${id} not found in category`);
  }
  if (orderedIds.length !== cat.items.length) {
    throw new Error('orderedIds length mismatch');
  }
  const itemMap = {};
  cat.items.forEach(i => { itemMap[i.id] = i; });
  cat.items = orderedIds.map(id => itemMap[id]);
  reindexItemOrders(cat);
  await save();
}

function reindexItemOrders(cat) {
  cat.items.forEach((item, i) => { item.order = i; });
}

module.exports = {
  load,
  getData,
  save,
  addCategory,
  updateCategory,
  removeCategory,
  reorderCategories,
  addItem,
  updateItem,
  removeItem,
  reorderItems,
};

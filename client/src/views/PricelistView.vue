<template>
  <main class="content">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="title-area">
        <h1 class="page-title">Ceník</h1>
        <p class="page-subtitle">Správa kategorií a položek ceníku</p>
      </div>
      <div class="actions">
        <button class="btn-primary" @click="showNewCatForm = true">
          <PlusIcon :size="16" />
          <span>Nová kategorie</span>
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon stat-icon--sage">
          <LayersIcon :size="20" />
        </div>
        <div class="stat-text">
          <span class="stat-value">{{ categories.length }}</span>
          <span class="stat-label">Kategorie</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <ListIcon :size="20" />
        </div>
        <div class="stat-text">
          <span class="stat-value">{{ totalItems }}</span>
          <span class="stat-label">Celkem položek</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--sage">
          <PanelLeftIcon :size="20" />
        </div>
        <div class="stat-text">
          <span class="stat-value">{{ leftCount }}</span>
          <span class="stat-label">Levý sloupec</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--terracotta">
          <PanelRightIcon :size="20" />
        </div>
        <div class="stat-text">
          <span class="stat-value">{{ rightCount }}</span>
          <span class="stat-label">Pravý sloupec</span>
        </div>
      </div>
    </div>

    <!-- New Category Form -->
    <div v-if="showNewCatForm" class="new-category-form">
      <input
        ref="newCatTitleInput"
        v-model="newCatTitle"
        type="text"
        placeholder="Název kategorie..."
        class="form-input"
        @keyup.enter="handleCreateCategory"
        @keyup.escape="cancelNewCat"
      />
      <span class="slug-preview">{{ newCatSlug }}</span>
      <select v-model="newCatColumn" class="form-input form-select">
        <option value="left">Levý</option>
        <option value="right">Pravý</option>
      </select>
      <button class="btn-primary btn-sm" :disabled="!newCatTitle.trim() || creatingCat" @click="handleCreateCategory">
        {{ creatingCat ? 'Vytvářím...' : 'Přidat' }}
      </button>
      <button class="btn-secondary btn-sm" @click="cancelNewCat">Zrušit</button>
      <p v-if="newCatError" class="error-text">{{ newCatError }}</p>
    </div>

    <!-- Two-column layout -->
    <div class="price-columns">
      <div class="price-column">
        <h2 class="column-heading">Levý sloupec</h2>
        <div class="category-list">
          <template v-for="(cat, idx) in leftCategories" :key="cat.id">
            <CategoryCard
              :cat="cat"
              :idx="idx"
              :total="leftCategories.length"
              :all-categories="categories"
              :expanded-id="expandedCatId"
              :new-item-cat-id="newItemCatId"
              :new-item-name="newItemName"
              :new-item-price="newItemPrice"
              :new-item-note="newItemNote"
              :adding-item="addingItem"
              @toggle-expand="toggleExpand"
              @start-edit-cat="startEditCat"
              @move-category="moveCategory"
              @delete-category="handleDeleteCategory"
              @toggle-column="toggleColumn"
              @start-new-item="startNewItem"
              @move-item="moveItem"
              @start-edit-item="startEditItem"
              @delete-item="handleDeleteItem"
              @update:new-item-name="newItemName = $event"
              @update:new-item-price="newItemPrice = $event"
              @update:new-item-note="newItemNote = $event"
              @add-item="handleAddItem"
              @cancel-new-item="cancelNewItem"
            />
          </template>
          <p v-if="!leftCategories.length" class="empty-text">Žádné kategorie v levém sloupci.</p>
        </div>
      </div>

      <div class="price-column">
        <h2 class="column-heading">Pravý sloupec</h2>
        <div class="category-list">
          <template v-for="(cat, idx) in rightCategories" :key="cat.id">
            <CategoryCard
              :cat="cat"
              :idx="idx"
              :total="rightCategories.length"
              :all-categories="categories"
              :expanded-id="expandedCatId"
              :new-item-cat-id="newItemCatId"
              :new-item-name="newItemName"
              :new-item-price="newItemPrice"
              :new-item-note="newItemNote"
              :adding-item="addingItem"
              @toggle-expand="toggleExpand"
              @start-edit-cat="startEditCat"
              @move-category="moveCategory"
              @delete-category="handleDeleteCategory"
              @toggle-column="toggleColumn"
              @start-new-item="startNewItem"
              @move-item="moveItem"
              @start-edit-item="startEditItem"
              @delete-item="handleDeleteItem"
              @update:new-item-name="newItemName = $event"
              @update:new-item-price="newItemPrice = $event"
              @update:new-item-note="newItemNote = $event"
              @add-item="handleAddItem"
              @cancel-new-item="cancelNewItem"
            />
          </template>
          <p v-if="!rightCategories.length" class="empty-text">Žádné kategorie v pravém sloupci.</p>
        </div>
      </div>
    </div>
  </main>

  <!-- Modals -->
  <Teleport to="body">
    <!-- Edit Category Modal -->
    <div v-if="editingCat" class="modal-overlay" @click.self="cancelEditCat">
      <div class="modal" style="max-width: 480px">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Upravit kategorii</h2>
            <p class="modal-subtitle">Aktualizovat údaje kategorie</p>
          </div>
          <button class="btn-icon" @click="cancelEditCat">
            <XIcon :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label class="modal-field-label">Název kategorie</label>
            <input v-model="editCatTitle" type="text" class="modal-input" @keyup.enter="saveEditCat" />
          </div>
          <div class="modal-field">
            <label class="modal-field-label">Slug</label>
            <div class="slug-preview-box">
              <LinkIcon :size="14" />
              <span>{{ editCatSlug }}</span>
            </div>
          </div>
          <div class="modal-field">
            <label class="modal-field-label">Sloupec</label>
            <div class="column-toggle">
              <button :class="{ active: editCatColumn === 'left' }" @click="editCatColumn = 'left'">
                <PanelLeftIcon :size="16" />
                <span>Levý</span>
              </button>
              <button :class="{ active: editCatColumn === 'right' }" @click="editCatColumn = 'right'">
                <PanelRightIcon :size="16" />
                <span>Pravý</span>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelEditCat">Zrušit</button>
          <button class="btn-primary" :disabled="!editCatTitle.trim()" @click="saveEditCat">Uložit změny</button>
        </div>
      </div>
    </div>

    <!-- Edit Item Modal -->
    <div v-if="editingItem" class="modal-overlay" @click.self="cancelEditItem">
      <div class="modal" style="max-width: 480px">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Upravit položku</h2>
            <p class="modal-subtitle">Aktualizovat údaje položky</p>
          </div>
          <button class="btn-icon" @click="cancelEditItem">
            <XIcon :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div class="category-context">
            <FolderIcon :size="14" />
            <span class="row-badge count-badge">{{ editingItemCatTitle }}</span>
          </div>
          <div class="modal-field">
            <label class="modal-field-label">Název položky</label>
            <input v-model="editItemName" type="text" class="modal-input" @keyup.enter="saveEditItem" />
          </div>
          <div class="modal-field">
            <label class="modal-field-label">Cena</label>
            <div class="price-input-wrap">
              <input v-model="editItemPrice" type="text" class="modal-input" @keyup.enter="saveEditItem" />
              <span class="price-suffix">Kč / m²</span>
            </div>
          </div>
          <div class="modal-field">
            <label class="modal-field-label">Poznámka</label>
            <textarea v-model="editItemNote" class="modal-textarea" rows="3"></textarea>
            <span class="modal-helper-text">Volitelné doplňující informace</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelEditItem">Zrušit</button>
          <button class="btn-primary" :disabled="!editItemName.trim()" @click="saveEditItem">Uložit položku</button>
        </div>
      </div>
    </div>

    <!-- Delete Category Modal -->
    <div v-if="deletingCat" class="modal-overlay" @click.self="cancelDeleteCat">
      <div class="modal" style="max-width: 420px">
        <div class="modal-body" style="text-align: center">
          <div class="delete-icon-circle">
            <TriangleAlertIcon :size="24" />
          </div>
          <h2 class="modal-title">Smazat kategorii?</h2>
          <p class="modal-description">Tuto akci nelze vrátit zpět. Kategorie a všechny její položky budou trvale odstraněny.</p>
          <div class="delete-highlight">{{ deletingCat.title }}</div>
          <div v-if="deletingCat.items.length" class="delete-items-list">
            <div v-for="item in deletingCat.items.slice(0, 3)" :key="item.id" class="delete-items-list__item">
              {{ item.name }}
            </div>
            <div v-if="deletingCat.items.length > 3" class="delete-items-list__more">
              a {{ deletingCat.items.length - 3 }} {{ deletingCat.items.length - 3 === 1 ? 'další' : 'dalších' }}
            </div>
          </div>
        </div>
        <div class="modal-footer modal-footer--center">
          <button class="btn-secondary" @click="cancelDeleteCat">Zrušit</button>
          <button class="btn-danger-solid" @click="confirmDeleteCategory">Smazat kategorii</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { usePricelist } from '../composables/usePricelist.js';
import {
  Plus as PlusIcon,
  Pencil as PencilIcon,
  Trash2 as Trash2Icon,
  Check as CheckIcon,
  X as XIcon,
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Layers as LayersIcon,
  List as ListIcon,
  PanelLeft as PanelLeftIcon,
  PanelRight as PanelRightIcon,
  Link as LinkIcon,
  Folder as FolderIcon,
  TriangleAlert as TriangleAlertIcon,
} from 'lucide-vue-next';

const {
  pricelist,
  loadPricelist,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
} = usePricelist();

// ── Category card subcomponent (inline) ──
const CategoryCard = {
  props: [
    'cat', 'idx', 'total', 'allCategories', 'expandedId',
    'newItemCatId', 'newItemName', 'newItemPrice', 'newItemNote', 'addingItem',
  ],
  emits: [
    'toggleExpand', 'startEditCat', 'moveCategory', 'deleteCategory', 'toggleColumn',
    'startNewItem', 'moveItem', 'startEditItem', 'deleteItem',
    'update:newItemName', 'update:newItemPrice', 'update:newItemNote',
    'addItem', 'cancelNewItem',
  ],
  components: {
    PlusIcon, PencilIcon, Trash2Icon, CheckIcon, XIcon,
    ChevronUpIcon, ChevronDownIcon, ChevronRightIcon,
  },
  template: `
    <div class="category-card" :class="{ 'category-card--expanded': expandedId === cat.id }">
      <!-- Category header -->
      <div class="cat-header" @click="$emit('toggleExpand', cat.id)">
        <div class="cat-header__left">
          <ChevronRightIcon :size="16" class="expand-icon" :class="{ 'expand-icon--open': expandedId === cat.id }" />
          <span class="cat-title">{{ cat.title }}</span>
        </div>

        <div class="cat-header__right" @click.stop>
          <span class="row-badge column-badge" :class="'column-badge--' + cat.column" @click="$emit('toggleColumn', cat.id)">{{ cat.column === 'left' ? 'Levý sloupec' : 'Pravý sloupec' }}</span>
          <span class="row-badge count-badge">{{ cat.items.length }} {{ cat.items.length === 1 ? 'položka' : cat.items.length >= 2 && cat.items.length <= 4 ? 'položky' : 'položek' }}</span>

          <div class="row-order">
            <button class="btn-icon btn-icon--sm" title="Posunout nahoru" :disabled="idx === 0" @click="$emit('moveCategory', cat.id, -1)">
              <ChevronUpIcon :size="14" />
            </button>
            <button class="btn-icon btn-icon--sm" title="Posunout dolů" :disabled="idx === total - 1" @click="$emit('moveCategory', cat.id, 1)">
              <ChevronDownIcon :size="14" />
            </button>
          </div>
          <button class="btn-icon" title="Upravit" @click="$emit('startEditCat', cat)">
            <PencilIcon :size="16" />
          </button>
          <button class="btn-icon btn-icon--danger" title="Smazat" @click="$emit('deleteCategory', cat)">
            <Trash2Icon :size="16" />
          </button>
        </div>
      </div>

      <!-- Expanded items -->
      <div v-if="expandedId === cat.id" class="cat-items">
        <div v-for="(item, iIdx) in cat.items" :key="item.id" class="item-row">
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.note" class="item-note">{{ item.note }}</span>
          <span class="item-price">{{ item.price }}</span>
          <div class="item-actions">
            <div class="row-order">
              <button class="btn-icon btn-icon--sm" title="Posunout nahoru" :disabled="iIdx === 0" @click="$emit('moveItem', cat.id, iIdx, -1)">
                <ChevronUpIcon :size="14" />
              </button>
              <button class="btn-icon btn-icon--sm" title="Posunout dolů" :disabled="iIdx === cat.items.length - 1" @click="$emit('moveItem', cat.id, iIdx, 1)">
                <ChevronDownIcon :size="14" />
              </button>
            </div>
            <button class="btn-icon" title="Upravit" @click="$emit('startEditItem', item, cat.id)">
              <PencilIcon :size="16" />
            </button>
            <button class="btn-icon btn-icon--danger" title="Smazat" @click="$emit('deleteItem', cat.id, item.id)">
              <Trash2Icon :size="16" />
            </button>
          </div>
        </div>

        <!-- New item form (inline for rapid adds) -->
        <div v-if="newItemCatId === cat.id" class="item-row item-row--new">
          <input
            :value="newItemName"
            @input="$emit('update:newItemName', $event.target.value)"
            type="text"
            class="form-input form-input--inline"
            placeholder="Název"
            @keyup.enter="$emit('addItem', cat.id)"
            @keyup.escape="$emit('cancelNewItem')"
          />
          <input
            :value="newItemPrice"
            @input="$emit('update:newItemPrice', $event.target.value)"
            type="text"
            class="form-input form-input--inline form-input--price"
            placeholder="Cena"
            @keyup.enter="$emit('addItem', cat.id)"
          />
          <input
            :value="newItemNote"
            @input="$emit('update:newItemNote', $event.target.value)"
            type="text"
            class="form-input form-input--inline form-input--note"
            placeholder="Poznámka"
            @keyup.enter="$emit('addItem', cat.id)"
          />
          <button class="btn-icon" title="Přidat" :disabled="addingItem" @click="$emit('addItem', cat.id)">
            <CheckIcon :size="16" />
          </button>
          <button class="btn-icon" title="Zrušit" @click="$emit('cancelNewItem')">
            <XIcon :size="16" />
          </button>
        </div>

        <button v-else class="btn-add-item" @click="$emit('startNewItem', cat.id)">
          <PlusIcon :size="14" />
          <span>Přidat položku</span>
        </button>
      </div>
    </div>
  `,
};

// ── Data ──
const categories = computed(() => pricelist.value.categories || []);
const leftCategories = computed(() => categories.value.filter(c => c.column === 'left'));
const rightCategories = computed(() => categories.value.filter(c => c.column === 'right'));
const totalItems = computed(() => categories.value.reduce((sum, c) => sum + c.items.length, 0));
const leftCount = computed(() => leftCategories.value.length);
const rightCount = computed(() => rightCategories.value.length);

// ── New category ──
const showNewCatForm = ref(false);
const newCatTitle = ref('');
const newCatColumn = ref('left');
const newCatError = ref('');
const creatingCat = ref(false);
const newCatTitleInput = ref(null);

const newCatSlug = computed(() => slugify(newCatTitle.value));

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

watch(showNewCatForm, (val) => {
  if (val) nextTick(() => newCatTitleInput.value?.focus());
});

async function handleCreateCategory() {
  const title = newCatTitle.value.trim();
  const id = newCatSlug.value;
  if (!title || !id) return;

  creatingCat.value = true;
  newCatError.value = '';
  try {
    await createCategory(id, title, newCatColumn.value);
    newCatTitle.value = '';
    newCatColumn.value = 'left';
    showNewCatForm.value = false;
  } catch (err) {
    newCatError.value = err.response?.data?.error || 'Nepodařilo se vytvořit kategorii';
  } finally {
    creatingCat.value = false;
  }
}

function cancelNewCat() {
  showNewCatForm.value = false;
  newCatTitle.value = '';
  newCatError.value = '';
}

// ── Edit category (modal) ──
const editingCat = ref(null);
const editCatTitle = ref('');
const editCatColumn = ref('left');
const editCatSlug = computed(() => slugify(editCatTitle.value));

function startEditCat(cat) {
  editingCat.value = cat;
  editCatTitle.value = cat.title;
  editCatColumn.value = cat.column;
}

function cancelEditCat() {
  editingCat.value = null;
}

async function saveEditCat() {
  const title = editCatTitle.value.trim();
  if (!title) return;
  try {
    await updateCategory(editingCat.value.id, { title, column: editCatColumn.value });
    editingCat.value = null;
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se uložit');
  }
}

// ── Toggle column ──
async function toggleColumn(catId) {
  const cat = categories.value.find(c => c.id === catId);
  if (!cat) return;
  const newCol = cat.column === 'left' ? 'right' : 'left';
  try {
    await updateCategory(catId, { column: newCol });
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se přepnout sloupec');
  }
}

// ── Expand ──
const expandedCatId = ref('');

function toggleExpand(catId) {
  expandedCatId.value = expandedCatId.value === catId ? '' : catId;
}

// ── Move category ──
async function moveCategory(catId, direction) {
  const col = categories.value.find(c => c.id === catId)?.column;
  const colCats = categories.value.filter(c => c.column === col);
  const idx = colCats.findIndex(c => c.id === catId);
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= colCats.length) return;

  const allIds = categories.value.map(c => c.id);
  const globalIdx = allIds.indexOf(colCats[idx].id);
  const globalTargetIdx = allIds.indexOf(colCats[targetIdx].id);
  [allIds[globalIdx], allIds[globalTargetIdx]] = [allIds[globalTargetIdx], allIds[globalIdx]];

  try {
    await reorderCategories(allIds);
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se změnit pořadí');
  }
}

// ── Delete category (modal) ──
const deletingCat = ref(null);

function handleDeleteCategory(cat) {
  deletingCat.value = cat;
}

function cancelDeleteCat() {
  deletingCat.value = null;
}

async function confirmDeleteCategory() {
  try {
    await deleteCategory(deletingCat.value.id);
    deletingCat.value = null;
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se smazat');
  }
}

// ── New item ──
const newItemCatId = ref('');
const newItemName = ref('');
const newItemPrice = ref('');
const newItemNote = ref('');
const addingItem = ref(false);

function startNewItem(catId) {
  newItemCatId.value = catId;
  newItemName.value = '';
  newItemPrice.value = '';
  newItemNote.value = '';
}

function cancelNewItem() {
  newItemCatId.value = '';
}

async function handleAddItem(catId) {
  const name = newItemName.value.trim();
  if (!name) return;
  addingItem.value = true;
  try {
    await addItem(catId, { name, price: newItemPrice.value.trim() ? newItemPrice.value.trim() + PRICE_SUFFIX : '', note: newItemNote.value });
    newItemName.value = '';
    newItemPrice.value = '';
    newItemNote.value = '';
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se přidat položku');
  } finally {
    addingItem.value = false;
  }
}

// ── Edit item (modal) ──
const editingItem = ref(null);
const editItemName = ref('');
const editItemPrice = ref('');
const editItemNote = ref('');

const editingItemCatTitle = computed(() => {
  if (!editingItem.value) return '';
  const cat = categories.value.find(c => c.id === editingItem.value.catId);
  return cat ? cat.title : '';
});

const PRICE_SUFFIX = ' Kč / m²';

function stripPriceSuffix(price) {
  return (price || '').replace(/\s*Kč\s*\/\s*m²\s*$/i, '').trim();
}

function startEditItem(item, catId) {
  editingItem.value = { ...item, catId };
  editItemName.value = item.name;
  editItemPrice.value = stripPriceSuffix(item.price);
  editItemNote.value = item.note || '';
}

function cancelEditItem() {
  editingItem.value = null;
}

async function saveEditItem() {
  const name = editItemName.value.trim();
  if (!name) return;
  try {
    await updateItem(editingItem.value.catId, editingItem.value.id, {
      name,
      price: editItemPrice.value.trim() ? editItemPrice.value.trim() + PRICE_SUFFIX : '',
      note: editItemNote.value,
    });
    editingItem.value = null;
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se uložit');
  }
}

// ── Move item ──
async function moveItem(catId, idx, direction) {
  const cat = categories.value.find(c => c.id === catId);
  if (!cat) return;
  const ids = cat.items.map(i => i.id);
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= ids.length) return;
  [ids[idx], ids[targetIdx]] = [ids[targetIdx], ids[idx]];
  try {
    await reorderItems(catId, ids);
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se změnit pořadí');
  }
}

// ── Delete item ──
async function handleDeleteItem(catId, itemId) {
  if (!confirm('Smazat tuto položku?')) return;
  try {
    await deleteItem(catId, itemId);
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se smazat');
  }
}

// ── Keyboard shortcuts ──
function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (editingCat.value) { cancelEditCat(); return; }
    if (editingItem.value) { cancelEditItem(); return; }
    if (deletingCat.value) { cancelDeleteCat(); return; }
  }
}

// ── Init ──
onMounted(() => {
  loadPricelist();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style>
.content {
  flex: 1;
  background: var(--surface-tint);
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  min-height: 100vh;
}

.top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-red);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 9px 18px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: var(--text-secondary);
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  padding: 9px 18px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover { border-color: var(--text-muted); }
.btn-sm { padding: 6px 14px; font-size: 12px; }

/* Stats */
.stats-row {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon--sage {
  background: rgba(124, 144, 112, 0.08);
  color: #7C9070;
}

.stat-icon--blue {
  background: rgba(91, 155, 213, 0.08);
  color: #5B9BD5;
}

.stat-icon--terracotta {
  background: rgba(212, 132, 94, 0.08);
  color: #D4845E;
}

.stat-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-primary);
}

/* New Category Form */
.new-category-form {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  padding: 16px 20px;
  flex-wrap: wrap;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  width: 240px;
}

.form-input:focus { border-color: var(--text-muted); }
.form-input--inline { width: 160px; }
.form-input--price { width: 140px; }
.form-input--note { width: 140px; }

.form-select {
  width: auto;
  cursor: pointer;
}

.form-select--sm {
  padding: 4px 8px;
  font-size: 12px;
}

.slug-preview {
  font-size: 12px;
  color: var(--text-muted);
  font-family: monospace;
}

.error-text {
  color: #dc2626;
  font-size: 12px;
  width: 100%;
}

/* Two-column layout */
.price-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.column-heading {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

/* Category list & cards */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card {
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.024);
}

.category-card--expanded {
  border-color: var(--text-muted);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
}

.cat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.1s;
}

.cat-header:hover {
  background: var(--surface-tint);
}

.cat-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.cat-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.expand-icon {
  transition: transform 0.15s;
  flex-shrink: 0;
  color: var(--text-muted);
}

.expand-icon--open {
  transform: rotate(90deg);
}

.cat-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
}

.count-badge {
  background: var(--surface-tint);
  color: var(--text-secondary);
}

.column-badge {
  cursor: pointer;
  transition: opacity 0.15s;
}

.column-badge--left {
  background: rgba(124, 144, 112, 0.08);
  color: #4A5D43;
}

.column-badge--right {
  background: rgba(91, 155, 213, 0.08);
  color: #5B9BD5;
}

.column-badge:hover {
  opacity: 0.7;
}

.row-order {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon:hover { color: var(--text-primary); background: var(--surface-tint); }
.btn-icon--danger:hover { color: #dc2626; background: #fef2f2; }
.btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-icon:disabled:hover { color: var(--text-muted); background: transparent; }
.btn-icon--sm { padding: 3px; }

/* Items */
.cat-items {
  border-top: 1px solid var(--border-gray);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-gray);
  transition: background 0.1s;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background: var(--surface-tint);
}

.item-row--new {
  background: var(--surface-tint);
}

.item-name {
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-note {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #4A5D43;
  white-space: nowrap;
  margin-left: auto;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  margin-left: 8px;
}

.btn-add-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: none;
  border-top: 1px solid var(--border-gray);
  border-radius: 0;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-add-item:hover {
  color: var(--text-primary);
  background: var(--surface-tint);
}

.empty-text {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 40px 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border-gray);
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-gray);
}

.modal-footer--center {
  justify-content: center;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.modal-input {
  padding: 10px 12px;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.modal-input:focus {
  border-color: #7C9070;
}

.modal-textarea {
  padding: 10px 12px;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
}

.modal-textarea:focus {
  border-color: #7C9070;
}

.modal-helper-text {
  font-size: 12px;
  color: var(--text-muted);
}

.modal-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.slug-preview-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface-tint);
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-muted);
  font-family: monospace;
}

.column-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  overflow: hidden;
}

.column-toggle button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.column-toggle button + button {
  border-left: 1px solid var(--border-gray);
}

.column-toggle button.active {
  background: rgba(124, 144, 112, 0.08);
  color: #4A5D43;
}

.category-context {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(124, 144, 112, 0.06);
  border-radius: 8px;
  color: #4A5D43;
  font-size: 13px;
}

.price-input-wrap {
  display: flex;
  align-items: stretch;
}

.price-input-wrap .modal-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.price-suffix {
  padding: 10px 14px;
  background: var(--surface-tint);
  border: 1px solid var(--border-gray);
  border-left: none;
  border-radius: 0 8px 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.delete-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.delete-highlight {
  background: #fef2f2;
  color: #dc2626;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
  text-align: center;
}

.delete-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  margin-top: 4px;
}

.delete-items-list__item {
  font-size: 13px;
  color: var(--text-secondary);
  padding-left: 16px;
  position: relative;
}

.delete-items-list__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dc2626;
}

.delete-items-list__more {
  font-size: 12px;
  color: var(--text-muted);
  padding-left: 16px;
  font-style: italic;
}

.btn-danger-solid {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 9px 18px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-danger-solid:hover {
  opacity: 0.9;
}
</style>

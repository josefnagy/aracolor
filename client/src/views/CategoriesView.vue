<template>
  <main class="content">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="title-area">
        <h1 class="page-title">Categories</h1>
        <p class="page-subtitle">Manage image categories</p>
      </div>
      <div class="actions">
        <button class="btn-primary" @click="showNewForm = true">
          <PlusIcon :size="16" />
          <span>New Category</span>
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Total Categories</span>
        <span class="stat-value">{{ categoryList.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Images</span>
        <span class="stat-value">{{ totalImages }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Avg per Category</span>
        <span class="stat-value">{{ avgPerCategory }}</span>
      </div>
    </div>

    <!-- New Category Form -->
    <div v-if="showNewForm" class="new-category-form">
      <input
        ref="newTitleInput"
        v-model="newTitle"
        type="text"
        placeholder="Category title..."
        class="form-input"
        @keyup.enter="createCategory"
        @keyup.escape="cancelNew"
      />
      <span class="slug-preview">{{ newSlug }}</span>
      <button class="btn-primary btn-sm" :disabled="!newTitle.trim() || creating" @click="createCategory">
        {{ creating ? 'Creating...' : 'Add' }}
      </button>
      <button class="btn-secondary btn-sm" @click="cancelNew">Cancel</button>
      <p v-if="newError" class="error-text">{{ newError }}</p>
    </div>

    <!-- Category List -->
    <div class="category-list">
      <div
        v-for="(cat, idx) in categoryList"
        :key="cat.slug"
        class="category-row"
      >
        <div class="row-order">
          <button
            class="btn-icon btn-icon--sm"
            title="Move up"
            :disabled="idx === 0"
            @click="moveCategory(idx, -1)"
          >
            <ChevronUpIcon :size="14" />
          </button>
          <button
            class="btn-icon btn-icon--sm"
            title="Move down"
            :disabled="idx === categoryList.length - 1"
            @click="moveCategory(idx, 1)"
          >
            <ChevronDownIcon :size="14" />
          </button>
        </div>

        <div class="row-thumb">
          <img
            v-if="cat.heroSrc"
            :src="cat.heroSrc"
            :alt="cat.title"
            class="thumb-img"
          />
          <div v-else class="thumb-placeholder">
            <ImageIcon :size="16" />
          </div>
        </div>

        <div class="row-info">
          <template v-if="editingSlug === cat.slug">
            <input
              ref="editInput"
              v-model="editTitle"
              type="text"
              class="form-input form-input--inline"
              @keyup.escape="cancelEdit"
            />
            <textarea
              v-model="editDescription"
              class="form-input form-textarea"
              placeholder="Description (optional)..."
              rows="3"
            />
          </template>
          <template v-else>
            <span class="row-title">{{ cat.title }}</span>
            <span class="row-slug">{{ cat.slug }}</span>
            <span v-if="cat.description" class="row-desc">{{ cat.description.length > 120 ? cat.description.slice(0, 120) + '…' : cat.description }}</span>
          </template>
        </div>

        <span class="row-badge">{{ cat.count }} {{ cat.count === 1 ? 'image' : 'images' }}</span>

        <div class="row-actions">
          <template v-if="editingSlug === cat.slug">
            <button class="btn-icon" title="Save" @click="saveRename(cat.slug)">
              <CheckIcon :size="16" />
            </button>
            <button class="btn-icon" title="Cancel" @click="cancelEdit">
              <XIcon :size="16" />
            </button>
          </template>
          <template v-else>
            <button class="btn-icon" title="Edit" @click="startEdit(cat)">
              <PencilIcon :size="16" />
            </button>
            <button
              class="btn-icon btn-icon--danger"
              title="Delete"
              :disabled="cat.count > 0"
              @click="handleDelete(cat.slug)"
            >
              <Trash2Icon :size="16" />
            </button>
          </template>
        </div>
      </div>

      <p v-if="!categoryList.length" class="empty-text">No categories yet. Create one to get started.</p>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useImages } from '../composables/useImages.js';
import { useCategories } from '../composables/useCategories.js';
import {
  Plus as PlusIcon,
  Image as ImageIcon,
  Pencil as PencilIcon,
  Trash2 as Trash2Icon,
  Check as CheckIcon,
  X as XIcon,
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
} from 'lucide-vue-next';

const { categoryList: rawCategoryList, images, loadData } = useImages();
const { createCat, renameCat, deleteCat, reorderCats } = useCategories();

const showNewForm = ref(false);
const newTitle = ref('');
const newError = ref('');
const creating = ref(false);
const newTitleInput = ref(null);

const editingSlug = ref('');
const editTitle = ref('');
const editDescription = ref('');
const editInput = ref(null);

const categoryList = computed(() => {
  return rawCategoryList.value.map(cat => {
    let heroSrc = null;
    if (cat.heroImageId && images.value[cat.heroImageId]) {
      heroSrc = images.value[cat.heroImageId].src;
    }
    return { ...cat, heroSrc };
  });
});

const totalImages = computed(() =>
  categoryList.value.reduce((sum, cat) => sum + cat.count, 0)
);

const avgPerCategory = computed(() => {
  if (!categoryList.value.length) return 0;
  return Math.round(totalImages.value / categoryList.value.length);
});

const newSlug = computed(() => slugify(newTitle.value));

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

watch(showNewForm, (val) => {
  if (val) nextTick(() => newTitleInput.value?.focus());
});

async function createCategory() {
  const title = newTitle.value.trim();
  const slug = newSlug.value;
  if (!title || !slug) return;

  creating.value = true;
  newError.value = '';
  try {
    await createCat(title, slug);
    await loadData();
    newTitle.value = '';
    showNewForm.value = false;
  } catch (err) {
    newError.value = err.response?.data?.error || 'Failed to create category';
  } finally {
    creating.value = false;
  }
}

function cancelNew() {
  showNewForm.value = false;
  newTitle.value = '';
  newError.value = '';
}

function startEdit(cat) {
  editingSlug.value = cat.slug;
  editTitle.value = cat.title;
  editDescription.value = cat.description || '';
  nextTick(() => editInput.value?.focus());
}

function cancelEdit() {
  editingSlug.value = '';
  editTitle.value = '';
  editDescription.value = '';
}

async function saveRename(slug) {
  const title = editTitle.value.trim();
  if (!title) return;
  try {
    await renameCat(slug, title, editDescription.value);
    await loadData();
    editingSlug.value = '';
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save');
  }
}

async function moveCategory(idx, direction) {
  const slugs = categoryList.value.map(c => c.slug);
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= slugs.length) return;
  [slugs[idx], slugs[targetIdx]] = [slugs[targetIdx], slugs[idx]];
  try {
    await reorderCats(slugs);
    await loadData();
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to reorder');
  }
}

async function handleDelete(slug) {
  if (!confirm('Delete this category? This cannot be undone.')) return;
  try {
    await deleteCat(slug);
    await loadData();
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete');
  }
}
</script>

<style scoped>
.content {
  flex: 1;
  background: var(--surface-tint);
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
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
  gap: 20px;
}

.stat-card {
  flex: 1;
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -1px;
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

.form-input--inline { width: 200px; }

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

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  overflow: hidden;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  transition: background 0.1s;
}

.row-order {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.btn-icon--sm {
  padding: 3px;
}

.category-row:hover {
  background: var(--surface-tint);
}

.category-row + .category-row {
  border-top: 1px solid var(--border-gray);
}

.row-thumb {
  width: 48px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-tint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  color: var(--text-muted);
}

.row-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.row-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.row-slug {
  font-size: 12px;
  color: var(--text-muted);
  font-family: monospace;
}

.row-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 2px;
}

.form-textarea {
  width: 100%;
  resize: vertical;
  font-size: 12px;
  line-height: 1.4;
  font-family: inherit;
  margin-top: 4px;
}

.row-badge {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface-tint);
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  gap: 4px;
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

.empty-text {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 40px 20px;
}
</style>

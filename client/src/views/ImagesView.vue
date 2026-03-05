<template>
  <main
    class="content"
    :class="{ 'drop-active': fileDragOver }"
    @dragenter="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="title-area">
        <h1 class="page-title">Správce obrázků</h1>
        <p class="page-subtitle">Správa a organizace obrázků na webu</p>
      </div>
      <div class="actions">
        <div class="search-box">
          <SearchIcon :size="16" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Hledat obrázky..."
          />
        </div>
        <button class="btn-upload" :disabled="!selectedCategory" @click="showUploadModal = true">
          <PlusIcon :size="16" />
          <span>Nahrát</span>
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Celkem obrázků</span>
        <span class="stat-value">{{ totalImages }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Kategorie</span>
        <span class="stat-value">{{ categoryList.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Tento týden</span>
        <span class="stat-value stat-value--green">
          +{{ weeklyCount }}
          <TrendingUpIcon :size="18" />
        </span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Využité úložiště</span>
        <span class="stat-value">{{ storageUsed }}</span>
      </div>
    </div>

    <!-- Filter Row -->
    <div class="filter-row">
      <div class="filters">
        <button
          class="filter-pill"
          :class="{ active: selectedCategory === '' }"
          @click="selectedCategory = ''"
        >
          Vše
        </button>
        <button
          v-for="cat in categoryList"
          :key="cat.slug"
          class="filter-pill"
          :class="{ active: selectedCategory === cat.slug }"
          @click="selectedCategory = cat.slug"
        >
          {{ cat.title }}
        </button>
      </div>
      <div class="view-actions">
        <button
          class="view-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <Grid3x3Icon :size="16" />
        </button>
        <button
          class="view-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <ListIcon :size="16" />
        </button>
      </div>
    </div>

    <!-- Gallery -->
    <ImageGallery
      :images="filteredImages"
      :category="selectedCategory"
      :view-mode="viewMode"
      @reorder="handleReorder"
      @set-hero="handleSetHero"
      @delete="handleDelete"
    />

    <p v-if="loading" class="loading">Načítání...</p>

    <!-- Upload Modal -->
    <UploadDropzone
      v-if="showUploadModal && selectedCategory"
      :category="selectedCategory"
      :categories="categoryList"
      @uploaded="onUploaded"
      @close="showUploadModal = false"
    />
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useImages } from '../composables/useImages.js';
import ImageGallery from '../components/ImageGallery.vue';
import UploadDropzone from '../components/UploadDropzone.vue';
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  TrendingUp as TrendingUpIcon,
  Grid3x3 as Grid3x3Icon,
  List as ListIcon,
} from 'lucide-vue-next';

const {
  selectedCategory,
  loading,
  categoryList,
  currentImages,
  totalStorageBytes,
  weeklyUploadCount,
  loadData,
  uploadImages,
  reorderImages,
  setHero,
  deleteImage,
} = useImages();

const showUploadModal = ref(false);
const searchQuery = ref('');
const viewMode = ref('grid');
const dragEnterCount = ref(0);
const fileDragOver = computed(() => dragEnterCount.value > 0);

const totalImages = computed(() => {
  return categoryList.value.reduce((sum, cat) => sum + cat.count, 0);
});

const weeklyCount = computed(() => weeklyUploadCount.value);

const storageUsed = computed(() => {
  const bytes = totalStorageBytes.value;
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
});

const filteredImages = computed(() => {
  let imgs = currentImages.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    imgs = imgs.filter(img => img.id.toLowerCase().includes(q));
  }
  return imgs;
});

async function handleReorder(orderedIds) {
  if (!selectedCategory.value) return;
  await reorderImages(selectedCategory.value, orderedIds);
}

async function handleSetHero(imageId) {
  const cat = selectedCategory.value || findCategoryForImage(imageId);
  if (!cat) return;
  await setHero(cat, imageId);
}

async function handleDelete(imageId) {
  if (!confirm('Smazat tento obrázek? Zpracovaný soubor bude odstraněn.')) return;
  await deleteImage(imageId);
}

function findCategoryForImage(imageId) {
  const img = filteredImages.value.find(i => i.id === imageId);
  return img?.category || '';
}

function onUploaded() {
  showUploadModal.value = false;
  loadData();
}

function isFileDrag(e) {
  return e.dataTransfer && e.dataTransfer.types.includes('Files');
}

function onDragEnter(e) {
  if (!isFileDrag(e)) return;
  if (!selectedCategory.value) return;
  dragEnterCount.value++;
}

function onDragLeave(e) {
  if (!isFileDrag(e)) return;
  dragEnterCount.value--;
}

async function onDrop(e) {
  dragEnterCount.value = 0;
  if (!isFileDrag(e)) return;
  if (!selectedCategory.value) return;

  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;

  await uploadImages(selectedCategory.value, files);
}
</script>

<style scoped>
/* ── Content ── */
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

/* Top Bar */
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
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  padding: 9px 14px;
  width: 220px;
}

.search-box :deep(svg) {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-primary);
  width: 100%;
  background: transparent;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.btn-upload {
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
  transition: opacity 0.15s;
}

.btn-upload:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-upload:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

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

.stat-value--green {
  color: var(--success-green);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Filter Row */
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-pill {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  border-radius: 20px;
  padding: 6px 14px;
  border: 1px solid var(--border-gray);
  background: #fff;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.filter-pill:hover {
  border-color: var(--text-muted);
}

.filter-pill.active {
  background: var(--text-primary);
  color: #fff;
  border-color: var(--text-primary);
  font-weight: 500;
}

.view-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-btn {
  padding: 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.view-btn:hover {
  background: var(--border-gray);
}

.view-btn.active {
  background: var(--text-primary);
  color: #fff;
}

/* Drop zone */
.content.drop-active {
  outline: 2px dashed var(--accent-red);
  outline-offset: -4px;
  background: rgba(220, 38, 38, 0.03);
}

/* Loading */
.loading {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
}
</style>

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
        <h1 class="page-title">Referenční obrázky</h1>
        <p class="page-subtitle">Správa obrázků referenční galerie a karuselů</p>
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
        <button class="btn-upload" :disabled="!selectedCategory" @click="uploadCategory = selectedCategory; showUploadModal = true">
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
          <span class="carousel-count">{{ carouselCountByCategory[cat.slug] || 0 }}/20</span>
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
    <div class="gallery">
      <draggable
        v-model="localImages"
        item-key="id"
        :class="viewMode === 'list' ? 'gallery-list' : 'gallery-grid'"
        ghost-class="ghost"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div class="image-card" :class="{ carousel: element.carousel, list: viewMode === 'list' }">
            <div class="thumb-wrap">
              <img :src="element.thumb || element.src" :alt="element.id" loading="lazy" />
              <span v-if="element.carousel" class="carousel-badge">Karusel</span>
            </div>
            <div class="card-actions">
              <button
                class="btn-action btn-carousel"
                :class="{ active: element.carousel }"
                :title="element.carousel ? 'Odebrat z karuselu' : 'Přidat do karuselu'"
                @click.stop="handleToggleCarousel(element)"
              >
                <FilmIcon :size="14" />
              </button>
              <button
                class="btn-action btn-delete"
                title="Smazat obrázek"
                @click.stop="handleDelete(element.id)"
              >
                <Trash2Icon :size="14" />
              </button>
            </div>
            <div class="card-info">
              <span class="card-name">
                {{ element.id }}
                <span v-if="element.carousel && viewMode === 'list'" class="carousel-label">Karusel</span>
              </span>
              <div class="card-meta">
                <span>{{ formatSize(element.size) }}</span>
                <span class="dot">&middot;</span>
                <span>{{ element.width || '—' }} &times; {{ element.height || '—' }}</span>
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <div v-if="filteredImages.length === 0 && !loading" class="empty">
        <p class="empty-text">V této kategorii nejsou žádné obrázky</p>
        <p class="empty-hint">Nahrajte obrázky pro začátek.</p>
      </div>
    </div>

    <p v-if="loading" class="loading">Načítání...</p>

    <!-- Upload Modal -->
    <div v-if="showUploadModal && selectedCategory" class="modal-overlay" @click.self="showUploadModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Nahrát referenční obrázky</h2>
          <button class="btn-close" @click="showUploadModal = false">
            <XIcon :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label class="field-label">Kategorie</label>
            <select v-model="uploadCategory" class="field-select">
              <option v-for="cat in categoryList" :key="cat.slug" :value="cat.slug">
                {{ cat.title }}
              </option>
            </select>
          </div>
          <div
            class="dropzone"
            :class="{ dragover: uploadDragover }"
            @dragover.prevent="uploadDragover = true"
            @dragleave.prevent="uploadDragover = false"
            @drop.prevent="handleUploadDrop"
            @click="uploadFileInput?.click()"
          >
            <input
              ref="uploadFileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic"
              style="display: none"
              @change="handleUploadFileSelect"
            />
            <div v-if="uploading" class="upload-progress">
              <UploadCloudIcon :size="32" class="uploading-icon" />
              <p class="progress-text">Nahrávám {{ uploadFileCount }} {{ uploadFileCount === 1 ? 'soubor' : uploadFileCount <= 4 ? 'soubory' : 'souborů' }}...</p>
            </div>
            <div v-else class="upload-prompt">
              <UploadCloudIcon :size="32" class="prompt-icon" />
              <p class="prompt-main">Přetáhněte obrázky sem nebo klikněte pro výběr</p>
              <p class="prompt-hint">JPG, PNG, WebP, HEIC — max 20 MB na soubor</p>
            </div>
          </div>
          <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRefImages } from '../composables/useRefImages.js';
import draggable from 'vuedraggable';
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  TrendingUp as TrendingUpIcon,
  Grid3x3 as Grid3x3Icon,
  List as ListIcon,
  Trash2 as Trash2Icon,
  Film as FilmIcon,
  X as XIcon,
  UploadCloud as UploadCloudIcon,
} from 'lucide-vue-next';

const {
  selectedCategory,
  loading,
  categoryList,
  currentImages,
  totalStorageBytes,
  weeklyUploadCount,
  carouselCountByCategory,
  loadData,
  uploadImages,
  reorderImages,
  deleteImage,
  toggleCarousel,
} = useRefImages();

const showUploadModal = ref(false);
const searchQuery = ref('');
const viewMode = ref('grid');
const dragEnterCount = ref(0);
const fileDragOver = computed(() => dragEnterCount.value > 0);
const localImages = ref([]);

// Upload modal state
const uploadCategory = ref('');
const uploadFileInput = ref(null);
const uploadDragover = ref(false);
const uploading = ref(false);
const uploadFileCount = ref(0);
const uploadError = ref('');

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

watch(filteredImages, (val) => {
  localImages.value = [...val];
}, { immediate: true });

function onDragEnd() {
  if (!selectedCategory.value) return;
  const orderedIds = localImages.value.map(img => img.id);
  reorderImages(selectedCategory.value, orderedIds);
}

async function handleDelete(imageId) {
  if (!confirm('Smazat tento obrázek? Zpracovaný soubor bude odstraněn.')) return;
  await deleteImage(imageId);
}

async function handleToggleCarousel(image) {
  try {
    await toggleCarousel(image.id, !image.carousel);
  } catch (err) {
    alert(err.response?.data?.error || 'Nepodařilo se přepnout karusel');
  }
}

function findCategoryForImage(imageId) {
  const img = filteredImages.value.find(i => i.id === imageId);
  return img?.category || '';
}

async function processUploadFiles(files) {
  if (!files.length) return;
  uploadError.value = '';
  uploading.value = true;
  uploadFileCount.value = files.length;
  try {
    await uploadImages(uploadCategory.value || selectedCategory.value, files);
    showUploadModal.value = false;
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Nahrávání se nezdařilo';
  } finally {
    uploading.value = false;
    uploadFileCount.value = 0;
  }
}

function handleUploadDrop(e) {
  uploadDragover.value = false;
  processUploadFiles(Array.from(e.dataTransfer.files));
}

function handleUploadFileSelect(e) {
  processUploadFiles(Array.from(e.target.files));
  e.target.value = '';
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

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Load ref data on mount
loadData();
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
  flex-wrap: wrap;
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
  display: flex;
  align-items: center;
  gap: 6px;
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

.carousel-count {
  font-size: 10px;
  opacity: 0.7;
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

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.gallery-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ghost {
  opacity: 0.3;
}

/* Image Card */
.image-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-gray);
  display: flex;
  flex-direction: column;
  cursor: grab;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.image-card:active { cursor: grabbing; }
.image-card:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }

.image-card.carousel {
  border-color: #6366f1;
}

.image-card.carousel:not(.hero) {
  border-left: 3px solid #6366f1;
}

.thumb-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface-tint);
}

.thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(99, 102, 241, 0.9);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.4;
  backdrop-filter: blur(4px);
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1;
}

.image-card:hover .card-actions { opacity: 1; }

.btn-action {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-secondary);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.15s;
}

.btn-carousel:hover,
.btn-carousel.active {
  color: #6366f1;
  background: rgba(255, 255, 255, 0.96);
}

.btn-carousel.active :deep(svg) { fill: currentColor; }

.btn-delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

.card-info {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.2s;
}

.card-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
}

.carousel-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4f46e5;
  background: #eef2ff;
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.dot { color: var(--text-muted); }

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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  text-align: center;
}

.empty-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* List view */
.image-card.list {
  flex-direction: row;
  align-items: center;
}

.image-card.list .thumb-wrap {
  aspect-ratio: unset;
  width: 72px;
  height: 54px;
  flex-shrink: 0;
}

.image-card.list .carousel-badge { display: none; }

.image-card.list .card-info {
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.image-card.list .card-actions {
  position: static;
  opacity: 1;
  order: 3;
  padding: 0 12px;
  flex-shrink: 0;
}

/* Upload Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.16);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-gray);
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s;
}

.btn-close:hover { color: var(--text-primary); }

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.field-select {
  padding: 9px 12px;
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  background: #fff;
  outline: none;
}

.dropzone {
  border: 2px dashed var(--border-gray);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-tint);
}

.dropzone:hover,
.dropzone.dragover {
  border-color: var(--accent-red);
  background: #fef7f6;
}

.prompt-icon,
.uploading-icon {
  color: var(--text-muted);
  margin-bottom: 8px;
}

.prompt-main {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.prompt-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.progress-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--accent-red);
}

.upload-error {
  color: #dc2626;
  font-size: 13px;
}
</style>

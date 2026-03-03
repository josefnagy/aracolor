<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-dot"></div>
        <span class="logo-text">Aracolor</span>
      </div>

      <nav class="nav-section">
        <span class="nav-label">MENU</span>
        <a
          class="nav-item active"
          href="#"
          @click.prevent
        >
          <ImageIcon :size="18" />
          <span>Images</span>
        </a>
        <a class="nav-item" href="#" @click.prevent>
          <FolderIcon :size="18" />
          <span>Categories</span>
        </a>
        <a class="nav-item" href="#" @click.prevent>
          <UploadIcon :size="18" />
          <span>Uploads</span>
        </a>
        <a class="nav-item" href="#" @click.prevent>
          <SettingsIcon :size="18" />
          <span>Settings</span>
        </a>
      </nav>

      <div class="spacer"></div>

      <div class="storage-card">
        <span class="storage-label">Storage</span>
        <div class="storage-bar-bg">
          <div class="storage-bar-fill" :style="{ width: storagePercent + '%' }"></div>
        </div>
        <span class="storage-text">{{ storageUsed }} of 10 GB used</span>
      </div>

      <div class="user-section">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <span class="user-name">{{ username }}</span>
          <span class="user-role">Administrator</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="title-area">
          <h1 class="page-title">Image Manager</h1>
          <p class="page-subtitle">Manage and organize your website images</p>
        </div>
        <div class="actions">
          <div class="search-box">
            <SearchIcon :size="16" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search images..."
            />
          </div>
          <button class="btn-upload" @click="showUploadModal = true">
            <PlusIcon :size="16" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-label">Total Images</span>
          <span class="stat-value">{{ totalImages }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Categories</span>
          <span class="stat-value">{{ categoryList.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">This Week</span>
          <span class="stat-value stat-value--green">
            +{{ weeklyCount }}
            <TrendingUpIcon :size="18" />
          </span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Storage Used</span>
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
            All
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
        @reorder="handleReorder"
        @set-hero="handleSetHero"
        @delete="handleDelete"
      />

      <p v-if="loading" class="loading">Loading...</p>
    </main>

    <!-- Upload Modal -->
    <UploadDropzone
      v-if="showUploadModal"
      :category="selectedCategory || categoryList[0]?.slug"
      :categories="categoryList"
      @uploaded="onUploaded"
      @close="showUploadModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { useImages } from '../composables/useImages.js';
import ImageGallery from '../components/ImageGallery.vue';
import UploadDropzone from '../components/UploadDropzone.vue';
import {
  Image as ImageIcon,
  Folder as FolderIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Plus as PlusIcon,
  TrendingUp as TrendingUpIcon,
  Grid3x3 as Grid3x3Icon,
  List as ListIcon,
} from 'lucide-vue-next';

const router = useRouter();
const { username, checkAuth } = useAuth();
const {
  selectedCategory,
  loading,
  categoryList,
  currentImages,
  loadData,
  reorderImages,
  setHero,
  deleteImage,
} = useImages();

const showUploadModal = ref(false);
const searchQuery = ref('');
const viewMode = ref('grid');

const userInitial = computed(() =>
  username.value ? username.value.charAt(0).toUpperCase() : 'A'
);

const totalImages = computed(() => {
  return categoryList.value.reduce((sum, cat) => sum + cat.count, 0);
});

const weeklyCount = computed(() => {
  // Placeholder — would need backend support
  return 0;
});

const storageUsed = computed(() => {
  // Placeholder — would need backend support
  return '—';
});

const storagePercent = computed(() => {
  return 0;
});

const filteredImages = computed(() => {
  let imgs = currentImages.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    imgs = imgs.filter(img => img.id.toLowerCase().includes(q));
  }
  return imgs;
});

onMounted(async () => {
  const authed = await checkAuth();
  if (!authed) {
    router.push('/');
    return;
  }
  await loadData();
});

async function handleReorder(orderedIds) {
  if (!selectedCategory.value) return; // Reorder disabled in "All" view
  await reorderImages(selectedCategory.value, orderedIds);
}

async function handleSetHero(imageId) {
  const cat = selectedCategory.value || findCategoryForImage(imageId);
  if (!cat) return;
  await setHero(cat, imageId);
}

async function handleDelete(imageId) {
  if (!confirm('Delete this image? The processed file will be removed.')) return;
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
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ── */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-gray);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 100vh;
  position: sticky;
  top: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-dot {
  width: 28px;
  height: 28px;
  background: var(--accent-red);
  border-radius: 4px;
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: var(--surface-tint);
}

.nav-item.active {
  background: var(--surface-tint);
  color: var(--text-primary);
  font-weight: 500;
}

.nav-item.active :deep(svg) {
  color: var(--accent-red);
}

.spacer {
  flex: 1;
}

.storage-card {
  background: var(--surface-tint);
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.storage-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.storage-bar-bg {
  height: 4px;
  background: var(--border-gray);
  border-radius: 2px;
  overflow: hidden;
}

.storage-bar-fill {
  height: 100%;
  background: var(--accent-red);
  border-radius: 2px;
  transition: width 0.3s;
}

.storage-text {
  font-size: 11px;
  color: var(--text-muted);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border-gray);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: var(--text-primary);
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 11px;
  color: var(--text-secondary);
}

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

.btn-upload:hover {
  opacity: 0.9;
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

/* Loading */
.loading {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
}
</style>

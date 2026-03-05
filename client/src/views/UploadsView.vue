<template>
  <main class="content">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="title-area">
        <h1 class="page-title">Nahrávání</h1>
        <p class="page-subtitle">Nahrávejte obrázky a sledujte nedávnou aktivitu</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Nahráno dnes</span>
        <span class="stat-value">{{ todayCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Tento týden</span>
        <span class="stat-value">{{ weeklyCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Celkové úložiště</span>
        <span class="stat-value">{{ storageUsed }}</span>
      </div>
    </div>

    <!-- Upload Zone -->
    <div class="upload-section">
      <div class="field">
        <label class="field-label">Kategorie</label>
        <select v-model="uploadCategory" class="field-select">
          <option value="" disabled>Vyberte kategorii...</option>
          <option v-for="cat in categoryList" :key="cat.slug" :value="cat.slug">
            {{ cat.title }}
          </option>
        </select>
      </div>

      <div
        class="dropzone"
        :class="{ dragover, disabled: !uploadCategory }"
        @dragover.prevent="uploadCategory && (dragover = true)"
        @dragleave.prevent="dragover = false"
        @drop.prevent="handleDrop"
        @click="uploadCategory && fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic"
          style="display: none"
          @change="handleFileSelect"
        />

        <div v-if="uploading" class="upload-progress">
          <UploadCloudIcon :size="36" class="uploading-icon" />
          <p class="progress-text">Nahrávám {{ fileCount }} {{ fileCount === 1 ? 'soubor' : fileCount <= 4 ? 'soubory' : 'souborů' }}...</p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
        <div v-else class="upload-prompt">
          <UploadCloudIcon :size="36" class="prompt-icon" />
          <p class="prompt-text">
            {{ uploadCategory ? 'Přetáhněte obrázky sem nebo klikněte pro výběr' : 'Nejprve vyberte kategorii' }}
          </p>
          <p class="prompt-hint">JPG, PNG, WebP, HEIC — max 20 MB na soubor</p>
        </div>
      </div>

      <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
    </div>

    <!-- Recent Uploads Timeline -->
    <div class="timeline-section">
      <h2 class="section-title">Nedávné nahrávání</h2>

      <div v-if="!groupedUploads.length" class="empty-text">Zatím žádné nahrávání.</div>

      <div v-for="group in groupedUploads" :key="group.date" class="timeline-group">
        <div class="timeline-date">{{ group.label }}</div>
        <div class="timeline-items">
          <div v-for="img in group.images" :key="img.id" class="timeline-row">
            <div class="timeline-thumb">
              <img :src="img.src" :alt="img.id" />
            </div>
            <div class="timeline-info">
              <span class="timeline-id">{{ img.id }}</span>
              <span class="timeline-meta">
                <span class="timeline-pill">{{ getCategoryTitle(img.category) }}</span>
                <span v-if="img.width && img.height">{{ img.width }}×{{ img.height }}</span>
                <span v-if="img.size">{{ formatBytes(img.size) }}</span>
              </span>
            </div>
            <span class="timeline-time">{{ formatTime(img.uploadedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useImages } from '../composables/useImages.js';
import { UploadCloud as UploadCloudIcon } from 'lucide-vue-next';

const {
  categoryList,
  images,
  totalStorageBytes,
  weeklyUploadCount,
  loadData,
  uploadImages,
} = useImages();

const uploadCategory = ref('');
const dragover = ref(false);
const uploading = ref(false);
const fileCount = ref(0);
const uploadError = ref('');
const fileInput = ref(null);

const todayCount = computed(() => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const ts = todayStart.getTime();
  return Object.values(images.value).filter(
    img => img.uploadedAt && new Date(img.uploadedAt).getTime() >= ts
  ).length;
});

const weeklyCount = computed(() => weeklyUploadCount.value);

const storageUsed = computed(() => formatBytes(totalStorageBytes.value));

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getCategoryTitle(slug) {
  const cat = categoryList.value.find(c => c.slug === slug);
  return cat ? cat.title : slug;
}

const groupedUploads = computed(() => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const allImages = Object.entries(images.value)
    .filter(([, img]) => img.uploadedAt && new Date(img.uploadedAt).getTime() >= thirtyDaysAgo)
    .map(([id, img]) => ({ id, ...img }))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  const groups = {};
  for (const img of allImages) {
    const date = new Date(img.uploadedAt).toLocaleDateString();
    if (!groups[date]) {
      const d = new Date(img.uploadedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label = date;
      if (d.toDateString() === today.toDateString()) label = 'Dnes';
      else if (d.toDateString() === yesterday.toDateString()) label = 'Včera';

      groups[date] = { date, label, images: [] };
    }
    groups[date].images.push(img);
  }

  return Object.values(groups);
});

async function processFiles(files) {
  if (!files.length || !uploadCategory.value) return;

  uploadError.value = '';
  uploading.value = true;
  fileCount.value = files.length;

  try {
    await uploadImages(uploadCategory.value, files);
    await loadData();
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Nahrávání se nezdařilo';
  } finally {
    uploading.value = false;
    fileCount.value = 0;
  }
}

function handleDrop(e) {
  dragover.value = false;
  if (!uploadCategory.value) return;
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  processFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  processFiles(files);
  e.target.value = '';
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

/* Upload Section */
.upload-section {
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
}

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
  transition: border-color 0.15s;
}

.field-select:focus {
  border-color: var(--text-muted);
}

.dropzone {
  border: 2px dashed var(--border-gray);
  border-radius: 8px;
  padding: 48px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-tint);
}

.dropzone:hover:not(.disabled),
.dropzone.dragover {
  border-color: var(--accent-red);
  background: #fef7f6;
}

.dropzone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.prompt-icon,
.uploading-icon {
  color: var(--text-muted);
  margin-bottom: 8px;
}

.prompt-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
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
  font-size: 15px;
  font-weight: 500;
  color: var(--accent-red);
}

.progress-bar {
  height: 4px;
  background: var(--border-gray);
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
  width: 240px;
  margin-left: auto;
  margin-right: auto;
}

.progress-fill {
  height: 100%;
  background: var(--accent-red);
  border-radius: 2px;
  width: 100%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.error-text {
  color: #dc2626;
  font-size: 13px;
}

/* Timeline */
.timeline-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.timeline-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-date {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.timeline-items {
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  overflow: hidden;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  transition: background 0.1s;
}

.timeline-row:hover {
  background: var(--surface-tint);
}

.timeline-row + .timeline-row {
  border-top: 1px solid var(--border-gray);
}

.timeline-thumb {
  width: 44px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-tint);
}

.timeline-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.timeline-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.timeline-id {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.timeline-pill {
  background: var(--surface-tint);
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: var(--text-secondary);
}

.timeline-time {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.empty-text {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 40px 20px;
}
</style>

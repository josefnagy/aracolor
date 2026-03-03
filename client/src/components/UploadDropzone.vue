<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Upload Images</h2>
        <button class="btn-close" @click="$emit('close')">
          <XIcon :size="18" />
        </button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label class="field-label">Category</label>
          <select v-model="uploadCategory" class="field-select">
            <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">
              {{ cat.title }}
            </option>
          </select>
        </div>

        <div
          class="dropzone"
          :class="{ dragover }"
          @dragover.prevent="dragover = true"
          @dragleave.prevent="dragover = false"
          @drop.prevent="handleDrop"
          @click="fileInput?.click()"
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
            <UploadCloudIcon :size="32" class="uploading-icon" />
            <p class="progress-text">Uploading {{ fileCount }} file{{ fileCount > 1 ? 's' : '' }}...</p>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
          <div v-else class="upload-prompt">
            <UploadCloudIcon :size="32" class="prompt-icon" />
            <p class="prompt-text">Drop images here or click to select</p>
            <p class="prompt-hint">JPG, PNG, WebP, HEIC — max 20MB each</p>
          </div>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useImages } from '../composables/useImages.js';
import { X as XIcon, UploadCloud as UploadCloudIcon } from 'lucide-vue-next';

const props = defineProps({
  category: { type: String, required: true },
  categories: { type: Array, default: () => [] },
});

const emit = defineEmits(['uploaded', 'close']);

const { uploadImages } = useImages();

const fileInput = ref(null);
const dragover = ref(false);
const uploading = ref(false);
const fileCount = ref(0);
const error = ref('');
const uploadCategory = ref(props.category);

async function processFiles(files) {
  if (!files.length) return;

  error.value = '';
  uploading.value = true;
  fileCount.value = files.length;

  try {
    await uploadImages(uploadCategory.value, files);
    emit('uploaded');
  } catch (err) {
    error.value = err.response?.data?.error || 'Upload failed';
  } finally {
    uploading.value = false;
    fileCount.value = 0;
  }
}

function handleDrop(e) {
  dragover.value = false;
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  processFiles(files);
  e.target.value = '';
}
</script>

<style scoped>
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
  transition: color 0.15s;
}

.btn-close:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.prompt-text {
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

.progress-bar {
  height: 4px;
  background: var(--border-gray);
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
  width: 200px;
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

.error {
  color: #dc2626;
  font-size: 13px;
}
</style>

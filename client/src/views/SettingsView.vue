<template>
  <main class="content">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="title-area">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Manage your account and configuration</p>
      </div>
    </div>

    <!-- Change Password Card -->
    <div class="settings-card">
      <h2 class="card-title">Change Password</h2>
      <form class="card-form" @submit.prevent="handleChangePassword">
        <div class="field">
          <label class="field-label">Current Password</label>
          <input
            v-model="currentPassword"
            type="password"
            class="field-input"
            autocomplete="current-password"
          />
        </div>
        <div class="field">
          <label class="field-label">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            class="field-input"
            autocomplete="new-password"
          />
        </div>
        <div class="field">
          <label class="field-label">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="field-input"
            autocomplete="new-password"
          />
        </div>
        <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="success-text">{{ passwordSuccess }}</p>
        <button type="submit" class="btn-primary" :disabled="savingPassword">
          {{ savingPassword ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>

    <!-- Image Processing Card -->
    <div class="settings-card">
      <h2 class="card-title">Image Processing</h2>
      <p class="card-hint">These settings affect future uploads only.</p>
      <form class="card-form" @submit.prevent="handleSaveProcessing">
        <div class="field-grid">
          <div class="field">
            <label class="field-label">Max Dimension (px)</label>
            <input
              v-model.number="processing.maxDimension"
              type="number"
              class="field-input"
              min="100"
              max="10000"
            />
          </div>
          <div class="field">
            <label class="field-label">Max File Size (KB)</label>
            <input
              v-model.number="processing.maxFileSizeKB"
              type="number"
              class="field-input"
              min="50"
              max="10240"
            />
          </div>
          <div class="field">
            <label class="field-label">Initial Quality</label>
            <input
              v-model.number="processing.initialQuality"
              type="number"
              class="field-input"
              min="10"
              max="100"
            />
          </div>
          <div class="field">
            <label class="field-label">Quality Step</label>
            <input
              v-model.number="processing.qualityStep"
              type="number"
              class="field-input"
              min="1"
              max="20"
            />
          </div>
        </div>
        <p v-if="processingError" class="error-text">{{ processingError }}</p>
        <p v-if="processingSuccess" class="success-text">{{ processingSuccess }}</p>
        <button type="submit" class="btn-primary" :disabled="savingProcessing">
          {{ savingProcessing ? 'Saving...' : 'Save Settings' }}
        </button>
      </form>
    </div>

    <!-- Data & Backup Card -->
    <div class="settings-card">
      <h2 class="card-title">Data & Backup</h2>
      <p class="card-hint">Download your data files for backup or migration.</p>
      <div class="export-actions">
        <a :href="exportUrl('images')" class="btn-secondary" download>
          <DownloadIcon :size="16" />
          <span>Download images.json</span>
        </a>
        <a :href="exportUrl('categories')" class="btn-secondary" download>
          <DownloadIcon :size="16" />
          <span>Download categories.json</span>
        </a>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSettings } from '../composables/useSettings.js';
import { Download as DownloadIcon } from 'lucide-vue-next';

const {
  getProcessingConfig,
  saveProcessingConfig,
  changePassword,
  exportUrl,
} = useSettings();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const passwordSuccess = ref('');
const savingPassword = ref(false);

const processing = ref({
  maxDimension: 1600,
  maxFileSizeKB: 1024,
  initialQuality: 80,
  qualityStep: 5,
});
const processingError = ref('');
const processingSuccess = ref('');
const savingProcessing = ref(false);

onMounted(async () => {
  try {
    const config = await getProcessingConfig();
    processing.value = config;
  } catch {
    // defaults are fine
  }
});

async function handleChangePassword() {
  passwordError.value = '';
  passwordSuccess.value = '';

  if (!currentPassword.value || !newPassword.value) {
    passwordError.value = 'All fields are required';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New passwords do not match';
    return;
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters';
    return;
  }

  savingPassword.value = true;
  try {
    await changePassword(currentPassword.value, newPassword.value);
    passwordSuccess.value = 'Password updated successfully';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (err) {
    passwordError.value = err.response?.data?.error || 'Failed to change password';
  } finally {
    savingPassword.value = false;
  }
}

async function handleSaveProcessing() {
  processingError.value = '';
  processingSuccess.value = '';
  savingProcessing.value = true;
  try {
    await saveProcessingConfig(processing.value);
    processingSuccess.value = 'Settings saved';
  } catch (err) {
    processingError.value = err.response?.data?.error || 'Failed to save settings';
  } finally {
    savingProcessing.value = false;
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

/* Settings Card */
.settings-card {
  background: #fff;
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: -8px;
}

.card-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
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

.field-input {
  padding: 9px 12px;
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: var(--text-muted);
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
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
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  display: inline-flex;
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
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  border-color: var(--text-muted);
  color: var(--text-primary);
}

.export-actions {
  display: flex;
  gap: 12px;
}

.error-text {
  color: #dc2626;
  font-size: 13px;
}

.success-text {
  color: var(--success-green);
  font-size: 13px;
}
</style>

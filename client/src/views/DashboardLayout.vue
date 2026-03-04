<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-dot"></div>
        <span class="logo-text">Aracolor</span>
      </div>

      <nav class="nav-section">
        <span class="nav-label">ÚVOD</span>
        <router-link
          class="nav-item"
          :to="{ name: 'Categories' }"
          exact-active-class="active"
        >
          <FolderIcon :size="18" />
          <span>Categories</span>
        </router-link>
        <router-link
          class="nav-item"
          :to="{ name: 'Uploads' }"
          exact-active-class="active"
        >
          <UploadIcon :size="18" />
          <span>Uploads</span>
        </router-link>
        <router-link
          class="nav-item"
          :to="{ name: 'Images' }"
          exact-active-class="active"
        >
          <ImageIcon :size="18" />
          <span>Images</span>
        </router-link>
      </nav>

      <nav class="nav-section">
        <span class="nav-label">MALÍŘSKÉ PRÁCE</span>
        <router-link
          class="nav-item"
          :to="{ name: 'Pricelist' }"
          exact-active-class="active"
        >
          <ListOrderedIcon :size="18" />
          <span>Pricelist</span>
        </router-link>
      </nav>

      <nav class="nav-section">
        <span class="nav-label">REFERENCE</span>
        <router-link
          class="nav-item"
          :to="{ name: 'RefImages' }"
          exact-active-class="active"
        >
          <CameraIcon :size="18" />
          <span>Images</span>
        </router-link>
        <router-link
          class="nav-item"
          :to="{ name: 'RefCategories' }"
          exact-active-class="active"
        >
          <FolderIcon :size="18" />
          <span>Categories</span>
        </router-link>
      </nav>

      <nav class="nav-section">
        <span class="nav-label">OSTATNÍ</span>
        <router-link
          class="nav-item"
          :to="{ name: 'Settings' }"
          exact-active-class="active"
        >
          <SettingsIcon :size="18" />
          <span>Settings</span>
        </router-link>
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
        <button class="btn-logout" title="Log out" @click="logout">
          <LogOutIcon :size="16" />
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { useImages } from '../composables/useImages.js';
import { useRefImages } from '../composables/useRefImages.js';
import {
  Image as ImageIcon,
  Folder as FolderIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  ListOrdered as ListOrderedIcon,
  Camera as CameraIcon,
} from 'lucide-vue-next';

const router = useRouter();
const { username, checkAuth, logout } = useAuth();
const { totalStorageBytes, loadData } = useImages();
const { totalStorageBytes: refStorageBytes, loadData: loadRefData } = useRefImages();

const userInitial = computed(() =>
  username.value ? username.value.charAt(0).toUpperCase() : 'A'
);

const combinedStorageBytes = computed(() => totalStorageBytes.value + refStorageBytes.value);

const storageUsed = computed(() => {
  const bytes = combinedStorageBytes.value;
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
});

const TEN_GB = 10 * 1024 * 1024 * 1024;
const storagePercent = computed(() => {
  return Math.min((combinedStorageBytes.value / TEN_GB) * 100, 100);
});

onMounted(async () => {
  const authed = await checkAuth();
  if (!authed) {
    router.push('/');
    return;
  }
  await Promise.all([loadData(), loadRefData()]);
});
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
  gap: 24px;
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

.btn-logout {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.btn-logout:hover {
  color: #dc2626;
  background: #fef2f2;
}
</style>

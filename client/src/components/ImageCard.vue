<template>
  <div class="image-card" :class="{ hero: image.isHero, list: viewMode === 'list' }">
    <div class="thumb-wrap">
      <img :src="image.src" :alt="image.id" loading="lazy" />
      <span v-if="image.isHero" class="hero-badge">Hero</span>
    </div>
    <div class="card-actions">
      <button
        class="btn-action btn-star"
        :class="{ active: image.isHero }"
        :title="image.isHero ? 'Current hero' : 'Set as hero'"
        @click.stop="$emit('set-hero', image.id)"
      >
        <StarIcon :size="14" />
      </button>
      <button
        class="btn-action btn-delete"
        title="Delete image"
        @click.stop="$emit('delete', image.id)"
      >
        <Trash2Icon :size="14" />
      </button>
    </div>
    <div class="card-info">
      <span class="card-name">
        {{ image.id }}
        <span v-if="image.isHero && viewMode === 'list'" class="hero-label">Hero</span>
      </span>
      <div class="card-meta">
        <span>{{ formatSize(image.size) }}</span>
        <span class="dot">&middot;</span>
        <span>{{ image.width || '—' }} &times; {{ image.height || '—' }}</span>
      </div>
      <span v-if="image.uploadedAt" class="card-date">{{ formatDate(image.uploadedAt) }}</span>
    </div>
  </div>
</template>

<script setup>
import { Star as StarIcon, Trash2 as Trash2Icon } from 'lucide-vue-next';

defineProps({
  image: { type: Object, required: true },
  viewMode: { type: String, default: 'grid' },
});

defineEmits(['set-hero', 'delete']);

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
</script>

<style scoped>
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

.image-card:active {
  cursor: grabbing;
}

.image-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* ── Hero highlight ── */
.image-card.hero {
  border-color: #f59e0b;
  border-left: 3px solid #f59e0b;
}

.image-card.hero .card-info {
  background: #fffbeb;
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

.hero-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(245, 158, 11, 0.9);
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

.image-card:hover .card-actions {
  opacity: 1;
}

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

.btn-star:hover,
.btn-star.active {
  color: #f59e0b;
  background: rgba(255, 255, 255, 0.96);
}

.btn-star.active :deep(svg),
.btn-star:hover :deep(svg) {
  fill: currentColor;
}

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

.hero-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #d97706;
  background: #fef3c7;
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

.dot {
  color: var(--text-muted);
}

.card-date {
  font-size: 11px;
  color: var(--text-muted);
}

/* ── List view ── */
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

.image-card.list .hero-badge {
  display: none;
}

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
</style>

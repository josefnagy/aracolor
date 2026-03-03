<template>
  <div class="image-card" :class="{ hero: image.isHero }">
    <div class="thumb-wrap">
      <img :src="image.src" :alt="image.id" loading="lazy" />
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
    </div>
    <div class="card-info">
      <span class="card-name">{{ image.id }}</span>
      <div class="card-meta">
        <span>{{ formatSize(image.size) }}</span>
        <span class="dot">&middot;</span>
        <span>{{ image.width || '—' }} &times; {{ image.height || '—' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star as StarIcon, Trash2 as Trash2Icon } from 'lucide-vue-next';

defineProps({
  image: { type: Object, required: true },
});

defineEmits(['set-hero', 'delete']);

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
</script>

<style scoped>
.image-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-gray);
  display: flex;
  flex-direction: column;
  cursor: grab;
  transition: box-shadow 0.2s;
}

.image-card:active {
  cursor: grabbing;
}

.image-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.image-card.hero {
  border-color: var(--accent-red);
  box-shadow: 0 0 0 1px var(--accent-red);
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

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
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
  backdrop-filter: blur(8px);
  transition: all 0.15s;
}

.btn-star:hover,
.btn-star.active {
  color: #f59e0b;
  background: rgba(255, 255, 255, 0.96);
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
}

.card-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
</style>

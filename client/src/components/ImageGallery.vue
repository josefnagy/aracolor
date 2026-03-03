<template>
  <div class="gallery">
    <draggable
      v-model="localImages"
      item-key="id"
      :class="viewMode === 'list' ? 'gallery-list' : 'gallery-grid'"
      ghost-class="ghost"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <ImageCard
          :image="element"
          :view-mode="viewMode"
          @set-hero="$emit('set-hero', $event)"
          @delete="$emit('delete', $event)"
        />
      </template>
    </draggable>

    <div v-if="images.length === 0" class="empty">
      <p class="empty-text">No images in this category</p>
      <p class="empty-hint">Upload some images to get started.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import ImageCard from './ImageCard.vue';

const props = defineProps({
  images: { type: Array, required: true },
  category: { type: String, required: true },
  viewMode: { type: String, default: 'grid' },
});

const emit = defineEmits(['reorder', 'set-hero', 'delete']);

const localImages = ref([]);

watch(
  () => props.images,
  (val) => {
    localImages.value = [...val];
  },
  { immediate: true }
);

function onDragEnd() {
  const orderedIds = localImages.value.map(img => img.id);
  emit('reorder', orderedIds);
}
</script>

<style scoped>
.gallery {
  flex: 1;
}

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
</style>

import { ref, computed } from 'vue';
import api from '../api/client.js';

const categories = ref({});
const images = ref({});
const selectedCategory = ref('');
const loading = ref(false);

export function useRefImages() {
  const categoryList = computed(() => {
    return Object.entries(categories.value).map(([slug, cat]) => ({
      slug,
      title: cat.title,
      description: cat.description || '',
      count: cat.imageIds ? cat.imageIds.length : 0,
      heroImageId: cat.heroImageId,
    }));
  });

  const currentImages = computed(() => {
    if (!selectedCategory.value) {
      const all = [];
      for (const [slug, cat] of Object.entries(categories.value)) {
        if (!cat.imageIds) continue;
        for (const id of cat.imageIds) {
          all.push({
            id,
            ...images.value[id],
            isHero: cat.heroImageId === id,
            category: slug,
          });
        }
      }
      return all;
    }

    const cat = categories.value[selectedCategory.value];
    if (!cat || !cat.imageIds) return [];

    return cat.imageIds.map(id => ({
      id,
      ...images.value[id],
      isHero: cat.heroImageId === id,
      category: selectedCategory.value,
    }));
  });

  async function loadData() {
    loading.value = true;
    try {
      const { data } = await api.get('/ref-categories');
      categories.value = data.categories;
      images.value = data.images;
    } finally {
      loading.value = false;
    }
  }

  async function uploadImages(category, files) {
    const formData = new FormData();
    formData.append('category', category);
    for (const file of files) {
      formData.append('files', file);
    }

    const { data } = await api.post('/ref-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    await loadData();
    return data;
  }

  async function reorderImages(category, orderedIds) {
    await api.post('/ref-reorder', { category, orderedIds });
    await loadData();
  }

  async function setHero(category, imageId) {
    await api.post('/ref-set-hero', { category, imageId });
    await loadData();
  }

  async function deleteImage(imageId) {
    await api.delete(`/ref-image/${imageId}`);
    await loadData();
  }

  async function toggleCarousel(imageId, value) {
    await api.post('/ref-carousel', { imageId, value });
    await loadData();
  }

  const totalStorageBytes = computed(() => {
    return Object.values(images.value).reduce((sum, img) => sum + (img.size || 0), 0);
  });

  const weeklyUploadCount = computed(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return Object.values(images.value).filter(
      img => img.uploadedAt && new Date(img.uploadedAt).getTime() >= weekAgo
    ).length;
  });

  const carouselCountByCategory = computed(() => {
    const counts = {};
    for (const [slug, cat] of Object.entries(categories.value)) {
      if (!cat.imageIds) { counts[slug] = 0; continue; }
      counts[slug] = cat.imageIds.filter(id => images.value[id]?.carousel).length;
    }
    return counts;
  });

  return {
    categories,
    images,
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
    setHero,
    deleteImage,
    toggleCarousel,
  };
}

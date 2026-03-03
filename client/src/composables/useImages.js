import { ref, computed } from 'vue';
import api from '../api/client.js';

const categories = ref({});
const images = ref({});
const selectedCategory = ref('');
const loading = ref(false);

export function useImages() {
  const categoryList = computed(() => {
    return Object.entries(categories.value).map(([slug, cat]) => ({
      slug,
      title: cat.title,
      count: cat.imageIds ? cat.imageIds.length : 0,
      heroImageId: cat.heroImageId,
    }));
  });

  const currentImages = computed(() => {
    // "All" mode — show images from every category
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
      const { data } = await api.get('/categories');
      categories.value = data.categories;
      images.value = data.images;

      // Default to "All" view (empty string)

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

    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    await loadData();
    return data;
  }

  async function reorderImages(category, orderedIds) {
    await api.post('/reorder', { category, orderedIds });
    await loadData();
  }

  async function setHero(category, imageId) {
    await api.post('/set-hero', { category, imageId });
    await loadData();
  }

  async function deleteImage(imageId) {
    await api.delete(`/image/${imageId}`);
    await loadData();
  }

  return {
    categories,
    images,
    selectedCategory,
    loading,
    categoryList,
    currentImages,
    loadData,
    uploadImages,
    reorderImages,
    setHero,
    deleteImage,
  };
}

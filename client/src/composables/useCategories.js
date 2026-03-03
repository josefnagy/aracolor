import api from '../api/client.js';

export function useCategories() {
  async function createCat(title, slug, description) {
    return api.post('/categories', { title, slug, description });
  }

  async function renameCat(slug, title, description) {
    return api.put(`/categories/${slug}`, { title, description });
  }

  async function deleteCat(slug) {
    return api.delete(`/categories/${slug}`);
  }

  async function reorderCats(orderedSlugs) {
    return api.post('/categories/reorder', { orderedSlugs });
  }

  return { createCat, renameCat, deleteCat, reorderCats };
}

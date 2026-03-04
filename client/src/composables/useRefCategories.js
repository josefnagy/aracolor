import api from '../api/client.js';

export function useRefCategories() {
  async function createCat(title, slug, description) {
    return api.post('/ref-categories', { title, slug, description });
  }

  async function renameCat(slug, title, description) {
    return api.put(`/ref-categories/${slug}`, { title, description });
  }

  async function deleteCat(slug) {
    return api.delete(`/ref-categories/${slug}`);
  }

  async function reorderCats(orderedSlugs) {
    return api.post('/ref-categories/reorder', { orderedSlugs });
  }

  return { createCat, renameCat, deleteCat, reorderCats };
}

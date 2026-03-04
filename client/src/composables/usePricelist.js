import { ref } from 'vue';
import api from '../api/client.js';

const pricelist = ref({ version: 1, categories: [] });

export function usePricelist() {
  async function loadPricelist() {
    const res = await api.get('/pricelist');
    pricelist.value = res.data;
  }

  async function createCategory(id, title, column) {
    await api.post('/pricelist/categories', { id, title, column });
    await loadPricelist();
  }

  async function updateCategory(id, updates) {
    await api.put(`/pricelist/categories/${id}`, updates);
    await loadPricelist();
  }

  async function deleteCategory(id) {
    await api.delete(`/pricelist/categories/${id}`);
    await loadPricelist();
  }

  async function reorderCategories(orderedIds) {
    await api.post('/pricelist/categories/reorder', { orderedIds });
    await loadPricelist();
  }

  async function addItem(catId, item) {
    const res = await api.post(`/pricelist/categories/${catId}/items`, item);
    await loadPricelist();
    return res.data.item;
  }

  async function updateItem(catId, itemId, updates) {
    await api.put(`/pricelist/categories/${catId}/items/${itemId}`, updates);
    await loadPricelist();
  }

  async function deleteItem(catId, itemId) {
    await api.delete(`/pricelist/categories/${catId}/items/${itemId}`);
    await loadPricelist();
  }

  async function reorderItems(catId, orderedIds) {
    await api.post(`/pricelist/categories/${catId}/items/reorder`, { orderedIds });
    await loadPricelist();
  }

  return {
    pricelist,
    loadPricelist,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}

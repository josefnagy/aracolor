import api from '../api/client.js';

export function useSettings() {
  async function changePassword(currentPassword, newPassword) {
    return api.post('/settings/password', { currentPassword, newPassword });
  }

  async function getProcessingConfig() {
    const { data } = await api.get('/settings/processing');
    return data;
  }

  async function saveProcessingConfig(config) {
    return api.put('/settings/processing', config);
  }

  function exportUrl(type) {
    return `/api/settings/export/${type}`;
  }

  return { changePassword, getProcessingConfig, saveProcessingConfig, exportUrl };
}

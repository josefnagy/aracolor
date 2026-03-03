import { ref } from 'vue';
import api from '../api/client.js';
import router from '../router/index.js';

const isAuthenticated = ref(false);
const username = ref('');

export function useAuth() {
  async function login(user, password) {
    const { data } = await api.post('/login', { username: user, password });
    isAuthenticated.value = true;
    username.value = data.username;
    router.push('/dashboard');
  }

  async function checkAuth() {
    try {
      const { data } = await api.get('/me');
      isAuthenticated.value = true;
      username.value = data.username;
      return true;
    } catch {
      isAuthenticated.value = false;
      username.value = '';
      return false;
    }
  }

  async function logout() {
    await api.post('/logout');
    isAuthenticated.value = false;
    username.value = '';
    router.push('/');
  }

  return { isAuthenticated, username, login, checkAuth, logout };
}

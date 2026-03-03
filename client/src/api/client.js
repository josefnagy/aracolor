import axios from 'axios';
import router from '../router/index.js';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      router.push('/');
    }
    return Promise.reject(error);
  }
);

export default api;

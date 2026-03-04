import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardLayout from '../views/DashboardLayout.vue';
import ImagesView from '../views/ImagesView.vue';
import CategoriesView from '../views/CategoriesView.vue';
import UploadsView from '../views/UploadsView.vue';
import SettingsView from '../views/SettingsView.vue';
import PricelistView from '../views/PricelistView.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: '', name: 'Images', component: ImagesView },
      { path: 'categories', name: 'Categories', component: CategoriesView },
      { path: 'uploads', name: 'Uploads', component: UploadsView },
      { path: 'pricelist', name: 'Pricelist', component: PricelistView },
      { path: 'settings', name: 'Settings', component: SettingsView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes,
});

export default router;

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-dot"></div>
        <span class="logo-text">Aracolor</span>
      </div>
      <p class="login-subtitle">Přihlášení do administrace</p>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="username">Uživatelské jméno</label>
          <input
            id="username"
            v-model="user"
            type="text"
            autocomplete="username"
            placeholder="Zadejte uživatelské jméno"
            required
          />
        </div>
        <div class="field">
          <label for="password">Heslo</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Zadejte heslo"
            required
          />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Přihlašování...' : 'Přihlásit se' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth.js';
import { useRouter } from 'vue-router';

const { login, checkAuth } = useAuth();
const router = useRouter();

const user = ref('');
const password = ref('');
const error = ref('');
const submitting = ref(false);

onMounted(async () => {
  const authed = await checkAuth();
  if (authed) router.push('/dashboard');
});

async function handleLogin() {
  error.value = '';
  submitting.value = true;
  try {
    await login(user.value, password.value);
  } catch (err) {
    error.value = err.response?.data?.error || 'Přihlášení se nezdařilo';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--surface-tint);
}

.login-card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid var(--border-gray);
  width: 100%;
  max-width: 380px;
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 8px;
}

.logo-dot {
  width: 28px;
  height: 28px;
  background: var(--accent-red);
  border-radius: 4px;
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.login-subtitle {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.field {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  transition: border-color 0.2s;
  outline: none;
}

input::placeholder {
  color: var(--text-muted);
}

input:focus {
  border-color: var(--text-muted);
}

.error {
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
}

button {
  width: 100%;
  padding: 10px;
  background: var(--accent-red);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.15s;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.6;
}
</style>

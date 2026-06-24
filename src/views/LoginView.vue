<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="logo">🎬</span>
        <h1>Cinema Operator Panel</h1>
        <p class="subtitle">Sign in to continue</p>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Enter username"
            @keyup.enter="login"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            @keyup.enter="login"
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button
          class="btn-login"
          :disabled="loading || !form.username || !form.password"
          @click="login"
        >
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { loginOperator } from "@/api.js";

export default {
  name: "LoginView",

  data() {
    return {
      form: { username: "", password: "" },
      loading: false,
      error: null,
    };
  },

  methods: {
    async login() {
      if (!this.form.username || !this.form.password) return;
      this.loading = true;
      this.error = null;
      try {
        const data = await loginOperator(
          this.form.username,
          this.form.password,
        );
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_role", data.role);
        localStorage.setItem("auth_username", data.username);
        this.$router.push("/operator");
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
}

.login-card {
  background: var(--color-secondary);
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid #333;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 2.5rem;
}

.login-header h1 {
  font-size: 1.3rem;
  margin-top: 0.75rem;
  color: var(--color-primary);
}

.subtitle {
  color: #888;
  font-size: 0.85rem;
  margin-top: 0.4rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: #aaa;
  margin-bottom: 0.4rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.95rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.error-message {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.btn-login {
  width: 100%;
  padding: 0.85rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.btn-login:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-login:not(:disabled):hover {
  filter: brightness(0.85);
}
</style>

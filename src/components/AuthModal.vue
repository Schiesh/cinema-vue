<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="auth-modal">
      <!-- Tab switcher -->
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Sign In
        </button>
        <button
          class="auth-tab"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Create Account
        </button>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Sign In -->
      <div v-if="activeTab === 'login'" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="loginForm.email"
            type="email"
            placeholder="your@email.com"
            @keyup.enter="submitLogin"
          />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="Enter password"
            @keyup.enter="submitLogin"
          />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button class="btn-submit" :disabled="loading" @click="submitLogin">
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>
        <p class="switch-hint">
          Don't have an account?
          <a @click="activeTab = 'register'">Create one</a>
        </p>
      </div>

      <!-- Register -->
      <div v-if="activeTab === 'register'" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input
              v-model="registerForm.first_name"
              type="text"
              placeholder="First name"
            />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input
              v-model="registerForm.last_name"
              type="text"
              placeholder="Last name"
            />
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="your@email.com"
          />
        </div>
        <div class="form-group">
          <label>Phone <span class="optional">(optional)</span></label>
          <input
            v-model="registerForm.phone"
            type="text"
            placeholder="555-1234"
          />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="Create password"
          />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input
            v-model="registerForm.password_confirmation"
            type="password"
            placeholder="Confirm password"
            @keyup.enter="submitRegister"
          />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button class="btn-submit" :disabled="loading" @click="submitRegister">
          {{ loading ? "Creating account..." : "Create Account" }}
        </button>
        <p class="switch-hint">
          Already have an account?
          <a @click="activeTab = 'login'">Sign in</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { loginCustomer, registerCustomer } from "@/api.js";

export default {
  name: "AuthModal",
  emits: ["close", "authenticated"],

  data() {
    return {
      activeTab: "login",
      loading: false,
      error: null,
      loginForm: { email: "", password: "" },
      registerForm: {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
      },
    };
  },

  methods: {
    async submitLogin() {
      if (!this.loginForm.email || !this.loginForm.password) return;
      this.loading = true;
      this.error = null;
      try {
        const data = await loginCustomer(
          this.loginForm.email,
          this.loginForm.password,
        );
        this.$emit("authenticated", data);
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    async submitRegister() {
      if (
        !this.registerForm.first_name ||
        !this.registerForm.email ||
        !this.registerForm.password
      ) {
        this.error = "Please fill in all required fields.";
        return;
      }
      if (
        this.registerForm.password !== this.registerForm.password_confirmation
      ) {
        this.error = "Passwords don't match.";
        return;
      }
      this.loading = true;
      this.error = null;
      try {
        const data = await registerCustomer(this.registerForm);
        this.$emit("authenticated", data);
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.auth-modal {
  background: var(--color-secondary);
  border-radius: 10px;
  width: 420px;
  border: 1px solid #333;
  overflow: hidden;
}

.auth-tabs {
  display: flex;
  align-items: center;
  background: #111;
  border-bottom: 1px solid #333;
}

.auth-tab {
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #888;
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.auth-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.close-btn {
  padding: 1rem;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
}

.close-btn:hover {
  color: #fff;
}

.auth-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 0.35rem;
}

.optional {
  color: #555;
  font-size: 0.75rem;
}

.form-group input {
  width: 100%;
  padding: 0.7rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.error-message {
  background: rgba(244, 67, 54, 0.12);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  margin-bottom: 1rem;
}

.btn-submit {
  width: 100%;
  padding: 0.85rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 1rem;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-submit:not(:disabled):hover {
  filter: brightness(0.85);
}

.switch-hint {
  text-align: center;
  font-size: 0.8rem;
  color: #666;
}

.switch-hint a {
  color: var(--color-primary);
  cursor: pointer;
}
</style>

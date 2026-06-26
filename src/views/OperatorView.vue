<template>
  <div class="operator">
    <!-- HEADER -->
    <div class="header">
      <h1>
        🎬 Cinema Operator Panel
        <EnvironmentBadge />
      </h1>
      <div class="header-right">
        <span class="date">{{ currentDate }}</span>
        <span class="username">{{ username }}</span>
        <button class="btn-logout" @click="logout">Sign Out</button>
      </div>
    </div>

    <!-- NAV -->
    <nav class="nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- CONTENT -->
    <div class="content">
      <!-- MESSAGE -->
      <div v-if="message.text" :class="`message ${message.type}`">
        {{ message.text }}
      </div>

      <!-- TABS -->
      <DashboardTab v-if="activeTab === 'dashboard'" />
      <MoviesTab v-if="activeTab === 'movies'" @message="showMessage" />
      <ScreensTab v-if="activeTab === 'screens'" @message="showMessage" />
      <ShowingsTab v-if="activeTab === 'showings'" @message="showMessage" />
      <ThemeTab
        v-if="activeTab === 'theme'"
        @message="showMessage"
        @theme-updated="onThemeUpdated"
      />
      <UsersTab v-if="activeTab === 'users'" @message="showMessage" />
      <SiteSettingsTab v-if="activeTab === 'settings'" @message="showMessage" />
    </div>

    <!-- BACK LINK -->
    <div class="back-link">
      <router-link to="/">← Back to Customer View</router-link>
    </div>
  </div>
</template>

<script>
import DashboardTab from "@/components/operator/DashboardTab.vue";
import MoviesTab from "@/components/operator/MoviesTab.vue";
import ScreensTab from "@/components/operator/ScreensTab.vue";
import ShowingsTab from "@/components/operator/ShowingsTab.vue";
import EnvironmentBadge from "@/components/EnvironmentBadge.vue";
import ThemeTab from "@/components/operator/ThemeTab.vue";
import UsersTab from "@/components/operator/UsersTab.vue";
import SiteSettingsTab from "@/components/operator/SiteSettingsTab.vue";

export default {
  name: "OperatorView",
  components: {
    DashboardTab,
    MoviesTab,
    ScreensTab,
    ShowingsTab,
    ThemeTab,
    SiteSettingsTab,
    UsersTab,
    EnvironmentBadge,
  },

  data() {
    return {
      activeTab: "dashboard",
      message: { text: "", type: "" },
      tabs: [
        { id: "dashboard", label: "Dashboard" },
        { id: "movies", label: "Movies" },
        { id: "screens", label: "Screens" },
        { id: "showings", label: "Showings" },
        { id: "theme", label: "Theme" },
        { id: "users", label: "Users" },
        { id: "settings", label: "Site Settings" },
      ],
    };
  },

  computed: {
    currentDate() {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    username() {
      return localStorage.getItem("auth_username") || "Operator";
    },
  },

  methods: {
    logout() {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_username");
      this.$router.push("/login");
    },

    showMessage({ text, type }) {
      this.message = { text, type };
      setTimeout(() => {
        this.message = { text: "", type: "" };
      }, 4000);
    },

    onThemeUpdated(theme) {
      this.$root.applyTheme(theme);
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--color-secondary);
  border-bottom: 2px solid var(--color-primary);
}

.header h1 {
  color: #e50914;
  font-size: 1.4rem;
}
.date {
  color: #aaa;
  font-size: 0.85rem;
}

.nav {
  display: flex;
  background: #1a1a1a;
  padding: 0 2rem;
  border-bottom: 1px solid #333;
}

.nav-tab {
  padding: 1rem 1.5rem;
  cursor: pointer;
  color: #aaa;
  font-size: 0.9rem;
  border: none;
  border-bottom: 3px solid transparent;
  background: none;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: #fff;
}
.nav-tab.active {
  color: #e50914;
  border-bottom-color: #e50914;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.message.success {
  background: #1a3a1a;
  border: 1px solid #2d8a2d;
  color: #4caf50;
}
.message.error {
  background: #3a1a1a;
  border: 1px solid #8a2d2d;
  color: #f44336;
}

.back-link {
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid #222;
}

.back-link a {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
}
.back-link a:hover {
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-size: 0.85rem;
  color: #aaa;
}

.btn-logout {
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid #444;
  border-radius: 4px;
  color: #aaa;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-logout:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>

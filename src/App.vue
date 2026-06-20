<template>
  <router-view />
</template>

<script>
import { fetchTheme } from "@/api.js";

export default {
  name: "App",

  async mounted() {
    try {
      const theme = await fetchTheme();
      this.applyTheme(theme);
    } catch (error) {
      console.error("Failed to load theme, using defaults:", error);
    }
  },

  methods: {
    applyTheme(theme) {
      const root = document.documentElement;
      root.style.setProperty("--color-primary", theme.primary_color);
      root.style.setProperty("--color-secondary", theme.secondary_color);
      root.style.setProperty("--color-info", theme.info_color);
      root.style.setProperty("--color-success", theme.success_color);
      root.style.setProperty("--color-danger", theme.danger_color);
      root.style.setProperty("--color-background", theme.background_color);
      root.style.setProperty("--color-text", theme.text_color);
    },
  },
};
</script>

<style>
:root {
  --color-primary: #e50914;
  --color-secondary: #1a1a1a;
  --color-info: #4a9eff;
  --color-success: #4caf50;
  --color-danger: #f44336;
  --color-background: #0f0f0f;
  --color-text: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
}
</style>

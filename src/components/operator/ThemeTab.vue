<template>
  <div>
    <div class="tab-header">
      <h2>Theme & Branding</h2>
    </div>

    <div v-if="loading" class="loading">Loading theme...</div>

    <div v-else class="theme-layout">
      <!-- FORM -->
      <div class="theme-form">
        <div v-for="field in colorFields" :key="field.key" class="color-row">
          <label>{{ field.label }}</label>
          <div class="color-input-group">
            <input
              type="color"
              v-model="form[field.key]"
              class="color-swatch"
            />
            <input
              type="text"
              v-model="form[field.key]"
              class="hex-input"
              placeholder="#e50914"
            />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="resetToDefaults">
            Reset to Defaults
          </button>
          <button class="btn btn-primary" :disabled="saving" @click="saveTheme">
            {{ saving ? "Saving..." : "Save Theme" }}
          </button>
        </div>
      </div>

      <!-- LIVE PREVIEW -->
      <div class="theme-preview">
        <h3 class="preview-title">Live Preview</h3>
        <div class="preview-card" :style="previewStyles">
          <div
            class="preview-header"
            :style="{ borderBottomColor: form.primary_color }"
          >
            <span :style="{ color: form.primary_color }"
              >🎬 Cinema Booking</span
            >
          </div>
          <div class="preview-body">
            <div
              class="preview-movie-card"
              :style="{ background: form.secondary_color }"
            >
              <div class="preview-poster"></div>
              <p :style="{ color: form.text_color }">Sample Movie</p>
              <p class="preview-price" :style="{ color: form.primary_color }">
                $14.99
              </p>
            </div>
            <div class="preview-badges">
              <span
                class="preview-badge"
                :style="{ background: form.success_color }"
                >Available</span
              >
              <span
                class="preview-badge"
                :style="{ background: form.info_color }"
                >Accessible</span
              >
              <span
                class="preview-badge"
                :style="{ background: form.danger_color }"
                >Sold Out</span
              >
            </div>
            <button
              class="preview-btn"
              :style="{ background: form.primary_color }"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchTheme, updateTheme } from "@/api.js";

const DEFAULTS = {
  primary_color: "#e50914",
  secondary_color: "#1a1a1a",
  info_color: "#4a9eff",
  success_color: "#4caf50",
  danger_color: "#f44336",
  background_color: "#0f0f0f",
  text_color: "#ffffff",
};

export default {
  name: "ThemeTab",
  emits: ["message", "theme-updated"],

  data() {
    return {
      loading: false,
      saving: false,
      form: { ...DEFAULTS },
      colorFields: [
        { key: "primary_color", label: "Primary" },
        { key: "secondary_color", label: "Secondary" },
        { key: "info_color", label: "Info" },
        { key: "success_color", label: "Success" },
        { key: "danger_color", label: "Danger" },
        { key: "background_color", label: "Background" },
        { key: "text_color", label: "Text" },
      ],
    };
  },

  computed: {
    previewStyles() {
      return {
        background: this.form.background_color,
        color: this.form.text_color,
      };
    },
  },

  async mounted() {
    this.loading = true;
    try {
      const theme = await fetchTheme();
      this.form = {
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        info_color: theme.info_color,
        success_color: theme.success_color,
        danger_color: theme.danger_color,
        background_color: theme.background_color,
        text_color: theme.text_color,
      };
    } catch (error) {
      this.$emit("message", { text: error.message, type: "error" });
    } finally {
      this.loading = false;
    }
  },

  methods: {
    resetToDefaults() {
      this.form = { ...DEFAULTS };
    },

    async saveTheme() {
      const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      for (const field of this.colorFields) {
        if (!hexPattern.test(this.form[field.key])) {
          this.$emit("message", {
            text: `${field.label} must be a valid hex color like #e50914`,
            type: "error",
          });
          return;
        }
      }

      this.saving = true;
      try {
        const updated = await updateTheme(this.form);
        this.$emit("message", {
          text: "Theme saved successfully.",
          type: "success",
        });
        this.$emit("theme-updated", updated);
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" });
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.tab-header {
  margin-bottom: 1.5rem;
}
.tab-header h2 {
  font-size: 1.3rem;
}
.loading {
  color: #aaa;
  padding: 1rem 0;
}

.theme-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 800px) {
  .theme-layout {
    grid-template-columns: 1fr;
  }
}

.theme-form {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
}

.color-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #222;
}

.color-row label {
  color: #aaa;
  font-size: 0.9rem;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #444;
  background: none;
  cursor: pointer;
  padding: 0;
}

.hex-input {
  width: 100px;
  padding: 0.5rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.85rem;
  font-family: monospace;
}

.hex-input:focus {
  outline: none;
  border-color: #e50914;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.theme-preview {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
}

.preview-title {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-weight: normal;
}

.preview-card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}

.preview-header {
  padding: 1rem;
  border-bottom: 2px solid;
  font-weight: bold;
}

.preview-body {
  padding: 1.25rem;
}

.preview-movie-card {
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.preview-poster {
  width: 60px;
  height: 90px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.preview-price {
  font-weight: bold;
  margin-top: 0.25rem;
}

.preview-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.preview-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
}

.preview-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
}

.btn-primary {
  background: #e50914;
  color: white;
}
.btn-secondary {
  background: #333;
  color: white;
}
</style>

<template>
  <div>
    <div class="tab-header">
      <h2>Site Settings</h2>
    </div>

    <div v-if="loading" class="loading">Loading settings...</div>

    <div v-else class="settings-card">
      <div class="setting-row">
        <label>Booking Cutoff (minutes)</label>
        <input
          v-model.number="form.booking_cutoff_minutes"
          type="number"
          class="cutoff-input"
        />
        <p class="hint">
          {{ cutoffExplanation }}
        </p>
      </div>

      <div class="form-actions">
        <button
          class="btn btn-primary"
          :disabled="saving"
          @click="saveSettings"
        >
          {{ saving ? "Saving..." : "Save Settings" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchSiteSettings, updateSiteSettings } from "@/api.js";

export default {
  name: "SiteSettingsTab",
  emits: ["message"],

  data() {
    return {
      loading: false,
      saving: false,
      form: { booking_cutoff_minutes: 0 },
    };
  },

  computed: {
    cutoffExplanation() {
      const minutes = this.form.booking_cutoff_minutes;
      if (minutes === 0) return "Bookings close exactly at showtime.";
      if (minutes > 0)
        return `Bookings stay open until ${minutes} minute${
          minutes === 1 ? "" : "s"
        } AFTER showtime starts.`;
      return `Bookings close ${Math.abs(minutes)} minute${
        Math.abs(minutes) === 1 ? "" : "s"
      } BEFORE showtime starts.`;
    },
  },

  async mounted() {
    this.loading = true;
    try {
      const settings = await fetchSiteSettings();
      this.form.booking_cutoff_minutes = settings.booking_cutoff_minutes;
    } catch (error) {
      this.$emit("message", { text: error.message, type: "error" });
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async saveSettings() {
      this.saving = true;
      try {
        await updateSiteSettings(this.form);
        this.$emit("message", {
          text: "Site settings saved.",
          type: "success",
        });
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

.settings-card {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
  max-width: 500px;
}

.setting-row label {
  display: block;
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.cutoff-input {
  width: 150px;
  padding: 0.6rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 1rem;
}

.cutoff-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.hint {
  margin-top: 0.5rem;
  color: #888;
  font-size: 0.8rem;
}

.form-actions {
  margin-top: 1.5rem;
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
  background: var(--color-primary);
  color: white;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

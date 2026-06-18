<template>
  <div v-if="environment" :class="`env-badge ${environment}`">
    {{ label }}
  </div>
</template>

<script>
export default {
  name: "EnvironmentBadge",

  computed: {
    environment() {
      return process.env.VUE_APP_ENVIRONMENT;
    },

    label() {
      return this.environment === "production" ? "PROD" : "STAG";
    },
  },
};
</script>

<style scoped>
.env-badge {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 1px;
  margin-left: 0.75rem;
}

.env-badge.staging {
  background: #3a2a1a;
  color: #ffb74d;
  border: 1px solid #ffb74d;
}

.env-badge.production {
  background: #1a3a1a;
  color: #4caf50;
  border: 1px solid #4caf50;
}
</style>

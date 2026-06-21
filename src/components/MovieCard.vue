<template>
  <div
    class="movie-card"
    :class="{ selected: isSelected, 'coming-soon': isComingSoon }"
    @click="$emit('selected', movie)"
  >
    <div class="poster-wrap">
      <img
        v-if="movie.poster_url"
        :src="movie.poster_url"
        class="poster"
        :alt="movie.title"
      />
      <div v-else class="poster-fallback">🎬</div>
      <div v-if="isComingSoon" class="coming-soon-badge">Coming Soon</div>
    </div>
    <h3 class="movie-title">{{ movie.title }}</h3>
    <p class="movie-meta">⏱ {{ movie.duration }} mins</p>
    <p class="movie-meta">🎭 {{ movie.genre }}</p>
    <p class="movie-meta">🔞 {{ movie.rating }}</p>
    <p class="movie-price">${{ parseFloat(movie.price).toFixed(2) }}</p>
  </div>
</template>

<script>
export default {
  name: "MovieCard",
  props: {
    movie: { type: Object, required: true },
    isSelected: { type: Boolean, default: false },
    isComingSoon: { type: Boolean, default: false },
  },
  emits: ["selected"],
};
</script>

<style scoped>
.movie-card {
  background: var(--color-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.movie-card:hover {
  border-color: var(--color-primary);
}
.movie-card.selected {
  border-color: var(--color-primary);
}

.movie-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.movie-meta {
  font-size: 0.85rem;
  color: #aaaaaa;
  margin-bottom: 0.2rem;
}
.movie-price {
  color: var(--color-primary);
  font-weight: bold;
  margin-top: 0.75rem;
}

.poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  background: #0f0f0f;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #333;
}

.movie-card.coming-soon {
  cursor: default;
  opacity: 0.85;
}

.movie-card.coming-soon:hover {
  border-color: transparent;
}

.coming-soon-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-info);
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
}
</style>

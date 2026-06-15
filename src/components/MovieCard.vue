<template>
  <div
    class="movie-card"
    :class="{ selected: isSelected }"
    @click="$emit('selected', movie)"
  >
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
    isSelected: { type: Boolean, default: false }
  },
  emits: ["selected"]
}
</script>

<style scoped>
.movie-card {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.movie-card:hover { border-color: #e50914; }
.movie-card.selected { border-color: #e50914; }
.movie-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; }
.movie-meta { font-size: 0.85rem; color: #aaaaaa; margin-bottom: 0.2rem; }
.movie-price { color: #e50914; font-weight: bold; margin-top: 0.75rem; }
</style>

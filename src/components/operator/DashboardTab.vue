<template>
  <div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ stats.movies }}</div>
        <div class="stat-label">Movies</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.screens }}</div>
        <div class="stat-label">Active Screens</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.showings }}</div>
        <div class="stat-label">Total Showings</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.ticketsSold }}</div>
        <div class="stat-label">Tickets Sold</div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading stats...</div>

    <div v-else class="summary-card">
      <p>
        You have <strong>{{ stats.movies }} movies</strong> in the catalog
        across <strong>{{ stats.screens }} screens</strong>
        with <strong>{{ stats.showings }} showings</strong> scheduled
        and <strong>{{ stats.ticketsSold }} tickets</strong> sold.
      </p>
    </div>
  </div>
</template>

<script>
import { fetchMovies, fetchScreens, fetchScreenings } from "@/api.js"

export default {
  name: "DashboardTab",

  data() {
    return {
      loading: false,
      stats: {
        movies: "—",
        screens: "—",
        showings: "—",
        ticketsSold: "—"
      }
    }
  },

  async mounted() {
    await this.loadStats()
  },

  methods: {
    async loadStats() {
      this.loading = true
      try {
        const [movies, screens] = await Promise.all([
          fetchMovies(),
          fetchScreens()
        ])

        let totalShowings = 0
        let totalSold = 0

        for (const movie of movies) {
          const showings = await fetchScreenings(movie.id)
          totalShowings += showings.length
          showings.forEach(s => {
            totalSold += (s.seats_total - s.seats_available)
          })
        }

        this.stats = {
          movies: movies.length,
          screens: screens.length,
          showings: totalShowings,
          ticketsSold: totalSold
        }

      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #e50914;
}

.stat-label {
  font-size: 0.85rem;
  color: #aaaaaa;
  margin-top: 0.4rem;
}

.summary-card {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #333;
  color: #aaa;
  line-height: 1.8;
  font-size: 0.95rem;
}

.summary-card strong { color: white; }
.loading { color: #aaa; padding: 1rem 0; }
</style>

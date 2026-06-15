<template>
  <div>
    <div class="tab-header">
      <h2>Showings</h2>
      <button class="btn btn-primary" @click="openModal">+ Schedule Showing</button>
    </div>

    <div v-if="loading" class="loading">Loading showings...</div>
    <div v-else-if="allShowings.length === 0" class="empty">No showings scheduled yet.</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Movie</th>
          <th>Screen</th>
          <th>Showtime</th>
          <th>Price</th>
          <th>Seats</th>
          <th>Occupancy</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="showing in allShowings" :key="showing.id">
          <td class="bold">{{ showing.movie_title }}</td>
          <td class="muted">{{ showing.screen_name || `Screen ${showing.screen_number}` }}</td>
          <td>{{ formatShowtime(showing.showtime) }}</td>
          <td class="green">${{ parseFloat(showing.price || 0).toFixed(2) }}</td>
          <td class="muted">{{ showing.seats_available }}/{{ showing.seats_total }}</td>
          <td>
            <div class="progress-wrap">
              <div class="progress-bar" :style="{ width: `${showing.percent_full}%` }"></div>
            </div>
            <span class="muted" style="font-size:0.8rem;">{{ showing.percent_full }}%</span>
          </td>
          <td>
            <button class="btn btn-danger btn-sm" @click="cancelShowing(showing.id)">Cancel</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL -->
    <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Schedule Showing</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Movie</label>
            <select v-model="form.movie_id">
              <option v-for="m in movies" :key="m.id" :value="m.id">{{ m.title }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Screen</label>
            <select v-model="form.screen_id">
              <option v-for="s in screens" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.screen_type }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date & Time</label>
            <input v-model="form.datetime" type="datetime-local">
          </div>
          <div class="form-group">
            <label>Ticket Price ($)</label>
            <input v-model="form.price" type="number" step="0.01" placeholder="14.99">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveShowing">Schedule</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchMovies, fetchScreens,
  fetchScreenings, createScreening, deleteScreening
} from "@/api.js"

export default {
  name: "ShowingsTab",
  emits: ["message"],

  data() {
    return {
      allShowings: [],
      movies: [],
      screens: [],
      loading: false,
      modal: { open: false },
      form: {
        movie_id: null,
        screen_id: null,
        datetime: "",
        price: "14.99"
      }
    }
  },

  async mounted() {
    await this.loadShowings()
  },

  methods: {
    async loadShowings() {
      this.loading = true
      try {
        const movies = await fetchMovies()
        let showings = []
        for (const movie of movies) {
          const s = await fetchScreenings(movie.id)
          s.forEach(showing => showing.movie_title = movie.title)
          showings = showings.concat(s)
        }
        this.allShowings = showings.sort((a, b) =>
          new Date(a.showtime) - new Date(b.showtime)
        )
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      } finally {
        this.loading = false
      }
    },

    async openModal() {
      try {
        const [movies, screens] = await Promise.all([fetchMovies(), fetchScreens()])
        this.movies = movies
        this.screens = screens
        this.form.movie_id = movies[0]?.id || null
        this.form.screen_id = screens[0]?.id || null

        const now = new Date()
        now.setMinutes(0, 0, 0)
        now.setHours(now.getHours() + 1)
        this.form.datetime = now.toISOString().slice(0, 16)

        this.modal.open = true
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      }
    },

    closeModal() { this.modal.open = false },

    async saveShowing() {
      if (!this.form.movie_id || !this.form.screen_id || !this.form.datetime || !this.form.price) {
        this.$emit("message", { text: "All fields are required.", type: "error" })
        return
      }

      const screen = this.screens.find(s => s.id === parseInt(this.form.screen_id))

      try {
        await createScreening(this.form.movie_id, {
          screen_id: parseInt(this.form.screen_id),
          screen_number: screen?.capacity || 1,
          showtime: this.form.datetime,
          price: parseFloat(this.form.price),
          seats_total: screen?.capacity || 0,
          seats_available: screen?.capacity || 0
        })
        this.$emit("message", { text: "Showing scheduled.", type: "success" })
        this.closeModal()
        await this.loadShowings()
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      }
    },

    async cancelShowing(id) {
      if (!confirm("Cancel this showing? All tickets will be deleted.")) return
      try {
        await deleteScreening(id)
        this.$emit("message", { text: "Showing cancelled.", type: "success" })
        await this.loadShowings()
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      }
    },

    formatShowtime(dt) {
      return new Date(dt).toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true
      })
    }
  }
}
</script>

<style scoped>
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.tab-header h2 { font-size: 1.3rem; }

.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.table th { text-align: left; padding: 0.75rem 1rem; background: #2a2a2a; color: #aaa; font-weight: normal; border-bottom: 1px solid #333; }
.table td { padding: 0.75rem 1rem; border-bottom: 1px solid #222; vertical-align: middle; }
.table tr:hover td { background: #1f1f1f; }

.bold { font-weight: bold; }
.muted { color: #aaa; }
.green { color: #4caf50; }

.progress-wrap { background: #222; border-radius: 99px; height: 5px; width: 80px; overflow: hidden; margin-bottom: 4px; }
.progress-bar { background: #e50914; height: 100%; border-radius: 99px; transition: width 0.3s; }

.loading { color: #aaa; padding: 1rem 0; }
.empty { color: #555; font-style: italic; padding: 1rem 0; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 100; display: flex; justify-content: center; align-items: center; }
.modal { background: #1a1a1a; border-radius: 8px; padding: 2rem; width: 90%; max-width: 520px; border: 1px solid #333; }
.modal h3 { color: #e50914; margin-bottom: 1.5rem; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.85rem; color: #aaa; }
.form-group input, .form-group select { padding: 0.7rem; background: #2a2a2a; border: 1px solid #444; border-radius: 6px; color: #fff; font-size: 0.9rem; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #e50914; }
.form-group select option { background: #2a2a2a; }

.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }

.btn { padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.9rem; font-weight: bold; transition: background 0.2s; }
.btn-primary { background: #e50914; color: white; }
.btn-primary:hover { background: #b20710; }
.btn-secondary { background: #333; color: white; }
.btn-secondary:hover { background: #444; }
.btn-danger { background: #7a0000; color: white; }
.btn-danger:hover { background: #990000; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
</style>

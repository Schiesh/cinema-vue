<template>
  <div>
    <div class="tab-header">
      <h2>Movies</h2>
      <button class="btn btn-primary" @click="openModal()">+ Add Movie</button>
    </div>

    <div v-if="loading" class="loading">Loading movies...</div>
    <div v-else-if="movies.length === 0" class="empty">No movies yet.</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Poster</th>
          <th>Title</th>
          <th>Genre</th>
          <th>Duration</th>
          <th>Rating</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="movie in movies" :key="movie.id">
          <td>
            <img
              v-if="movie.poster_url"
              :src="movie.poster_url"
              class="poster-thumb"
              alt="Poster"
            />
            <div v-else class="poster-placeholder">No poster</div>
          </td>
          <td class="bold">{{ movie.title }}</td>
          <td class="muted">{{ movie.genre }}</td>
          <td class="muted">{{ movie.duration }} mins</td>
          <td>
            <span class="badge">{{ movie.rating }}</span>
          </td>
          <td class="green">${{ parseFloat(movie.price).toFixed(2) }}</td>
          <td>
            <button class="btn btn-secondary btn-sm" @click="openModal(movie)">
              Edit
            </button>
            <button
              class="btn btn-danger btn-sm"
              @click="removeMovie(movie.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL -->
    <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ modal.editingId ? "Edit Movie" : "Add Movie" }}</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Title</label>
            <input v-model="form.title" type="text" placeholder="Movie title" />
          </div>
          <div class="form-group">
            <label>Genre</label>
            <input
              v-model="form.genre"
              type="text"
              placeholder="Action, Drama..."
            />
          </div>
          <div class="form-group">
            <label>Duration (minutes)</label>
            <input v-model="form.duration" type="number" placeholder="120" />
          </div>
          <div class="form-group">
            <label>Rating</label>
            <select v-model="form.rating">
              <option>G</option>
              <option>PG</option>
              <option>PG-13</option>
              <option>R</option>
              <option>NC-17</option>
            </select>
          </div>
          <div class="form-group">
            <label>Base Price ($)</label>
            <input
              v-model="form.price"
              type="number"
              step="0.01"
              placeholder="14.99"
            />
          </div>
          <div class="form-group">
            <label>Base Price ($)</label>
            <input
              v-model="form.price"
              type="number"
              step="0.01"
              placeholder="14.99"
            />
          </div>
          <div class="form-group full-width">
            <label>Poster URL</label>
            <input
              v-model="form.poster_url"
              type="text"
              placeholder="https://example.com/poster.jpg"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveMovie">Save Movie</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchMovies, createMovie, updateMovie, deleteMovie } from "@/api.js";

export default {
  name: "MoviesTab",
  emits: ["message"],

  data() {
    return {
      movies: [],
      loading: false,
      modal: { open: false, editingId: null },
      form: {
        title: "",
        genre: "",
        duration: "",
        rating: "PG-13",
        price: "",
        poster_url: "",
      },
    };
  },

  async mounted() {
    await this.loadMovies();
  },

  methods: {
    async loadMovies() {
      this.loading = true;
      try {
        this.movies = await fetchMovies();
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" });
      } finally {
        this.loading = false;
      }
    },

    openModal(movie = null) {
      this.modal.editingId = movie?.id || null;
      this.form = {
        title: movie?.title || "",
        genre: movie?.genre || "",
        duration: movie?.duration || "",
        rating: movie?.rating || "PG-13",
        price: movie?.price || "",
        poster_url: movie?.poster_url || "",
      };
      this.modal.open = true;
    },

    closeModal() {
      this.modal.open = false;
    },

    async saveMovie() {
      if (!this.form.title || !this.form.price) {
        this.$emit("message", {
          text: "Title and price are required.",
          type: "error",
        });
        return;
      }
      try {
        if (this.modal.editingId) {
          await updateMovie(this.modal.editingId, this.form);
          this.$emit("message", { text: "Movie updated.", type: "success" });
        } else {
          await createMovie(this.form);
          this.$emit("message", { text: "Movie added.", type: "success" });
        }
        this.closeModal();
        await this.loadMovies();
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" });
      }
    },

    async removeMovie(id) {
      if (!confirm("Delete this movie?")) return;
      try {
        await deleteMovie(id);
        this.$emit("message", { text: "Movie deleted.", type: "success" });
        await this.loadMovies();
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" });
      }
    },
  },
};
</script>

<style scoped>
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tab-header h2 {
  font-size: 1.3rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #2a2a2a;
  color: #aaa;
  font-weight: normal;
  border-bottom: 1px solid #333;
}

.table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #222;
  vertical-align: middle;
}
.table tr:hover td {
  background: #1f1f1f;
}

.bold {
  font-weight: bold;
}
.muted {
  color: #aaa;
}
.green {
  color: #4caf50;
}

.badge {
  background: #2a2a2a;
  color: #aaa;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.loading {
  color: #aaa;
  padding: 1rem 0;
}
.empty {
  color: #555;
  font-style: italic;
  padding: 1rem 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 560px;
  border: 1px solid #333;
}

.modal h3 {
  color: #e50914;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  font-size: 0.85rem;
  color: #aaa;
}

.form-group input,
.form-group select {
  padding: 0.7rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #e50914;
}
.form-group select option {
  background: #2a2a2a;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-primary {
  background: #e50914;
  color: white;
}
.btn-primary:hover {
  background: #b20710;
}
.btn-secondary {
  background: #333;
  color: white;
}
.btn-secondary:hover {
  background: #444;
}
.btn-danger {
  background: #7a0000;
  color: white;
}
.btn-danger:hover {
  background: #990000;
}
.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  margin-right: 4px;
}

.poster-thumb {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.poster-placeholder {
  width: 40px;
  height: 60px;
  background: #2a2a2a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  color: #555;
  text-align: center;
}
</style>

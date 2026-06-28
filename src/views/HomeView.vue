<template>
  <div class="home">
    <div class="header">
      <h1>🎬 Cinema Booking</h1>
      <div class="header-auth">
        <template v-if="currentUser">
          <span class="welcome">Welcome, {{ currentUser.full_name }}</span>
          <button class="btn-signout" @click="signOut">Sign Out</button>
        </template>
        <button v-else class="btn-signin" @click="showAuthModal = true">
          Sign In / Register
        </button>
      </div>
    </div>

    <AuthModal
      v-if="showAuthModal"
      @close="showAuthModal = false"
      @authenticated="onAuthenticated"
    />

    <div class="content">
      <div v-if="message.text" :class="`message ${message.type}`">
        {{ message.text }}
      </div>

      <!-- MOVIES -->
      <section class="section">
        <h2>Now Showing</h2>
        <div v-if="loading.movies" class="loading">Loading movies...</div>
        <div v-else-if="nowShowingMovies.length === 0" class="empty">
          No movies currently showing.
        </div>
        <div v-else class="movies-grid">
          <MovieCard
            v-for="movie in nowShowingMovies"
            :key="movie.id"
            :movie="movie"
            :isSelected="selectedMovie?.id === movie.id"
            @selected="selectMovie"
          />
        </div>
      </section>

      <section v-if="comingSoonMovies.length > 0" class="section">
        <h2>Coming Soon</h2>
        <div class="movies-grid">
          <MovieCard
            v-for="movie in comingSoonMovies"
            :key="movie.id"
            :movie="movie"
            :isSelected="selectedMovie?.id === movie.id"
            :isComingSoon="true"
            @selected="selectMovie"
          />
        </div>
      </section>

      <!-- SCREENINGS -->
      <div
        v-for="screening in screenings"
        :key="screening.id"
        class="screening-item"
        :class="{
          selected: selectedScreening?.id === screening.id,
          closed: !screening.bookable,
        }"
        @click="screening.bookable && selectScreening(screening)"
      >
        <div>
          <p class="showtime">{{ formatShowtime(screening.showtime) }}</p>
          <p class="screen-name">
            {{ screening.screen_name || `Screen ${screening.screen_number}` }}
          </p>
        </div>
        <div class="seats-info">
          <template v-if="screening.bookable">
            <p class="seats-available">
              {{ screening.seats_available }} seats left
            </p>
            <p class="seats-total">of {{ screening.seats_total }} total</p>
          </template>
          <span v-else class="closed-badge"
            >Booking closed — purchase at counter</span
          >
        </div>
      </div>

      <!-- SEATS -->
      <section v-if="selectedScreening" class="section">
        <h2>Select Your Seat</h2>
        <div v-if="loading.seats" class="loading">Loading seats...</div>
        <div v-else>
          <div class="screen-indicator">SCREEN</div>
          <div class="seat-map">
            <div v-for="row in seatRows" :key="row.letter" class="seat-row">
              <span class="row-label">{{ row.letter }}</span>
              <template v-for="seat in row.seats" :key="seat.id">
                <div v-if="seat.isAisle" class="aisle-gap"></div>
                <div
                  v-else
                  :class="getSeatClass(seat)"
                  @click="seat.clickable ? selectSeat(seat) : null"
                  :title="`${seat.label} — ${seat.seatType}`"
                >
                  {{ seat.icon }}
                </div>
              </template>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-box available-box"></div>
              Available
            </div>
            <div class="legend-item">
              <div class="legend-box premium-box"></div>
              Premium
            </div>
            <div class="legend-item">
              <div class="legend-box selected-box"></div>
              Selected
            </div>
            <div class="legend-item">
              <div class="legend-box sold-box"></div>
              Sold
            </div>
            <div class="legend-item">
              <div class="legend-box accessible-box"></div>
              Accessible
            </div>
          </div>
        </div>
      </section>

      <!-- BOOKING FORM -->
      <section v-if="selectedSeat" class="section">
        <h2>Your Details</h2>
        <div class="form">
          <!-- Logged in — show read-only info -->
          <template v-if="currentUser">
            <div class="booking-user-info">
              <div class="user-info-row">
                <span class="user-info-label">Booking as</span>
                <span class="user-info-value">{{ currentUser.full_name }}</span>
              </div>
              <div class="user-info-row">
                <span class="user-info-label">Email</span>
                <span class="user-info-value">{{ currentUser.email }}</span>
              </div>
            </div>
          </template>

          <!-- Guest — show editable fields -->
          <template v-else>
            <div class="form-group">
              <label>Full Name</label>
              <input
                v-model="booking.name"
                type="text"
                placeholder="Jane Smith"
              />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input
                v-model="booking.email"
                type="email"
                placeholder="jane@example.com"
              />
            </div>
          </template>

          <button
            class="book-btn"
            :disabled="loading.booking"
            @click="confirmBooking"
          >
            {{
              loading.booking ? "Booking..." : `Book Seat ${selectedSeat.label}`
            }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import MovieCard from "@/components/MovieCard.vue";
import AuthModal from "@/components/AuthModal.vue";
import {
  fetchNowShowing,
  fetchComingSoon,
  fetchScreenings,
  fetchScreening,
  fetchSeatMap,
  fetchTickets,
  bookTicket,
} from "@/api.js";

export default {
  name: "HomeView",
  components: { MovieCard, AuthModal },

  data() {
    return {
      nowShowingMovies: [],
      comingSoonMovies: [],
      screenings: [],
      seatRows: [],
      selectedMovie: null,
      selectedScreening: null,
      selectedSeat: null,
      booking: { name: "", email: "" },
      loading: {
        movies: false,
        screenings: false,
        seats: false,
        booking: false,
      },
      message: { text: "", type: "" },
      showAuthModal: false,
      currentUser: null,
    };
  },

  watch: {
    currentUser(user) {
      if (user) {
        this.booking.name = user.full_name;
        this.booking.email = user.email;
      } else {
        this.booking.name = "";
        this.booking.email = "";
      }
    },
  },

  async mounted() {
    await this.loadMovies();
    const token = localStorage.getItem("customer_token");
    if (token) {
      this.currentUser = {
        full_name: localStorage.getItem("customer_name"),
        email: localStorage.getItem("customer_email"),
      };
      this.booking.name = this.currentUser.full_name;
      this.booking.email = this.currentUser.email;
    }
  },

  methods: {
    async loadMovies() {
      this.loading.movies = true;
      try {
        const [nowShowing, comingSoon] = await Promise.all([
          fetchNowShowing(),
          fetchComingSoon(),
        ]);
        this.nowShowingMovies = nowShowing;
        this.comingSoonMovies = comingSoon;
      } catch (error) {
        this.showMessage(error.message, "error");
      } finally {
        this.loading.movies = false;
      }
    },

    async selectMovie(movie) {
      this.selectedMovie = movie;
      this.selectedScreening = null;
      this.selectedSeat = null;
      this.seatRows = [];
      this.loading.screenings = true;
      try {
        this.screenings = await fetchScreenings(movie.id);
      } catch (error) {
        this.showMessage(error.message, "error");
      } finally {
        this.loading.screenings = false;
      }
    },

    async selectScreening(screening) {
      this.selectedScreening = screening;
      this.selectedSeat = null;
      this.seatRows = [];
      this.loading.seats = true;
      try {
        const [tickets, screeningDetail] = await Promise.all([
          fetchTickets(screening.id),
          fetchScreening(screening.id),
        ]);

        const ticketBySeat = {};
        tickets.forEach((t) => {
          ticketBySeat[t.seat_number] = t;
        });

        if (screeningDetail.screen_id) {
          await this.buildSeatMapRows(screeningDetail.screen_id, ticketBySeat);
        } else {
          this.buildFlatRows(tickets);
        }
      } catch (error) {
        this.showMessage(error.message, "error");
      } finally {
        this.loading.seats = false;
      }
    },

    async buildSeatMapRows(screenId, ticketBySeat) {
      const seatMap = await fetchSeatMap(screenId);
      this.seatRows = seatMap.seat_map_rows.map((row) => {
        const seats = [];
        row.seats.forEach((seat) => {
          if (row.has_aisle && row.aisle_after_seat === seat.position - 1) {
            seats.push({
              isAisle: true,
              id: `aisle-${row.row_letter}-${seat.position}`,
            });
          }
          const ticket = ticketBySeat[seat.label];
          const status = ticket ? ticket.status : "unavailable";
          seats.push({
            id: seat.id,
            ticketId: ticket?.id,
            label: seat.label,
            seatType: seat.seat_type,
            status,
            active: seat.active,
            isAisle: false,
            clickable: status === "available" && seat.active,
            icon:
              seat.seat_type === "wheelchair"
                ? "♿"
                : seat.seat_type === "companion"
                ? "♿+"
                : seat.label,
          });
        });
        return { letter: row.row_letter, seats };
      });
    },

    buildFlatRows(tickets) {
      const rowMap = {};
      tickets.forEach((ticket) => {
        const letter = ticket.seat_number[0];
        if (!rowMap[letter]) rowMap[letter] = [];
        rowMap[letter].push({
          id: ticket.id,
          ticketId: ticket.id,
          label: ticket.seat_number,
          seatType: "standard",
          status: ticket.status,
          active: true,
          isAisle: false,
          clickable: ticket.status === "available",
          icon: ticket.seat_number,
        });
      });
      this.seatRows = Object.keys(rowMap)
        .sort()
        .map((letter) => ({
          letter,
          seats: rowMap[letter],
        }));
    },

    getSeatClass(seat) {
      if (!seat.active) return "seat inactive";
      if (seat === this.selectedSeat) return "seat selected";
      if (seat.status === "sold") return "seat sold";
      if (seat.status === "available") return `seat available ${seat.seatType}`;
      return "seat unavailable";
    },

    selectSeat(seat) {
      this.selectedSeat = seat;
    },

    async confirmBooking() {
      if (!this.booking.name.trim() || !this.booking.email.trim()) {
        this.showMessage("Please enter your name and email.", "error");
        return;
      }
      this.loading.booking = true;
      try {
        const result = await bookTicket(
          this.selectedSeat.ticketId,
          this.booking.name,
          this.booking.email,
        );
        this.showMessage(
          `✅ Booking confirmed! Seat ${result.ticket.seat_number} booked for ${result.ticket.customer_name}.`,
          "success",
        );
        await this.selectScreening(this.selectedScreening);
        this.selectedSeat = null;
        this.booking = { name: "", email: "" };
      } catch (error) {
        this.showMessage(error.message, "error");
      } finally {
        this.loading.booking = false;
      }
    },

    showMessage(text, type) {
      this.message = { text, type };
      setTimeout(() => {
        this.message = { text: "", type: "" };
      }, 5000);
    },

    formatShowtime(datetime) {
      return new Date(datetime).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },

    onAuthenticated(data) {
      localStorage.setItem("customer_token", data.token);
      localStorage.setItem("customer_name", data.full_name);
      localStorage.setItem("customer_email", data.email);
      this.currentUser = { full_name: data.full_name, email: data.email };
      this.showAuthModal = false;
    },

    signOut() {
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer_name");
      localStorage.removeItem("customer_email");
      this.currentUser = null;
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
  border-bottom: 2px solid var(--color-primary);
}

.header h1 {
  color: var(--color-primary);
  font-size: 1.5rem;
}

.header-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.btn-signin {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
}

.btn-signout {
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid #444;
  border-radius: 4px;
  color: #aaa;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-signout:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.section {
  margin-bottom: 2.5rem;
}
.section h2 {
  color: var(--color-primary);
  margin-bottom: 1.25rem;
  font-size: 1.2rem;
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

.message {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.message.success {
  background: #1a3a1a;
  color: var(--color-success);
  border-color: var(--color-success);
}
.message.error {
  background: #3a1a1a;
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.screenings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.screening-item {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s;
}

.screening-item:hover {
  border-color: var(--color-primary);
}
.screening-item.selected {
  border-color: var(--color-primary);
}
.showtime {
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.screen-name {
  font-size: 0.85rem;
  color: #aaa;
}
.seats-available {
  color: var(--color-success);
  font-weight: bold;
  text-align: right;
}
.seats-total {
  font-size: 0.8rem;
  color: #aaa;
  text-align: right;
}

.screen-indicator {
  text-align: center;
  background: #2a2a2a;
  color: #aaa;
  padding: 0.4rem;
  border-radius: 4px;
  margin-bottom: 1.25rem;
  font-size: 0.8rem;
  letter-spacing: 3px;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-x: auto;
}
.seat-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-label {
  width: 20px;
  text-align: center;
  color: #aaa;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
}

.aisle-gap {
  width: 20px;
  flex-shrink: 0;
}

.seat {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.58rem;
  font-weight: bold;
  border: 2px solid transparent;
  flex-shrink: 0;
  transition: all 0.15s;
}

.seat.available {
  background: #2a2a2a;
  border-color: #555;
  color: #fff;
  cursor: pointer;
}
.seat.available:hover {
  border-color: var(--color-primary);
}
.seat.available.premium {
  background: #3a2a1a;
  border-color: #ffb74d;
  color: #ffb74d;
}
.seat.available.wheelchair,
.seat.available.companion {
  background: #1a2a3a;
  border-color: var(--color-info);
  color: var(--color-info);
}
.seat.selected {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: #fff !important;
  cursor: pointer;
}
.seat.sold {
  background: #1a1a1a;
  border-color: #333;
  color: #444;
  cursor: not-allowed;
}
.seat.inactive {
  background: #111;
  border-color: #1a1a1a;
  color: #222;
  cursor: not-allowed;
}
.seat.unavailable {
  background: #111;
  border-color: #1a1a1a;
  color: #222;
  cursor: not-allowed;
}

.legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #aaa;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid #555;
}
.available-box {
  background: #2a2a2a;
}
.premium-box {
  background: #3a2a1a;
  border-color: #ffb74d;
}
.selected-box {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.sold-box {
  background: #1a1a1a;
  border-color: #333;
}
.accessible-box {
  background: #1a2a3a;
  border-color: var(--color-info);
}

.form {
  max-width: 480px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.form-group label {
  font-size: 0.85rem;
  color: #aaa;
}

.form-group input {
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.95rem;
}

.form-group input:focus {
  outline: none;
  border-color: #e50914;
}

.book-btn {
  width: 100%;
  padding: 0.9rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.book-btn:hover {
  filter: brightness(0.85);
}
.book-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.screening-item.closed {
  cursor: default;
  opacity: 0.5;
}

.screening-item.closed:hover {
  border-color: transparent;
}

.closed-badge {
  display: inline-block;
  background: rgba(244, 67, 54, 0.15);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  white-space: nowrap;
}

.welcome {
  font-size: 0.85rem;
  color: #aaa;
}

.booking-user-info {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.user-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
}

.user-info-row + .user-info-row {
  border-top: 1px solid #222;
}

.user-info-label {
  font-size: 0.8rem;
  color: #888;
}

.user-info-value {
  font-size: 0.9rem;
  color: #fff;
  font-weight: bold;
}
</style>

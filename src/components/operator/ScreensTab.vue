<template>
  <div>
    <div class="tab-header">
      <h2>Screens</h2>
      <button class="btn btn-primary" @click="openModal()">+ Add Screen</button>
    </div>

    <div v-if="loading" class="loading">Loading screens...</div>
    <div v-else-if="screens.length === 0" class="empty">No screens configured.</div>

    <div v-else class="screens-list">
      <div v-for="screen in screens" :key="screen.id" class="screen-card">
        <div class="screen-info">
          <div class="screen-name">
            {{ screen.name }}
            <span :class="`badge badge-${screen.screen_type.toLowerCase().replace(' ', '-')}`">
              {{ screen.screen_type }}
            </span>
          </div>
          <div class="screen-meta">Capacity: {{ screen.capacity }} seats</div>
          <div v-if="screen.description" class="screen-desc">{{ screen.description }}</div>
        </div>
        <div class="screen-actions">
          <button class="btn btn-secondary btn-sm" @click="openModal(screen)">Edit</button>
          <button class="btn btn-secondary btn-sm" @click="openSeatMap(screen)">Seat Map</button>
          <button class="btn btn-danger btn-sm" @click="removeScreen(screen.id)">Remove</button>
        </div>
      </div>
    </div>

    <!-- SCREEN MODAL -->
    <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ modal.editingId ? "Edit Screen" : "Add Screen" }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Screen Name</label>
            <input v-model="form.name" type="text" placeholder="Screen 1">
          </div>
          <div class="form-group">
            <label>Screen Type</label>
            <select v-model="form.screen_type">
              <option>Standard</option>
              <option>PLF</option>
              <option>IMAX</option>
              <option>4DX</option>
              <option>Dolby Cinema</option>
              <option>ScreenX</option>
            </select>
          </div>
          <div class="form-group">
            <label>Capacity</label>
            <input v-model="form.capacity" type="number" placeholder="120">
          </div>
          <div class="form-group full-width">
            <label>Description</label>
            <textarea v-model="form.description" rows="2" placeholder="Notes about this screen"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveScreen">Save Screen</button>
        </div>
      </div>
    </div>

    <!-- SEAT MAP MODAL -->
    <div v-if="seatMapModal.open" class="modal-overlay" @click.self="closeSeatMap">
      <div class="modal modal-wide">
        <h3>Seat Map — {{ seatMapModal.screenName }}</h3>

        <div v-if="seatMapModal.loading" class="loading">Loading seat map...</div>

        <!-- no seat map yet — show builder -->
        <div v-else-if="!seatMapModal.seatMap">
          <p class="muted-text">No seat map configured for this screen yet.</p>
          <div class="form-grid" style="margin-top:1rem">
            <div class="form-group">
              <label>Number of Rows</label>
              <input v-model="seatMapForm.rows" type="number" placeholder="8" min="1" max="26">
            </div>
            <div class="form-group">
              <label>Seats Per Row</label>
              <input v-model="seatMapForm.seats_per_row" type="number" placeholder="10" min="1" max="50">
            </div>
            <div class="form-group">
              <label>Has Centre Aisle?</label>
              <select v-model="seatMapForm.has_aisle">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div class="form-group">
              <label>Aisle After Seat #</label>
              <input v-model="seatMapForm.aisle_after_seat" type="number" placeholder="5">
            </div>
          </div>
          <button class="btn btn-primary" @click="buildSeatMap">Generate Seat Map</button>
        </div>

        <!-- seat map exists — show grid -->
        <div v-else>
          <div class="seat-map-stats">
            {{ seatMapModal.seatMap.total_seats }} seats —
            {{ seatMapModal.seatMap.standard_seats }} standard,
            {{ seatMapModal.seatMap.premium_seats }} premium,
            {{ seatMapModal.seatMap.accessible_seats }} accessible
          </div>
          <p class="muted-text" style="margin-bottom:1rem; font-size:0.8rem;">
            Click any seat to cycle: standard → premium → wheelchair → companion → inactive
          </p>
          <div class="seat-map-container">
            <div class="screen-label">SCREEN</div>
            <div v-for="row in seatMapModal.seatMap.seat_map_rows" :key="row.id" class="seat-row">
              <span class="row-label">{{ row.row_letter }}</span>
              <template v-for="seat in row.seats" :key="seat.id">
                <div
                  v-if="row.has_aisle && row.aisle_after_seat === seat.position - 1"
                  class="aisle-gap"
                ></div>
                <button
                  :class="getSeatClass(seat)"
                  @click="cycleSeat(seat)"
                  :title="`${seat.label} — ${seat.seat_type}`"
                >
                  {{ seat.label }}
                </button>
              </template>
            </div>
          </div>
          <div class="seat-legend">
            <div class="legend-item"><div class="ls standard"></div> Standard</div>
            <div class="legend-item"><div class="ls premium"></div> Premium</div>
            <div class="legend-item"><div class="ls wheelchair"></div> Accessible</div>
            <div class="legend-item"><div class="ls inactive"></div> Inactive</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeSeatMap">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  fetchScreens, createScreen, updateScreen, deleteScreen,
  fetchSeatMap, createSeatMap, updateSeat
} from "@/api.js"

const SEAT_CYCLE = ["standard", "premium", "wheelchair", "companion", "inactive"]

export default {
  name: "ScreensTab",
  emits: ["message"],

  data() {
    return {
      screens: [],
      loading: false,
      modal: { open: false, editingId: null },
      form: { name: "", screen_type: "Standard", capacity: "", description: "" },
      seatMapModal: {
        open: false,
        loading: false,
        screenId: null,
        screenName: "",
        seatMap: null
      },
      seatMapForm: {
        rows: "",
        seats_per_row: "",
        has_aisle: "false",
        aisle_after_seat: ""
      }
    }
  },

  async mounted() {
    await this.loadScreens()
  },

  methods: {
    async loadScreens() {
      this.loading = true
      try {
        this.screens = await fetchScreens()
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      } finally {
        this.loading = false
      }
    },

    openModal(screen = null) {
      this.modal.editingId = screen?.id || null
      this.form = {
        name: screen?.name || "",
        screen_type: screen?.screen_type || "Standard",
        capacity: screen?.capacity || "",
        description: screen?.description || ""
      }
      this.modal.open = true
    },

    closeModal() { this.modal.open = false },

    async saveScreen() {
      if (!this.form.name || !this.form.capacity) {
        this.$emit("message", { text: "Name and capacity are required.", type: "error" })
        return
      }
      try {
        if (this.modal.editingId) {
          await updateScreen(this.modal.editingId, this.form)
          this.$emit("message", { text: "Screen updated.", type: "success" })
        } else {
          await createScreen(this.form)
          this.$emit("message", { text: "Screen added.", type: "success" })
        }
        this.closeModal()
        await this.loadScreens()
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      }
    },

    async removeScreen(id) {
      if (!confirm("Remove this screen?")) return
      try {
        await deleteScreen(id)
        this.$emit("message", { text: "Screen removed.", type: "success" })
        await this.loadScreens()
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      }
    },

    async openSeatMap(screen) {
      this.seatMapModal = {
        open: true,
        loading: true,
        screenId: screen.id,
        screenName: screen.name,
        seatMap: null
      }
      try {
        this.seatMapModal.seatMap = await fetchSeatMap(screen.id)
      } catch {
        this.seatMapModal.seatMap = null
      } finally {
        this.seatMapModal.loading = false
      }
    },

    closeSeatMap() { this.seatMapModal.open = false },

    async buildSeatMap() {
      if (!this.seatMapForm.rows || !this.seatMapForm.seats_per_row) {
        this.$emit("message", { text: "Rows and seats per row are required.", type: "error" })
        return
      }
      try {
        this.seatMapModal.seatMap = await createSeatMap(this.seatMapModal.screenId, {
          rows: parseInt(this.seatMapForm.rows),
          seats_per_row: parseInt(this.seatMapForm.seats_per_row),
          has_aisle: this.seatMapForm.has_aisle,
          aisle_after_seat: this.seatMapForm.aisle_after_seat || null
        })
        this.$emit("message", { text: "Seat map created.", type: "success" })
      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      }
    },

    getSeatClass(seat) {
      if (!seat.active) return "seat-btn inactive"
      const type = seat.seat_type
      if (type === "premium") return "seat-btn premium"
      if (type === "wheelchair" || type === "companion") return "seat-btn accessible"
      return "seat-btn"
    },

    async cycleSeat(seat) {
      const current = !seat.active ? "inactive" : seat.seat_type
      const nextType = SEAT_CYCLE[(SEAT_CYCLE.indexOf(current) + 1) % SEAT_CYCLE.length]
      const isInactive = nextType === "inactive"

      try {
        await updateSeat(seat.id, {
          seat_type: isInactive ? seat.seat_type : nextType,
          active: !isInactive
        })

        seat.seat_type = isInactive ? seat.seat_type : nextType
        seat.active = !isInactive

      } catch (error) {
        this.$emit("message", { text: error.message, type: "error" })
      }
    }
  }
}
</script>

<style scoped>
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.tab-header h2 { font-size: 1.3rem; }

.screens-list { display: flex; flex-direction: column; gap: 1rem; }

.screen-card {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.screen-name { font-size: 1rem; font-weight: bold; margin-bottom: 0.4rem; }
.screen-meta { font-size: 0.85rem; color: #aaa; }
.screen-desc { font-size: 0.8rem; color: #555; margin-top: 0.25rem; }
.screen-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: bold;
  margin-left: 0.5rem;
  background: #2a2a2a;
  color: #aaa;
}

.badge-plf { background: #1a3a5c; color: #4a9eff; }
.badge-imax { background: #1a3a1a; color: #4caf50; }
.badge-4dx { background: #3a1a3a; color: #ce93d8; }
.badge-dolby-cinema { background: #3a2a1a; color: #ffb74d; }

.loading { color: #aaa; padding: 1rem 0; }
.empty { color: #555; font-style: italic; padding: 1rem 0; }
.muted-text { color: #aaa; font-size: 0.9rem; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.8);
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
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #333;
}

.modal-wide { max-width: 800px; }
.modal h3 { color: #e50914; margin-bottom: 1.5rem; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; color: #aaa; }

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.7rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus { outline: none; border-color: #e50914; }
.form-group select option { background: #2a2a2a; }

.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }

.seat-map-stats { color: #aaa; font-size: 0.85rem; margin-bottom: 0.75rem; }

.seat-map-container {
  background: #111;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.screen-label {
  text-align: center;
  background: #333;
  color: #aaa;
  padding: 0.4rem;
  border-radius: 4px;
  margin-bottom: 1.25rem;
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.seat-row { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
.row-label { width: 20px; text-align: center; color: #aaa; font-size: 0.75rem; font-weight: bold; flex-shrink: 0; }
.aisle-gap { width: 20px; flex-shrink: 0; }

.seat-btn {
  width: 34px;
  height: 34px;
  border-radius: 4px;
  border: 2px solid #444;
  background: #2a2a2a;
  color: #fff;
  font-size: 0.6rem;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.seat-btn:hover { border-color: #e50914; }
.seat-btn.premium { background: #3a2a1a; border-color: #ffb74d; color: #ffb74d; }
.seat-btn.accessible { background: #1a2a3a; border-color: #4a9eff; color: #4a9eff; }
.seat-btn.inactive { background: #111; border-color: #222; color: #333; }

.seat-legend { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; color: #aaa; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.ls { width: 14px; height: 14px; border-radius: 3px; border: 2px solid #444; }
.ls.standard { background: #2a2a2a; }
.ls.premium { background: #3a2a1a; border-color: #ffb74d; }
.ls.wheelchair { background: #1a2a3a; border-color: #4a9eff; }
.ls.inactive { background: #111; border-color: #222; }

.btn { padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.9rem; font-weight: bold; transition: background 0.2s; }
.btn-primary { background: #e50914; color: white; }
.btn-primary:hover { background: #b20710; }
.btn-secondary { background: #333; color: white; }
.btn-secondary:hover { background: #444; }
.btn-danger { background: #7a0000; color: white; }
.btn-danger:hover { background: #990000; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
</style>

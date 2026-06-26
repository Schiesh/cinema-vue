<template>
  <div>
    <div class="tab-header">
      <h2>User Management</h2>
      <button class="btn-add" @click="openModal()">+ Add User</button>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-tab"
        :class="{ active: activeFilter === f.value }"
        @click="setFilter(f.value)"
      >
        {{ f.label }}
      </button>
      <label class="inactive-toggle">
        <input type="checkbox" v-model="showInactive" @change="loadUsers" />
        Show Archived
      </label>
    </div>

    <div v-if="loading" class="loading">Loading users...</div>

    <div v-else-if="users.length === 0" class="empty">No users found.</div>

    <table v-else class="users-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Employee ID</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          :class="{ inactive: !user.active }"
        >
          <td class="bold">{{ user.full_name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span class="role-badge" :class="user.role">{{ user.role }}</span>
          </td>
          <td>{{ user.employee_id || "—" }}</td>
          <td>
            <span
              class="status-badge"
              :class="{ active: user.active, archived: !user.active }"
            >
              {{ user.active ? "Active" : "Archived" }}
            </span>
          </td>
          <td>
            <button class="btn-edit" @click="openModal(user)">Edit</button>
            <button
              v-if="user.active"
              class="btn-archive"
              @click="archiveUser(user)"
            >
              Archive
            </button>
            <button v-else class="btn-restore" @click="restoreUser(user)">
              Restore
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ modal.editingId ? "Edit User" : "Add User" }}</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>First Name</label>
            <input
              v-model="form.first_name"
              type="text"
              placeholder="First name"
            />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input
              v-model="form.last_name"
              type="text"
              placeholder="Last name"
            />
          </div>
          <div class="form-group full-width">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
            />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="form.phone" type="text" placeholder="555-1234" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="form.role">
              <option value="operator">Operator</option>
              <option value="cashier">Cashier</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <!-- Employee fields - only show for operators/cashiers -->
          <template v-if="form.role !== 'customer'">
            <div class="form-group">
              <label>Employee ID</label>
              <input
                v-model="form.employee_id"
                type="text"
                placeholder="4 digits"
              />
            </div>
            <div class="form-group">
              <label>PIN Length</label>
              <select v-model="form.pin_length">
                <option :value="4">4 digits</option>
                <option :value="6">6 digits</option>
              </select>
            </div>
            <div class="form-group">
              <label
                >PIN
                {{
                  modal.editingId ? "(leave blank to keep current)" : ""
                }}</label
              >
              <input
                v-model="form.pin"
                type="password"
                placeholder="Enter PIN"
              />
            </div>
            <div class="form-group">
              <label>Confirm PIN</label>
              <input
                v-model="form.pin_confirmation"
                type="password"
                placeholder="Confirm PIN"
              />
            </div>
          </template>

          <!-- Password fields -->
          <template v-if="form.role === 'operator' || form.role === 'customer'">
            <div class="form-group">
              <label
                >Password
                {{
                  modal.editingId ? "(leave blank to keep current)" : ""
                }}</label
              >
              <input
                v-model="form.password"
                type="password"
                placeholder="Enter password"
              />
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input
                v-model="form.password_confirmation"
                type="password"
                placeholder="Confirm password"
              />
            </div>
          </template>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Cancel</button>
          <button class="btn-save" @click="saveUser">
            {{ modal.editingId ? "Save Changes" : "Create User" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchUsers, createUser, updateUser, deactivateUser } from "@/api.js";

export default {
  name: "UsersTab",
  emits: ["message"],

  data() {
    return {
      users: [],
      loading: false,
      activeFilter: null,
      showInactive: false,
      modal: { open: false, editingId: null },
      form: this.emptyForm(),
      filters: [
        { label: "All Users", value: null },
        { label: "Employees", value: "employees" },
        { label: "Customers", value: "customers" },
      ],
    };
  },

  async mounted() {
    await this.loadUsers();
  },

  methods: {
    emptyForm() {
      return {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "cashier",
        employee_id: "",
        pin_length: 4,
        pin: "",
        pin_confirmation: "",
        password: "",
        password_confirmation: "",
      };
    },

    async loadUsers() {
      this.loading = true;
      try {
        this.users = await fetchUsers(this.activeFilter, this.showInactive);
      } catch (e) {
        this.$emit("message", { text: e.message, type: "error" });
      } finally {
        this.loading = false;
      }
    },

    async setFilter(filter) {
      this.activeFilter = filter;
      await this.loadUsers();
    },

    openModal(user = null) {
      this.modal.editingId = user?.id || null;
      this.form = user
        ? {
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "cashier",
            employee_id: user.employee_id || "",
            pin_length: user.pin_length || 4,
            pin: "",
            pin_confirmation: "",
            password: "",
            password_confirmation: "",
          }
        : this.emptyForm();
      this.modal.open = true;
    },

    closeModal() {
      this.modal.open = false;
      this.form = this.emptyForm();
    },

    async saveUser() {
      const payload = { ...this.form };
      if (!payload.pin) {
        delete payload.pin;
        delete payload.pin_confirmation;
      }
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      try {
        if (this.modal.editingId) {
          await updateUser(this.modal.editingId, payload);
          this.$emit("message", {
            text: "User updated successfully.",
            type: "success",
          });
        } else {
          await createUser(payload);
          this.$emit("message", {
            text: "User created successfully.",
            type: "success",
          });
        }
        this.closeModal();
        await this.loadUsers();
      } catch (e) {
        this.$emit("message", { text: e.message, type: "error" });
      }
    },

    async archiveUser(user) {
      try {
        await deactivateUser(user.id);
        this.$emit("message", {
          text: `${user.full_name} archived.`,
          type: "success",
        });
        await this.loadUsers();
      } catch (e) {
        this.$emit("message", { text: e.message, type: "error" });
      }
    },

    async restoreUser(user) {
      try {
        await updateUser(user.id, { active: true });
        this.$emit("message", {
          text: `${user.full_name} restored.`,
          type: "success",
        });
        await this.loadUsers();
      } catch (e) {
        this.$emit("message", { text: e.message, type: "error" });
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

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #333;
  padding-bottom: 0.75rem;
}

.filter-tab {
  padding: 0.4rem 1rem;
  background: transparent;
  border: 1px solid #333;
  border-radius: 20px;
  color: #aaa;
  font-size: 0.85rem;
  cursor: pointer;
}

.filter-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.inactive-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #888;
  font-size: 0.8rem;
  cursor: pointer;
}

.loading {
  color: #aaa;
  padding: 1rem 0;
}
.empty {
  color: #555;
  padding: 2rem 0;
  text-align: center;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  color: #888;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #333;
}

.users-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #222;
  font-size: 0.9rem;
}

.users-table tr.inactive td {
  opacity: 0.5;
}
.bold {
  font-weight: bold;
}

.role-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: capitalize;
}

.role-badge.operator {
  background: rgba(74, 158, 255, 0.2);
  color: #4a9eff;
}
.role-badge.cashier {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}
.role-badge.customer {
  background: rgba(229, 9, 20, 0.2);
  color: var(--color-primary);
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-badge.active {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}
.status-badge.archived {
  background: rgba(255, 255, 255, 0.05);
  color: #666;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.btn-edit,
.btn-archive,
.btn-restore {
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.3rem;
}

.btn-edit {
  background: #333;
  color: white;
}
.btn-archive {
  background: #3a1a1a;
  color: #f44336;
}
.btn-restore {
  background: #1a3a1a;
  color: #4caf50;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  width: 580px;
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid #333;
}

.modal h3 {
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  font-size: 0.8rem;
  color: #aaa;
}

.form-group input,
.form-group select {
  padding: 0.6rem;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.6rem 1.2rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save {
  padding: 0.6rem 1.2rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
</style>

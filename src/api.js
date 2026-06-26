const API = process.env.VUE_APP_API_URL || "http://localhost:3001";

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── MOVIES ──────────────────────────────────────────────────────
export async function fetchMovies() {
  const res = await fetch(`${API}/movies`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}

export async function createMovie(data) {
  const res = await fetch(`${API}/movies`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ movie: data }),
  });
  if (!res.ok) throw new Error("Failed to create movie");
  return res.json();
}

export async function updateMovie(id, data) {
  const res = await fetch(`${API}/movies/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ movie: data }),
  });
  if (!res.ok) throw new Error("Failed to update movie");
  return res.json();
}

export async function deleteMovie(id) {
  const res = await fetch(`${API}/movies/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete movie");
}

export async function fetchNowShowing() {
  const res = await fetch(`${API}/movies/now_showing`);
  if (!res.ok) throw new Error("Failed to fetch now showing movies");
  return res.json();
}

export async function fetchComingSoon() {
  const res = await fetch(`${API}/movies/coming_soon`);
  if (!res.ok) throw new Error("Failed to fetch coming soon movies");
  return res.json();
}

// ── SCREENS ─────────────────────────────────────────────────────
export async function fetchScreens() {
  const res = await fetch(`${API}/screens`);
  if (!res.ok) throw new Error("Failed to fetch screens");
  return res.json();
}

export async function createScreen(data) {
  const res = await fetch(`${API}/screens`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ screen: data }),
  });
  if (!res.ok) throw new Error("Failed to create screen");
  return res.json();
}

export async function updateScreen(id, data) {
  const res = await fetch(`${API}/screens/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ screen: data }),
  });
  if (!res.ok) throw new Error("Failed to update screen");
  return res.json();
}

export async function deleteScreen(id) {
  const res = await fetch(`${API}/screens/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete screen");
}

// ── SEAT MAPS ────────────────────────────────────────────────────
export async function fetchSeatMap(screenId) {
  const res = await fetch(`${API}/screens/${screenId}/seat_map`);
  if (!res.ok) throw new Error("Failed to fetch seat map");
  return res.json();
}

export async function createSeatMap(screenId, data) {
  const res = await fetch(`${API}/screens/${screenId}/seat_map`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ seat_map: data }),
  });
  if (!res.ok) throw new Error("Failed to create seat map");
  return res.json();
}

export async function updateSeat(seatId, data) {
  const res = await fetch(`${API}/seats/${seatId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ seat: data }),
  });
  if (!res.ok) throw new Error("Failed to update seat");
  return res.json();
}

// ── SCREENINGS ───────────────────────────────────────────────────
export async function fetchScreenings(movieId) {
  const res = await fetch(`${API}/movies/${movieId}/screenings`);
  if (!res.ok) throw new Error("Failed to fetch screenings");
  return res.json();
}

export async function fetchScreening(screeningId) {
  const res = await fetch(`${API}/screenings/${screeningId}`);
  if (!res.ok) throw new Error("Failed to fetch screening");
  return res.json();
}

export async function createScreening(movieId, data) {
  const res = await fetch(`${API}/movies/${movieId}/screenings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ screening: data }),
  });
  if (!res.ok) throw new Error("Failed to create screening");
  return res.json();
}

export async function deleteScreening(id) {
  const res = await fetch(`${API}/screenings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete screening");
}

// ── TICKETS ──────────────────────────────────────────────────────
export async function fetchTickets(screeningId) {
  const res = await fetch(`${API}/screenings/${screeningId}/tickets`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function bookTicket(ticketId, customerName, customerEmail) {
  const res = await fetch(`${API}/tickets/${ticketId}/book`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      customer_name: customerName,
      customer_email: customerEmail,
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Booking failed");
  }
  return res.json();
}
// ── Theme ──────────────────────────────────────────────────────
export async function fetchTheme() {
  const res = await fetch(`${API}/theme`);
  if (!res.ok) throw new Error("Failed to fetch theme");
  return res.json();
}

export async function updateTheme(data) {
  const res = await fetch(`${API}/theme`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ theme: data }),
  });
  if (!res.ok) throw new Error("Failed to update theme");
  return res.json();
}

// ── Site Settings ──────────────────────────────────────────────────────
export async function fetchSiteSettings() {
  const res = await fetch(`${API}/site_settings`);
  if (!res.ok) throw new Error("Failed to fetch site settings");
  return res.json();
}

export async function updateSiteSettings(data) {
  const res = await fetch(`${API}/site_settings`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ site_setting: data }),
  });
  if (!res.ok) throw new Error("Failed to update site settings");
  return res.json();
}

// ── Operator Login ──────────────────────────────────────────────────────
export async function loginOperator(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  return res.json();
}

export async function fetchUsers(filter = null, includeInactive = false) {
  const params = new URLSearchParams();
  if (filter) params.append("filter", filter);
  if (includeInactive) params.append("include_inactive", "true");
  const res = await fetch(`${API}/users?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(data) {
  const res = await fetch(`${API}/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user: data }),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API}/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ user: data }),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function deactivateUser(id) {
  const res = await fetch(`${API}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to deactivate user");
}

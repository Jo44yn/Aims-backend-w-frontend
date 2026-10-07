// AIMS API service — talks to the Laravel backend at http://127.0.0.1:8000
const BASE = 'http://127.0.0.1:8000/api/v1'

// ── Token helpers ──────────────────────────────────────────────────────────
export function getToken() {
  try { return localStorage.getItem('aims_token') } catch { return null }
}
function setToken(t) {
  try { localStorage.setItem('aims_token', t) } catch {}
}
function clearToken() {
  try { localStorage.removeItem('aims_token'); localStorage.removeItem('aims_user') } catch {}
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem('aims_user') || 'null') } catch { return null }
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...(opts.headers || {}) }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { ...opts, headers })
  if (res.status === 401) {
    clearToken()
    location.href = 'login.html'
    throw new Error('Unauthenticated')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

// ── Auth ───────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  try { localStorage.setItem('aims_user', JSON.stringify(data.user)) } catch {}
  return data
}

export async function logout() {
  try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
  clearToken()
}

export function isAuthenticated() {
  return !!getToken()
}

// ── Data endpoints ─────────────────────────────────────────────────────────
export const api = {
  contracts:      () => apiFetch('/contracts'),
  contract:       (id) => apiFetch('/contracts/' + id),
  purchaseOrders: () => apiFetch('/purchase-orders'),
  movements:      () => apiFetch('/inventory/movements'),
  invoices:       () => apiFetch('/invoices'),
}

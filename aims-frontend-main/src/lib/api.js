// AIMS API service — talks to the Laravel backend.
// Override the address with VITE_API_URL in aims-frontend-main/.env if needed.
const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

// ── Session helpers ────────────────────────────────────────────────────────
export function getToken() {
  try { return localStorage.getItem('aims_token') } catch { return null }
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem('aims_user') || 'null') } catch { return null }
}
function saveSession(data) {
  try {
    localStorage.setItem('aims_token', data.token || data.access_token)
    saveUser(data.user)
  } catch {}
}
function saveUser(user) {
  try {
    localStorage.setItem('aims_user', JSON.stringify(user))
    localStorage.setItem('aims_role', user.role || 'gm')
  } catch {}
}
function clearSession() {
  try { ['aims_token', 'aims_user', 'aims_role'].forEach((k) => localStorage.removeItem(k)) } catch {}
}
export function isAuthenticated() {
  return !!getToken()
}
// Which page a signed-in user belongs on.
export const homeFor = (user) => (user && user.role === 'client' ? 'portal.html' : 'app.html')

// ── Core fetch wrapper ─────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message)
    this.status = status
    this.errors = errors // Laravel validation errors: { field: ['msg'] }
  }
  // { field: 'first message' } for the form helper
  get fields() {
    return Object.fromEntries(Object.entries(this.errors || {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]))
  }
}

async function apiFetch(path, opts = {}) {
  const { auth = true, ...init } = opts
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...(init.headers || {}) }
  const token = getToken()
  if (auth && token) headers.Authorization = 'Bearer ' + token

  let res
  try {
    res = await fetch(BASE + path, { ...init, headers })
  } catch {
    throw new ApiError('Cannot connect to the server. Make sure the backend is running.')
  }
  const body = await res.json().catch(() => ({}))

  if (res.status === 401 && auth) {
    clearSession()
    location.href = 'login.html'
    throw new ApiError('Your session has expired. Please sign in again.', 401)
  }
  if (!res.ok) throw new ApiError(body.message || `Request failed (${res.status})`, res.status, body.errors)
  return body
}
const send = (method, path, payload) => apiFetch(path, { method, body: JSON.stringify(payload) })

// ── Auth ───────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const data = await apiFetch('/auth/login', { method: 'POST', auth: false, body: JSON.stringify({ email, password }) })
  saveSession(data)
  return data
}

// payload: { name, email, password, password_confirmation, organization?, phone? }
export async function register(payload) {
  const data = await apiFetch('/auth/register', { method: 'POST', auth: false, body: JSON.stringify(payload) })
  if (data.token || data.access_token) saveSession(data)
  return data
}

export async function logout() {
  try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
  clearSession()
}

// Fresh copy of the signed-in user from the server (also refreshes the stored copy).
export async function fetchMe() {
  const data = await apiFetch('/auth/me')
  const stored = getUser() || {}
  const user = { ...stored, ...data.user, roles: data.roles || data.user.roles }
  saveUser(user)
  return user
}

// payload: { name, email, phone?, current_password?, password?, password_confirmation? }
export async function updateProfile(payload) {
  const data = await send('PUT', '/auth/profile', payload)
  saveUser({ ...(getUser() || {}), ...data.user })
  return getUser()
}

// ── Data endpoints ─────────────────────────────────────────────────────────
export const api = {
  contracts:      () => apiFetch('/contracts'),
  contract:       (id) => apiFetch('/contracts/' + id),
  purchaseOrders: () => apiFetch('/purchase-orders'),
  movements:      () => apiFetch('/inventory/movements'),
  invoices:       () => apiFetch('/invoices'),

  products:             () => apiFetch('/products'),
  suppliers:            () => apiFetch('/suppliers'),
  createSupplier:       (b) => send('POST', '/suppliers', b),
  priceAgreements:      () => apiFetch('/price-agreements'),
  createPriceAgreement: (b) => send('POST', '/price-agreements', b),
}

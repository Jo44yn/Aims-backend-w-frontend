// Helpers for pages that read from the API (no sample data, no browser-only fallbacks).

export const unwrap = (res) => res.data || res

export const skeleton = (what) => `<div class="card animate-pulse p-6 text-center text-muted">Loading ${what} from server…</div>`

export const errorCard = (msg) => `
<div class="card p-8 text-center">
  <p class="font-head text-xl text-danger">Could not load this page</p>
  <p class="mt-1 text-sm text-muted">${String(msg).replace(/</g, '&lt;')}</p>
  <button class="btn btn-primary mt-4" onclick="window.dispatchEvent(new HashChangeEvent('hashchange'))">Try again</button>
</div>`

// Route helper: show a skeleton, then replace it with whatever `build(params)` resolves to.
export const asyncRoute = (what, build) => (params) => ({
  html: skeleton(what),
  mount: ({ view }) => {
    build(params)
      .then((html) => { view.innerHTML = html })
      .catch((e) => { view.innerHTML = errorCard(e.message) })
  },
})

// A button that calls the API, shows a toast, then re-draws the current page.
// run: async () => 'message to show'
const actions = {}
let seq = 0
window.aimsAct = async (id, btn) => {
  btn.disabled = true
  try {
    window.Alpine.store('ui').toast(await actions[id]())
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } catch (e) {
    btn.disabled = false
    window.Alpine.store('ui').toast(e.message || 'Action failed')
  }
}
// confirm: optional question asked before the action runs (for cancel / delete / deactivate).
export const actionButton = (label, run, cls = 'btn-primary', confirm = '') => {
  const id = 'a' + ++seq
  actions[id] = run
  const ask = confirm ? `if (!confirm('${confirm.replace(/['"]/g, '')}')) return; ` : ''
  return `<button type="button" class="btn ${cls}" @click="${ask}aimsAct('${id}', $el)">${label}</button>`
}

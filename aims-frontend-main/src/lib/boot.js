import Alpine from 'alpinejs'
import Chart from 'chart.js/auto'
import { errorPage } from '../pages/errors.js'

window.Alpine = Alpine
window.Chart = Chart

Alpine.store('ui', {
  toasts: [],
  modal: { open: false, title: '', reason: '', need: true, danger: false, confirm: 'Confirm', done: '', err: false },
  toast(msg) {
    const t = { id: Date.now() + Math.random(), msg }
    this.toasts.push(t)
    setTimeout(() => (this.toasts = this.toasts.filter((x) => x.id !== t.id)), 3500)
  },
  ask(o) {
    this.modal = { open: true, reason: '', err: false, need: o.reason, title: o.title, danger: o.danger, confirm: o.confirm, done: o.done }
  },
  ok() {
    const m = this.modal
    if (m.need && !m.reason.trim()) { m.err = true; return }
    m.open = false
    this.toast(m.done)
  },
})

// Hash router. routes: [{ path:'/contracts/:id', render:(params)=> html | {html, mount} }]
function compile(routes) {
  return routes.map((r) => ({
    ...r,
    re: new RegExp('^' + r.path.replace(/:[^/]+/g, '([^/]+)') + '/?$'),
    keys: [...r.path.matchAll(/:([^/]+)/g)].map((m) => m[1]),
  }))
}

export function boot({ layout, routes, home, title = 'AIMS' }) {
  const app = document.getElementById('app')
  app.innerHTML = layout()
  const view = document.getElementById('view')
  const table = compile(routes)
  let charts = []

  const render = () => {
    const path = (location.hash.slice(1) || home).split('?')[0]
    let out = null
    for (const r of table) {
      const m = path.match(r.re)
      if (m) {
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]))
        out = r.render(params)
        break
      }
    }
    if (!out) out = errorPage(404)
    charts.forEach((c) => c.destroy())
    charts = []
    const { html, mount } = typeof out === 'string' ? { html: out } : out
    view.innerHTML = html
    mount?.({ view, track: (c) => charts.push(c) })
    const h1 = view.querySelector('h1')
    document.title = (h1 ? h1.textContent + ' | ' : '') + title
    app.querySelectorAll('[data-nav]').forEach((a) => {
      const target = a.getAttribute('href').slice(1)
      a.dataset.active = String(path === target || (target !== '/' && path.startsWith(target + '/')))
    })
    window.scrollTo(0, 0)
  }
  window.addEventListener('hashchange', render)
  render()

  // Click a column heading to sort that table (numbers sort numerically).
  document.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-sort]')
    if (!th) return
    const i = [...th.parentNode.children].indexOf(th)
    const body = th.closest('table').tBodies[0]
    const dir = th.dataset.dir === 'asc' ? -1 : 1
    th.parentNode.querySelectorAll('th').forEach((x) => delete x.dataset.dir)
    th.dataset.dir = dir === 1 ? 'asc' : 'desc'
    const val = (tr) => tr.children[i].textContent.trim()
    const n = (s) => parseFloat(s.replace(/[₱,%\s,]/g, ''))
    ;[...body.rows]
      .sort((a, b) => {
        const x = val(a), y = val(b)
        return (isNaN(n(x)) || isNaN(n(y)) ? x.localeCompare(y) : n(x) - n(y)) * dir
      })
      .forEach((r) => body.appendChild(r))
  })

  Alpine.start()
}
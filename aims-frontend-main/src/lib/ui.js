export const peso = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const num = (n) => Number(n).toLocaleString('en-PH')
// The role comes from the signed-in user (stored at login/sign-up), not from a demo switcher.
export const role = () => {
  try {
    const u = JSON.parse(localStorage.getItem('aims_user') || 'null')
    return (u && u.role) || localStorage.getItem('aims_role') || 'gm'
  } catch { return 'gm' }
}

// Who can create/edit what (blueprint role matrix; Admin and the owner/GM can act on every business module).
// The server enforces the same rules, so this only hides buttons people could not use anyway.
const WRITE = {
  catalog: ['admin', 'gm', 'purchasing'],
  production: ['admin', 'gm', 'production'],
  clients: ['admin', 'gm', 'bidding'],
  users: ['admin'],
  settings: ['admin', 'gm'],
}
export const can = (area) => (WRITE[area] || []).includes(role())

// One colour per meaning on every screen (blueprint: status badges).
const TONE = {}
const add = (tone, list) => list.forEach((s) => (TONE[s] = tone))
add('gray', ['draft', 'queued', 'cancelled', 'closed', 'inactive', 'unavailable'])
add('amber', ['for approval', 'for qa', 'at risk', 'expiring', 'partially paid', 'pending', 'preparing', 'new'])
add('teal', ['sent', 'awaiting supplier', 'in production', 'scheduled', 'in progress', 'submitted', 'partially received', 'quoted'])
add('green', ['on track', 'ready', 'delivered', 'accepted', 'paid', 'approved', 'active', 'passed', 'done', 'received', 'won', 'posted', 'available'])
add('red', ['delayed', 'rejected', 'overdue', 'void', 'suspended', 'expired', 'lost', 'failed'])
export const badge = (s) => `<span class="badge badge-${TONE[String(s).toLowerCase()] || 'gray'}">${s}</span>`

export const header = ({ title, crumbs = [], actions = '' }) => `
<div class="mb-5 flex flex-wrap items-end justify-between gap-3">
  <div>
    <nav class="mb-1 text-xs text-muted" aria-label="Breadcrumb">${crumbs
      .map(([l, h]) => (h ? `<a class="hover:underline" href="${h}">${l}</a>` : `<span>${l}</span>`))
      .join(' <span aria-hidden="true">/</span> ')}</nav>
    <h1 class="font-head text-2xl font-semibold text-primary">${title}</h1>
  </div>
  <div class="flex flex-wrap gap-2">${actions}</div>
</div>`

const KPI_TONE = { primary: 'border-primary', danger: 'border-danger', warning: 'border-warning', info: 'border-info', success: 'border-success' }
export const kpi = (label, value, sub = '', tone = 'primary') => `
<div class="card border-l-4 p-4 ${KPI_TONE[tone]}">
  <p class="text-xs font-semibold uppercase tracking-wide text-muted">${label}</p>
  <p class="mt-1 font-head text-3xl font-semibold tabular-nums text-ink">${value}</p>
  <p class="mt-1 text-xs text-muted">${sub}</p>
</div>`

export function table({ cols, rows, statusKey, search = true }) {
  const statuses = statusKey ? [...new Set(rows.map((r) => r[statusKey]))] : []
  const align = (c) => (c.right ? 'text-right tabular-nums' : '')
  return `
<div class="card" x-data="{q:'',s:''}">
  <div class="flex flex-wrap items-center gap-2 border-b border-line p-3">
    ${search ? `<input class="input max-w-xs" placeholder="Search…" aria-label="Search table" x-model="q">` : ''}
    ${statuses.length ? `<select class="input max-w-[190px]" aria-label="Filter by status" x-model="s"><option value="">All statuses</option>${statuses.map((s) => `<option>${s}</option>`).join('')}</select>` : ''}
    <button class="btn btn-ghost ml-auto" @click="aimsCsv($el)">Export CSV</button>
  </div>
  <div class="overflow-x-auto">
    <table class="tbl">
      <thead><tr>${cols.map((c) => `<th data-sort class="${c.right ? 'text-right' : ''}">${c.label}</th>`).join('')}</tr></thead>
      <tbody>${rows
        .map(
          (r) => `<tr data-status="${statusKey ? r[statusKey] : ''}" x-show="(!q || $el.textContent.toLowerCase().includes(q.toLowerCase())) &amp;&amp; (!s || $el.dataset.status === s)">${cols
            .map((c) => `<td class="${align(c)}">${c.render ? c.render(r) : (r[c.k] ?? '')}</td>`)
            .join('')}</tr>`,
        )
        .join('')}</tbody>
    </table>
  </div>
  <p class="border-t border-line p-3 text-xs text-muted">${rows.length} records · click a column heading to sort</p>
</div>`
}

export const link = (href, text) => `<a class="link" href="${href}">${text}</a>`

// A standard list page: header + searchable table.
export const listPage = ({ title, crumbs, action = '', cols, rows, statusKey, note = '' }) =>
  header({ title, crumbs, actions: action }) + (note ? `<p class="mb-3 text-sm text-muted">${note}</p>` : '') + table({ cols, rows, statusKey })

export function tabs(items) {
  return `
<div x-data="{t:'${items[0].id}'}">
  <div class="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
    ${items.map((i) => `<button role="tab" class="tab" :class="t==='${i.id}' &amp;&amp; 'tab-on'" :aria-selected="t==='${i.id}'" @click="t='${i.id}'">${i.label}</button>`).join('')}
  </div>
  ${items.map((i) => `<div x-show="t==='${i.id}'" class="pt-4">${i.html}</div>`).join('')}
</div>`
}

// Status trail. steps: [{label, state: 'done'|'now'|'todo'}]
export const timeline = (steps) => `
<ol class="flex flex-wrap gap-y-3">${steps
  .map(
    (s, i) => `<li class="flex items-center">
  <span class="grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${s.state === 'done' ? 'bg-success text-white' : s.state === 'now' ? 'bg-accent text-primary' : 'bg-line text-muted'}">${s.state === 'done' ? '✓' : i + 1}</span>
  <span class="ml-2 text-xs font-semibold ${s.state === 'todo' ? 'text-muted' : 'text-ink'}">${s.label}</span>
  ${i < steps.length - 1 ? '<span class="mx-3 hidden h-px w-6 bg-line sm:block"></span>' : ''}
</li>`,
  )
  .join('')}</ol>`

// Stacked quantity bar. parts: [{n, cls, label}]
export function bar(parts) {
  const total = parts.reduce((a, p) => a + p.n, 0) || 1
  return `
<div class="flex h-2.5 w-full overflow-hidden rounded-full bg-line" role="img" aria-label="${parts.map((p) => p.label + ' ' + p.n).join(', ')}">
  ${parts.filter((p) => p.n).map((p) => `<div class="${p.cls}" style="width:${(p.n / total) * 100}%"></div>`).join('')}
</div>`
}

export const empty = (msg, cta = '') => `
<div class="card p-10 text-center">
  <p class="font-head text-xl text-primary">Nothing here yet</p>
  <p class="mt-1 text-sm text-muted">${msg}</p>${cta}
</div>`

// Button that opens the confirm modal (reason required for approve / void / cancel).
export const ask = (label, o = {}) => {
  const cfg = { title: o.title || label, confirm: o.confirm || 'Confirm', danger: !!o.danger, reason: o.reason ?? true, done: o.done || 'Done (demo only)' }
  const json = JSON.stringify(cfg).replace(/'/g, '&#39;')
  return `<button type="button" class="btn ${o.danger ? 'btn-danger' : o.cls || 'btn-primary'}" @click='$store.ui.ask(${json})'>${label}</button>`
}

export const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const field = (f) => {
  const id = 'f_' + f.name
  const common = `id="${id}" name="${f.name}" ${f.required ? 'required' : ''} ${f.readonly ? 'readonly' : ''} :class="err['${f.name}'] &amp;&amp; 'border-danger'"`
  let ctl
  if (f.type === 'select') {
    const opts = f.options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }))
    ctl = `<select class="input" ${common}><option value="">Select…</option>${opts.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(f.value ?? '') ? 'selected' : ''}>${o.label}</option>`).join('')}</select>`
  } else if (f.type === 'textarea') ctl = `<textarea class="input" rows="3" ${common}>${esc(f.value)}</textarea>`
  else if (f.type === 'checkbox') ctl = `<label class="flex items-center gap-2"><input type="checkbox" id="${id}" name="${f.name}" value="1" ${f.value ? 'checked' : ''}> ${f.checkLabel || ''}</label>`
  else ctl = `<input class="input ${f.readonly ? 'bg-paper' : ''}" type="${f.type || 'text'}" value="${esc(f.value)}" placeholder="${f.placeholder || ''}" ${f.type === 'number' ? `min="${f.min ?? 0}" step="any"` : ''} ${common}>`
  return `<div class="${f.span === 2 ? 'md:col-span-2' : ''}">
  <label class="label" for="${id}">${f.label}${f.required ? ' <span class="text-danger">*</span>' : ''}</label>${ctl}
  ${f.hint ? `<p class="mt-1 text-xs text-muted">${f.hint}</p>` : ''}
  <p class="mt-1 text-xs text-danger" x-show="err['${f.name}']" x-text="err['${f.name}']"></p></div>`
}

// Real submit handlers live here so the generated HTML only needs an id.
const handlers = {}
let handlerSeq = 0
window.aimsForm = {
  // Runs a handler; resolves { ok } or { errors } so the form can show server messages inline.
  async run(id, data) {
    try {
      const msg = await handlers[id](data)
      window.Alpine.store('ui').toast(msg || 'Saved')
      return { ok: true }
    } catch (e) {
      window.Alpine.store('ui').toast(e.message || 'Could not save')
      return { errors: e.fields || {} }
    }
  },
}

// Export the visible rows of the table next to the clicked button as CSV.
window.aimsCsv = (btn) => {
  const t = btn.closest('.card').querySelector('table')
  const cell = (c) => '"' + c.textContent.trim().replace(/"/g, '""') + '"'
  const rows = [...t.rows].filter((r) => r.offsetParent !== null || r.parentNode.tagName === 'THEAD')
  const csv = rows.map((r) => [...r.cells].map(cell).join(',')).join('\r\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })),
    download: (document.title.split(' | ')[0] || 'export').toLowerCase().replace(/\W+/g, '-') + '.csv',
  })
  a.click()
  URL.revokeObjectURL(a.href)
}

// Form with inline validation.
// Without `onSubmit` it is a demo (toast + go back). With `onSubmit(data)` (async, returns a toast message,
// throws ApiError on failure) the data is really sent, server validation errors show under each field,
// and on success it goes to `after` (default: `back`).
export const form = ({ title, crumbs, fields, back, submit = 'Save', extra = '', onSubmit, after, actions = '' }) => {
  let save = `$store.ui.toast('Saved (demo only)'); location.hash = '${back}'`
  if (onSubmit) {
    const id = 'h' + ++handlerSeq
    handlers[id] = onSubmit
    save = `busy = true; aimsForm.run('${id}', Object.fromEntries(new FormData($el))).then((r) => { busy = false; if (r.errors) err = r.errors; else ${after === null ? '{}' : `location.hash = '${after || back}'`} })`
  }
  return (title ? header({ title, crumbs, actions }) : '') +
  `<form class="card grid max-w-4xl gap-4 p-5 md:grid-cols-2" novalidate x-data="{err:{}, busy:false}"
    @submit.prevent="err={}; $el.querySelectorAll('[required]').forEach(i => { if (!String(i.value).trim()) err[i.name] = 'This field is required' }); if (!Object.keys(err).length) { ${save} }">
  ${fields.map(field).join('')}
  ${extra}
  <div class="flex justify-end gap-2 md:col-span-2"><a class="btn btn-ghost" href="#${back}">Cancel</a><button class="btn btn-primary" :disabled="busy" :class="busy &amp;&amp; 'opacity-75'">${submit}</button></div>
</form>`
}

// Toasts + confirm modal. Place once in every layout.
export const overlays = () => `
<div class="fixed bottom-4 right-4 z-50 space-y-2" aria-live="polite">
  <template x-for="t in $store.ui.toasts" :key="t.id"><div class="toast" x-text="t.msg"></div></template>
</div>
<div x-show="$store.ui.modal.open" x-cloak class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" @keydown.escape.window="$store.ui.modal.open=false">
  <div class="card w-full max-w-md p-5" role="dialog" aria-modal="true" @click.outside="$store.ui.modal.open=false">
    <h2 class="font-head text-xl text-primary" x-text="$store.ui.modal.title"></h2>
    <template x-if="$store.ui.modal.need">
      <div class="mt-3">
        <label class="label" for="reason">Reason (required)</label>
        <textarea id="reason" class="input" rows="3" x-model="$store.ui.modal.reason"></textarea>
        <p class="mt-1 text-xs text-danger" x-show="$store.ui.modal.err">A reason is required.</p>
      </div>
    </template>
    <div class="mt-4 flex justify-end gap-2">
      <button class="btn btn-ghost" @click="$store.ui.modal.open=false">Cancel</button>
      <button class="btn" :class="$store.ui.modal.danger ? 'btn-danger' : 'btn-primary'" @click="$store.ui.ok()" x-text="$store.ui.modal.confirm"></button>
    </div>
  </div>
</div>`
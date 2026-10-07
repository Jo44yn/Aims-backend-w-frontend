import { purchaseOrders as mockPOs, poLines, approvals, contracts as mockContracts } from '../../lib/data.js'
import { ask, badge, header, link, listPage, peso, table } from '../../lib/ui.js'
import { api } from '../../lib/api.js'

// ── Normalise API PO shape → frontend shape ────────────────────────────────
function normalisePO(p) {
  return {
    id: p.id,
    no: p.po_number || p.no || 'PO-???',
    supplier: p.supplier?.name || p.supplier || '—',
    contract: p.contract?.contract_number || p.contract || '—',
    date: p.order_date || p.date || '—',
    eta: p.eta_date || p.eta || '—',
    total: Number(p.total_amount || p.total || 0),
    status: p.status || 'Draft',
    approver: p.approver || '—',
  }
}

// S13 – preview draft POs grouped by supplier, with margin warnings (BR-09, BR-10, BR-11)
const DRAFTS = [
  { no: 'PO-2026-0031 (draft)', supplier: 'Propper USA (PH distributor)', lines: [['Tactical boots, sizes 6–11', 300, 5600, 6800]] },
  { no: 'PO-2026-0032 (draft)', supplier: 'Rudy Project Philippines', lines: [['Ballistic eyewear', 150, 4150, 4500]] },
]
const generate = ({ id }) => {
  const c = mockContracts.find((x) => x.id === Number(id)) || mockContracts[0]
  const THRESHOLD = 100000
  return header({ title: 'Generate purchase orders', crumbs: [['Home', '#/dashboard'], ['Contracts', '#/contracts'], [c.no, '#/contracts/' + c.id], ['Generate PO']], actions: ask('Create draft POs', { title: 'Create 2 draft purchase orders', reason: false, done: '2 draft POs created (demo)', confirm: 'Create drafts' }) }) + `
<p class="mb-4 text-muted">AIMS picked each line's preferred active price agreement and grouped the lines by supplier. In-house lines go to a job order instead.</p>
<div class="grid gap-4">${DRAFTS.map((d) => {
    const total = d.lines.reduce((a, l) => a + l[1] * l[2], 0)
    return `<section class="card"><div class="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4"><div><h2 class="font-head text-lg text-primary">${d.no}</h2><p class="text-sm text-muted">${d.supplier}</p></div><div class="text-right"><p class="font-head text-xl tabular-nums">${peso(total)}</p>${total > THRESHOLD ? badge('For approval') : badge('Approved')}</div></div>
    <table class="tbl"><thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Unit cost</th><th class="text-right">Contract price</th><th class="text-right">Cost / price</th></tr></thead><tbody>
    ${d.lines.map(([n, q, cost, price]) => { const r = cost / price; return `<tr><td>${n}</td><td class="text-right tabular-nums">${q}</td><td class="text-right tabular-nums">${peso(cost)}</td><td class="text-right tabular-nums">${peso(price)}</td><td class="text-right ${r > 0.9 ? 'font-semibold text-danger' : ''}">${Math.round(r * 100)}%${r > 0.9 ? '<br><span class="text-xs">Margin guard: above 90%</span>' : ''}</td></tr>` }).join('')}</tbody></table></section>`
  }).join('')}</div>
<p class="mt-3 text-xs text-muted">Totals above ${peso(THRESHOLD)} need GM approval before sending (BR-11).</p>`
}

// S14
const list = (rows) => listPage({
  title: 'Purchase orders', crumbs: [['Home', '#/dashboard'], ['Purchase orders']],
  cols: [{ label: 'PO no.', render: (r) => link('#/purchase-orders/' + r.id, r.no) }, { k: 'supplier', label: 'Supplier' }, { k: 'contract', label: 'Contract' }, { k: 'date', label: 'Date' }, { k: 'eta', label: 'ETA' }, { k: 'total', label: 'Total', right: true, render: (r) => peso(r.total) }, { label: 'Status', render: (r) => badge(r.status) }],
  rows, statusKey: 'status',
})

// S15 – PDF preview, approve, send, cancel, ETA
const detail = ({ id }, poRows = mockPOs) => {
  const p = poRows.find((x) => x.id === Number(id)) || mockPOs.find((x) => x.id === Number(id))
  if (!p) return `<p class="p-10 text-center">Purchase order not found.</p>`
  const lines = p.id === 31 ? poLines : [{ sku: 'ITEM-1', desc: 'See contract ' + p.contract, size: '—', qty: 1, cost: p.total }]
  const actions = p.status === 'For approval'
    ? ask('Approve', { title: 'Approve ' + p.no, confirm: 'Approve', done: p.no + ' approved and emailed (demo)' }) + ask('Reject', { title: 'Reject ' + p.no, danger: true, confirm: 'Reject' })
    : p.status === 'Draft' ? `<button class="btn btn-primary" @click="$store.ui.toast('Submitted for approval (demo)')">Submit for approval</button>`
    : p.status === 'Approved' ? `<button class="btn btn-primary" @click="$store.ui.toast('PDF emailed to supplier (demo)')">Send to supplier</button>`
    : ['Sent', 'Partially received'].includes(p.status) ? ask('Cancel & reissue', { title: 'Cancel ' + p.no, danger: true, confirm: 'Cancel PO', done: p.no + ' cancelled (demo)' }) : ''
  return header({ title: p.no, crumbs: [['Home', '#/dashboard'], ['Purchase orders', '#/purchase-orders'], [p.no]], actions: badge(p.status) + `<button class="btn btn-ghost" @click="$store.ui.toast('Downloading PDF (demo)')">Download PDF</button>` + actions }) + `
<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
  <section class="card mx-auto w-full max-w-3xl min-w-0 p-4 sm:p-8" aria-label="Purchase order PDF preview">
    <div class="flex justify-between border-b-2 border-primary pb-3"><div><p class="font-head text-xl text-primary">AIMFORCE Police and Military Supply</p><p class="text-xs text-muted">Dasmariñas, Cavite</p></div><div class="text-right"><p class="font-head text-2xl text-primary">PURCHASE ORDER</p><p class="text-sm">${p.no} · ${p.date}</p></div></div>
    <div class="my-4 grid gap-4 text-sm sm:grid-cols-2"><div><p class="label">Supplier</p><p>${p.supplier}</p></div><div><p class="label">Contract reference</p><p>${p.contract}</p><p class="label mt-2">Ship to</p><p>AIMFORCE warehouse, Dasmariñas, Cavite</p></div></div>
    <div class="overflow-x-auto"><table class="tbl"><thead><tr><th>SKU</th><th>Description</th><th>Size</th><th class="text-right">Qty</th><th class="text-right">Unit cost</th><th class="text-right">Amount</th></tr></thead>
    <tbody>${lines.map((l) => `<tr><td>${l.sku}</td><td>${l.desc}</td><td>${l.size}</td><td class="text-right tabular-nums">${l.qty}</td><td class="text-right tabular-nums">${peso(l.cost)}</td><td class="text-right tabular-nums">${peso(l.qty * l.cost)}</td></tr>`).join('')}</tbody></table></div>
    <p class="mt-3 text-right font-head text-xl tabular-nums">Total ${peso(p.total)}</p>
    <p class="mt-4 text-sm">Required delivery date: <b>${p.eta}</b>. Terms: net 30 days from receipt of acceptable goods.</p>
    <p class="mt-6 text-sm">Approved by: <b>${p.approver}</b></p>
  </section>
  <aside class="card h-fit p-4"><h2 class="font-head text-lg text-primary">ETA tracking</h2>
    <dl class="mt-2 space-y-2 text-sm"><div class="flex justify-between"><dt class="text-muted">Expected</dt><dd>${p.eta}</dd></div><div class="flex justify-between"><dt class="text-muted">Status</dt><dd>${p.status}</dd></div></dl>
    <button class="btn btn-ghost mt-3 w-full" @click="$store.ui.toast('ETA updated (demo)')">Update ETA</button></aside>
</div>`
}

// S16
const approvalsPage = () => header({ title: 'Approvals', crumbs: [['Home', '#/dashboard'], ['Approvals']] }) + table({
  cols: [{ k: 'kind', label: 'Type' }, { k: 'ref', label: 'Reference' }, { k: 'by', label: 'Requested by' }, { k: 'date', label: 'Date' }, { k: 'amount', label: 'Amount', right: true, render: (r) => (r.amount ? peso(r.amount) : '—') },
    { label: '', render: (r) => ask('Approve', { title: 'Approve ' + r.ref, confirm: 'Approve' }).replace('class="btn', 'class="mr-1 btn') + ask('Reject', { title: 'Reject ' + r.ref, danger: true, confirm: 'Reject' }) }],
  rows: approvals, statusKey: 'kind',
})

// ── Loading skeleton ──────────────────────────────────────────────────────
const skeleton = () => `<div class="card p-6 text-center text-muted animate-pulse">Loading purchase orders from server…</div>`

// ── Route handlers (async-aware) ──────────────────────────────────────────
const listRoute = () => ({
  html: skeleton(),
  mount: ({ view }) => {
    api.purchaseOrders()
      .then((res) => { view.innerHTML = list((res.data || res).map(normalisePO)) })
      .catch(() => { view.innerHTML = list(mockPOs) })
  },
})

const detailRoute = ({ id }) => ({
  html: skeleton(),
  mount: ({ view }) => {
    api.purchaseOrders()
      .then((res) => { view.innerHTML = detail({ id }, (res.data || res).map(normalisePO)) })
      .catch(() => { view.innerHTML = detail({ id }, mockPOs) })
  },
})

export const procurementRoutes = [
  { path: '/contracts/:id/generate-po', render: generate },
  { path: '/purchase-orders', render: listRoute },
  { path: '/purchase-orders/:id', render: detailRoute },
  { path: '/approvals', render: approvalsPage },
]
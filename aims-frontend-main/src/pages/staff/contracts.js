import { clients, contracts as mockContracts, contractItems, deliveries, goodsReceipts, invoices, purchaseOrders as mockPOs, jobOrders, billing, products } from '../../lib/data.js'
import { ask, badge, bar, form, header, link, listPage, peso, table, tabs, timeline } from '../../lib/ui.js'
import { api } from '../../lib/api.js'

// ── helpers to normalise API contract shape → frontend shape ───────────────
function normaliseContract(c) {
  return {
    id: c.id,
    no: c.contract_number || c.no || 'CT-???',
    client: c.client?.name || c.client || '—',
    clientId: c.client_id || c.clientId,
    title: c.title || '—',
    noa: c.noa_number || c.noa || '—',
    ntp: c.ntp_date || c.ntp || '—',
    days: c.delivery_days || c.days || 0,
    deadline: c.deadline || '—',
    amount: Number(c.amount || 0),
    status: c.status || 'Draft',
    deadlineStatus: c.deadline_status || c.deadlineStatus || 'On track',
    pct: c.pct || 0,
    left: c.left || 0,
  }
}

// S06
const list = (contractRows) => listPage({
  title: 'Contracts', crumbs: [['Home', '#/dashboard'], ['Contracts']], action: `<a class="btn btn-primary" href="#/contracts/create">+ New contract</a>`,
  cols: [
    { label: 'Contract', render: (r) => link('#/contracts/' + r.id, r.no) }, { k: 'client', label: 'Client' }, { k: 'title', label: 'Title' },
    { k: 'amount', label: 'Amount', right: true, render: (r) => peso(r.amount) }, { k: 'deadline', label: 'Deadline' },
    { label: 'Deadline status', render: (r) => badge(r.deadlineStatus) }, { label: 'Stage', render: (r) => badge(r.status) },
  ],
  rows: contractRows, statusKey: 'deadlineStatus',
})

// S07 – NOA, NTP, terms, line items by size
const create = () => form({
  title: 'New contract', crumbs: [['Home', '#/dashboard'], ['Contracts', '#/contracts'], ['New']], back: '/contracts',
  fields: [
    { name: 'client', label: 'Client', type: 'select', options: clients.map((c) => c.name), required: true, span: 2 },
    { name: 'title', label: 'Contract title', required: true, span: 2 },
    { name: 'noa_no', label: 'NOA number', required: true }, { name: 'noa_date', label: 'NOA date', type: 'date', required: true },
    { name: 'contract_date', label: 'Contract date', type: 'date' }, { name: 'ntp_date', label: 'NTP date', type: 'date', hint: 'Prices lock once the NTP date is entered (BR-02).' },
    { name: 'delivery_days', label: 'Delivery period (calendar days)', type: 'number', required: true, hint: 'Deadline = NTP date + delivery period (BR-03).' },
    { name: 'ld_rate', label: 'Liquidated damages rate (%/day)', type: 'number', hint: 'Typical: 0.1' },
  ],
  extra: `<div class="min-w-0 md:col-span-2"><h2 class="font-head text-lg text-primary">Line items</h2>
    <p class="mb-2 text-xs text-muted">Add one line per variant (size). At least one line is required (BR-01).</p>
    <div class="overflow-x-auto"><table class="tbl min-w-[520px]"><thead><tr><th>Product</th><th>Variant / size</th><th class="text-right">Qty</th><th class="text-right">Won-bid unit price</th></tr></thead>
    <tbody>${[0, 1].map(() => `<tr><td><select class="input">${products.map((p) => `<option>${p.name}</option>`).join('')}</select></td><td><input class="input" placeholder="e.g. Size 9"></td><td><input class="input text-right" type="number" min="0"></td><td><input class="input text-right" type="number" min="0" step="0.01"></td></tr>`).join('')}</tbody></table></div>
    <button type="button" class="btn btn-ghost mt-2" @click="$store.ui.toast('Row added (demo)')">+ Add line</button>
    <div class="mt-4"><label class="label">Attachments (NOA, contract, NTP)</label><input class="input" type="file" multiple></div></div>`,
})

const money = (i) => `<span class="tabular-nums">${peso(i)}</span>`
const margin = (i) => Math.round(((i.price - i.cost) / i.price) * 100)

const itemsTab = (c) => {
  const trail = timeline([
    { label: 'Awarded', state: 'done' }, { label: 'PO sent', state: 'done' }, { label: 'Received', state: 'done' }, { label: 'QA', state: 'done' },
    { label: 'Delivered', state: 'done' }, { label: 'Accepted', state: 'now' }, { label: 'Billed', state: 'todo' }, { label: 'Paid', state: 'todo' },
  ])
  const rows = contractItems.map((i) => {
    const m = margin(i)
    return `<tr>
      <td>${i.line}</td><td><b>${i.item}</b><p class="text-xs text-muted">${i.source}</p></td>
      <td class="text-right tabular-nums">${i.qty.toLocaleString()}</td><td class="text-right">${money(i.price)}</td>
      <td class="text-right"><span class="${m < 10 ? 'font-semibold text-danger' : ''}">${m}%</span>${m < 10 ? '<p class="text-xs text-danger">Margin guard</p>' : ''}</td>
      <td class="min-w-48">${bar([
        { n: i.b.accepted, cls: 'bg-success', label: 'Accepted' }, { n: i.b.delivered, cls: 'bg-green-400', label: 'Delivered' }, { n: i.b.ready, cls: 'bg-success/50', label: 'Ready' },
        { n: i.b.forQa, cls: 'bg-warning', label: 'For QA' }, { n: i.b.awaiting, cls: 'bg-info', label: 'Awaiting supplier' },
      ])}<p class="mt-1 text-xs text-muted">Accepted ${i.b.accepted} · Awaiting ${i.b.awaiting}${i.returned ? ` · Returned ${i.returned}` : ''}</p></td></tr>`
  }).join('')
  return `<div class="card mb-4 p-4">${trail}</div>
  <div class="card overflow-x-auto"><table class="tbl"><thead><tr><th>#</th><th>Item</th><th class="text-right">Qty</th><th class="text-right">Unit price</th><th class="text-right">Margin</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  <p class="mt-2 text-xs text-muted">A line can sit in several states at once when split, for example 296 boots accepted and 4 returned.</p>`
}

// S08 – tabs: Items, POs and job orders, Receiving and QA, Deliveries, Billing, Documents, Timeline
const detail = ({ id }, contractRows = mockContracts) => {
  const c = contractRows.find((x) => x.id === Number(id)) || mockContracts.find((x) => x.id === Number(id))
  if (!c) return `<p class="p-10 text-center">Contract not found.</p>`
  const full = c.id === 12 // only the demo scenario has the full trail
  const pos = full ? mockPOs.filter((p) => p.contract === c.no) : []
  const bs = billing(2182800)
  return header({
    title: c.no, crumbs: [['Home', '#/dashboard'], ['Contracts', '#/contracts'], [c.no]],
    actions: `<a class="btn btn-ghost" href="#/contracts/${c.id}/generate-po">Generate PO</a>${ask('Amend contract', { title: 'Amend contract prices', confirm: 'Request amendment', done: 'Amendment sent for approval (demo)', cls: 'btn-ghost' })}`,
  }) + `
<div class="card mb-4 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
  ${[['Client', c.client], ['Value', peso(c.amount)], ['NTP', c.ntp], ['Deadline', c.deadline + ` (${c.days} days)`]].map(([a, b]) => `<div><p class="label">${a}</p><p class="font-semibold">${b}</p></div>`).join('')}
  <div><p class="label">Deadline status</p>${badge(c.deadlineStatus)}</div>
</div>` + tabs([
    { id: 'items', label: 'Items', html: full ? itemsTab(c) : `<p class="card p-6 text-muted">Line items for ${c.no} follow the same structure.</p>` },
    { id: 'po', label: 'POs & job orders', html: table({ cols: [{ label: 'No.', render: (r) => link('#/purchase-orders/' + r.id, r.no) }, { k: 'supplier', label: 'Supplier' }, { k: 'total', label: 'Total', right: true, render: (r) => peso(r.total) }, { label: 'Status', render: (r) => badge(r.status) }], rows: pos, search: false }) + (full ? `<p class="mt-3 text-sm">Job order: ${link('#/job-orders', jobOrders[0].no)} ${badge('Done')}</p>` : '') },
    { id: 'rq', label: 'Receiving & QA', html: table({ cols: [{ k: 'no', label: 'GR' }, { k: 'source', label: 'Source' }, { k: 'date', label: 'Date' }, { k: 'qty', label: 'Qty', right: true }, { label: 'Status', render: (r) => badge(r.status) }], rows: full ? goodsReceipts : [], search: false }) },
    { id: 'dl', label: 'Deliveries', html: table({ cols: [{ k: 'no', label: 'DR' }, { k: 'date', label: 'Date' }, { k: 'qty', label: 'Qty', right: true }, { label: 'Status', render: (r) => badge(r.status) }], rows: deliveries.filter((d) => d.contract === c.no), search: false }) },
    { id: 'bl', label: 'Billing', html: full ? `<div class="card p-5"><div class="mb-3 flex items-center justify-between"><b>BS-2026-0020</b>${badge('Unpaid')}</div><dl class="grid gap-2 sm:grid-cols-2">${[['Gross (VAT incl.)', 2182800], ['VAT-exclusive base', bs.base], ['Withholding VAT 5%', -bs.wvat], ['Expanded withholding 1%', -bs.ewt], ['Expected collection', bs.net]].map(([a, b]) => `<div class="flex justify-between border-b border-line py-1"><dt>${a}</dt><dd class="tabular-nums">${peso(b)}</dd></div>`).join('')}</dl></div>` : '<p class="card p-6 text-muted">No billing yet.</p>' },
    { id: 'doc', label: 'Documents', html: `<div class="card divide-y divide-line">${['NOA', 'Contract', 'NTP', 'IAR'].map((d) => `<div class="flex items-center justify-between p-3"><span>${d} – ${c.no}.pdf</span><button class="btn btn-ghost" @click="$store.ui.toast('Opening ${d} (demo)')">View</button></div>`).join('')}<div class="p-3"><input type="file" class="input max-w-sm" aria-label="Upload a document"></div></div>` },
    { id: 'tl', label: 'Timeline', html: `<ul class="card divide-y divide-line">${[['Oct 28', 'Billing statement BS-2026-0020 created'], ['Oct 25', 'DR-2026-0027 delivered; IAR recorded'], ['Oct 22', 'RTS-2026-0003 posted (4 boots)'], ['Oct 20', 'GR-2026-0044 received; QA passed 296, rejected 4'], ['Oct 6', 'PO-2026-0031 and PO-2026-0032 approved and sent'], ['Oct 5', 'NTP received; deadline set to Dec 4']].map(([d, t]) => `<li class="flex gap-4 p-3"><span class="w-14 text-muted">${d}</span>${t}</li>`).join('')}</ul>` },
  ])
}

// ── Loading skeleton ──────────────────────────────────────────────────────
const skeleton = () => `
<div class="card p-6 text-center text-muted animate-pulse">Loading contracts from server…</div>`

// ── Route handlers (async-aware) ──────────────────────────────────────────
const listRoute = () => {
  return {
    html: skeleton(),
    mount: ({ view }) => {
      api.contracts()
        .then((res) => {
          const rows = (res.data || res).map(normaliseContract)
          view.innerHTML = list(rows)
        })
        .catch(() => {
          // Graceful fallback to mock data
          view.innerHTML = list(mockContracts)
        })
    },
  }
}

const detailRoute = ({ id }) => {
  return {
    html: skeleton(),
    mount: ({ view }) => {
      api.contracts()
        .then((res) => {
          const rows = (res.data || res).map(normaliseContract)
          view.innerHTML = detail({ id }, rows)
        })
        .catch(() => {
          view.innerHTML = detail({ id }, mockContracts)
        })
    },
  }
}

export const contractRoutes = [
  { path: '/contracts', render: listRoute },
  { path: '/contracts/create', render: create },
  { path: '/contracts/:id', render: detailRoute },
]
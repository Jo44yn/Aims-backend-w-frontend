import { invoices as mockInvoices, payments, supplierBills, billing } from '../../lib/data.js'
import { badge, header, kpi, link, listPage, peso, table, tabs } from '../../lib/ui.js'
import { C, chart } from '../../lib/charts.js'
import { api } from '../../lib/api.js'

// ── Normalise API invoice shape → frontend shape ──────────────────────────
function normaliseInvoice(i) {
  return {
    id: i.id,
    bs: i.invoice_number || i.bs || 'BS-???',
    oi: i.official_invoice_number || i.oi || '—',
    contract: i.contract?.contract_number || i.contract || '—',
    client: i.client?.name || i.client || '—',
    date: i.invoice_date || i.date || '—',
    gross: Number(i.gross_amount || i.gross || 0),
    due: i.due_date || i.due || '—',
    status: i.status || 'Unpaid',
    age: i.age || 0,
  }
}

// S28 – billing statements with withholding (BR-24, BR-25)
const invoiceListHtml = (invoices) => listPage({
  title: 'Invoices', crumbs: [['Home', '#/dashboard'], ['Invoices']], action: `<button class="btn btn-primary" @click="$store.ui.toast('Billing from accepted deliveries (demo)')">+ Create billing statement</button>`,
  note: 'AIMS prints the billing statement and records the official invoice number from AIMFORCE’s BIR-registered series.',
  cols: [{ label: 'BS no.', render: (r) => link('#/invoices/' + r.id, r.bs) }, { k: 'oi', label: 'Official invoice' }, { k: 'client', label: 'Client' }, { k: 'date', label: 'Date' },
    { k: 'gross', label: 'Gross', right: true, render: (r) => peso(r.gross) }, { label: 'Net receivable', right: true, render: (r) => peso(billing(r.gross).net) }, { k: 'due', label: 'Due' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: invoices, statusKey: 'status',
})

const invoiceDetailHtml = (invoiceRows) => ({ id }) => {
  const i = invoiceRows.find((x) => x.id === Number(id))
  if (!i) return `<p class="p-10 text-center">Invoice not found.</p>`
  const b = billing(i.gross)
  const rows = [['Gross amount (VAT inclusive)', i.gross], ['VAT-exclusive base', b.base], ['Output VAT 12%', b.vat], ['Less: withholding VAT 5%', -b.wvat], ['Less: expanded withholding 1%', -b.ewt]]
  return header({ title: i.bs, crumbs: [['Home', '#/dashboard'], ['Invoices', '#/invoices'], [i.bs]], actions: badge(i.status) + `<button class="btn btn-ghost" @click="$store.ui.toast('Downloading PDF (demo)')">Download PDF</button>` }) + `
<section class="card max-w-2xl p-6"><p class="text-sm text-muted">${i.client} · ${i.contract} · Official invoice ${i.oi}</p>
  <dl class="mt-4">${rows.map(([a, v]) => `<div class="flex justify-between border-b border-line py-2"><dt>${a}</dt><dd class="tabular-nums">${peso(v)}</dd></div>`).join('')}
  <div class="flex justify-between py-3 font-head text-xl text-primary"><dt>Expected collection</dt><dd class="tabular-nums">${peso(b.net)}</dd></div></dl>
  <p class="text-xs text-muted">Rates come from Settings. Confirm the expanded withholding rate with the accountant.</p></section>`
}

// S29 – payments, 2307 log, aging buckets (BR-26)
const collections = (invoiceRows = mockInvoices) => {
  const bucket = (lo, hi) => invoiceRows.filter((i) => i.status !== 'Paid' && i.age >= lo && i.age <= hi).reduce((a, i) => a + billing(i.gross).net, 0)
  const buckets = [['0–30 days', bucket(0, 30)], ['31–60 days', bucket(31, 60)], ['61–90 days', bucket(61, 90)], ['90+ days', bucket(91, 9999)]]
  return {
    html: header({ title: 'Collections & AR aging', crumbs: [['Home', '#/dashboard'], ['Collections']], actions: `<button class="btn btn-primary" @click="$store.ui.toast('Payment form (demo)')">+ Record payment</button>` }) + `
<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${buckets.map(([l, v], k) => kpi(l, peso(v), 'Outstanding', ['success', 'info', 'warning', 'danger'][k])).join('')}</div>
<div class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
  <div class="min-w-0"><h2 class="mb-2 font-head text-lg text-primary">Payments & BIR Form 2307</h2>${table({ cols: [{ k: 'date', label: 'Date' }, { k: 'bs', label: 'BS' }, { k: 'amount', label: 'Amount', right: true, render: (r) => peso(r.amount) }, { k: 'mode', label: 'Mode' }, { k: 'ref', label: 'Reference' }, { label: '2307', render: (r) => `<span class="badge ${r.f2307 === 'Received' ? 'badge-green' : 'badge-amber'}">${r.f2307}</span>` }], rows: payments, statusKey: 'mode' })}</div>
  <section class="card p-4"><h2 class="font-head text-lg text-primary">Aging</h2><div class="mt-3 h-56"><canvas id="aging" role="img" aria-label="Bar chart of receivables by age"></canvas></div></section>
</div>`,
    mount: ({ view, track }) => chart(view.querySelector('#aging'), track, { type: 'bar', data: { labels: buckets.map((b) => b[0]), datasets: [{ data: buckets.map((b) => b[1] / 1000), backgroundColor: [C.green, C.teal, C.amber, C.red] }] }, options: { plugins: { legend: { display: false } } } }),
  }
}

// S30 – supplier bills, payments, AP aging
const payables = () => listPage({
  title: 'Payables', crumbs: [['Home', '#/dashboard'], ['Payables']], action: `<button class="btn btn-primary" @click="$store.ui.toast('Supplier payment form (demo)')">+ Record supplier payment</button>`,
  cols: [{ k: 'bill', label: 'Bill' }, { k: 'supplier', label: 'Supplier' }, { k: 'po', label: 'PO' }, { k: 'date', label: 'Bill date' }, { k: 'amount', label: 'Amount', right: true, render: (r) => peso(r.amount) }, { k: 'due', label: 'Due' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: supplierBills, statusKey: 'status',
})

// S31 – contract status, on-time delivery, margins, supplier performance, stock value
const reports = () => ({
  html: header({ title: 'Reports', crumbs: [['Home', '#/dashboard'], ['Reports']], actions: ['PDF', 'Excel', 'CSV'].map((f) => `<button class="btn btn-ghost" @click="$store.ui.toast('Exporting ${f} (demo)')">${f}</button>`).join('') }) + tabs([
    { id: 'm', label: 'Margin per contract', html: `<div class="card p-4"><div class="h-72"><canvas id="r1" role="img" aria-label="Margin percent by contract"></canvas></div></div>` },
    { id: 'o', label: 'On-time delivery', html: `<div class="card p-4"><div class="h-72"><canvas id="r2" role="img" aria-label="On-time delivery percent by month"></canvas></div></div>` },
    { id: 's', label: 'Supplier performance', html: table({ cols: [{ k: 's', label: 'Supplier' }, { k: 'ot', label: 'On-time %', right: true }, { k: 'rj', label: 'Reject %', right: true }, { k: 'po', label: 'POs', right: true }], rows: [{ s: 'Propper USA', ot: 92, rj: 1.3, po: 9 }, { s: 'Rudy Project', ot: 88, rj: 0.4, po: 6 }, { s: 'Under Armour', ot: 95, rj: 2.1, po: 5 }], search: false }) },
    { id: 'v', label: 'Stock value', html: `<div class="grid gap-4 sm:grid-cols-3">${kpi('Raw materials', peso(81450.5), 'Moving weighted average', 'primary')}${kpi('Finished goods', peso(0), 'JIT: zero on hand', 'success')}${kpi('Awaiting QA', peso(448000), '80 pairs of boots', 'warning')}</div>` },
  ]),
  mount: ({ view, track }) => {
    chart(view.querySelector('#r1'), track, { type: 'bar', data: { labels: ['CT-0008', 'CT-0009', 'CT-0010', 'CT-0011', 'CT-0012'], datasets: [{ label: 'Margin %', data: [34, 21, 18, 26, 32], backgroundColor: C.primary }] } })
    chart(view.querySelector('#r2'), track, { type: 'line', data: { labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], datasets: [{ label: 'On-time %', data: [100, 100, 90, 85, 80, 78], borderColor: C.gold, backgroundColor: C.gold, tension: 0.3 }] } })
  },
})

const skeleton = () => `<div class="card p-6 text-center text-muted animate-pulse">Loading from server…</div>`

// ── Route handlers (async-aware) ──────────────────────────────────────────
const invoiceList = () => ({
  html: skeleton(),
  mount: ({ view }) => {
    api.invoices()
      .then((res) => { view.innerHTML = invoiceListHtml((res.data || res).map(normaliseInvoice)) })
      .catch(() => { view.innerHTML = invoiceListHtml(mockInvoices) })
  },
})

const invoiceDetail = ({ id }) => ({
  html: skeleton(),
  mount: ({ view }) => {
    api.invoices()
      .then((res) => { view.innerHTML = invoiceDetailHtml((res.data || res).map(normaliseInvoice))({ id }) })
      .catch(() => { view.innerHTML = invoiceDetailHtml(mockInvoices)({ id }) })
  },
})

export const financeRoutes = [
  { path: '/invoices', render: invoiceList },
  { path: '/invoices/:id', render: invoiceDetail },
  { path: '/collections', render: collections },
  { path: '/payables', render: payables },
  { path: '/reports', render: reports },
]
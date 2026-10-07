import { goodsReceipts, qaQueue, returns, movements, materials, contractItems, purchaseOrders } from '../../lib/data.js'
import { badge, bar, form, header, link, listPage, num, peso, table } from '../../lib/ui.js'

// S17 – post a goods receipt against a PO or job order
const receiving = () => header({ title: 'Receiving', crumbs: [['Home', '#/dashboard'], ['Receiving']], actions: `<a class="btn btn-primary" href="#/receiving/new">+ Post goods receipt</a>` }) + table({
  cols: [{ k: 'no', label: 'GR no.' }, { k: 'source', label: 'Source' }, { k: 'contract', label: 'Contract' }, { k: 'date', label: 'Received' }, { k: 'supplierDr', label: 'Supplier DR' }, { k: 'qty', label: 'Qty', right: true, render: (r) => num(r.qty) }, { k: 'by', label: 'Received by' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: goodsReceipts, statusKey: 'status',
})
const receivingForm = () => form({
  title: 'Post goods receipt', crumbs: [['Home', '#/dashboard'], ['Receiving', '#/receiving'], ['New']], back: '/receiving', submit: 'Post receipt',
  fields: [
    { name: 'source', label: 'Against purchase order', type: 'select', options: purchaseOrders.filter((p) => ['Sent', 'Partially received'].includes(p.status)).map((p) => p.no + ' · ' + p.supplier), required: true, span: 2, hint: 'Received quantity goes to “For QA”. Only passed quantity becomes available (BR-15).' },
    { name: 'date', label: 'Received date', type: 'date', required: true }, { name: 'sdr', label: 'Supplier DR no.', required: true },
    { name: 'qty', label: 'Quantity received', type: 'number', required: true }, { name: 'remarks', label: 'Remarks' },
  ],
})

// S18 – inspect received lines
const qa = () => header({ title: 'QA queue', crumbs: [['Home', '#/dashboard'], ['QA queue']] }) + `
<div class="card mb-4 p-4" x-data="{pass: 80, fail: 0, open:false}">
  <h2 class="font-head text-lg text-primary">Inspect: GR-2026-0044 · Tactical boots, size 9</h2>
  <div class="mt-3 grid max-w-2xl gap-3 sm:grid-cols-3">
    <div><label class="label" for="qp">Passed</label><input id="qp" class="input" type="number" min="0" :max="80" x-model.number="pass" @input="fail = Math.max(0, 80 - pass)"></div>
    <div><label class="label" for="qf">Failed</label><input id="qf" class="input" type="number" min="0" :max="80" x-model.number="fail" @input="pass = Math.max(0, 80 - fail)"></div>
    <div><label class="label" for="qd">Defects</label><input id="qd" class="input" placeholder="e.g. stitching"></div>
  </div>
  <p class="mt-2 text-sm" :class="pass + fail === 80 ? 'text-success' : 'text-danger'" x-text="pass + fail === 80 ? 'Passed + failed = received (80)' : 'Passed + failed must equal 80 received'"></p>
  <div class="mt-3 flex flex-wrap items-center gap-3"><input type="file" accept="image/*" class="input max-w-xs" aria-label="Defect photo"><button class="btn btn-primary" :disabled="pass + fail !== 80" :class="pass + fail !== 80 &amp;&amp; 'opacity-50'" @click="$store.ui.toast('Inspection saved: ' + pass + ' passed, ' + fail + ' failed (demo)')">Save inspection</button></div>
</div>` + table({
  cols: [{ k: 'gr', label: 'Receipt' }, { k: 'item', label: 'Item' }, { k: 'contract', label: 'Contract' }, { k: 'received', label: 'Received', right: true }, { k: 'passed', label: 'Passed', right: true }, { k: 'failed', label: 'Failed', right: true }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: qaQueue, statusKey: 'status',
})

// S19
const rts = () => listPage({
  title: 'Returns to supplier', crumbs: [['Home', '#/dashboard'], ['Returns']], note: 'Rejected quantity becomes a return slip and the PO line stays open for replacement (BR-16).',
  cols: [{ k: 'no', label: 'RTS no.' }, { k: 'supplier', label: 'Supplier' }, { k: 'po', label: 'PO' }, { k: 'qty', label: 'Qty', right: true }, { k: 'reason', label: 'Reason' }, { k: 'date', label: 'Date' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: returns, statusKey: 'status',
})

// S20 – buckets per contract line
const stock = () => header({ title: 'Stock overview', crumbs: [['Home', '#/dashboard'], ['Inventory']] }) + `
<p class="mb-3 text-sm text-muted">Finished goods are JIT: zero on hand until a goods receipt or job-order output. Buckets are computed from stock movements, never edited by hand (BR-18).</p>
<div class="card overflow-x-auto"><table class="tbl"><thead><tr><th>Contract</th><th>Item</th><th class="text-right">On order</th><th class="text-right">For QA</th><th class="text-right">Ready</th><th class="text-right">Delivered</th><th class="text-right">Accepted</th><th class="min-w-40">Progress</th></tr></thead><tbody>
${contractItems.map((i) => `<tr><td>${link('#/contracts/12', 'CT-2026-0012')}</td><td>${i.item}</td>${[i.b.awaiting, i.b.forQa, i.b.ready, i.b.delivered, i.b.accepted].map((n) => `<td class="text-right tabular-nums">${num(n)}</td>`).join('')}<td>${bar([{ n: i.b.accepted, cls: 'bg-success', label: 'Accepted' }, { n: i.b.awaiting, cls: 'bg-info', label: 'On order' }])}</td></tr>`).join('')}
</tbody></table></div>`

// S21
const ledger = () => listPage({
  title: 'Stock ledger', crumbs: [['Home', '#/dashboard'], ['Inventory', '#/inventory'], ['Ledger']], note: 'Insert-only: every in, out or allocation, with its source document.',
  cols: [{ k: 'when', label: 'When' }, { k: 'type', label: 'Movement' }, { k: 'item', label: 'Item' }, { k: 'contract', label: 'Contract' }, { k: 'qty', label: 'Qty', right: true, render: (r) => `<span class="${r.qty < 0 ? 'text-danger' : 'text-success'}">${r.qty > 0 ? '+' : ''}${num(r.qty)}</span>` }, { k: 'ref', label: 'Source' }, { k: 'user', label: 'By' }],
  rows: movements, statusKey: 'type',
})

// S22
const materialsPage = () => listPage({
  title: 'Raw materials', crumbs: [['Home', '#/dashboard'], ['Materials']], note: 'The one exception to JIT: patch inputs are kept on hand with a reorder point (BR-19).',
  cols: [{ k: 'code', label: 'Code' }, { k: 'name', label: 'Material' }, { k: 'onHand', label: 'On hand', right: true }, { k: 'reorder', label: 'Reorder point', right: true }, { k: 'cost', label: 'Avg cost', right: true, render: (r) => peso(r.cost) }, { k: 'supplier', label: 'Supplier' },
    { label: 'Level', render: (r) => (r.onHand <= r.reorder ? '<span class="badge badge-amber">Reorder</span>' : '<span class="badge badge-green">OK</span>') }],
  rows: materials.map((m) => ({ ...m, level: m.onHand <= m.reorder ? 'Reorder' : 'OK' })), statusKey: 'level',
})

export const inventoryRoutes = [
  { path: '/receiving', render: receiving },
  { path: '/receiving/new', render: receivingForm },
  { path: '/qa', render: qa },
  { path: '/returns', render: rts },
  { path: '/inventory', render: stock },
  { path: '/inventory/movements', render: ledger },
  { path: '/materials', render: materialsPage },
]
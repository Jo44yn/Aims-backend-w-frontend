import { deliveries, contractItems, contracts } from '../../lib/data.js'
import { badge, form, header, link, listPage, num, table } from '../../lib/ui.js'

// S25
const list = () => listPage({
  title: 'Deliveries', crumbs: [['Home', '#/dashboard'], ['Deliveries']], action: `<a class="btn btn-primary" href="#/deliveries/create">+ Create DR</a>`,
  cols: [{ label: 'DR no.', render: (r) => link('#/deliveries/' + r.id + '/acceptance', r.no) }, { k: 'contract', label: 'Contract' }, { k: 'client', label: 'Client' }, { k: 'date', label: 'Date' }, { k: 'qty', label: 'Qty', right: true, render: (r) => num(r.qty) }, { k: 'vehicle', label: 'Vehicle' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: deliveries, statusKey: 'status',
})

// S26 – pick ready stock of ONE contract (BR-22), then print the DR
const create = () => header({ title: 'Create delivery receipt', crumbs: [['Home', '#/dashboard'], ['Deliveries', '#/deliveries'], ['Create']] }) + `
<div class="card max-w-4xl p-5" x-data="{qty:{1:0,2:0}, ready:{1:0,2:296}}">
  <label class="label" for="ct">Contract</label>
  <select id="ct" class="input max-w-md">${contracts.slice(0, 2).map((c) => `<option>${c.no} · ${c.client}</option>`).join('')}</select>
  <p class="mt-1 text-xs text-muted">A DR may include only QA-passed stock allocated to this same contract (BR-22).</p>
  <div class="overflow-x-auto"><table class="tbl mt-4"><thead><tr><th>Item</th><th class="text-right">Ready</th><th class="text-right">Deliver now</th></tr></thead><tbody>
    ${contractItems.slice(1).map((i, k) => `<tr><td>${i.item}</td><td class="text-right tabular-nums" x-text="ready[${k + 1}]"></td><td class="text-right"><input class="input ml-auto w-28 text-right" type="number" min="0" :max="ready[${k + 1}]" x-model.number="qty[${k + 1}]" aria-label="Quantity for ${i.item}"></td></tr>`).join('')}
  </tbody></table></div>
  <div class="mt-4 grid gap-3 sm:grid-cols-3"><div><label class="label" for="dv">Vehicle</label><input id="dv" class="input" value="Isuzu NPR · ABC 1234"></div><div><label class="label" for="dd">Delivery date</label><input id="dd" type="date" class="input"></div><div><label class="label" for="dr">Received by (name)</label><input id="dr" class="input"></div></div>
  <p class="mt-3 text-sm text-danger" x-show="qty[2] > ready[2]">Quantity exceeds ready stock.</p>
  <div class="mt-4 flex justify-end gap-2"><a class="btn btn-ghost" href="#/deliveries">Cancel</a><button class="btn btn-primary" @click="qty[2] > ready[2] ? $store.ui.toast('Fix quantities first') : ($store.ui.toast('DR posted (demo)'), location.hash = '/deliveries/27/acceptance')">Post &amp; print DR</button></div>
</div>`

// S27 – IAR number, accepted quantities, scan upload
const acceptance = ({ id }) => {
  const d = deliveries.find((x) => x.id === Number(id)) || deliveries[0]
  return header({ title: `Record acceptance · ${d.no}`, crumbs: [['Home', '#/dashboard'], ['Deliveries', '#/deliveries'], [d.no]], actions: `<button class="btn btn-ghost" @click="window.print()">Print DR</button>` }) + `
<div class="card max-w-4xl p-5">
  <div class="grid gap-3 sm:grid-cols-3"><div><label class="label" for="iar">IAR number</label><input id="iar" class="input" value="IAR-2026-118"></div><div><label class="label" for="iard">IAR date</label><input id="iard" type="date" class="input"></div><div><label class="label" for="iarf">Scan of signed IAR</label><input id="iarf" type="file" class="input"></div></div>
  <table class="tbl mt-4"><thead><tr><th>Item</th><th class="text-right">Delivered</th><th class="text-right">Accepted</th></tr></thead><tbody>
    <tr><td>Embroidered unit patch, 3 in</td><td class="text-right tabular-nums">2,000</td><td><input class="input ml-auto w-28 text-right" type="number" value="2000" aria-label="Accepted patches"></td></tr>
    <tr><td>Tactical boots, sizes 6–11</td><td class="text-right tabular-nums">296</td><td><input class="input ml-auto w-28 text-right" type="number" value="296" aria-label="Accepted boots"></td></tr></tbody></table>
  <p class="mt-3 text-xs text-muted">A line is “Accepted” only after the IAR is recorded (BR-23). Billing uses accepted quantities only (BR-24).</p>
  <div class="mt-4 flex justify-end gap-2"><a class="btn btn-ghost" href="#/deliveries">Back</a><button class="btn btn-primary" @click="$store.ui.toast('Acceptance recorded (demo)')">Save acceptance</button></div>
</div>`
}

export const deliveryRoutes = [
  { path: '/deliveries', render: list },
  { path: '/deliveries/create', render: create },
  { path: '/deliveries/:id/acceptance', render: acceptance },
]
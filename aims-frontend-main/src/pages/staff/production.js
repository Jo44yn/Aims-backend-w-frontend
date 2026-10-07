import { designs, jobOrders } from '../../lib/data.js'
import { badge, header, listPage } from '../../lib/ui.js'

// S23 – designs, client approval, bill of materials
const designList = () => listPage({
  title: 'Patch designs', crumbs: [['Home', '#/dashboard'], ['Designs']], action: `<button class="btn btn-primary" @click="$store.ui.toast('Design form (demo)')">+ New design</button>`,
  note: 'A job order needs a client-approved design (BR-20).',
  cols: [{ k: 'name', label: 'Design' }, { k: 'client', label: 'Client' }, { k: 'size', label: 'Size' }, { k: 'stitches', label: 'Stitches', right: true, render: (r) => r.stitches.toLocaleString() }, { k: 'approved', label: 'Client approval' }, { label: 'Status', render: (r) => badge(r.status) },
    { label: 'BOM', render: () => `<button class="link" @click="$store.ui.toast('Thread 0.4 cone/100 pcs · Twill 0.02 m/pc · Backing 0.02 m/pc (demo)')">View</button>` }],
  rows: designs, statusKey: 'status',
})

// S24 – board by status
const COLS = [['Queued', 'border-gray-400'], ['In production', 'border-info'], ['For QA', 'border-warning'], ['Done', 'border-success']]
const board = () => header({ title: 'Job orders', crumbs: [['Home', '#/dashboard'], ['Job orders']], actions: `<button class="btn btn-primary" @click="$store.ui.toast('Job order form (demo)')">+ New job order</button>` }) + `
<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">${COLS.map(([s, border]) => `
  <section aria-label="${s}"><h2 class="mb-2 flex items-center justify-between font-head text-lg text-primary">${s}<span class="text-sm text-muted">${jobOrders.filter((j) => j.status === s).length}</span></h2>
    <div class="space-y-3">${jobOrders.filter((j) => j.status === s).map((j) => `
      <article class="card border-t-4 p-3 ${border}"><p class="text-xs font-semibold text-muted">${j.no} · ${j.contract}</p><p class="font-semibold">${j.design}</p>
        <p class="mt-1 text-sm text-muted">${j.qty.toLocaleString()} pcs · due ${j.due}</p><p class="text-xs text-muted">Machine ${j.machine}</p>
        ${s === 'In production' ? `<button class="btn btn-primary mt-2 w-full" @click="$store.ui.toast('Output sent to QA, materials consumed (demo)')">Complete job</button>` : ''}</article>`).join('') || '<p class="card p-3 text-sm text-muted">Empty</p>'}</div></section>`).join('')}
</div>`

export const productionRoutes = [
  { path: '/designs', render: designList },
  { path: '/job-orders', render: board },
]
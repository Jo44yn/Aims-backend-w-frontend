import { badge, can, header, listPage, form, esc } from '../../lib/ui.js'
import { api } from '../../lib/api.js'
import { asyncRoute, unwrap, actionButton } from '../../lib/source.js'

const edit = (href) => `<a class="btn btn-ghost !py-1" href="${href}">Edit</a>`

// ── S23 – designs and client approval ──────────────────────────────────────
const designList = asyncRoute('patch designs', async () => listPage({
  title: 'Patch designs', crumbs: [['Home', '#/dashboard'], ['Designs']], action: can('production') ? `<a class="btn btn-primary" href="#/designs/new">+ New design</a>` : '',
  note: 'A job order needs a client-approved design (BR-20). If the client changes the design, edit it and untick approval until they sign off again.',
  cols: [{ k: 'name', label: 'Design' }, { k: 'client', label: 'Client' }, { k: 'size', label: 'Size' }, { k: 'stitches', label: 'Stitches', right: true, render: (r) => Number(r.stitches).toLocaleString() }, { k: 'approved', label: 'Client approval' }, { label: 'Status', render: (r) => badge(r.status) },
    ...(can('production') ? [{ label: '', render: (r) => `<div class="flex gap-1">${r.status === 'Approved' ? '' : actionButton('Mark approved', async () => { await api.approveDesign(r.id); return `${r.name} marked as client-approved.` }, 'btn-ghost !py-1')}${edit('#/designs/' + r.id + '/edit')}${actionButton('Delete', async () => { await api.deleteDesign(r.id); return `${r.name} deleted.` }, 'btn-ghost !py-1', `Delete design ${r.name}?`)}</div>` }] : [])],
  rows: unwrap(await api.designs()), statusKey: 'status',
}))

const designFields = (clients, d = {}) => [
  { name: 'name', label: 'Design name', required: true, span: 2, value: d.name },
  { name: 'client_id', label: 'Client', type: 'select', required: true, options: clients.map((c) => ({ value: c.id, label: esc(c.name) })), value: d.clientId },
  { name: 'size', label: 'Size', required: true, placeholder: '3 in', value: d.size },
  { name: 'colors', label: 'Colours', placeholder: 'Navy, gold, white', value: d.colors },
  { name: 'stitch_count', label: 'Stitch count', type: 'number', value: d.stitches },
  { name: 'approved', label: 'Client approval', type: 'checkbox', checkLabel: 'The client has approved this design', value: d.status === 'Approved', span: 2 },
]
const designBody = (d) => ({ client_id: Number(d.client_id), name: d.name.trim(), size: d.size.trim(), colors: d.colors || null, stitch_count: d.stitch_count === '' ? 0 : Number(d.stitch_count), approved: !!d.approved })

const designForm = asyncRoute('clients', async () => {
  const clients = unwrap(await api.clients())
  return form({
    title: 'New patch design', crumbs: [['Home', '#/dashboard'], ['Designs', '#/designs'], ['New']], back: '/designs', submit: 'Create design',
    onSubmit: async (d) => { await api.createDesign(designBody(d)); return `Design "${d.name}" created.` },
    fields: designFields(clients),
  })
})

const designEdit = asyncRoute('design', async ({ id }) => {
  const [clients, designs] = await Promise.all([api.clients().then(unwrap), api.designs().then(unwrap)])
  const d0 = designs.find((x) => String(x.id) === String(id))
  if (!d0) return `<p class="p-10 text-center">Design not found.</p>`
  return form({
    title: `Edit ${esc(d0.name)}`, crumbs: [['Home', '#/dashboard'], ['Designs', '#/designs'], [d0.name]], back: '/designs', submit: 'Save changes', actions: badge(d0.status),
    onSubmit: async (d) => { await api.updateDesign(d0.id, designBody(d)); return `${d.name} updated.` },
    fields: designFields(clients, d0),
  })
})

// ── S24 – job order board ──────────────────────────────────────────────────
const COLS = [['Queued', 'border-gray-400'], ['In production', 'border-info'], ['For QA', 'border-warning'], ['Done', 'border-success']]
const NEXT = { Queued: ['Start production', 'btn-ghost', (j) => `${j.no} is now in production.`], 'In production': ['Complete job', 'btn-primary', (j) => `${j.no} sent to QA.`] }

const board = asyncRoute('job orders', async () => {
  const jobs = unwrap(await api.jobOrders())
  const card = (j, s, border) => {
    const next = NEXT[s]
    const editable = can('production') && (s === 'Queued' || s === 'In production')
    return `<article class="card border-t-4 p-3 ${border}"><p class="text-xs font-semibold text-muted">${esc(j.no)} · ${esc(j.contract)}</p><p class="font-semibold">${esc(j.design)}</p>
      <p class="mt-1 text-sm text-muted">${Number(j.qty).toLocaleString()} pcs · due ${esc(j.due)}</p><p class="text-xs text-muted">Machine ${esc(j.machine)}</p>
      ${next && can('production') ? `<div class="mt-2 grid">${actionButton(next[0], async () => { await api.advanceJobOrder(j.id); return next[2](j) }, next[1])}</div>` : ''}
      ${editable ? `<div class="mt-2 flex gap-1">${edit('#/job-orders/' + j.id + '/edit')}${s === 'Queued' ? actionButton('Cancel job', async () => { await api.deleteJobOrder(j.id); return `${j.no} cancelled.` }, 'btn-ghost !py-1', `Cancel job order ${j.no}?`) : ''}</div>` : ''}</article>`
  }
  return header({ title: 'Job orders', crumbs: [['Home', '#/dashboard'], ['Job orders']], actions: can('production') ? `<a class="btn btn-primary" href="#/job-orders/new">+ New job order</a>` : '' }) + `
<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">${COLS.map(([s, border]) => `
  <section aria-label="${s}"><h2 class="mb-2 flex items-center justify-between font-head text-lg text-primary">${s}<span class="text-sm text-muted">${jobs.filter((j) => j.status === s).length}</span></h2>
    <div class="space-y-3">${jobs.filter((j) => j.status === s).map((j) => card(j, s, border)).join('') || '<p class="card p-3 text-sm text-muted">Empty</p>'}</div></section>`).join('')}
</div>`
})

const jobForm = asyncRoute('contract lines and designs', async () => {
  const opts = await api.jobOrderOptions()
  const noItems = !opts.contractItems.length
  const noDesigns = !opts.designs.length
  return form({
    title: 'New job order', crumbs: [['Home', '#/dashboard'], ['Job orders', '#/job-orders'], ['New']], back: '/job-orders', submit: 'Create job order',
    onSubmit: async (d) => {
      await api.createJobOrder({
        contract_item_id: Number(d.contract_item_id), patch_design_id: Number(d.patch_design_id), quantity: Number(d.quantity),
        start_date: d.start_date || null, due_date: d.due_date, machine_no: d.machine_no || null,
      })
      return 'Job order created and queued.'
    },
    fields: [
      { name: 'contract_item_id', label: 'Contract line (in-house items)', type: 'select', required: true, span: 2, options: opts.contractItems.map((i) => ({ value: i.id, label: esc(i.label) })), hint: noItems ? 'No in-house contract lines yet. Create a contract that contains an in-house product first.' : '' },
      { name: 'patch_design_id', label: 'Patch design (client-approved only)', type: 'select', required: true, span: 2, options: opts.designs.map((d) => ({ value: d.id, label: esc(d.label) })), hint: noDesigns ? 'No approved designs yet. Add a design or mark one as approved on the Designs page.' : '' },
      { name: 'quantity', label: 'Quantity (pcs)', type: 'number', required: true },
      { name: 'machine_no', label: 'Machine', placeholder: 'M-01' },
      { name: 'start_date', label: 'Start date', type: 'date' },
      { name: 'due_date', label: 'Due date', type: 'date', required: true },
    ],
  })
})

// Quantity, dates and machine can change while the job has not reached QA.
const jobEdit = asyncRoute('job order', async ({ id }) => {
  const j = unwrap(await api.jobOrders()).find((x) => String(x.id) === String(id))
  if (!j) return `<p class="p-10 text-center">Job order not found.</p>`
  return form({
    title: `Edit ${esc(j.no)}`, crumbs: [['Home', '#/dashboard'], ['Job orders', '#/job-orders'], [j.no]], back: '/job-orders', submit: 'Save changes', actions: badge(j.status),
    onSubmit: async (d) => {
      await api.updateJobOrder(j.id, { quantity: Number(d.quantity), start_date: d.start_date || null, due_date: d.due_date, machine_no: d.machine_no || null })
      return `${j.no} updated.`
    },
    fields: [
      { name: 'contract', label: 'Contract', readonly: true, value: j.contract },
      { name: 'design', label: 'Design', readonly: true, value: j.design },
      { name: 'quantity', label: 'Quantity (pcs)', type: 'number', required: true, value: j.qty },
      { name: 'machine_no', label: 'Machine', placeholder: 'M-01', value: j.machineNo },
      { name: 'start_date', label: 'Start date', type: 'date', value: j.startIso },
      { name: 'due_date', label: 'Due date', type: 'date', required: true, value: j.dueIso },
    ],
  })
})

export const productionRoutes = [
  { path: '/designs', render: designList },
  { path: '/designs/new', render: designForm },
  { path: '/designs/:id/edit', render: designEdit },
  { path: '/job-orders', render: board },
  { path: '/job-orders/new', render: jobForm },
  { path: '/job-orders/:id/edit', render: jobEdit },
]

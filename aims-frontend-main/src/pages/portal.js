import { contracts, contractItems, portalDocs } from '../lib/data.js'
import { esc, badge, bar, header, kpi, listPage, peso, table, timeline, form, link } from '../lib/ui.js'
import { errorRoutes } from './errors.js'
import { getUser, api } from '../lib/api.js'
import { asyncRoute, unwrap } from '../lib/source.js'
import { profileRoute } from './profile.js'

const mine = contracts.filter((c) => c.clientId === 1) // this portal user belongs to client 1

const progressCard = (c) => `
<a href="#/portal/contracts/${c.id}" class="card block p-4 transition-shadow hover:shadow-md">
  <div class="flex items-start justify-between gap-2"><div><p class="text-xs font-semibold text-muted">${c.no}</p><h3 class="font-head text-lg text-primary">${c.title}</h3></div>${badge(c.deadlineStatus)}</div>
  <div class="mt-3">${bar([{ n: c.pct, cls: 'bg-success', label: 'Delivered' }, { n: 100 - c.pct, cls: 'bg-line', label: 'Remaining' }])}</div>
  <p class="mt-2 flex justify-between text-xs text-muted"><span>${c.pct}% delivered</span><span>Deadline ${c.deadline}</span></p>
</a>`

// C01
const dashboard = () => `
${header({ title: 'Welcome, ' + esc((getUser() || {}).name || 'client'), crumbs: [['Portal']] })}
<div class="grid gap-4 sm:grid-cols-3">
  ${kpi('Active contracts', mine.filter((c) => c.status === 'In progress').length, 'In progress', 'primary')}
  ${kpi('Next delivery', 'Nov 5', 'DR-2026-0028 scheduled', 'info')}
  ${kpi('Documents ready', portalDocs.length, 'DRs and billing statements', 'success')}
</div>
<h2 class="mb-3 mt-8 font-head text-xl text-primary">Your contracts</h2>
<div class="grid gap-4 md:grid-cols-2">${mine.map(progressCard).join('')}</div>`

// C02
const list = () => `${header({ title: 'My contracts', crumbs: [['Portal', '#/portal'], ['Contracts']] })}<div class="grid gap-4 md:grid-cols-2">${mine.map(progressCard).join('')}</div>`

// C03 – the item status trail
const track = ({ id }) => {
  const c = contracts.find((x) => x.id === Number(id))
  if (!c || c.clientId !== 1) return `<p class="p-10 text-center">Contract not found.</p>`
  const trail = (i) => timeline([
    { label: 'Ordered', state: 'done' },
    { label: 'Received', state: i.b.awaiting === i.qty ? 'now' : 'done' },
    { label: 'Inspected', state: i.b.awaiting === i.qty ? 'todo' : 'done' },
    { label: 'Delivered', state: i.b.accepted + i.b.delivered > 0 ? 'done' : 'todo' },
    { label: 'Accepted', state: i.b.accepted === i.qty ? 'done' : i.b.accepted > 0 ? 'now' : 'todo' },
  ])
  return `
${header({ title: c.no, crumbs: [['Portal', '#/portal'], ['Contracts', '#/portal/contracts'], [c.no]], actions: badge(c.deadlineStatus) })}
<p class="-mt-3 mb-4 text-muted">${c.title} · Deadline ${c.deadline}</p>
<div class="grid gap-4">${(id === '12' ? contractItems : []).map((i) => `
  <div class="card p-4">
    <div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="font-head text-lg text-primary">Line ${i.line}: ${i.item}</h3><span class="tabular-nums text-sm text-muted">${i.qty.toLocaleString()} ordered</span></div>
    <div class="my-3">${trail(i)}</div>
    ${bar([{ n: i.b.accepted, cls: 'bg-success', label: 'Accepted' }, { n: i.b.delivered, cls: 'bg-green-400', label: 'Delivered' }, { n: i.b.ready, cls: 'bg-success/60', label: 'Ready' }, { n: i.b.forQa, cls: 'bg-warning', label: 'For QA' }, { n: i.b.awaiting, cls: 'bg-info', label: 'Awaiting supplier' }])}
    <p class="mt-2 text-xs text-muted">Accepted ${i.b.accepted} · Awaiting supplier ${i.b.awaiting}</p>
  </div>`).join('') || '<p class="card p-6 text-muted">Item tracking appears once purchasing starts.</p>'}</div>`
}

// C04
const documents = () => listPage({
  title: 'Documents', crumbs: [['Portal', '#/portal'], ['Documents']],
  cols: [{ k: 'type', label: 'Type' }, { k: 'no', label: 'Number' }, { k: 'contract', label: 'Contract' }, { k: 'date', label: 'Date' },
    { label: '', render: (r) => `<button class="btn btn-ghost" @click="$store.ui.toast('Downloading ${r.no} (demo)')">Download PDF</button>` }],
  rows: portalDocs, statusKey: 'type',
})

// C05 – the client's own quotation requests (from the API)
const inq = asyncRoute('your inquiries', async () => listPage({
  title: 'Inquiries', crumbs: [['Portal', '#/portal'], ['Inquiries']],
  action: link('#/portal/inquiries/new', '+ New quotation request').replace('class="link"', 'class="btn btn-primary"'),
  note: 'Our team replies by email. The status changes to Quoted once a quotation was sent.',
  cols: [{ k: 'date', label: 'Date' }, { label: 'Items', render: (r) => `<span class="whitespace-pre-line">${esc(r.items)}</span>` }, { k: 'neededBy', label: 'Needed by' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: unwrap(await api.myInquiries()), statusKey: 'status',
}))
const inqNew = () => form({
  title: 'New quotation request', crumbs: [['Portal', '#/portal'], ['Inquiries', '#/portal/inquiries'], ['New']], back: '/portal/inquiries', submit: 'Send request',
  onSubmit: async (d) => { await api.createPortalInquiry({ items: d.items.trim(), needed_by: d.needed || null }); return 'Request sent. We will reply by email.' },
  fields: [{ name: 'items', label: 'Items and quantities', type: 'textarea', span: 2, required: true }, { name: 'needed', label: 'Needed by', type: 'date' }],
})

// C06 – real account of the signed-in client (see pages/profile.js)
const profile = profileRoute({ crumbs: [['Portal', '#/portal'], ['Account']], back: '/portal' })

export const portalRoutes = [
  { path: '/portal', render: dashboard },
  { path: '/portal/contracts', render: list },
  { path: '/portal/contracts/:id', render: track },
  { path: '/portal/documents', render: documents },
  { path: '/portal/inquiries', render: inq },
  { path: '/portal/inquiries/new', render: inqNew },
  { path: '/portal/profile', render: profile },
  ...errorRoutes,
]
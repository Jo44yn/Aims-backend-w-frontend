import { bids } from '../../lib/data.js'
import { badge, can, form, header, link, listPage, peso, table, tabs, esc } from '../../lib/ui.js'
import { api } from '../../lib/api.js'
import { asyncRoute, unwrap, actionButton } from '../../lib/source.js'

const plus = (href, label) => `<a class="btn btn-primary" href="${href}">${label}</a>`
const BRANCHES = ['Army', 'Air Force', 'Navy', 'PNP', 'Private', 'Other']

// ── S02 – clients (from the API) ───────────────────────────────────────────
const clientList = asyncRoute('clients', async () => listPage({
  title: 'Clients', crumbs: [['Home', '#/dashboard'], ['Clients']], action: can('clients') ? plus('#/clients/new', '+ New client') : '',
  cols: [
    { k: 'code', label: 'Code' }, { label: 'Name', render: (r) => link('#/clients/' + r.id, esc(r.name)) },
    { k: 'branch', label: 'Branch' }, { k: 'type', label: 'Type' }, { k: 'contact', label: 'Contact' }, { k: 'contracts', label: 'Contracts', right: true },
    ...(can('clients') ? [{ label: '', render: (r) => `<a class="btn btn-ghost !py-1" href="#/clients/${r.id}/edit">Edit</a>` }] : []),
  ],
  rows: unwrap(await api.clients()), statusKey: 'branch',
}))

// ── S03 – form (create and edit share the fields) ──────────────────────────
const clientFields = (c = {}) => [
  { name: 'name', label: 'Organization name', required: true, span: 2, value: c.name },
  { name: 'branch', label: 'Branch', type: 'select', options: BRANCHES, required: true, value: c.branch },
  { name: 'type', label: 'Type', type: 'select', options: ['government', 'private'], required: true, value: c.type, hint: 'Government clients get withholding computed on invoices.' },
  { name: 'tin', label: 'TIN', value: c.tin }, { name: 'contact', label: 'Contact person', required: true, value: c.contact },
  { name: 'phone', label: 'Contact no.', value: c.phone }, { name: 'email', label: 'Email', type: 'email', value: c.email },
  { name: 'address', label: 'Address', type: 'textarea', span: 2, value: c.address },
]
const clientBody = (d) => ({ name: d.name.trim(), branch: d.branch, type: d.type, tin: d.tin || null, contact: d.contact.trim(), phone: d.phone || null, email: d.email || null, address: d.address || null })

const clientForm = () => form({
  title: 'New client', crumbs: [['Home', '#/dashboard'], ['Clients', '#/clients'], ['New']], back: '/clients', submit: 'Create client',
  onSubmit: async (d) => { await api.createClient(clientBody(d)); return `Client "${d.name}" created.` },
  fields: clientFields(),
})

const clientEdit = asyncRoute('client', async ({ id }) => {
  const c = unwrap(await api.client(id))
  return form({
    title: `Edit ${esc(c.name)}`, crumbs: [['Home', '#/dashboard'], ['Clients', '#/clients'], [c.code, '#/clients/' + c.id], ['Edit']], back: '/clients/' + c.id, submit: 'Save changes',
    onSubmit: async (d) => { await api.updateClient(c.id, clientBody(d)); return `${d.name} updated.` },
    fields: clientFields(c),
  })
})

// ── S03 – detail ───────────────────────────────────────────────────────────
const clientDetail = asyncRoute('client', async ({ id }) => {
  const c = unwrap(await api.client(id).catch(() => ({ data: null })))
  if (!c) return `<p class="p-10 text-center">Client not found.</p>`
  const own = c.contractRows || []
  return header({ title: esc(c.name), crumbs: [['Home', '#/dashboard'], ['Clients', '#/clients'], [c.code]], actions: can('clients') ? `<a class="btn btn-ghost" href="#/clients/${c.id}/edit">Edit</a>` : '' }) +
    tabs([
      { id: 'p', label: 'Profile', html: `<div class="card grid gap-4 p-5 sm:grid-cols-2">${[['Branch', c.branch], ['Type', c.type], ['TIN', c.tin || '—'], ['Contact', c.contact], ['Phone', c.phone || '—'], ['Email', c.email || '—'], ['Address', c.address || '—']].map(([a, b]) => `<div><p class="label">${a}</p><p>${esc(b)}</p></div>`).join('')}</div>` },
      { id: 'c', label: `Contracts (${own.length})`, html: table({ cols: [{ label: 'No.', render: (r) => link('#/contracts/' + r.id, r.no) }, { k: 'title', label: 'Title' }, { k: 'amount', label: 'Amount', right: true, render: (r) => peso(r.amount) }, { label: 'Status', render: (r) => badge(r.status) }], rows: own, search: false }) },
      { id: 'u', label: 'Portal users', html: `<div class="card p-5"><p>${esc(c.contact)} · ${esc(c.email || '—')}</p><p class="mt-2 text-sm text-muted">Create a login for this client under Administration → Users & roles (role: client, then pick this organization).</p></div>` },
    ])
})

// ── S04 – inquiries inbox (public site + client portal) ────────────────────
const inquiryList = asyncRoute('inquiries', async () => {
  const rows = unwrap(await api.inquiries())
  const set = (r, status) => actionButton(status === 'new' ? 'Reopen' : status === 'quoted' ? 'Mark quoted' : 'Close', async () => { await api.updateInquiry(r.id, { status }); return `Inquiry from ${r.name} marked ${status}.` }, 'btn-ghost !py-1')
  return listPage({
    title: 'Inquiries inbox', crumbs: [['Home', '#/dashboard'], ['Inquiries']], note: 'Quotation requests from the public site and the client portal. Reply by email, then mark them as quoted or closed.',
    cols: [{ k: 'date', label: 'Date' }, { label: 'From', render: (r) => `${esc(r.name)}<br><a class="link text-xs" href="mailto:${esc(r.email)}">${esc(r.email)}</a>${r.phone ? `<br><span class="text-xs text-muted">${esc(r.phone)}</span>` : ''}` },
      { k: 'org', label: 'Organization' }, { label: 'Items', render: (r) => `<span class="whitespace-pre-line">${esc(r.items)}</span>` }, { k: 'neededBy', label: 'Needed by' }, { label: 'Status', render: (r) => badge(r.status) },
      ...(can('clients') ? [{ label: '', render: (r) => `<div class="flex gap-1">${r.status !== 'Quoted' ? set(r, 'quoted') : ''}${r.status !== 'Closed' ? set(r, 'closed') : ''}${r.status !== 'New' ? set(r, 'new') : ''}</div>` }] : [])],
    rows, statusKey: 'status',
  })
})

// S05 – extended feature (still sample data: bids are an extended feature in the blueprint)
const bidList = () => listPage({
  title: 'Bids log', crumbs: [['Home', '#/dashboard'], ['Bids']], action: `<span class="badge badge-gray">Extended feature · sample data</span>`,
  note: 'Bidding happens offline. This log only tracks opportunities and results; AIMS starts at the Notice of Award.',
  cols: [{ k: 'ref', label: 'PhilGEPS ref' }, { k: 'client', label: 'Agency' }, { k: 'title', label: 'Title' }, { k: 'abc', label: 'ABC', right: true, render: (r) => peso(r.abc) }, { k: 'bid', label: 'Our bid', right: true, render: (r) => (r.bid ? peso(r.bid) : '—') }, { k: 'due', label: 'Due' }, { label: 'Result', render: (r) => badge(r.status) }],
  rows: bids, statusKey: 'status',
})

export const salesRoutes = [
  { path: '/clients', render: clientList },
  { path: '/clients/new', render: clientForm },
  { path: '/clients/:id/edit', render: clientEdit },
  { path: '/clients/:id', render: clientDetail },
  { path: '/inquiries', render: inquiryList },
  { path: '/bids', render: bidList },
]

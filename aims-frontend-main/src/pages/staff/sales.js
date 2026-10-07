import { clients, contracts, bids, inquiries } from '../../lib/data.js'
import { badge, form, header, link, listPage, peso, table, tabs } from '../../lib/ui.js'

const plus = (href, label) => `<a class="btn btn-primary" href="${href}">${label}</a>`

// S02
const clientList = () => listPage({
  title: 'Clients', crumbs: [['Home', '#/dashboard'], ['Clients']], action: plus('#/clients/new', '+ New client'),
  cols: [
    { k: 'code', label: 'Code' }, { label: 'Name', render: (r) => link('#/clients/' + r.id, r.name) },
    { k: 'branch', label: 'Branch' }, { k: 'type', label: 'Type' }, { k: 'contact', label: 'Contact' }, { k: 'contracts', label: 'Contracts', right: true },
  ],
  rows: clients, statusKey: 'branch',
})

// S03 – form
const clientForm = () => form({
  title: 'New client', crumbs: [['Home', '#/dashboard'], ['Clients', '#/clients'], ['New']], back: '/clients',
  fields: [
    { name: 'name', label: 'Organization name', required: true, span: 2 },
    { name: 'branch', label: 'Branch', type: 'select', options: ['Army', 'Air Force', 'Navy', 'PNP', 'Private', 'Other'], required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['government', 'private'], required: true, hint: 'Government clients get withholding computed on invoices.' },
    { name: 'tin', label: 'TIN' }, { name: 'contact', label: 'Contact person', required: true },
    { name: 'phone', label: 'Contact no.' }, { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'textarea', span: 2 },
  ],
})

// S03 – detail
const clientDetail = ({ id }) => {
  const c = clients.find((x) => x.id === Number(id))
  if (!c) return `<p class="p-10 text-center">Client not found.</p>`
  const own = contracts.filter((x) => x.clientId === c.id)
  return header({ title: c.name, crumbs: [['Home', '#/dashboard'], ['Clients', '#/clients'], [c.code]], actions: `<button class="btn btn-ghost" @click="$store.ui.toast('Edit form (demo)')">Edit</button>` }) +
    tabs([
      { id: 'p', label: 'Profile', html: `<div class="card grid gap-4 p-5 sm:grid-cols-2">${[['Branch', c.branch], ['Type', c.type], ['TIN', c.tin], ['Contact', c.contact], ['Phone', c.phone], ['Email', c.email], ['Address', c.address]].map(([a, b]) => `<div><p class="label">${a}</p><p>${b}</p></div>`).join('')}</div>` },
      { id: 'c', label: `Contracts (${own.length})`, html: table({ cols: [{ label: 'No.', render: (r) => link('#/contracts/' + r.id, r.no) }, { k: 'title', label: 'Title' }, { k: 'amount', label: 'Amount', right: true, render: (r) => peso(r.amount) }, { label: 'Status', render: (r) => badge(r.deadlineStatus) }], rows: own, search: false }) },
      { id: 'u', label: 'Portal users', html: `<div class="card p-5"><p>${c.contact} · ${c.email}</p><button class="btn btn-ghost mt-3" @click="$store.ui.toast('Invite sent (demo)')">Invite portal user</button></div>` },
    ])
}

// S04
const inquiryList = () => listPage({
  title: 'Inquiries inbox', crumbs: [['Home', '#/dashboard'], ['Inquiries']], note: 'Quotation requests from the public site and the client portal.',
  cols: [{ k: 'date', label: 'Date' }, { k: 'name', label: 'From' }, { k: 'org', label: 'Organization' }, { k: 'items', label: 'Items' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: inquiries, statusKey: 'status',
})

// S05 – extended feature
const bidList = () => listPage({
  title: 'Bids log', crumbs: [['Home', '#/dashboard'], ['Bids']], action: `<span class="badge badge-gray">Extended feature</span>`,
  note: 'Bidding happens offline. This log only tracks opportunities and results; AIMS starts at the Notice of Award.',
  cols: [{ k: 'ref', label: 'PhilGEPS ref' }, { k: 'client', label: 'Agency' }, { k: 'title', label: 'Title' }, { k: 'abc', label: 'ABC', right: true, render: (r) => peso(r.abc) }, { k: 'bid', label: 'Our bid', right: true, render: (r) => (r.bid ? peso(r.bid) : '—') }, { k: 'due', label: 'Due' }, { label: 'Result', render: (r) => badge(r.status) }],
  rows: bids, statusKey: 'status',
})

export const salesRoutes = [
  { path: '/clients', render: clientList },
  { path: '/clients/new', render: clientForm },
  { path: '/clients/:id', render: clientDetail },
  { path: '/inquiries', render: inquiryList },
  { path: '/bids', render: bidList },
]
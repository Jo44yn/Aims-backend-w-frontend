import { products, suppliers, priceAgreements, purchaseOrders } from '../../lib/data.js'
import { badge, header, link, listPage, peso, table, tabs, form } from '../../lib/ui.js'

// S09 – products and variants
const productList = () => listPage({
  title: 'Products & variants', crumbs: [['Home', '#/dashboard'], ['Products']], action: `<button class="btn btn-primary" @click="$store.ui.toast('Product form (demo)')">+ New product</button>`,
  cols: [{ k: 'code', label: 'Code' }, { k: 'name', label: 'Product' }, { k: 'category', label: 'Category' }, { label: 'Sourcing', render: (r) => `<span class="badge ${r.sourcing === 'In-house' ? 'badge-teal' : 'badge-gray'}">${r.sourcing}</span>` },
    { k: 'uom', label: 'UoM' }, { label: 'Variants', render: (r) => `<span class="text-muted">${r.sizes.join(' · ')}</span>` }],
  rows: products, statusKey: 'category',
})

// S10
const supplierList = () => listPage({
  title: 'Suppliers', crumbs: [['Home', '#/dashboard'], ['Suppliers']], action: `<a class="btn btn-primary" href="#/suppliers/new">+ New supplier</a>`,
  note: 'Only suppliers with status Approved can receive purchase orders (BR-06).',
  cols: [{ k: 'code', label: 'Code' }, { label: 'Name', render: (r) => link('#/suppliers/' + r.id, r.name) }, { k: 'type', label: 'Type' }, { k: 'terms', label: 'Terms (days)', right: true }, { k: 'lead', label: 'Lead time (days)', right: true }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: suppliers, statusKey: 'status',
})

const supplierForm = () => form({
  title: 'New supplier', crumbs: [['Home', '#/dashboard'], ['Suppliers', '#/suppliers'], ['New']], back: '/suppliers',
  fields: [
    { name: 'name', label: 'Supplier name', required: true, span: 2 }, { name: 'type', label: 'Type', type: 'select', options: ['brand_partner', 'local', 'subcontractor'], required: true },
    { name: 'tin', label: 'TIN' }, { name: 'contact', label: 'Contact person', required: true }, { name: 'email', label: 'Email (POs are sent here)', type: 'email', required: true },
    { name: 'terms', label: 'Payment terms (days)', type: 'number' }, { name: 'lead', label: 'Default lead time (days)', type: 'number' },
  ],
  extra: `<fieldset class="md:col-span-2"><legend class="font-head text-lg text-primary">Vetting checklist</legend>
    ${['Business permit on file', 'DTI / SEC registration on file', 'BIR Form 2303 on file'].map((l) => `<label class="mt-2 flex items-center gap-2"><input type="checkbox"> ${l}</label>`).join('')}
    <div class="mt-3"><label class="label">Vetting documents</label><input type="file" class="input" multiple></div></fieldset>`,
})

// S11
const supplierDetail = ({ id }) => {
  const s = suppliers.find((x) => x.id === Number(id))
  if (!s) return `<p class="p-10 text-center">Supplier not found.</p>`
  const pa = priceAgreements.filter((p) => p.supplier === s.name)
  const pos = purchaseOrders.filter((p) => p.supplier === s.name)
  return header({ title: s.name, crumbs: [['Home', '#/dashboard'], ['Suppliers', '#/suppliers'], [s.code]], actions: badge(s.status) }) + tabs([
    { id: 'p', label: 'Profile & documents', html: `<div class="card grid gap-4 p-5 sm:grid-cols-2">${[['Type', s.type], ['Contact', s.contact], ['Email', s.email], ['Payment terms', s.terms + ' days'], ['Lead time', s.lead + ' days']].map(([a, b]) => `<div><p class="label">${a}</p><p>${b}</p></div>`).join('')}</div>` },
    { id: 'a', label: `Price agreements (${pa.length})`, html: table({ cols: [{ k: 'ref', label: 'Ref' }, { k: 'product', label: 'Product' }, { k: 'cost', label: 'Unit cost', right: true, render: (r) => peso(r.cost) }, { k: 'to', label: 'Valid to' }, { label: 'Status', render: (r) => badge(r.status) }], rows: pa, search: false }) },
    { id: 'o', label: `Purchase orders (${pos.length})`, html: table({ cols: [{ label: 'PO', render: (r) => link('#/purchase-orders/' + r.id, r.no) }, { k: 'date', label: 'Date' }, { k: 'total', label: 'Total', right: true, render: (r) => peso(r.total) }, { label: 'Status', render: (r) => badge(r.status) }], rows: pos, search: false }) },
    { id: 's', label: 'Scorecard', html: `<div class="grid gap-4 sm:grid-cols-3">${[['On-time delivery', '92%'], ['Reject rate', '1.3%'], ['Avg lead time', s.lead + ' d']].map(([a, b]) => `<div class="card p-5"><p class="label">${a}</p><p class="font-head text-3xl text-primary">${b}</p></div>`).join('')}</div>` },
  ])
}

// S12
const priceList = () => listPage({
  title: 'Price agreements', crumbs: [['Home', '#/dashboard'], ['Price agreements']], action: `<button class="btn btn-primary" @click="$store.ui.toast('Price agreement form (demo)')">+ New agreement</button>`,
  note: 'A variant has at most one preferred active agreement; expired agreements cannot be used (BR-07). Purchasing is warned 30 days before expiry (BR-08).',
  cols: [{ k: 'ref', label: 'Ref' }, { k: 'supplier', label: 'Supplier' }, { k: 'product', label: 'Product' }, { k: 'cost', label: 'Unit cost', right: true, render: (r) => peso(r.cost) },
    { k: 'moq', label: 'MOQ', right: true }, { k: 'lead', label: 'Lead (d)', right: true }, { k: 'to', label: 'Valid to' }, { k: 'preferred', label: 'Preferred' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: priceAgreements, statusKey: 'status',
})

export const catalogRoutes = [
  { path: '/products', render: productList },
  { path: '/suppliers', render: supplierList },
  { path: '/suppliers/new', render: supplierForm },
  { path: '/suppliers/:id', render: supplierDetail },
  { path: '/price-agreements', render: priceList },
]
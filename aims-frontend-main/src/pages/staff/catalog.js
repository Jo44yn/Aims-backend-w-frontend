import { badge, can, header, link, listPage, peso, table, tabs, form, esc } from '../../lib/ui.js'
import { api } from '../../lib/api.js'
import { asyncRoute, unwrap, actionButton } from '../../lib/source.js'

// All data on these pages comes from the Laravel API (no sample data).
// Editing follows one rule: nothing that other records depend on is deleted. Products are marked
// unavailable, suppliers suspended, price agreements cancelled, so old orders and the audit trail stay intact.
const SOURCING = [{ value: 'in_house', label: 'In-house (we make it)' }, { value: 'purchased', label: 'Purchased (from a supplier)' }]
const SUPPLIER_TYPES = ['brand_partner', 'local', 'subcontractor']
const SUPPLIER_STATUS = [{ value: 'pending', label: 'Pending (not vetted yet)' }, { value: 'approved', label: 'Approved' }, { value: 'suspended', label: 'Suspended' }]
const editLink = (href) => `<a class="btn btn-ghost !py-1" href="${href}">Edit</a>`
const unwrapOne = (res) => res.data || res

// Product variants for the price-agreement picker: [{ value: variantId, label: 'Boots (8)' }]
const variantOptions = (products) => products.flatMap((p) =>
  (p.variants || []).filter((v) => v.active && p.active).map((v) => ({ value: v.id, label: esc(p.name + (v.size ? ` (${v.size})` : '')) })))

// ── S09 – products and variants ────────────────────────────────────────────
const productPayload = (d) => ({
  name: d.name.trim(), category: d.category.trim(), sourcing_type: d.sourcing_type, uom: d.uom || null,
  sizes: d.sizes || null, specifications: d.specifications || null, is_active: d.is_active === undefined ? true : !!d.is_active,
})

const productList = asyncRoute('products', async () => listPage({
  title: 'Products & variants', crumbs: [['Home', '#/dashboard'], ['Products']], action: can('catalog') ? `<a class="btn btn-primary" href="#/products/new">+ New product</a>` : '',
  note: 'Mark a product unavailable when it cannot be sourced for now. It stays in the system and disappears from the public catalog.',
  cols: [{ k: 'code', label: 'Code' }, { k: 'name', label: 'Product' }, { k: 'category', label: 'Category' }, { label: 'Sourcing', render: (r) => `<span class="badge ${r.sourcing === 'In-house' ? 'badge-teal' : 'badge-gray'}">${r.sourcing}</span>` },
    { k: 'uom', label: 'UoM' }, { label: 'Sizes', render: (r) => `<span class="text-muted">${esc((r.sizes || []).join(' · '))}</span>` },
    { label: 'Availability', render: (r) => badge(r.active ? 'Available' : 'Unavailable') },
    ...(can('catalog') ? [{ label: '', render: (r) => `<div class="flex gap-1">${editLink('#/products/' + r.id + '/edit')}${actionButton(r.active ? 'Mark unavailable' : 'Mark available', async () => { await api.updateProduct(r.id, productPayload({ name: r.name, category: r.category, sourcing_type: r.sourcingType, uom: r.uom, specifications: r.spec || '', is_active: !r.active })); return `${r.name} is now ${r.active ? 'unavailable' : 'available'}.` }, 'btn-ghost !py-1')}</div>` }] : [])],
  rows: unwrap(await api.products()).map((r) => ({ ...r, avail: r.active ? 'Available' : 'Unavailable' })), statusKey: 'avail',
}))

const productFields = (p = {}, categories = []) => [
  { name: 'name', label: 'Product name', required: true, span: 2, value: p.name },
  { name: 'category', label: 'Category', required: true, value: p.category, hint: categories.length ? `Existing: ${esc(categories.join(', '))}. A new name creates a new category.` : 'For example: Patches, Uniforms, Footwear.' },
  { name: 'sourcing_type', label: 'Sourcing', type: 'select', required: true, options: SOURCING, value: p.sourcingType, hint: p.id ? 'Change this if the product will be made or bought differently from now on.' : '' },
  { name: 'uom', label: 'Unit of measure', placeholder: 'pc', value: p.uom },
  { name: 'sizes', label: 'Sizes / variants', placeholder: 'S, M, L, XL', value: (p.sizes || []).join(', '), hint: 'Comma separated. Removing a size switches it off but keeps old orders. Leave blank for "One size".' },
  { name: 'specifications', label: 'Specification', type: 'textarea', span: 2, value: p.spec },
  ...(p.id ? [{ name: 'is_active', label: 'Availability', type: 'checkbox', checkLabel: 'Available (uncheck if it cannot be sourced or made right now)', value: p.active, span: 2 }] : []),
]

const productForm = asyncRoute('categories', async () => {
  const categories = [...new Set(unwrap(await api.products()).map((p) => p.category))]
  return form({
    title: 'New product', crumbs: [['Home', '#/dashboard'], ['Products', '#/products'], ['New']], back: '/products', submit: 'Create product',
    onSubmit: async (d) => { await api.createProduct(productPayload(d)); return `Product "${d.name}" created.` },
    fields: productFields({}, categories),
  })
})

const productEdit = asyncRoute('product', async ({ id }) => {
  const all = unwrap(await api.products())
  const p = all.find((x) => String(x.id) === String(id))
  if (!p) return `<p class="p-10 text-center">Product not found.</p>`
  const categories = [...new Set(all.map((x) => x.category))]
  return form({
    title: `Edit ${esc(p.name)}`, crumbs: [['Home', '#/dashboard'], ['Products', '#/products'], [p.code]], back: '/products', submit: 'Save changes',
    actions: badge(p.active ? 'Available' : 'Unavailable'),
    onSubmit: async (d) => { await api.updateProduct(p.id, { ...productPayload(d), is_active: !!d.is_active }); return `${d.name} updated.` },
    fields: productFields(p, categories),
  })
})

// ── S10 – suppliers ────────────────────────────────────────────────────────
const supplierList = asyncRoute('suppliers', async () => listPage({
  title: 'Suppliers', crumbs: [['Home', '#/dashboard'], ['Suppliers']], action: can('catalog') ? `<a class="btn btn-primary" href="#/suppliers/new">+ New supplier</a>` : '',
  note: 'Only suppliers with status Approved can receive purchase orders (BR-06). Suspend a supplier that should not be used for now.',
  cols: [{ k: 'code', label: 'Code' }, { label: 'Name', render: (r) => link('#/suppliers/' + r.id, esc(r.name)) }, { k: 'type', label: 'Type' }, { k: 'terms', label: 'Terms (days)', right: true }, { k: 'lead', label: 'Lead time (days)', right: true }, { label: 'Status', render: (r) => badge(r.status) },
    ...(can('catalog') ? [{ label: '', render: (r) => editLink('#/suppliers/' + r.id + '/edit') }] : [])],
  rows: unwrap(await api.suppliers()), statusKey: 'status',
}))

const supplierPayload = (d) => ({
  name: d.name.trim(), type: d.type, tin: d.tin || null, contact: d.contact.trim(), email: d.email.trim(), phone: d.phone || null,
  terms: d.terms === '' || d.terms == null ? null : Number(d.terms), lead: d.lead === '' || d.lead == null ? null : Number(d.lead),
})

const supplierFields = (s = {}) => [
  { name: 'name', label: 'Supplier name', required: true, span: 2, value: s.name },
  { name: 'type', label: 'Type', type: 'select', options: SUPPLIER_TYPES, required: true, value: s.type },
  { name: 'tin', label: 'TIN', value: s.tin },
  { name: 'contact', label: 'Contact person', required: true, value: s.contact },
  { name: 'email', label: 'Email (POs are sent here)', type: 'email', required: true, value: s.email },
  { name: 'phone', label: 'Phone', value: s.phone },
  { name: 'terms', label: 'Payment terms (days)', type: 'number', placeholder: '30', value: s.terms },
  { name: 'lead', label: 'Default lead time (days)', type: 'number', placeholder: '14', value: s.lead },
]

const supplierForm = () => form({
  title: 'New supplier', crumbs: [['Home', '#/dashboard'], ['Suppliers', '#/suppliers'], ['New']], back: '/suppliers', submit: 'Create supplier',
  onSubmit: async (d) => { await api.createSupplier(supplierPayload(d)); return `Supplier "${d.name}" created. It stays Pending until approved.` },
  fields: supplierFields(),
  extra: `<fieldset class="md:col-span-2"><legend class="font-head text-lg text-primary">Vetting checklist</legend>
    ${['Business permit on file', 'DTI / SEC registration on file', 'BIR Form 2303 on file'].map((l) => `<label class="mt-2 flex items-center gap-2"><input type="checkbox"> ${l}</label>`).join('')}
    <div class="mt-3"><label class="label">Vetting documents</label><input type="file" class="input" multiple></div></fieldset>`,
})

const supplierEdit = asyncRoute('supplier', async ({ id }) => {
  const s = unwrapOne(await api.supplier(id))
  return form({
    title: `Edit ${esc(s.name)}`, crumbs: [['Home', '#/dashboard'], ['Suppliers', '#/suppliers'], [s.code, '#/suppliers/' + s.id], ['Edit']], back: '/suppliers/' + s.id, submit: 'Save changes',
    actions: badge(s.status),
    onSubmit: async (d) => { await api.updateSupplier(s.id, { ...supplierPayload(d), status: d.status }); return `${d.name} updated.` },
    fields: [...supplierFields(s), { name: 'status', label: 'Status', type: 'select', required: true, options: SUPPLIER_STATUS, value: String(s.status).toLowerCase(), hint: 'Suspended suppliers cannot receive new POs or price agreements.' }],
  })
})

// ── S11 – supplier detail ──────────────────────────────────────────────────
const supplierDetail = asyncRoute('supplier', async ({ id }) => {
  const s = unwrapOne(await api.supplier(id).catch(() => ({ data: null })))
  if (!s) return `<p class="p-10 text-center">Supplier not found.</p>`
  const pa = s.priceAgreements || []
  const pos = s.purchaseOrders || []
  const status = String(s.status).toLowerCase()
  const buttons = can('catalog') ? [
    editLink('#/suppliers/' + s.id + '/edit'),
    status === 'approved'
      ? actionButton('Suspend', async () => { await api.updateSupplier(s.id, { ...supplierPayload({ ...s, name: s.name, type: s.type, tin: s.tin, contact: s.contact, email: s.email, phone: s.phone, terms: s.terms, lead: s.lead }), status: 'suspended' }); return `${s.name} suspended.` }, 'btn-ghost', `Suspend ${s.name}? It will not be able to receive new POs.`)
      : actionButton(status === 'suspended' ? 'Reactivate' : 'Approve supplier', async () => { await api.approveSupplier(s.id); return `${s.name} approved.` }),
  ].join('') : ''
  return header({ title: esc(s.name), crumbs: [['Home', '#/dashboard'], ['Suppliers', '#/suppliers'], [s.code]], actions: badge(s.status) + buttons }) + tabs([
    { id: 'p', label: 'Profile & documents', html: `<div class="card grid gap-4 p-5 sm:grid-cols-2">${[['Type', s.type], ['TIN', s.tin || '—'], ['Contact', s.contact], ['Email', s.email], ['Phone', s.phone || '—'], ['Payment terms', s.terms + ' days'], ['Lead time', s.lead + ' days']].map(([a, b]) => `<div><p class="label">${a}</p><p>${esc(b)}</p></div>`).join('')}</div>` },
    { id: 'a', label: `Price agreements (${pa.length})`, html: table({ cols: [{ k: 'ref', label: 'Ref' }, { k: 'product', label: 'Product' }, { k: 'cost', label: 'Unit cost', right: true, render: (r) => peso(r.cost) }, { k: 'to', label: 'Valid to' }, { label: 'Status', render: (r) => badge(r.status) }], rows: pa, search: false }) },
    { id: 'o', label: `Purchase orders (${pos.length})`, html: table({ cols: [{ label: 'PO', render: (r) => link('#/purchase-orders/' + r.id, r.no) }, { k: 'date', label: 'Date' }, { k: 'total', label: 'Total', right: true, render: (r) => peso(r.total) }, { label: 'Status', render: (r) => badge(r.status) }], rows: pos, search: false }) },
  ])
})

// ── S12 – price agreements ─────────────────────────────────────────────────
const agreementBody = (r, over = {}) => ({
  reference_no: r.ref, unit_cost: r.cost, min_order_qty: r.moq, lead_time_days: r.lead, valid_from: r.fromIso, valid_to: r.toIso,
  is_preferred: r.isPreferred, status: 'active', ...over,
})

const priceList = asyncRoute('price agreements', async () => listPage({
  title: 'Price agreements', crumbs: [['Home', '#/dashboard'], ['Price agreements']], action: can('catalog') ? `<a class="btn btn-primary" href="#/price-agreements/new">+ New agreement</a>` : '',
  note: 'A variant has at most one preferred active agreement; expired agreements cannot be used (BR-07). Purchasing is warned 30 days before expiry (BR-08). Cancel an agreement if the supplier withdraws the price.',
  cols: [{ k: 'ref', label: 'Ref' }, { k: 'supplier', label: 'Supplier' }, { k: 'product', label: 'Product' }, { k: 'cost', label: 'Unit cost', right: true, render: (r) => peso(r.cost) },
    { k: 'moq', label: 'MOQ', right: true }, { k: 'lead', label: 'Lead (d)', right: true }, { k: 'to', label: 'Valid to' }, { k: 'preferred', label: 'Preferred' }, { label: 'Status', render: (r) => badge(r.status) },
    ...(can('catalog') ? [{ label: '', render: (r) => `<div class="flex gap-1">${editLink('#/price-agreements/' + r.id + '/edit')}${r.cancelled ? '' : actionButton('Cancel', async () => { await api.updatePriceAgreement(r.id, agreementBody(r, { status: 'cancelled' })); return `${r.ref} cancelled.` }, 'btn-ghost !py-1', `Cancel agreement ${r.ref}? It can no longer be used for new POs.`)}</div>` }] : [])],
  rows: unwrap(await api.priceAgreements()), statusKey: 'status',
}))

const agreementForm = asyncRoute('suppliers and products', async () => {
  const [suppliers, products] = await Promise.all([api.suppliers().then(unwrap), api.products().then(unwrap)])
  // Only Approved suppliers can be used on agreements/POs (BR-06).
  const usable = suppliers.filter((s) => String(s.status).toLowerCase() === 'approved')

  return form({
    title: 'New price agreement', crumbs: [['Home', '#/dashboard'], ['Price agreements', '#/price-agreements'], ['New']], back: '/price-agreements',
    submit: 'Create agreement',
    onSubmit: async (d) => {
      if (d.valid_to < d.valid_from) throw Object.assign(new Error('"Valid to" must be on or after "Valid from".'), { fields: { valid_to: 'Must be on or after Valid from.' } })
      await api.createPriceAgreement({
        supplier_id: Number(d.supplier_id), product_variant_id: Number(d.product_variant_id), reference_no: d.reference_no || null,
        unit_cost: Number(d.unit_cost), min_order_qty: Number(d.min_order_qty || 1), lead_time_days: Number(d.lead_time_days || 0),
        valid_from: d.valid_from, valid_to: d.valid_to, is_preferred: !!d.is_preferred,
      })
      return 'Price agreement created.'
    },
    fields: [
      { name: 'supplier_id', label: 'Supplier (approved only)', type: 'select', required: true, options: usable.map((s) => ({ value: s.id, label: esc(s.name) })), hint: usable.length ? '' : 'No approved suppliers yet. Open a supplier and click Approve first.' },
      { name: 'product_variant_id', label: 'Product / variant (available products)', type: 'select', required: true, options: variantOptions(products) },
      { name: 'reference_no', label: 'Reference no.', placeholder: 'Leave blank to auto-number' },
      { name: 'unit_cost', label: 'Unit cost (₱)', type: 'number', required: true },
      { name: 'min_order_qty', label: 'Minimum order qty (MOQ)', type: 'number', placeholder: '1' },
      { name: 'lead_time_days', label: 'Lead time (days)', type: 'number', placeholder: '14' },
      { name: 'valid_from', label: 'Valid from', type: 'date', required: true },
      { name: 'valid_to', label: 'Valid to', type: 'date', required: true },
      { name: 'is_preferred', label: 'Preferred', type: 'checkbox', checkLabel: 'Make this the preferred agreement for the variant', span: 2 },
    ],
  })
})

const agreementEdit = asyncRoute('price agreement', async ({ id }) => {
  const r = unwrap(await api.priceAgreements()).find((x) => String(x.id) === String(id))
  if (!r) return `<p class="p-10 text-center">Price agreement not found.</p>`
  return form({
    title: `Edit ${esc(r.ref)}`, crumbs: [['Home', '#/dashboard'], ['Price agreements', '#/price-agreements'], [r.ref]], back: '/price-agreements', submit: 'Save changes',
    actions: badge(r.status),
    onSubmit: async (d) => {
      if (d.valid_to < d.valid_from) throw Object.assign(new Error('"Valid to" must be on or after "Valid from".'), { fields: { valid_to: 'Must be on or after Valid from.' } })
      await api.updatePriceAgreement(r.id, {
        reference_no: d.reference_no || null, unit_cost: Number(d.unit_cost), min_order_qty: Number(d.min_order_qty || 1), lead_time_days: Number(d.lead_time_days || 0),
        valid_from: d.valid_from, valid_to: d.valid_to, is_preferred: !!d.is_preferred, status: d.status,
      })
      return `${r.ref} updated.`
    },
    fields: [
      { name: 'supplier', label: 'Supplier', readonly: true, value: r.supplier },
      { name: 'product', label: 'Product', readonly: true, value: r.product },
      { name: 'reference_no', label: 'Reference no.', value: r.ref },
      { name: 'unit_cost', label: 'Unit cost (₱)', type: 'number', required: true, value: r.cost },
      { name: 'min_order_qty', label: 'Minimum order qty (MOQ)', type: 'number', value: r.moq },
      { name: 'lead_time_days', label: 'Lead time (days)', type: 'number', value: r.lead },
      { name: 'valid_from', label: 'Valid from', type: 'date', required: true, value: r.fromIso },
      { name: 'valid_to', label: 'Valid to', type: 'date', required: true, value: r.toIso, hint: 'Extend this date to renew the agreement.' },
      { name: 'status', label: 'Agreement', type: 'select', required: true, value: r.cancelled ? 'cancelled' : 'active', options: [{ value: 'active', label: 'Active' }, { value: 'cancelled', label: 'Cancelled (supplier withdrew the price)' }] },
      { name: 'is_preferred', label: 'Preferred', type: 'checkbox', checkLabel: 'Preferred agreement for this variant', value: r.isPreferred },
    ],
  })
})

export const catalogRoutes = [
  { path: '/products', render: productList },
  { path: '/products/new', render: productForm },
  { path: '/products/:id/edit', render: productEdit },
  { path: '/suppliers', render: supplierList },
  { path: '/suppliers/new', render: supplierForm },
  { path: '/suppliers/:id', render: supplierDetail },
  { path: '/suppliers/:id/edit', render: supplierEdit },
  { path: '/price-agreements', render: priceList },
  { path: '/price-agreements/new', render: agreementForm },
  { path: '/price-agreements/:id/edit', render: agreementEdit },
]

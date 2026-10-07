import { products as mockProducts, suppliers as mockSuppliers, priceAgreements as mockAgreements, purchaseOrders as mockPOs } from '../../lib/data.js'
import { badge, header, link, listPage, peso, table, tabs, form, esc } from '../../lib/ui.js'
import { api } from '../../lib/api.js'

// ── Data loading ───────────────────────────────────────────────────────────
// Each list comes from the API. If the backend endpoint is not available yet, the sample rows
// are shown instead, and anything you create is kept in this browser (localStorage) so the
// screens keep working. Once the backend routes exist, records are saved to the database.
const LOCAL = { suppliers: 'aims_local_suppliers', agreements: 'aims_local_agreements' }
const readLocal = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const addLocal = (key, rec) => { try { localStorage.setItem(key, JSON.stringify([...readLocal(key), rec])) } catch {} }
const unwrap = (res) => res.data || res
const noEndpoint = (e) => e.status === 0 || e.status === 404 || e.status === 405

const load = (fn, mock, key) => fn().then(unwrap).catch(() => mock).then((rows) => (key ? [...rows, ...readLocal(key)] : rows))
const loadSuppliers = () => load(api.suppliers, mockSuppliers, LOCAL.suppliers)
const loadAgreements = () => load(api.priceAgreements, mockAgreements, LOCAL.agreements)
const loadProducts = () => load(api.products, mockProducts)

const skeleton = (what) => `<div class="card animate-pulse p-6 text-center text-muted">Loading ${what} from server…</div>`
// Route helper: show a skeleton, then replace it with whatever `build` returns.
const asyncRoute = (what, build) => (params) => ({
  html: skeleton(what),
  mount: ({ view }) => { build(params).then((html) => { view.innerHTML = html }) },
})

// Product variants for the price-agreement picker: [{ value: variantId, label: 'Boots (8)' }]
const variantOptions = (products) => products.flatMap((p) =>
  (p.variants && p.variants.length ? p.variants : (p.sizes || []).map((size, i) => ({ id: `${p.id}-${i}`, size })))
    .map((v) => ({ value: v.id, label: esc(p.name + (v.size ? ` (${v.size})` : '')) })))

// ── S09 – products and variants ────────────────────────────────────────────
const productList = asyncRoute('products', async () => listPage({
  title: 'Products & variants', crumbs: [['Home', '#/dashboard'], ['Products']], action: `<button class="btn btn-primary" @click="$store.ui.toast('Product form (demo)')">+ New product</button>`,
  cols: [{ k: 'code', label: 'Code' }, { k: 'name', label: 'Product' }, { k: 'category', label: 'Category' }, { label: 'Sourcing', render: (r) => `<span class="badge ${r.sourcing === 'In-house' ? 'badge-teal' : 'badge-gray'}">${r.sourcing}</span>` },
    { k: 'uom', label: 'UoM' }, { label: 'Variants', render: (r) => `<span class="text-muted">${(r.sizes || []).join(' · ')}</span>` }],
  rows: await loadProducts(), statusKey: 'category',
}))

// ── S10 – suppliers ────────────────────────────────────────────────────────
const supplierList = asyncRoute('suppliers', async () => listPage({
  title: 'Suppliers', crumbs: [['Home', '#/dashboard'], ['Suppliers']], action: `<a class="btn btn-primary" href="#/suppliers/new">+ New supplier</a>`,
  note: 'Only suppliers with status Approved can receive purchase orders (BR-06).',
  cols: [{ k: 'code', label: 'Code' }, { label: 'Name', render: (r) => link('#/suppliers/' + r.id, esc(r.name)) }, { k: 'type', label: 'Type' }, { k: 'terms', label: 'Terms (days)', right: true }, { k: 'lead', label: 'Lead time (days)', right: true }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: await loadSuppliers(), statusKey: 'status',
}))

const createSupplier = async (d) => {
  const body = {
    name: d.name.trim(), type: d.type, tin: d.tin || null, contact: d.contact.trim(), email: d.email.trim(),
    terms: d.terms === '' ? null : Number(d.terms), lead: d.lead === '' ? null : Number(d.lead),
  }
  try {
    await api.createSupplier(body)
    return `Supplier "${body.name}" created. It stays Pending until approved.`
  } catch (e) {
    if (!noEndpoint(e)) throw e // validation errors etc. show inline on the form
    const n = readLocal(LOCAL.suppliers).length + 1
    addLocal(LOCAL.suppliers, { id: Date.now(), code: 'SP-L' + String(n).padStart(2, '0'), ...body, terms: body.terms ?? 30, lead: body.lead ?? 14, status: 'Pending', agreements: 0 })
    return `Supplier "${body.name}" saved on this browser only (the backend /suppliers endpoint is not available yet).`
  }
}

const supplierForm = () => form({
  title: 'New supplier', crumbs: [['Home', '#/dashboard'], ['Suppliers', '#/suppliers'], ['New']], back: '/suppliers',
  onSubmit: createSupplier, submit: 'Create supplier',
  fields: [
    { name: 'name', label: 'Supplier name', required: true, span: 2 }, { name: 'type', label: 'Type', type: 'select', options: ['brand_partner', 'local', 'subcontractor'], required: true },
    { name: 'tin', label: 'TIN' }, { name: 'contact', label: 'Contact person', required: true }, { name: 'email', label: 'Email (POs are sent here)', type: 'email', required: true },
    { name: 'terms', label: 'Payment terms (days)', type: 'number', placeholder: '30' }, { name: 'lead', label: 'Default lead time (days)', type: 'number', placeholder: '14' },
  ],
  extra: `<fieldset class="md:col-span-2"><legend class="font-head text-lg text-primary">Vetting checklist</legend>
    ${['Business permit on file', 'DTI / SEC registration on file', 'BIR Form 2303 on file'].map((l) => `<label class="mt-2 flex items-center gap-2"><input type="checkbox"> ${l}</label>`).join('')}
    <div class="mt-3"><label class="label">Vetting documents</label><input type="file" class="input" multiple></div></fieldset>`,
})

// ── S11 – supplier detail ──────────────────────────────────────────────────
const supplierDetail = asyncRoute('supplier', async ({ id }) => {
  const [suppliers, agreements, allPOs] = await Promise.all([loadSuppliers(), loadAgreements(), load(api.purchaseOrders, mockPOs)])
  const s = suppliers.find((x) => String(x.id) === String(id))
  if (!s) return `<p class="p-10 text-center">Supplier not found.</p>`
  const pa = agreements.filter((p) => p.supplier === s.name)
  const pos = allPOs.filter((p) => (p.supplier?.name || p.supplier) === s.name)
  return header({ title: esc(s.name), crumbs: [['Home', '#/dashboard'], ['Suppliers', '#/suppliers'], [s.code]], actions: badge(s.status) }) + tabs([
    { id: 'p', label: 'Profile & documents', html: `<div class="card grid gap-4 p-5 sm:grid-cols-2">${[['Type', s.type], ['TIN', s.tin || '—'], ['Contact', s.contact], ['Email', s.email], ['Payment terms', s.terms + ' days'], ['Lead time', s.lead + ' days']].map(([a, b]) => `<div><p class="label">${a}</p><p>${esc(b)}</p></div>`).join('')}</div>` },
    { id: 'a', label: `Price agreements (${pa.length})`, html: table({ cols: [{ k: 'ref', label: 'Ref' }, { k: 'product', label: 'Product' }, { k: 'cost', label: 'Unit cost', right: true, render: (r) => peso(r.cost) }, { k: 'to', label: 'Valid to' }, { label: 'Status', render: (r) => badge(r.status) }], rows: pa, search: false }) },
    { id: 'o', label: `Purchase orders (${pos.length})`, html: table({ cols: [{ label: 'PO', render: (r) => link('#/purchase-orders/' + r.id, r.no) }, { k: 'date', label: 'Date' }, { k: 'total', label: 'Total', right: true, render: (r) => peso(r.total) }, { label: 'Status', render: (r) => badge(r.status) }], rows: pos, search: false }) },
  ])
})

// ── S12 – price agreements ─────────────────────────────────────────────────
const priceList = asyncRoute('price agreements', async () => listPage({
  title: 'Price agreements', crumbs: [['Home', '#/dashboard'], ['Price agreements']], action: `<a class="btn btn-primary" href="#/price-agreements/new">+ New agreement</a>`,
  note: 'A variant has at most one preferred active agreement; expired agreements cannot be used (BR-07). Purchasing is warned 30 days before expiry (BR-08).',
  cols: [{ k: 'ref', label: 'Ref' }, { k: 'supplier', label: 'Supplier' }, { k: 'product', label: 'Product' }, { k: 'cost', label: 'Unit cost', right: true, render: (r) => peso(r.cost) },
    { k: 'moq', label: 'MOQ', right: true }, { k: 'lead', label: 'Lead (d)', right: true }, { k: 'to', label: 'Valid to' }, { k: 'preferred', label: 'Preferred' }, { label: 'Status', render: (r) => badge(r.status) }],
  rows: await loadAgreements(), statusKey: 'status',
}))

const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const agreementForm = asyncRoute('suppliers and products', async () => {
  const [suppliers, products] = await Promise.all([loadSuppliers(), loadProducts()])
  const variants = variantOptions(products)
  // Only Approved suppliers can be used on agreements/POs (BR-06).
  const usable = suppliers.filter((s) => String(s.status).toLowerCase() === 'approved')

  const create = async (d) => {
    if (d.valid_to < d.valid_from) throw Object.assign(new Error('"Valid to" must be on or after "Valid from".'), { fields: { valid_to: 'Must be on or after Valid from.' } })
    const body = {
      supplier_id: Number(d.supplier_id), product_variant_id: d.product_variant_id, reference_no: d.reference_no || null,
      unit_cost: Number(d.unit_cost), min_order_qty: Number(d.min_order_qty || 1), lead_time_days: Number(d.lead_time_days || 0),
      valid_from: d.valid_from, valid_to: d.valid_to, is_preferred: !!d.is_preferred, status: 'active',
    }
    try {
      await api.createPriceAgreement(body)
      return 'Price agreement created.'
    } catch (e) {
      if (!noEndpoint(e)) throw e
      const sup = suppliers.find((s) => String(s.id) === d.supplier_id)
      const days = Math.round((new Date(d.valid_to) - new Date().setHours(0, 0, 0, 0)) / 864e5)
      addLocal(LOCAL.agreements, {
        id: Date.now(), ref: body.reference_no || 'PA-L' + String(readLocal(LOCAL.agreements).length + 1).padStart(3, '0'),
        supplier: sup ? sup.name : '—', product: (variants.find((v) => String(v.value) === d.product_variant_id) || {}).label || '—',
        cost: body.unit_cost, moq: body.min_order_qty, lead: body.lead_time_days, from: fmtDate(d.valid_from), to: fmtDate(d.valid_to),
        preferred: body.is_preferred ? 'Yes' : 'No', status: days < 0 ? 'Expired' : days <= 30 ? 'Expiring' : 'Active', days,
      })
      return 'Price agreement saved on this browser only (the backend /price-agreements endpoint is not available yet).'
    }
  }

  return form({
    title: 'New price agreement', crumbs: [['Home', '#/dashboard'], ['Price agreements', '#/price-agreements'], ['New']], back: '/price-agreements',
    onSubmit: create, submit: 'Create agreement',
    fields: [
      { name: 'supplier_id', label: 'Supplier (approved only)', type: 'select', required: true, options: usable.map((s) => ({ value: s.id, label: esc(s.name) })), hint: usable.length ? '' : 'No approved suppliers yet. Approve a supplier first.' },
      { name: 'product_variant_id', label: 'Product / variant', type: 'select', required: true, options: variants },
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

export const catalogRoutes = [
  { path: '/products', render: productList },
  { path: '/suppliers', render: supplierList },
  { path: '/suppliers/new', render: supplierForm },
  { path: '/suppliers/:id', render: supplierDetail },
  { path: '/price-agreements', render: priceList },
  { path: '/price-agreements/new', render: agreementForm },
]

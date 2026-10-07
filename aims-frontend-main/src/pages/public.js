import { form, esc } from '../lib/ui.js'
import { api } from '../lib/api.js'
import { asyncRoute, unwrap } from '../lib/source.js'
import { errorRoutes } from './errors.js'

const PARTNERS = ['Rudy Project Philippines', 'Under Armour', 'Propper USA', '361 Degrees Philippines']
const LINES = [
  ['Embroidered patches', 'Unit insignias, logos and name tapes made in-house.'],
  ['Tailored uniforms', 'Service Blouse, White Duck, Bush Coat and Barong, made to measure.'],
  ['Tactical gear', 'Boots, holsters, bags and apparel from partner brands.'],
  ['Protective equipment', 'Vests, riot gear, flight suits and safety gear.'],
]
const card = (p) => `
<a href="#/products/${p.slug}" class="card block p-4 transition-shadow hover:shadow-md">
  <div class="mb-3 grid h-32 place-items-center rounded-md bg-paper font-head text-3xl text-primary/40">${p.category}</div>
  <p class="text-xs font-semibold uppercase text-muted">${p.category}</p>
  <h3 class="font-head text-lg text-primary">${esc(p.name)}</h3>
  <p class="mt-1 text-sm text-muted">Sizes: ${esc((p.sizes || []).join(', ') || '—')}</p>
</a>`

// P01
const home = () => `
<section class="bg-primary text-white">
  <div class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2">
    <div>
      <p class="font-semibold uppercase tracking-widest text-accent">Since 2020 · Dasmariñas, Cavite</p>
      <h1 class="mt-3 font-head text-4xl font-semibold leading-tight md:text-5xl">Quality supplies for those who protect the nation.</h1>
      <p class="mt-4 text-white/80">Embroidered patches, tailored uniforms and tactical gear for the AFP, law enforcement agencies and security firms. Every item inspected and tested before delivery.</p>
      <div class="mt-6 flex flex-wrap gap-3"><a class="btn btn-gold" href="#/rfq">Request a quotation</a><a class="btn border border-white/30 text-white hover:bg-white/10" href="#/products">Browse products</a></div>
    </div>
    <div class="grid grid-cols-2 gap-3 text-center">
      ${[['2020', 'Founded'], ['4', 'Partner brands'], ['100%', 'Items inspected'], ['AFP · PNP', 'Clients']].map(([a, b]) => `<div class="rounded-lg bg-white/10 p-6"><p class="font-head text-3xl text-accent">${a}</p><p class="text-sm text-white/70">${b}</p></div>`).join('')}
    </div>
  </div>
</section>
<section class="mx-auto max-w-6xl px-4 py-12">
  <h2 class="font-head text-2xl text-primary">Our product lines</h2>
  <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${LINES.map(([t, d]) => `<div class="card border-t-4 border-accent p-5"><h3 class="font-head text-lg text-primary">${t}</h3><p class="mt-2 text-sm text-muted">${d}</p></div>`).join('')}</div>
</section>
<section class="bg-white py-10"><div class="mx-auto max-w-6xl px-4">
  <h2 class="font-head text-2xl text-primary">Trusted partner brands</h2>
  <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">${PARTNERS.map((p) => `<div class="grid h-20 place-items-center rounded-lg border border-line font-head text-lg text-muted">${p}</div>`).join('')}</div>
</div></section>`

// P02 – only products marked available are listed (from the API, no login needed)
const catalog = asyncRoute('products', async () => {
  const products = unwrap(await api.publicProducts())
  const categories = [...new Set(products.map((p) => p.category))]
  return `
<section class="mx-auto max-w-6xl px-4 py-10" x-data="{c:''}">
  <h1 class="font-head text-3xl text-primary">Product catalog</h1>
  <p class="mt-1 text-muted">Prices are quoted per contract. <a class="link" href="#/rfq">Request a quotation</a>.</p>
  <div class="mt-4 flex flex-wrap gap-2">
    <button class="btn btn-ghost" :class="c==='' &amp;&amp; '!bg-primary !text-white'" @click="c=''">All</button>
    ${categories.map((c) => `<button class="btn btn-ghost" :class="c==='${esc(c)}' &amp;&amp; '!bg-primary !text-white'" @click="c='${esc(c)}'">${esc(c)}</button>`).join('')}
  </div>
  <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${products.map((p) => `<div x-show="c===''||c==='${esc(p.category)}'">${card(p)}</div>`).join('') || '<p class="text-muted">No products are listed right now.</p>'}</div>
</section>`
})

// P03
const detail = asyncRoute('product', async ({ slug }) => {
  const p = unwrap(await api.publicProducts()).find((x) => x.slug === slug)
  if (!p) return `<div class="p-16 text-center"><h1 class="font-head text-2xl">Product not found</h1><p class="mt-1 text-muted">It may be unavailable right now.</p><a class="link" href="#/products">Back to catalog</a></div>`
  return `
<section class="mx-auto max-w-6xl px-4 py-10">
  <a class="link text-sm" href="#/products">← All products</a>
  <div class="mt-4 grid gap-8 md:grid-cols-2">
    <div class="grid h-72 place-items-center rounded-lg bg-white font-head text-4xl text-primary/30 shadow-sm">${esc(p.category)}</div>
    <div>
      <p class="text-xs font-semibold uppercase text-muted">${esc(p.category)} · ${esc(p.code)}</p>
      <h1 class="font-head text-3xl text-primary">${esc(p.name)}</h1>
      <p class="mt-3">${esc(p.spec || '')}</p>
      <h2 class="mt-5 text-sm font-semibold">Available sizes</h2>
      <div class="mt-2 flex flex-wrap gap-2">${(p.sizes || []).map((s) => `<span class="rounded-md border border-line bg-white px-3 py-1 text-sm">${esc(s)}</span>`).join('')}</div>
      <a class="btn btn-primary mt-6" href="#/rfq">Request a quotation</a>
    </div>
  </div>
</section>`
})

const about = () => `
<section class="mx-auto max-w-4xl px-4 py-10">
  <h1 class="font-head text-3xl text-primary">About AIMFORCE</h1>
  <p class="mt-3">Founded in 2020 in Dasmariñas, Cavite, AIMFORCE began as a maker of customized embroidered patches for AFP units, then expanded into tailored-fit uniforms and military supplies procured through public bidding.</p>
  <h2 class="mt-8 font-head text-xl text-primary">Mission</h2>
  <p class="mt-2">To equip security and defense forces with high-quality supplies, with integrity, reliability and professionalism.</p>
  <h2 class="mt-8 font-head text-xl text-primary">Quality assurance</h2>
  <p class="mt-2">Every item is inspected and tested before delivery. Client inspection and acceptance committees verify deliveries against specifications and quantities.</p>
  <h2 class="mt-8 font-head text-xl text-primary">Partner brands</h2>
  <ul class="mt-2 grid gap-2 sm:grid-cols-2">${PARTNERS.map((p) => `<li class="card px-4 py-3 font-semibold">${p}</li>`).join('')}</ul>
</section>`

// P05
const rfq = () =>
  `<section class="mx-auto max-w-4xl px-4 py-10">${form({
    title: 'Request a quotation',
    crumbs: [['Home', '#/'], ['Request a quotation']],
    back: '/',
    submit: 'Send request',
    onSubmit: async (d) => { await api.submitInquiry({ name: d.name.trim(), org: d.org.trim(), email: d.email.trim(), phone: d.phone || null, items: d.items.trim() }); return 'Thank you! We received your request and will reply by email.' },
    fields: [
      { name: 'name', label: 'Your name', required: true },
      { name: 'org', label: 'Organization / unit', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'items', label: 'Items and quantities needed', type: 'textarea', span: 2, required: true, hint: 'Example: Tactical boots ×120 (sizes 7–10)' },
    ],
  })}</section>`

export const publicRoutes = [
  { path: '/', render: home },
  { path: '/products', render: catalog },
  { path: '/products/:slug', render: detail },
  { path: '/about', render: about },
  { path: '/rfq', render: rfq },
  ...errorRoutes,
]
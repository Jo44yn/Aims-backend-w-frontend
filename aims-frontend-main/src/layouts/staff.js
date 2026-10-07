import { overlays, role } from '../lib/ui.js'
import { isAuthenticated, getUser, logout } from '../lib/api.js'

// module key -> roles that can open it (from the blueprint's role access matrix)
const ALL = ['admin', 'gm', 'bidding', 'purchasing', 'warehouse', 'production', 'qa', 'accounting']
const ACCESS = {
  dash: ALL,
  clients: ['admin', 'gm', 'bidding', 'purchasing', 'accounting'],
  contracts: ALL,
  catalog: ALL,
  suppliers: ['admin', 'gm', 'bidding', 'purchasing', 'accounting'],
  po: ['admin', 'gm', 'bidding', 'purchasing', 'warehouse', 'accounting'],
  receiving: ['admin', 'gm', 'purchasing', 'warehouse', 'qa'],
  qa: ['admin', 'gm', 'purchasing', 'warehouse', 'qa'],
  stock: ALL,
  production: ['admin', 'gm', 'bidding', 'warehouse', 'production', 'qa'],
  delivery: ['admin', 'gm', 'bidding', 'warehouse', 'accounting'],
  finance: ['gm', 'accounting'],
  reports: ALL,
  admin: ['admin', 'gm'],
}

const NAV = [
  ['Overview', [['dash', '/dashboard', 'Dashboard']]],
  ['Contracts', [['clients', '/clients', 'Clients'], ['clients', '/inquiries', 'Inquiries'], ['contracts', '/bids', 'Bids log'], ['contracts', '/contracts', 'Contracts']]],
  ['Catalog & suppliers', [['catalog', '/products', 'Products'], ['suppliers', '/suppliers', 'Suppliers'], ['suppliers', '/price-agreements', 'Price agreements']]],
  ['Procurement', [['po', '/purchase-orders', 'Purchase orders'], ['po', '/approvals', 'Approvals']]],
  ['Inventory & QA', [['receiving', '/receiving', 'Receiving'], ['qa', '/qa', 'QA queue'], ['receiving', '/returns', 'Returns to supplier'], ['stock', '/inventory', 'Stock overview'], ['stock', '/inventory/movements', 'Stock ledger']]],
  ['Production', [['production', '/materials', 'Raw materials'], ['production', '/designs', 'Patch designs'], ['production', '/job-orders', 'Job orders']]],
  ['Delivery', [['delivery', '/deliveries', 'Deliveries']]],
  ['Finance', [['finance', '/invoices', 'Invoices'], ['finance', '/collections', 'Collections & AR'], ['finance', '/payables', 'Payables']]],
  ['Insights', [['reports', '/reports', 'Reports']]],
  ['Administration', [['admin', '/admin/users', 'Users & roles'], ['admin', '/admin/settings', 'Settings'], ['admin', '/admin/audit', 'Audit log']]],
]

const ROLE_LABEL = {
  admin: 'Administrator',
  gm: 'Owner / GM',
  bidding: 'Bidding & Contracts',
  purchasing: 'Purchasing',
  warehouse: 'Warehouse & Logistics',
  production: 'Production',
  qa: 'QA Inspector',
  accounting: 'Accounting',
}

export function staffLayout() {
  // Guard: if no token, send to login
  if (!isAuthenticated()) {
    location.href = 'login.html'
    return ''
  }
  const r = role()
  const user = getUser()
  const nav = NAV.map(([group, items]) => {
    const shown = items.filter(([m]) => ACCESS[m].includes(r))
    if (!shown.length) return ''
    return (
      `<p class="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">${group}</p>` +
      shown.map(([, href, label]) => `<a class="nav-link" data-nav href="#${href}">${label}</a>`).join('')
    )
  }).join('')

  return `
<div x-data="{open:false}" class="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
  <aside class="fixed inset-y-0 left-0 z-40 w-[250px] -translate-x-full overflow-y-auto bg-primary p-3 transition-transform lg:static lg:translate-x-0" :class="open &amp;&amp; '!translate-x-0'">
    <a href="#/dashboard" class="flex items-center gap-2 px-3 py-3">
      <span class="grid h-9 w-9 place-items-center rounded-md bg-accent font-head text-lg text-primary">A</span>
      <span class="font-head text-lg leading-tight text-white">AIMS<br><span class="font-sans text-xs font-normal text-white/60">AIMFORCE ERP</span></span>
    </a>
    <nav aria-label="Main">${nav}</nav>
  </aside>
  <div x-show="open" x-cloak class="fixed inset-0 z-30 bg-black/40 lg:hidden" @click="open=false"></div>

  <div class="min-w-0">
    <header class="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white px-4 py-2.5">
      <button class="btn btn-ghost lg:hidden" aria-label="Open menu" @click="open=true">☰</button>
      <input class="input max-w-md" type="search" placeholder="Search contracts, POs, suppliers…" aria-label="Global search">
      <div class="ml-auto flex items-center gap-3">
        <label class="sr-only" for="roleSwitch">Demo role</label>
        <select id="roleSwitch" class="input hidden w-auto sm:block" title="Demo only: switch role to see role-based menus"
          onchange="localStorage.setItem('aims_role', this.value); location.reload()">
          ${Object.entries(ROLE_LABEL).map(([k, v]) => `<option value="${k}" ${k === r ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <a href="#/notifications" class="btn btn-ghost relative" aria-label="Notifications (5 unread)">🔔<span class="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-white">5</span></a>
        <div class="relative" x-data="{m:false}">
          <button class="btn btn-ghost" @click="m=!m" aria-haspopup="true">${user ? user.name : ROLE_LABEL[r] || r} ▾</button>
          <div x-show="m" x-cloak @click.outside="m=false" class="card absolute right-0 mt-1 w-44 p-1">
            <a class="block rounded px-3 py-2 hover:bg-paper" href="#/profile" @click="m=false">My profile</a>
            <button class="block w-full rounded px-3 py-2 text-left hover:bg-paper" @click="fetch('http://127.0.0.1:8000/api/v1/auth/logout',{method:'POST',headers:{'Authorization':'Bearer '+localStorage.getItem('aims_token'),'Accept':'application/json'}}).finally(()=>{localStorage.removeItem('aims_token');localStorage.removeItem('aims_user');location.href='login.html'})">Sign out</button>
          </div>
        </div>
      </div>
    </header>
    <main id="view" class="p-4 lg:p-6"></main>
  </div>
</div>
${overlays()}`
}
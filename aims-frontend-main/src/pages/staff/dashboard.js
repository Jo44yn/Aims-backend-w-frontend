import { contracts, invoices, notifications } from '../../lib/data.js'
import { badge, header, kpi, peso, role } from '../../lib/ui.js'
import { C, chart } from '../../lib/charts.js'

// S01 – role-aware KPI cards, alerts, charts.
const KPIS = {
  default: () => [
    kpi('Active contracts', 3, 'In progress', 'primary'),
    kpi('At risk / delayed', 2, '1 at risk · 1 delayed', 'danger'),
    kpi('Awaiting supplier', 154, 'Items on open POs', 'info'),
    kpi('For QA', 80, 'Boots waiting inspection', 'warning'),
    kpi('Receivables', peso(invoices.filter((i) => i.status !== 'Paid').reduce((a, i) => a + i.gross, 0)), 'Unpaid billing statements', 'primary'),
  ],
  qa: () => [kpi('For QA', 80, 'Lines waiting inspection', 'warning'), kpi('Passed this week', 296, 'Units', 'success'), kpi('Rejected this week', 4, 'Return slips open: 1', 'danger')],
  production: () => [kpi('Jobs in production', 1, 'JO-2026-0019', 'info'), kpi('Queued', 1, 'Starts Nov 2', 'primary'), kpi('Materials at reorder', 2, 'Gold thread, backing', 'warning')],
  accounting: () => [kpi('Receivables', peso(2998800), '4 statements', 'primary'), kpi('Overdue', peso(480000), '1 statement 85 days', 'danger'), kpi('Payables due', peso(1872600), '2 supplier bills', 'warning')],
}
KPIS.warehouse = () => [kpi('Awaiting delivery from suppliers', 154, 'Open PO lines', 'info'), kpi('For QA', 80, 'Boots', 'warning'), kpi('Ready to ship', 0, 'No stock allocated', 'success')]

const dashboard = () => {
  const r = role()
  const cards = (KPIS[r] || KPIS.default)()
  return {
    html: `
${header({ title: 'Dashboard', crumbs: [['Home']], actions: `<a class="btn btn-primary" href="#/contracts/create">+ New contract</a>` })}
<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-${Math.min(cards.length, 5)}">${cards.join('')}</div>
<div class="mt-6 grid gap-4 lg:grid-cols-3">
  <section class="card p-4 lg:col-span-2"><h2 class="font-head text-lg text-primary">Collections vs billings (₱ thousands)</h2><div class="mt-3 h-64"><canvas id="c1" aria-label="Bar chart of billings and collections by month" role="img"></canvas></div></section>
  <section class="card p-4"><h2 class="font-head text-lg text-primary">Contracts by deadline status</h2><div class="mt-3 h-64"><canvas id="c2" aria-label="Doughnut chart of contract deadline status" role="img"></canvas></div></section>
</div>
<div class="mt-6 grid gap-4 lg:grid-cols-2">
  <section class="card"><h2 class="border-b border-line p-4 font-head text-lg text-primary">Alerts</h2>
    <ul>${notifications.slice(0, 4).map((n) => `<li class="border-b border-line p-3 last:border-0"><a class="hover:underline" href="${n.link}">${n.text}</a><p class="text-xs text-muted">${n.time}</p></li>`).join('')}</ul></section>
  <section class="card"><h2 class="border-b border-line p-4 font-head text-lg text-primary">Contracts needing attention</h2>
    <ul>${contracts.filter((c) => c.deadlineStatus !== 'On track').map((c) => `<li class="flex items-center justify-between border-b border-line p-3 last:border-0"><a class="link" href="#/contracts/${c.id}">${c.no}</a><span class="text-sm text-muted">${c.left >= 0 ? c.left + ' days left' : -c.left + ' days late'}</span>${badge(c.deadlineStatus)}</li>`).join('')}</ul></section>
</div>`,
    mount: ({ view, track }) => {
      chart(view.querySelector('#c1'), track, {
        type: 'bar',
        data: { labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], datasets: [
          { label: 'Billed', data: [310, 480, 0, 0, 336, 2183], backgroundColor: C.primary },
          { label: 'Collected', data: [120, 297, 0, 0, 150, 0], backgroundColor: C.gold },
        ] },
      })
      chart(view.querySelector('#c2'), track, {
        type: 'doughnut',
        data: { labels: ['On track', 'At risk', 'Delayed'], datasets: [{ data: [3, 1, 1], backgroundColor: [C.green, C.amber, C.red] }] },
        options: { plugins: { legend: { position: 'bottom' } } },
      })
    },
  }
}

export const dashboardRoutes = [{ path: '/dashboard', render: dashboard }]
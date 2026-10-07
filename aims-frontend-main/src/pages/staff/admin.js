import { notifications, users, audit } from '../../lib/data.js'
import { ask, badge, form, header, listPage } from '../../lib/ui.js'

// S32
const alerts = () => header({ title: 'Notifications', crumbs: [['Home', '#/dashboard'], ['Notifications']], actions: `<button class="btn btn-ghost" @click="$store.ui.toast('All marked as read (demo)')">Mark all read</button>` }) + `
<ul class="card divide-y divide-line">${notifications.map((n) => `<li class="flex items-start gap-3 p-4"><span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${{ amber: 'bg-warning', red: 'bg-danger', teal: 'bg-info' }[n.tone]}" aria-hidden="true"></span><div class="flex-1"><a class="hover:underline" href="${n.link}">${n.text}</a><p class="text-xs text-muted">${n.time}</p></div></li>`).join('')}</ul>`

// S33
const userList = () => listPage({
  title: 'Users & roles', crumbs: [['Home', '#/dashboard'], ['Administration'], ['Users']], action: `<a class="btn btn-primary" href="#/admin/users/new">+ New user</a>`,
  note: 'Deactivate accounts instead of deleting them so the audit trail stays intact.',
  cols: [{ k: 'name', label: 'Name' }, { k: 'email', label: 'Email' }, { k: 'role', label: 'Role' }, { k: 'last', label: 'Last login' }, { label: 'Status', render: (r) => badge(r.status) },
    { label: '', render: (r) => (r.status === 'Active' ? ask('Deactivate', { title: 'Deactivate ' + r.name, danger: true, confirm: 'Deactivate' }) : '') }],
  rows: users, statusKey: 'role',
})
const userForm = () => form({
  title: 'New user', crumbs: [['Home', '#/dashboard'], ['Users', '#/admin/users'], ['New']], back: '/admin/users',
  fields: [
    { name: 'name', label: 'Full name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Role', type: 'select', required: true, options: ['admin', 'gm', 'bidding', 'purchasing', 'warehouse', 'production', 'qa', 'accounting', 'client'] },
    { name: 'client', label: 'Client organization (portal users only)', hint: 'Client users only see their own organization’s records (BR-27).' },
  ],
})

// S34
const settings = () => form({
  title: 'Settings', crumbs: [['Home', '#/dashboard'], ['Administration'], ['Settings']], back: '/dashboard',
  fields: [
    { name: 'company', label: 'Company name', required: true, span: 2 },
    { name: 'vat', label: 'VAT rate (%)', type: 'number', required: true }, { name: 'wvat', label: 'Withholding VAT, government (%)', type: 'number', required: true },
    { name: 'ewt', label: 'Expanded withholding, goods (%)', type: 'number', required: true, hint: 'Confirm with the accountant.' },
    { name: 'threshold', label: 'PO approval threshold (₱)', type: 'number', required: true }, { name: 'guard', label: 'Margin guard: warn above cost % of price', type: 'number', required: true },
    { name: 'numbering', label: 'Document numbering', span: 2, hint: 'Format PREFIX-YYYY-NNNN, for example PO-2026-0031.' },
  ],
})

// S35
const auditLog = () => listPage({
  title: 'Audit log', crumbs: [['Home', '#/dashboard'], ['Administration'], ['Audit log']], note: 'Posted POs, DRs and invoices are voided with a reason, never deleted (BR-28).',
  cols: [{ k: 'when', label: 'When' }, { k: 'user', label: 'User' }, { k: 'action', label: 'Action' }, { k: 'subject', label: 'Record' }, { k: 'change', label: 'Change (old → new)' }],
  rows: audit, statusKey: 'action',
})

// S36
const profile = () => form({
  title: 'My profile', crumbs: [['Home', '#/dashboard'], ['Profile']], back: '/dashboard',
  fields: [{ name: 'name', label: 'Name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'pw', label: 'New password', type: 'password' }, { name: 'pw2', label: 'Confirm new password', type: 'password' }],
})

export const adminRoutes = [
  { path: '/notifications', render: alerts },
  { path: '/admin/users', render: userList },
  { path: '/admin/users/new', render: userForm },
  { path: '/admin/settings', render: settings },
  { path: '/admin/audit', render: auditLog },
  { path: '/profile', render: profile },
]
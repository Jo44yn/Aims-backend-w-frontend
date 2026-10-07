import { notifications, audit } from '../../lib/data.js'
import { badge, can, form, header, listPage, esc } from '../../lib/ui.js'
import { api } from '../../lib/api.js'
import { asyncRoute, unwrap, actionButton } from '../../lib/source.js'
import { profileRoute } from '../profile.js'

const ROLE_LABEL = {
  admin: 'Administrator', gm: 'Owner / GM', bidding: 'Bidding & Contracts', purchasing: 'Purchasing', warehouse: 'Warehouse & Logistics',
  production: 'Production', qa: 'QA Inspector', accounting: 'Accounting', client: 'Client (portal)',
}

// S32 – notifications (still sample data until the alert jobs exist)
const alerts = () => header({ title: 'Notifications', crumbs: [['Home', '#/dashboard'], ['Notifications']], actions: `<span class="badge badge-gray">Sample data</span>` }) + `
<ul class="card divide-y divide-line">${notifications.map((n) => `<li class="flex items-start gap-3 p-4"><span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${{ amber: 'bg-warning', red: 'bg-danger', teal: 'bg-info' }[n.tone]}" aria-hidden="true"></span><div class="flex-1"><a class="hover:underline" href="${n.link}">${n.text}</a><p class="text-xs text-muted">${n.time}</p></div></li>`).join('')}</ul>`

// S33 – users and roles (from the API). Accounts are deactivated, never deleted.
const userList = asyncRoute('users', async () => {
  const res = await api.users()
  const rows = res.data.map((u) => ({ ...u, roleLabel: ROLE_LABEL[u.role] || u.role }))
  return listPage({
    title: 'Users & roles', crumbs: [['Home', '#/dashboard'], ['Administration'], ['Users']], action: can('users') ? `<a class="btn btn-primary" href="#/admin/users/new">+ New user</a>` : '',
    note: 'Deactivate accounts instead of deleting them so the audit trail stays intact. A deactivated user is signed out and cannot sign in.',
    cols: [{ k: 'name', label: 'Name' }, { k: 'email', label: 'Email' }, { k: 'roleLabel', label: 'Role' }, { k: 'last', label: 'Last login' }, { label: 'Status', render: (r) => badge(r.status) },
      ...(can('users') ? [{ label: '', render: (r) => `<div class="flex gap-1"><a class="btn btn-ghost !py-1" href="#/admin/users/${r.id}/edit">Edit</a>${actionButton(r.active ? 'Deactivate' : 'Reactivate', async () => { await api.updateUser(r.id, { name: r.name, email: r.email, role: r.role, client_id: r.clientId, is_active: !r.active }); return `${r.name} ${r.active ? 'deactivated' : 'reactivated'}.` }, 'btn-ghost !py-1', r.active ? `Deactivate ${r.name}? They will be signed out.` : '')}</div>` }] : [])],
    rows, statusKey: 'roleLabel',
  })
})

const userFields = (roles, clients, u = {}, isNew = true) => [
  { name: 'name', label: 'Full name', required: true, value: u.name },
  { name: 'email', label: 'Email', type: 'email', required: true, value: u.email },
  { name: 'role', label: 'Role', type: 'select', required: true, options: roles.map((r) => ({ value: r, label: ROLE_LABEL[r] || r })), value: u.role },
  { name: 'client_id', label: 'Client organization (portal users only)', type: 'select', options: clients.map((c) => ({ value: c.id, label: esc(c.name) })), value: u.clientId, hint: 'Client users only see their own organization’s records (BR-27).' },
  { name: 'password', label: isNew ? 'Temporary password' : 'Reset password', type: 'password', required: isNew, hint: isNew ? 'At least 8 characters. Ask the user to change it from My profile.' : 'Leave blank to keep the current password.' },
  ...(isNew ? [] : [{ name: 'is_active', label: 'Account', type: 'checkbox', checkLabel: 'Active (uncheck to deactivate)', value: u.active }]),
]
const userBody = (d) => ({ name: d.name.trim(), email: d.email.trim(), role: d.role, client_id: d.client_id ? Number(d.client_id) : null, password: d.password || null })

const userForm = asyncRoute('roles', async () => {
  const [res, clients] = await Promise.all([api.users(), api.clients().then(unwrap)])
  return form({
    title: 'New user', crumbs: [['Home', '#/dashboard'], ['Users', '#/admin/users'], ['New']], back: '/admin/users', submit: 'Create user',
    onSubmit: async (d) => { await api.createUser(userBody(d)); return `Account for ${d.name} created.` },
    fields: userFields(res.roles, clients),
  })
})

const userEdit = asyncRoute('user', async ({ id }) => {
  const [res, clients] = await Promise.all([api.users(), api.clients().then(unwrap)])
  const u = res.data.find((x) => String(x.id) === String(id))
  if (!u) return `<p class="p-10 text-center">User not found.</p>`
  return form({
    title: `Edit ${esc(u.name)}`, crumbs: [['Home', '#/dashboard'], ['Users', '#/admin/users'], [u.name]], back: '/admin/users', submit: 'Save changes', actions: badge(u.status),
    onSubmit: async (d) => { await api.updateUser(u.id, { ...userBody(d), is_active: !!d.is_active }); return `${d.name} updated.` },
    fields: userFields(res.roles, clients, u, false),
  })
})

// S34 – settings (tax rates, approval threshold, margin guard)
const settings = asyncRoute('settings', async () => {
  const s = unwrap(await api.settings())
  return form({
    title: 'Settings', crumbs: [['Home', '#/dashboard'], ['Administration'], ['Settings']], back: '/dashboard', after: null, submit: 'Save settings',
    onSubmit: async (d) => {
      await api.updateSettings({
        company_name: d.company_name.trim(), vat_rate: Number(d.vat_rate), wvat_rate: Number(d.wvat_rate), ewt_rate: Number(d.ewt_rate),
        po_approval_threshold: Number(d.po_approval_threshold), margin_guard_threshold: Number(d.margin_guard_threshold),
      })
      return 'Settings saved.'
    },
    fields: [
      { name: 'company_name', label: 'Company name', required: true, span: 2, value: s.company_name },
      { name: 'vat_rate', label: 'VAT rate (%)', type: 'number', required: true, value: s.vat_rate },
      { name: 'wvat_rate', label: 'Withholding VAT, government (%)', type: 'number', required: true, value: s.wvat_rate },
      { name: 'ewt_rate', label: 'Expanded withholding, goods (%)', type: 'number', required: true, value: s.ewt_rate, hint: 'Confirm with the accountant.' },
      { name: 'po_approval_threshold', label: 'PO approval threshold (₱)', type: 'number', required: true, value: s.po_approval_threshold, hint: 'POs above this amount need GM approval (BR-11).' },
      { name: 'margin_guard_threshold', label: 'Margin guard: warn when cost is above this % of price', type: 'number', required: true, value: s.margin_guard_threshold },
    ],
  })
})

// S35 – audit log (still sample data until activity logging is wired up)
const auditLog = () => listPage({
  title: 'Audit log', crumbs: [['Home', '#/dashboard'], ['Administration'], ['Audit log']], note: 'Sample data. Posted POs, DRs and invoices are voided with a reason, never deleted (BR-28).',
  cols: [{ k: 'when', label: 'When' }, { k: 'user', label: 'User' }, { k: 'action', label: 'Action' }, { k: 'subject', label: 'Record' }, { k: 'change', label: 'Change (old → new)' }],
  rows: audit, statusKey: 'action',
})

// S36 – real profile of the signed-in user (see pages/profile.js)
const profile = profileRoute({ crumbs: [['Home', '#/dashboard'], ['Profile']], back: '/dashboard' })

export const adminRoutes = [
  { path: '/notifications', render: alerts },
  { path: '/admin/users', render: userList },
  { path: '/admin/users/new', render: userForm },
  { path: '/admin/users/:id/edit', render: userEdit },
  { path: '/admin/settings', render: settings },
  { path: '/admin/audit', render: auditLog },
  { path: '/profile', render: profile },
]

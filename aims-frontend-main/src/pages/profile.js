// Profile page shared by the staff app and the client portal.
// Shows the signed-in account (refreshed from the API) and lets the user edit it.
import { getUser, fetchMe, updateProfile } from '../lib/api.js'
import { form, header, badge, esc } from '../lib/ui.js'

const ROLE_LABEL = {
  admin: 'Administrator', gm: 'Owner / GM', bidding: 'Bidding & Contracts', purchasing: 'Purchasing',
  warehouse: 'Warehouse & Logistics', production: 'Production', qa: 'QA Inspector', accounting: 'Accounting', client: 'Client',
}

const initials = (name) => String(name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

const view = (u, { crumbs, back }) => {
  const rows = [
    ['Role', ROLE_LABEL[u.role] || u.role || '—'],
    ['Email', u.email],
    u.phone && ['Phone', u.phone],
    u.organization && ['Organization', u.organization],
    u.client_id && ['Client ID', u.client_id],
    u.created_at && ['Member since', new Date(u.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })],
  ].filter(Boolean)

  return header({ title: 'My profile', crumbs }) + `
<div class="card mb-4 flex max-w-4xl flex-wrap items-center gap-4 p-5">
  <span class="grid h-16 w-16 place-items-center rounded-full bg-primary font-head text-2xl text-white">${esc(initials(u.name))}</span>
  <div class="min-w-0 flex-1">
    <p class="font-head text-xl text-primary">${esc(u.name)}</p>
    <p class="text-sm text-muted">${esc(u.email)}</p>
  </div>
  ${badge('Active')}
  <dl class="grid w-full gap-3 border-t border-line pt-4 sm:grid-cols-2">
    ${rows.map(([k, v]) => `<div><dt class="label">${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
  </dl>
</div>` + form({
    crumbs, back, after: null, submit: 'Save changes',
    fields: [
      { name: 'name', label: 'Name', required: true, value: u.name },
      { name: 'email', label: 'Email', type: 'email', required: true, value: u.email },
      { name: 'phone', label: 'Phone', value: u.phone },
      { name: 'current_password', label: 'Current password', type: 'password', hint: 'Only needed if you set a new password.' },
      { name: 'password', label: 'New password', type: 'password', hint: 'At least 8 characters. Leave blank to keep the current one.' },
      { name: 'password_confirmation', label: 'Confirm new password', type: 'password' },
    ],
    onSubmit: async (d) => {
      const body = { name: d.name, email: d.email, phone: d.phone }
      if (d.password) {
        if (d.password.length < 8) throw Object.assign(new Error('New password must be at least 8 characters.'), { fields: { password: 'At least 8 characters.' } })
        if (d.password !== d.password_confirmation) throw Object.assign(new Error('Passwords do not match.'), { fields: { password_confirmation: 'Passwords do not match.' } })
        Object.assign(body, { current_password: d.current_password, password: d.password, password_confirmation: d.password_confirmation })
      }
      await updateProfile(body)
      // Reload so the summary card and the name in the top bar show the saved values.
      setTimeout(() => location.reload(), 700)
      return 'Profile updated'
    },
  })
}

export const profileRoute = (opts) => () => ({
  html: view(getUser() || { name: 'Guest', email: '' }, opts),
  mount: ({ view: el }) => {
    // Refresh from the server so the page always reflects the real account.
    fetchMe().then((u) => { el.innerHTML = view(u, opts) }).catch(() => {})
  },
})

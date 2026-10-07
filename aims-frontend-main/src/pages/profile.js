// Profile page shared by the staff app and the client portal.
// Shows the signed-in account (refreshed from the API) and lets the user edit it.
import { getUser, fetchMe, updateProfile, updateAvatar } from '../lib/api.js'
import { form, header, badge, esc } from '../lib/ui.js'
import { avatar } from '../lib/brand.js'

// Profile photo: any signed-in role can set or remove their own. The image is shrunk
// in the browser to a 256px square (about 20 KB) before it is sent.
const toast = (m) => window.Alpine.store('ui').toast(m)
const shrink = (file) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => {
    const side = Math.min(img.width, img.height)
    const c = Object.assign(document.createElement('canvas'), { width: 256, height: 256 })
    c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256)
    URL.revokeObjectURL(img.src)
    resolve(c.toDataURL('image/jpeg', 0.85))
  }
  img.onerror = () => reject(new Error('That file is not a readable image.'))
  img.src = URL.createObjectURL(file)
})
const saveAvatar = async (dataUrl, msg) => {
  try {
    await updateAvatar(dataUrl)
    toast(msg)
    setTimeout(() => location.reload(), 600)
  } catch (e) { toast(e.message || 'Could not save the photo') }
}
window.aimsPhoto = {
  async pick(input) {
    const file = input.files[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) return toast('Choose an image smaller than 8 MB.')
    try { await saveAvatar(await shrink(file), 'Profile photo updated') } catch (e) { toast(e.message) }
  },
  remove: () => saveAvatar(null, 'Profile photo removed'),
}

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
  ${avatar(u, 'h-20 w-20', 'text-3xl')}
  <div class="min-w-0 flex-1">
    <p class="font-head text-xl text-primary">${esc(u.name)}</p>
    <p class="text-sm text-muted">${esc(u.email)}</p>
    <div class="mt-2 flex flex-wrap gap-2">
      <label class="btn btn-ghost cursor-pointer !py-1">Change photo<input type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" onchange="aimsPhoto.pick(this)"></label>
      ${u.avatar ? `<button type="button" class="btn btn-ghost !py-1" onclick="aimsPhoto.remove()">Remove photo</button>` : ''}
    </div>
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
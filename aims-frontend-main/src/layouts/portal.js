import { overlays, esc } from '../lib/ui.js'
import { isAuthenticated, getUser, logout } from '../lib/api.js'
import { logo, avatar } from '../lib/brand.js'

window.aimsLogout = () => logout().finally(() => { location.href = 'login.html' })

const LINKS = [['/portal', 'Dashboard'], ['/portal/contracts', 'My contracts'], ['/portal/documents', 'Documents'], ['/portal/inquiries', 'Inquiries'], ['/portal/profile', 'Account']]

export const portalLayout = () => {
  if (!isAuthenticated()) {
    location.href = 'login.html'
    return ''
  }
  const user = getUser() || {}
  return `
<header class="bg-primary text-white" x-data>
  <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
    <a href="#/portal" class="flex items-center gap-2"><span class="rounded-md bg-white p-0.5">${logo('h-9 w-9', 'bg-accent text-primary')}</span><span class="font-head text-lg">AIMFORCE Client Portal</span></a>
    <nav class="flex flex-wrap gap-1" aria-label="Portal">
      ${LINKS.map(([h, l]) => `<a class="nav-link !py-1.5" data-nav href="#${h}">${l}</a>`).join('')}
    </nav>
    <div class="ml-auto flex items-center gap-3 text-sm"><a href="#/portal/profile" class="flex items-center gap-2">${avatar(user, 'h-8 w-8', 'text-xs')}<span class="hidden text-white/80 sm:inline">${esc(user.name)}</span></a><button class="btn btn-gold" @click="aimsLogout()">Sign out</button></div>
  </div>
</header>
<main id="view" class="mx-auto max-w-6xl p-4 lg:py-6"></main>
<footer class="mt-8 border-t border-line py-4 text-center text-xs text-muted">You only see records of your own organization (Data Privacy Act, RA 10173).</footer>
${overlays()}`
}
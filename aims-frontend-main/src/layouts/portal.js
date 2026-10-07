import { overlays } from '../lib/ui.js'

const LINKS = [['/portal', 'Dashboard'], ['/portal/contracts', 'My contracts'], ['/portal/documents', 'Documents'], ['/portal/inquiries', 'Inquiries'], ['/portal/profile', 'Account']]

export const portalLayout = () => `
<header class="bg-primary text-white">
  <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
    <a href="#/portal" class="flex items-center gap-2"><span class="grid h-9 w-9 place-items-center rounded-md bg-accent font-head text-lg text-primary">A</span><span class="font-head text-lg">AIMFORCE Client Portal</span></a>
    <nav class="flex flex-wrap gap-1" aria-label="Portal">
      ${LINKS.map(([h, l]) => `<a class="nav-link !py-1.5" data-nav href="#${h}">${l}</a>`).join('')}
    </nav>
    <div class="ml-auto flex items-center gap-3 text-sm"><span class="hidden text-white/70 sm:inline">Maj. R. Dela Cruz · 1st Infantry Division</span><a class="btn btn-gold" href="login.html">Sign out</a></div>
  </div>
</header>
<main id="view" class="mx-auto max-w-6xl p-4 lg:py-6"></main>
<footer class="mt-8 border-t border-line py-4 text-center text-xs text-muted">You only see records of your own organization (Data Privacy Act, RA 10173).</footer>
${overlays()}`
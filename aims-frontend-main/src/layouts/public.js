import { overlays } from '../lib/ui.js'
import { logo } from '../lib/brand.js'

const LINKS = [['/', 'Home'], ['/products', 'Products'], ['/about', 'About & partners']]

export const publicLayout = () => `
<header class="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur" x-data="{o:false}">
  <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
    <a href="#/" class="flex items-center gap-2">${logo('h-10 w-10')}<span class="font-head text-lg leading-tight text-primary">AIMFORCE<br><span class="font-sans text-xs font-medium text-muted">Police and Military Supply</span></span></a>
    <button class="btn btn-ghost ml-auto md:hidden" aria-label="Menu" @click="o=!o">☰</button>
    <nav class="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
      ${LINKS.map(([h, l]) => `<a class="rounded px-3 py-2 font-semibold text-ink hover:text-primary-light" data-nav href="#${h}">${l}</a>`).join('')}
      <a class="btn btn-ghost" href="login.html">Sign in</a><a class="btn btn-gold" href="login.html#signup">Sign up</a><a class="btn btn-primary" href="#/rfq">Request a quotation</a>
    </nav>
  </div>
  <nav x-show="o" x-cloak class="border-t border-line p-3 md:hidden"><div class="grid gap-1">
    ${[...LINKS, ['/rfq', 'Request a quotation']].map(([h, l]) => `<a class="p-2" href="#${h}" @click="o=false">${l}</a>`).join('')}
    <a class="p-2" href="login.html">Sign in</a><a class="p-2" href="login.html#signup">Sign up</a></div></nav>
</header>
<main id="view"></main>
<footer class="mt-12 bg-primary text-white">
  <div class="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
    <div><p class="font-head text-xl">AIMFORCE Police and Military Supply</p><p class="mt-2 text-sm text-white/70">Equipping security and defense forces with high-quality supplies, with integrity, reliability and professionalism.</p></div>
    <div class="text-sm text-white/80"><p class="font-semibold text-accent">Visit</p><p>Dasmariñas, Cavite, Philippines</p></div>
    <div class="text-sm text-white/80"><p class="font-semibold text-accent">Contact</p><p>sales@aimforce.example · 0917 000 0000</p></div>
  </div>
  <p class="border-t border-white/10 py-3 text-center text-xs text-white/50">© 2026 AIMFORCE Police and Military Supply. All rights reserved.</p>
</footer>
${overlays()}`
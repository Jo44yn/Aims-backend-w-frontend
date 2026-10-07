// Brand assets. Put the logo file at:  aims-frontend-main/public/images/AF LOGO.png
// (Vite serves everything in /public from the site root, so no import is needed.)
// If your file is .jpg / .svg / .webp, only change LOGO_FILE below.
const LOGO_FILE = 'AF LOGO.png'

export const LOGO_URL = `${import.meta.env.BASE_URL}images/${encodeURIComponent(LOGO_FILE)}`

export const initials = (name) => String(name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

// Round profile picture: the user's photo, or their initials when there is none.
export const avatar = (u, size = 'h-8 w-8', text = 'text-xs') => {
  const user = u || {}
  const src = String(user.avatar || '').replace(/"/g, '')
  return src.startsWith('data:image/')
    ? `<img src="${src}" alt="" class="${size} shrink-0 rounded-full object-cover">`
    : `<span class="grid ${size} shrink-0 place-items-center rounded-full bg-primary font-head ${text} text-white">${initials(user.name).replace(/</g, '&lt;')}</span>`
}

// <img> that falls back to a plain "AF" badge if the file is missing.
// `size` = Tailwind size classes, `bg` = badge colours used only by the fallback.
export const logo = (size = 'h-10 w-10', bg = 'bg-primary text-accent') =>
  `<img src="${LOGO_URL}" alt="AF LOGO" class="${size} shrink-0 rounded-md object-contain" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` +
  `<span hidden class="grid ${size} shrink-0 place-items-center rounded-md ${bg} font-head text-lg">AF</span>`
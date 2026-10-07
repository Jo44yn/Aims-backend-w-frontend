// Brand assets. Put the logo file at:  aims-frontend-main/public/images/AF LOGO.png
// (Vite serves everything in /public from the site root, so no import is needed.)
// If your file is .jpg / .svg / .webp, only change LOGO_FILE below.
const LOGO_FILE = 'AF LOGO.png'

export const LOGO_URL = `${import.meta.env.BASE_URL}images/${encodeURIComponent(LOGO_FILE)}`

// <img> that falls back to a plain "AF" badge if the file is missing.
// `size` = Tailwind size classes, `bg` = badge colours used only by the fallback.
export const logo = (size = 'h-10 w-10', bg = 'bg-primary text-accent') =>
  `<img src="${LOGO_URL}" alt="AF LOGO" class="${size} shrink-0 rounded-md object-contain" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` +
  `<span hidden class="grid ${size} shrink-0 place-items-center rounded-md ${bg} font-head text-lg">AF</span>`

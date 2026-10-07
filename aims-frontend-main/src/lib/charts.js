// Brand colours for Chart.js (same hex values as the Tailwind theme).
export const C = { primary: '#1B2A6B', light: '#2E3E9E', gold: '#E0B21B', red: '#C8102E', green: '#2E7D32', amber: '#B45309', teal: '#0E7490', gray: '#9CA3AF' }
export const chart = (ctx, track, cfg) => track(new window.Chart(ctx, { ...cfg, options: { responsive: true, maintainAspectRatio: false, ...cfg.options } }))
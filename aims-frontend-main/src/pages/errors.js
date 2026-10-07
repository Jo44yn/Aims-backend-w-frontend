const E = {
  403: ['Not allowed', 'Your role does not have access to this page. Ask the Administrator if you need it.'],
  404: ['Page not found', 'The page you are looking for does not exist or was moved.'],
  419: ['Session expired', 'For your security the page expired. Sign in again and retry.'],
  500: ['Something went wrong', 'The system hit an error. The team has been notified. Try again in a few minutes.'],
  503: ['Back soon', 'AIMS is down for scheduled maintenance. Please check again shortly.'],
}

export const errorPage = (code) => `
<div class="mx-auto max-w-lg py-16 text-center">
  <p class="font-head text-8xl font-semibold text-primary">${code === 503 ? 'Maintenance' : code}</p>
  <h1 class="mt-2 font-head text-2xl text-ink">${E[code][0]}</h1>
  <p class="mt-2 text-muted">${E[code][1]}</p>
  <a class="btn btn-primary mt-6" href="${code === 419 ? 'login.html' : '#/'}">${code === 419 ? 'Sign in again' : 'Go to the home page'}</a>
</div>`

export const errorRoutes = Object.keys(E).map((c) => ({
  path: '/' + (c === '503' ? 'maintenance' : c),
  render: () => errorPage(Number(c)),
}))
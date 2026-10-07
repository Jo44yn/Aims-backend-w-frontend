// P06 – Sign in / Sign up. Talks to the Laravel API through lib/api.js (no pre-filled credentials).
import { login, register, homeFor } from '../lib/api.js'
import { logo } from '../lib/brand.js'

// Alpine expressions in the markup below call these.
window.aimsAuth = { login, register, homeFor }

export const loginPage = () => `
<div class="grid min-h-screen place-items-center p-4" x-data="{mode: location.hash === '#signup' ? 'signup' : 'login', err:'', ok:'', sent:false, loading:false}">
  <div class="w-full max-w-md">
    <a href="index.html" class="mb-6 flex items-center justify-center gap-3">${logo('h-14 w-14')}<span class="font-head text-2xl text-primary">AIMS</span></a>
    <div class="card p-6">

      <form x-show="mode==='login'" novalidate
        @submit.prevent="
          const f = Object.fromEntries(new FormData($el));
          if (!f.email || !f.password) { err = 'Enter your email and password.'; return }
          err = ''; ok = ''; loading = true;
          aimsAuth.login(f.email, f.password)
            .then((d) => { location.href = aimsAuth.homeFor(d.user) })
            .catch((e) => { loading = false; err = e.message })">
        <h1 class="font-head text-2xl text-primary">Sign in</h1>
        <p class="mt-1 text-sm text-muted">Use your AIMS account credentials to sign in.</p>
        <p class="mt-3 rounded-md bg-green-50 p-3 text-sm text-success" x-show="ok" x-text="ok"></p>
        <label class="label mt-4" for="email">Email</label><input id="email" name="email" type="email" class="input" autocomplete="username">
        <label class="label mt-3" for="password">Password</label><input id="password" name="password" type="password" class="input" autocomplete="current-password">
        <p class="mt-2 text-sm text-danger" x-show="err" x-text="err"></p>
        <button class="btn btn-primary mt-5 w-full" :disabled="loading" :class="loading && 'opacity-75'">
          <span x-show="!loading">Sign in</span><span x-show="loading">Signing in…</span>
        </button>
        <button type="button" class="mt-3 w-full text-center text-sm link" @click="mode='forgot'; err=''">Forgot password?</button>
        <p class="mt-3 text-center text-sm text-muted">New client? <button type="button" class="link" @click="mode='signup'; err=''; ok=''">Create an account</button></p>
      </form>

      <form x-show="mode==='signup'" x-cloak novalidate
        @submit.prevent="
          const f = Object.fromEntries(new FormData($el));
          if (!f.name || !f.email || !f.password) { err = 'Name, email and password are required.'; return }
          if (f.password.length < 8) { err = 'Password must be at least 8 characters.'; return }
          if (f.password !== f.password_confirmation) { err = 'Passwords do not match.'; return }
          err = ''; loading = true;
          aimsAuth.register(f)
            .then((d) => {
              if (d.token || d.access_token) { location.href = aimsAuth.homeFor(d.user); return }
              loading = false; mode = 'login'; ok = 'Account created. You can sign in now.'
            })
            .catch((e) => { loading = false; err = Object.values(e.fields || {})[0] || e.message })">
        <h1 class="font-head text-2xl text-primary">Create your account</h1>
        <p class="mt-1 text-sm text-muted">Sign up to follow your contracts, deliveries and documents in the client portal.</p>
        <label class="label mt-4" for="sname">Full name <span class="text-danger">*</span></label><input id="sname" name="name" class="input" autocomplete="name">
        <label class="label mt-3" for="semail">Email <span class="text-danger">*</span></label><input id="semail" name="email" type="email" class="input" autocomplete="email">
        <label class="label mt-3" for="sorg">Organization / unit</label><input id="sorg" name="organization" class="input" placeholder="e.g. 1st Infantry Division">
        <label class="label mt-3" for="sphone">Phone</label><input id="sphone" name="phone" class="input" autocomplete="tel">
        <label class="label mt-3" for="spw">Password <span class="text-danger">*</span></label><input id="spw" name="password" type="password" class="input" autocomplete="new-password">
        <label class="label mt-3" for="spw2">Confirm password <span class="text-danger">*</span></label><input id="spw2" name="password_confirmation" type="password" class="input" autocomplete="new-password">
        <p class="mt-2 text-sm text-danger" x-show="err" x-text="err"></p>
        <button class="btn btn-primary mt-5 w-full" :disabled="loading" :class="loading && 'opacity-75'">
          <span x-show="!loading">Sign up</span><span x-show="loading">Creating account…</span>
        </button>
        <p class="mt-3 text-center text-sm text-muted">Already have an account? <button type="button" class="link" @click="mode='login'; err=''">Sign in</button></p>
      </form>

      <form x-show="mode==='forgot'" x-cloak novalidate @submit.prevent="sent = true">
        <h1 class="font-head text-2xl text-primary">Reset your password</h1>
        <p class="mt-1 text-sm text-muted">We email you a link that expires in 60 minutes.</p>
        <label class="label mt-4" for="femail">Email</label><input id="femail" type="email" class="input" required>
        <p class="mt-3 rounded-md bg-green-50 p-3 text-sm text-success" x-show="sent">If that email exists, a reset link is on its way.</p>
        <button class="btn btn-primary mt-5 w-full">Send reset link</button>
        <button type="button" class="mt-3 w-full text-center text-sm link" @click="mode='login'">Back to sign in</button>
      </form>
    </div>
  </div>
</div>`

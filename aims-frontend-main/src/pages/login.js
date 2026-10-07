// P06 – Login page. Calls the Laravel API; on success stores the bearer token.
export const loginPage = () => `
<div class="grid min-h-screen place-items-center p-4" x-data="{mode:'login', err:'', sent:false, loading:false}">
  <div class="w-full max-w-md">
    <a href="index.html" class="mb-6 flex items-center justify-center gap-2"><span class="grid h-11 w-11 place-items-center rounded-md bg-primary font-head text-xl text-accent">A</span><span class="font-head text-2xl text-primary">AIMS</span></a>
    <div class="card p-6">
      <form x-show="mode==='login'" novalidate
        @submit.prevent="
          const f = new FormData($el);
          const email = f.get('email'); const password = f.get('password');
          if (!email || !password) { err = 'Enter your email and password.'; return }
          err = ''; loading = true;
          fetch('http://127.0.0.1:8000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, password })
          }).then(r => r.json().then(d => ({ ok: r.ok, d }))).then(({ ok, d }) => {
            loading = false;
            if (!ok) { err = d.message || 'Invalid credentials.'; return }
            try {
              localStorage.setItem('aims_token', d.token);
              localStorage.setItem('aims_user', JSON.stringify(d.user));
              localStorage.setItem('aims_role', d.user.role || 'gm')
            } catch {}
            location.href = d.user && d.user.role === 'client' ? 'portal.html' : 'app.html'
          }).catch(() => { loading = false; err = 'Cannot connect to server. Make sure the backend is running.' })">
        <h1 class="font-head text-2xl text-primary">Sign in</h1>
        <p class="mt-1 text-sm text-muted">Use your AIMS account credentials to sign in.</p>
        <label class="label mt-4" for="email">Email</label><input id="email" name="email" type="email" class="input" autocomplete="username" value="admin@aimforce.example">
        <label class="label mt-3" for="password">Password</label><input id="password" name="password" type="password" class="input" autocomplete="current-password" value="password">
        <p class="mt-2 text-sm text-danger" x-show="err" x-text="err"></p>
        <button class="btn btn-primary mt-5 w-full" :disabled="loading" :class="loading && 'opacity-75'">
          <span x-show="!loading">Sign in</span>
          <span x-show="loading">Signing in\u2026</span>
        </button>
        <button type="button" class="mt-3 w-full text-center text-sm link" @click="mode='forgot'">Forgot password?</button>
      </form>

      <form x-show="mode==='forgot'" x-cloak novalidate @submit.prevent="sent = true">
        <h1 class="font-head text-2xl text-primary">Reset your password</h1>
        <p class="mt-1 text-sm text-muted">We email you a link that expires in 60 minutes.</p>
        <label class="label mt-4" for="femail">Email</label><input id="femail" type="email" class="input" required>
        <p class="mt-3 rounded-md bg-green-50 p-3 text-sm text-success" x-show="sent">If that email exists, a reset link is on its way.</p>
        <button class="btn btn-primary mt-5 w-full">Send reset link</button>
        <button type="button" class="mt-3 w-full text-center text-sm link" @click="mode='reset'">I have a reset link</button>
        <button type="button" class="mt-1 w-full text-center text-sm link" @click="mode='login'">Back to sign in</button>
      </form>

      <form x-show="mode==='reset'" x-cloak novalidate x-data="{p:'',c:''}" @submit.prevent="if (p.length >= 8 &amp;&amp; p === c) mode = 'login'; else err = 'Passwords must match and be at least 8 characters.'">
        <h1 class="font-head text-2xl text-primary">Choose a new password</h1>
        <label class="label mt-4" for="np">New password</label><input id="np" type="password" class="input" x-model="p">
        <label class="label mt-3" for="cp">Confirm password</label><input id="cp" type="password" class="input" x-model="c">
        <p class="mt-2 text-sm text-danger" x-show="err" x-text="err"></p>
        <button class="btn btn-primary mt-5 w-full">Save password</button>
      </form>
    </div>
  </div>
</div>`
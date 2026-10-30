/* ==========================================================
   common.js - shared helpers used on every page
   - DB       : tiny wrapper over localStorage
   - Auth     : register / login / logout (demo, client side)
   - Progress : saves how far each user is in each case
   - UI       : navbar, footer, toast notifications
   ========================================================== */

/* ---------- Storage wrapper ---------- */
const DB = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/* ---------- Authentication (demo only, no server) ---------- */
const Auth = {
  users() {
    return DB.get('nd_users', {});
  },

  // Simple string hash so we never store the plain password.
  // (A real project would hash on the server with bcrypt.)
  hash(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    }
    return 'h' + (h >>> 0).toString(16) + text.length;
  },

  current() {
    const name = DB.get('nd_session', null);
    if (!name) return null;
    const u = this.users()[name];
    return u ? { username: name, name: u.name } : null;
  },

  register(name, username, password) {
    username = username.trim().toLowerCase();
    name = name.trim();
    if (name.length < 2) return { ok: false, msg: 'Please enter your full name.' };
    if (!/^[a-z0-9_]{3,16}$/.test(username))
      return { ok: false, msg: 'Username must be 3-16 characters (letters, numbers, underscore).' };
    if (password.length < 4) return { ok: false, msg: 'Password must be at least 4 characters.' };
    const users = this.users();
    if (users[username]) return { ok: false, msg: 'That username is already taken.' };
    users[username] = { name, pass: this.hash(password), joined: Date.now() };
    DB.set('nd_users', users);
    DB.set('nd_session', username);
    return { ok: true };
  },

  login(username, password) {
    username = username.trim().toLowerCase();
    const u = this.users()[username];
    if (!u || u.pass !== this.hash(password)) return { ok: false, msg: 'Wrong username or password.' };
    DB.set('nd_session', username);
    return { ok: true };
  },

  logout() {
    localStorage.removeItem('nd_session');
    location.href = 'index.html';
  },

  // Call at the top of protected pages. Redirects to login if needed.
  require() {
    const u = this.current();
    if (!u) {
      location.href = 'index.html';
      return null;
    }
    return u;
  }
};

/* ---------- Case progress per user ---------- */
const Progress = {
  key(username) {
    return 'nd_progress_' + username;
  },
  all(username) {
    return DB.get(this.key(username), {});
  },
  blank() {
    return { found: [], searched: [], asked: [], actions: 0, hints: 0, attempts: 0, status: 'new', score: 0, notes: '' };
  },
  get(username, caseId) {
    return Object.assign(this.blank(), this.all(username)[caseId] || {});
  },
  save(username, caseId, data) {
    const all = this.all(username);
    all[caseId] = data;
    DB.set(this.key(username), all);
  },
  reset(username, caseId) {
    const all = this.all(username);
    delete all[caseId];
    DB.set(this.key(username), all);
  },
  resetAll(username) {
    localStorage.removeItem(this.key(username));
  },
  totalScore(username) {
    const all = this.all(username);
    return Object.values(all).reduce((sum, p) => sum + (p.status === 'solved' ? p.score : 0), 0);
  },
  solvedCount(username) {
    return Object.values(this.all(username)).filter(p => p.status === 'solved').length;
  }
};

/* ---------- UI helpers ---------- */
const UI = {
  esc(text) {
    const d = document.createElement('div');
    d.textContent = text == null ? '' : String(text);
    return d.innerHTML;
  },

  initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  },

  toast(message, type) {
    let box = document.querySelector('.toasts');
    if (!box) {
      box = document.createElement('div');
      box.className = 'toasts';
      document.body.appendChild(box);
    }
    while (box.children.length >= 3) box.firstChild.remove(); // keep at most 3 on screen
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = message;
    box.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity .3s';
      setTimeout(() => t.remove(), 300);
    }, 3200);
  },

  navbar(active) {
    const user = Auth.current();
    const link = (href, label, key) =>
      `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;
    const logo = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M20 20l-4.8-4.8"></path>
        <path d="M8 10.5h5M10.5 8v5" opacity=".55"></path>
      </svg>`;
    const userBlock = user
      ? `<div class="nav-user">
           <div class="avatar">${UI.esc(UI.initials(user.name))}</div>
           <div><small>Detective</small><b>${UI.esc(user.name.split(' ')[0])}</b></div>
           <button class="btn btn-ghost btn-sm" id="logoutBtn">Logout</button>
         </div>`
      : '';
    const html = `
      <header class="nav">
        <div class="container nav-inner">
          <a class="brand" href="index.html">${logo}<span>Noir<em>Desk</em></span></a>
          <nav class="nav-links">
            ${link('index.html', 'Home', 'home')}
            ${user ? link('cases.html', 'Cases', 'cases') : ''}
            ${user ? link('leaderboard.html', 'Leaderboard', 'board') : ''}
            ${userBlock}
          </nav>
        </div>
      </header>`;
    const mount = document.getElementById('nav');
    if (mount) mount.innerHTML = html;
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.addEventListener('click', () => Auth.logout());
  },

  footer() {
    const mount = document.getElementById('footer');
    if (!mount) return;
    mount.innerHTML = `
      <footer class="footer">
        <div class="container">
          <span>&copy; ${new Date().getFullYear()} Noir Desk &mdash; Web Based Mystery Solving System</span>
          <span>Built with HTML, CSS &amp; JavaScript</span>
        </div>
      </footer>`;
  },

  difficultyBadge(level) {
    return `<span class="badge b-${level.toLowerCase()}">${level}</span>`;
  },

  statusBadge(status) {
    const map = { new: ['b-new', 'Not started'], open: ['b-open', 'In progress'], solved: ['b-solved', 'Solved'], failed: ['b-failed', 'Case cold'] };
    const [cls, label] = map[status] || map.new;
    return `<span class="badge ${cls}">${label}</span>`;
  }
};

/* ==========================================================
   home.js - landing page: login / register forms + live stats
   ========================================================== */
(function () {
  UI.navbar('home');
  UI.footer();

  // ----- live stats -----
  const totalClues = CASES.reduce((n, c) => n + Object.keys(c.clues).length, 0);
  document.getElementById('statCases').textContent = CASES.length;
  document.getElementById('statClues').textContent = totalClues;
  document.getElementById('statUsers').textContent = Object.keys(Auth.users()).length;

  const card = document.getElementById('authCard');
  const actions = document.getElementById('heroActions');
  const user = Auth.current();

  // ----- logged in: show welcome box instead of the forms -----
  if (user) {
    actions.innerHTML = `
      <a class="btn btn-primary" href="cases.html">Open case files</a>
      <a class="btn btn-ghost" href="leaderboard.html">View leaderboard</a>`;
    card.innerHTML = `
      <div class="welcome-box">
        <div class="avatar">${UI.esc(UI.initials(user.name))}</div>
        <h3>Welcome back, ${UI.esc(user.name.split(' ')[0])}</h3>
        <p class="sub">You have solved <b>${Progress.solvedCount(user.username)}</b> of ${CASES.length} cases
          with a total score of <b>${Progress.totalScore(user.username)}</b>.</p>
        <a class="btn btn-primary btn-block" href="cases.html">Continue investigating</a>
      </div>`;
    return;
  }

  // ----- guest: login / register -----
  actions.innerHTML = `
    <a class="btn btn-primary" href="#authCard" id="startBtn">Start investigating</a>
    <a class="btn btn-ghost" href="#how">How it works</a>`;

  let mode = 'login';

  function render(error) {
    const isLogin = mode === 'login';
    card.innerHTML = `
      <div class="auth-tabs">
        <button type="button" data-mode="login" class="${isLogin ? 'on' : ''}">Login</button>
        <button type="button" data-mode="register" class="${!isLogin ? 'on' : ''}">Register</button>
      </div>
      <h3>${isLogin ? 'Welcome, detective' : 'Join the force'}</h3>
      <p class="sub">${isLogin ? 'Log in to resume your open cases.' : 'Create an account to save your progress and score.'}</p>
      ${error ? `<div class="form-error">${UI.esc(error)}</div>` : ''}
      <form id="authForm" novalidate>
        ${isLogin ? '' : `<div class="field"><label for="fName">Full name</label><input id="fName" type="text" autocomplete="name" placeholder="e.g. Riya Sharma"></div>`}
        <div class="field"><label for="fUser">Username</label><input id="fUser" type="text" autocomplete="username" placeholder="detective_riya"></div>
        <div class="field"><label for="fPass">Password</label><input id="fPass" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="At least 4 characters"></div>
        <button class="btn btn-primary btn-block" type="submit">${isLogin ? 'Log in' : 'Create account'}</button>
      </form>`;

    card.querySelectorAll('[data-mode]').forEach(btn =>
      btn.addEventListener('click', () => { mode = btn.dataset.mode; render(); }));

    card.querySelector('#authForm').addEventListener('submit', e => {
      e.preventDefault();
      const username = card.querySelector('#fUser').value;
      const password = card.querySelector('#fPass').value;
      let res;
      if (isLogin) {
        res = Auth.login(username, password);
      } else {
        res = Auth.register(card.querySelector('#fName').value, username, password);
      }
      if (res.ok) location.href = 'cases.html';
      else render(res.msg);
    });
  }

  render();
})();

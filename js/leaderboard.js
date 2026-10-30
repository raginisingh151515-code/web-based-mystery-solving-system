/* ==========================================================
   leaderboard.js - ranks every registered user by total score
   ========================================================== */
(function () {
  const user = Auth.require();
  if (!user) return;

  UI.navbar('board');
  UI.footer();

  const users = Auth.users();

  // Build one row per user, then sort by score (ties: more cases solved first)
  const rows = Object.keys(users).map(name => ({
    username: name,
    name: users[name].name,
    solved: Progress.solvedCount(name),
    score: Progress.totalScore(name)
  })).sort((a, b) => b.score - a.score || b.solved - a.solved || a.name.localeCompare(b.name));

  // ----- personal stats -----
  const mine = Progress.all(user.username);
  const attempts = Object.values(mine).reduce((n, p) => n + p.attempts, 0);
  const clues = Object.values(mine).reduce((n, p) => n + p.found.length, 0);
  const myRank = rows.findIndex(r => r.username === user.username) + 1;

  document.getElementById('profile').innerHTML = [
    [myRank || '-', 'Your rank'],
    [Progress.totalScore(user.username), 'Total score'],
    [Progress.solvedCount(user.username) + ' / ' + CASES.length, 'Cases solved'],
    [clues, 'Clues collected']
  ].map(([v, l]) => `<div class="stat-card"><b>${v}</b><span>${l}</span></div>`).join('');

  // ----- table -----
  document.getElementById('rows').innerHTML = rows.map((r, i) => `
    <tr class="${r.username === user.username ? 'me' : ''}">
      <td><span class="rank">${i + 1}</span></td>
      <td><div class="user-cell"><div class="avatar">${UI.esc(UI.initials(r.name))}</div>
        <div><b>${UI.esc(r.name)}</b>${r.username === user.username ? ' <span class="badge b-open">You</span>' : ''}<br><span class="muted" style="font-size:.8rem">@${UI.esc(r.username)}</span></div></div></td>
      <td>${r.solved} / ${CASES.length}</td>
      <td><b style="color:var(--accent-2)">${r.score}</b></td>
    </tr>`).join('');

  // ----- reset button -----
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('This erases all your case progress and scores. Continue?')) {
      Progress.resetAll(user.username);
      location.reload();
    }
  });
})();

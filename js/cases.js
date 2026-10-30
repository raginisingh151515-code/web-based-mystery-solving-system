/* ==========================================================
   cases.js - lists all cases with filters and the user's status
   ========================================================== */
(function () {
  const user = Auth.require();
  if (!user) return;

  UI.navbar('cases');
  UI.footer();

  const levels = ['All', 'Easy', 'Medium', 'Hard'];
  let active = 'All';
  const progress = Progress.all(user.username);

  function renderFilters() {
    const box = document.getElementById('filters');
    box.innerHTML = levels
      .map(l => `<button class="chip ${l === active ? 'on' : ''}" data-level="${l}">${l}</button>`)
      .join('');
    box.querySelectorAll('.chip').forEach(btn =>
      btn.addEventListener('click', () => { active = btn.dataset.level; renderFilters(); renderGrid(); }));
  }

  function renderGrid() {
    const grid = document.getElementById('grid');
    const list = CASES.filter(c => active === 'All' || c.difficulty === active);

    grid.innerHTML = list.map(c => {
      const p = progress[c.id] || Progress.blank();
      const index = CASES.indexOf(c) + 1;
      const label = p.status === 'solved' ? 'Review case' : p.status === 'open' ? 'Resume case' : p.status === 'failed' ? 'View outcome' : 'Open case';
      return `
        <article class="case-card">
          <div class="case-cover" data-no="0${index}" style="background:linear-gradient(135deg, ${c.theme[0]}, ${c.theme[1]})">
            <div>${UI.difficultyBadge(c.difficulty)}</div>
            <div class="muted" style="font-size:.82rem">${UI.esc(c.place)}</div>
          </div>
          <div class="case-body">
            <h3>${UI.esc(c.title)}</h3>
            <p>${UI.esc(c.summary)}</p>
            <div class="case-meta">
              <span>${UI.statusBadge(p.status)}</span>
              <span>${p.status === 'solved' ? 'Score: <b style="color:var(--accent-2)">' + p.score + '</b>' : 'Max score: ' + c.base}</span>
            </div>
            <a class="btn btn-primary btn-sm" href="case.html?id=${c.id}">${label}</a>
          </div>
        </article>`;
    }).join('');
  }

  renderFilters();
  renderGrid();
})();

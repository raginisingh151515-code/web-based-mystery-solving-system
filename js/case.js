/* ==========================================================
   case.js - the investigation screen (core of the project)

   Flow:
     1. Load the case + the logged-in user's saved progress
     2. render() draws the whole page from the current state
     3. User actions (search / ask / hint / accuse) change the
        state, save it to localStorage and call render() again
   ========================================================== */
(function () {
  const user = Auth.require();
  if (!user) return;

  const params = new URLSearchParams(location.search);
  const C = CASES.find(c => c.id === params.get('id'));
  if (!C) { location.href = 'cases.html'; return; }

  UI.navbar('cases');
  UI.footer();

  // ----- state -----
  const MAX_ATTEMPTS = 3;
  let P = Progress.get(user.username, C.id);
  if (P.status === 'new') { P.status = 'open'; save(); }
  let tab = 'locations';
  let activeSuspect = C.suspects[0].id;

  const app = document.getElementById('app');

  // ----- small helpers -----
  function save() { Progress.save(user.username, C.id, P); }
  function isOpen() { return P.status === 'open'; }
  function liveScore() {
    return Math.max(100, C.base - P.actions * 10 - P.attempts * 100 - P.hints * 60);
  }
  // Add clue ids to the player's board. Returns only the new ones.
  function reveal(ids) {
    const fresh = [];
    ids.forEach(id => {
      if (!P.found.includes(id)) { P.found.push(id); fresh.push(id); }
    });
    fresh.forEach(id => UI.toast('New clue: ' + C.clues[id].title));
    return fresh;
  }
  function suspectName(id) { return C.suspects.find(s => s.id === id).name; }

  // ----- actions -----
  function investigate(locId) {
    if (!isOpen() || P.searched.includes(locId)) return;
    const loc = C.locations.find(l => l.id === locId);
    P.searched.push(locId);
    P.actions++;
    reveal(loc.clues);
    save();
    render();
  }

  function ask(suspectId, qId) {
    const key = suspectId + ':' + qId;
    if (!isOpen() || P.asked.includes(key)) return;
    const s = C.suspects.find(x => x.id === suspectId);
    const q = s.questions.find(x => x.id === qId);
    P.asked.push(key);
    P.actions++;
    reveal(q.clues);
    save();
    render();
  }

  function useHint() {
    if (!isOpen() || P.hints >= C.hints.length) return;
    P.hints++;
    save();
    render();
  }

  function accuse(suspectId, method, motive) {
    const sol = C.solution;
    const correct = [suspectId === sol.suspect, method === sol.method, motive === sol.motive];
    const hits = correct.filter(Boolean).length;

    if (hits === 3) {
      P.status = 'solved';
      P.score = liveScore();
      save();
      closeModal();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return { done: true };
    }
    P.attempts++;
    if (P.attempts >= MAX_ATTEMPTS) {
      P.status = 'failed';
      P.score = 0;
      save();
      closeModal();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return { done: true };
    }
    save();
    render();
    return { done: false, hits };
  }

  function restartCase() {
    if (!confirm('Restart this case? Your progress for this case will be erased.')) return;
    Progress.reset(user.username, C.id);
    P = Progress.get(user.username, C.id);
    P.status = 'open';
    save();
    tab = 'locations';
    activeSuspect = C.suspects[0].id;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----- render pieces -----
  function verdictHTML() {
    if (P.status === 'solved') {
      return `
        <div class="verdict win">
          <h2>Case closed - well done, detective!</h2>
          <p>You solved <b>${UI.esc(C.title)}</b> and earned <b style="color:var(--accent-2)">${P.score}</b> points.</p>
          <div class="sol">
            <div><small>Culprit</small>${UI.esc(suspectName(C.solution.suspect))}</div>
            <div><small>Method</small>${UI.esc(C.solution.method)}</div>
            <div><small>Motive</small>${UI.esc(C.solution.motive)}</div>
          </div>
          <p>${UI.esc(C.solution.explain)}</p>
          <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn-primary btn-sm" href="cases.html">Back to cases</a>
            <a class="btn btn-ghost btn-sm" href="leaderboard.html">Leaderboard</a>
          </div>
        </div>`;
    }
    if (P.status === 'failed') {
      return `
        <div class="verdict lose">
          <h2>The trail went cold</h2>
          <p>You used all ${MAX_ATTEMPTS} accusations without naming the right combination. Here is what really happened:</p>
          <div class="sol">
            <div><small>Culprit</small>${UI.esc(suspectName(C.solution.suspect))}</div>
            <div><small>Method</small>${UI.esc(C.solution.method)}</div>
            <div><small>Motive</small>${UI.esc(C.solution.motive)}</div>
          </div>
          <p>${UI.esc(C.solution.explain)}</p>
          <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" data-action="restart">Reopen the case</button>
            <a class="btn btn-ghost btn-sm" href="cases.html">Back to cases</a>
          </div>
        </div>`;
    }
    return '';
  }

  function locationsHTML() {
    return `<div class="loc-grid">` + C.locations.map(loc => {
      const done = P.searched.includes(loc.id);
      const tags = loc.clues.map(id => `<span class="found-tag">${UI.esc(C.clues[id].title)}</span>`).join('');
      return `
        <div class="loc ${done ? 'done' : ''}">
          <h4>${UI.esc(loc.name)} ${done ? '<span class="badge b-solved">Searched</span>' : ''}</h4>
          <p>${UI.esc(loc.teaser)}</p>
          ${done
            ? `<div class="result">${UI.esc(loc.result)}</div><div>${tags}</div>`
            : `<button class="btn btn-ghost btn-sm" data-action="search" data-id="${loc.id}" ${isOpen() ? '' : 'disabled'}>Investigate (-10 pts)</button>`}
        </div>`;
    }).join('') + `</div>`;
  }

  function suspectsHTML() {
    const s = C.suspects.find(x => x.id === activeSuspect);
    const list = C.suspects.map(x => `
      <button class="sus-btn ${x.id === activeSuspect ? 'on' : ''}" data-action="suspect" data-id="${x.id}">
        <div class="avatar">${UI.esc(UI.initials(x.name))}</div>
        <div><b>${UI.esc(x.name)}</b><small>${UI.esc(x.role)}</small></div>
      </button>`).join('');

    const qa = s.questions.map(q => {
      const asked = P.asked.includes(s.id + ':' + q.id);
      if (asked) {
        return `<div class="qa"><div class="q">${UI.esc(q.q)}</div><div class="a">${UI.esc(q.a)}</div></div>`;
      }
      return `<button class="ask-btn" data-action="ask" data-s="${s.id}" data-q="${q.id}" ${isOpen() ? '' : 'disabled'}>Ask: ${UI.esc(q.q)} <span class="muted">(-10 pts)</span></button>`;
    }).join('');

    return `
      <div class="sus-layout">
        <div class="sus-list">${list}</div>
        <div class="dossier">
          <div class="dossier-top">
            <div class="avatar">${UI.esc(UI.initials(s.name))}</div>
            <div><h3>${UI.esc(s.name)}</h3><span class="muted">${UI.esc(s.role)}</span></div>
          </div>
          <p class="bio">${UI.esc(s.bio)}</p>
          ${qa}
        </div>
      </div>`;
  }

  function cluesHTML() {
    if (!P.found.length) {
      return `<div class="empty"><b>Your case board is empty.</b><br>Search locations and question suspects to collect evidence.</div>`;
    }
    return `<div class="clue-list">` + P.found.map(id => {
      const c = C.clues[id];
      return `
        <div class="clue t-${c.type}">
          <div class="top"><h4>${UI.esc(c.title)}</h4><span class="type">${UI.esc(c.type)}</span></div>
          <p>${c.text}</p>
        </div>`;
    }).join('') + `</div>`;
  }

  function sidebarHTML() {
    const pips = Array.from({ length: MAX_ATTEMPTS }, (_, i) =>
      `<div class="pip ${i < P.attempts ? 'used' : ''}"></div>`).join('');
    const hints = C.hints.slice(0, P.hints).map(h => `<div class="hint-box">${UI.esc(h)}</div>`).join('');
    const canHint = isOpen() && P.hints < C.hints.length;

    return `
      <div class="sticky">
        <div class="side-card">
          <h4>Case status</h4>
          <div class="score-big">${P.status === 'solved' ? P.score : liveScore()}</div>
          <div class="muted" style="font-size:.82rem;margin-bottom:12px">${P.status === 'solved' ? 'final score' : 'score if solved now'}</div>
          <div class="kv"><span>Actions used</span><b>${P.actions}</b></div>
          <div class="kv"><span>Hints used</span><b>${P.hints}/${C.hints.length}</b></div>
          <div class="kv"><span>Wrong accusations</span><div class="pips">${pips}</div></div>
          <div class="kv"><span>Clues found</span><b>${P.found.length}</b></div>
        </div>

        <div class="side-card">
          <h4>Actions</h4>
          <button class="btn btn-primary btn-block" data-action="accuse" ${isOpen() ? '' : 'disabled'}>Make an accusation</button>
          <button class="btn btn-ghost btn-block" data-action="hint" ${canHint ? '' : 'disabled'}>Get a hint (-60 pts)</button>
          ${hints ? `<div style="margin-top:14px">${hints}</div>` : ''}
        </div>

        <div class="side-card">
          <h4>Detective notes</h4>
          <textarea id="notes" placeholder="Write your theories here..." maxlength="1500">${UI.esc(P.notes)}</textarea>
          <div class="muted" style="font-size:.78rem;margin-top:6px">Saved automatically.</div>
        </div>
      </div>`;
  }

  // ----- main render -----
  function render() {
    const tabs = [
      ['locations', 'Locations', C.locations.length],
      ['suspects', 'Suspects', C.suspects.length],
      ['clues', 'Case board', P.found.length]
    ].map(([key, label, n]) =>
      `<button class="tab ${tab === key ? 'on' : ''}" data-action="tab" data-id="${key}">${label}<span class="count">${n}</span></button>`
    ).join('');

    const panel = tab === 'locations' ? locationsHTML() : tab === 'suspects' ? suspectsHTML() : cluesHTML();

    app.innerHTML = `
      <section class="case-head">
        <div class="crumbs"><a href="cases.html">Case files</a> / ${UI.esc(C.title)}</div>
        ${UI.difficultyBadge(C.difficulty)} ${UI.statusBadge(P.status)}
        <h1>${UI.esc(C.title)}</h1>
        <div class="muted" style="margin-bottom:16px">${UI.esc(C.place)}</div>
        <div class="briefing"><b>BRIEFING &mdash;</b> ${C.briefing}</div>
      </section>
      ${verdictHTML()}
      <div class="case-layout">
        <div>
          <div class="tabs">${tabs}</div>
          ${panel}
        </div>
        <aside>${sidebarHTML()}</aside>
      </div>`;

    // notes autosave (no re-render, so the cursor never jumps)
    const notes = document.getElementById('notes');
    notes.addEventListener('input', () => { P.notes = notes.value; save(); });
  }

  // ----- accusation modal -----
  function openModal() {
    const opt = arr => arr.map(v => `<option value="${UI.esc(v)}">${UI.esc(v)}</option>`).join('');
    const suspects = C.suspects.map(s => `<option value="${s.id}">${UI.esc(s.name)} - ${UI.esc(s.role)}</option>`).join('');
    const left = MAX_ATTEMPTS - P.attempts;

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'modal';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3>Name the culprit</h3>
        <p class="sub">All three must be right. You have <b>${left}</b> attempt${left === 1 ? '' : 's'} left; each wrong one costs 100 points.</p>
        <div id="fb"></div>
        <div class="field"><label>Who did it?</label><select id="aS">${suspects}</select></div>
        <div class="field"><label>How was it done?</label><select id="aM">${opt(C.methods)}</select></div>
        <div class="field"><label>Why did they do it?</label><select id="aW">${opt(C.motives)}</select></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
          <button class="btn btn-primary" id="submitBtn">Submit accusation</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    overlay.querySelector('#cancelBtn').addEventListener('click', closeModal);
    overlay.querySelector('#submitBtn').addEventListener('click', () => {
      const res = accuse(
        overlay.querySelector('#aS').value,
        overlay.querySelector('#aM').value,
        overlay.querySelector('#aW').value
      );
      if (!res.done) {
        // keep modal open with feedback (render() did not touch it)
        const fb = document.getElementById('fb');
        const left = MAX_ATTEMPTS - P.attempts;
        fb.innerHTML = `<div class="feedback">${res.hits} of 3 are correct. ${left} attempt${left === 1 ? '' : 's'} left - rethink the evidence.</div>`;
        overlay.querySelector('.modal .sub b').textContent = left;
      }
    });
  }
  function closeModal() {
    const m = document.getElementById('modal');
    if (m) m.remove();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ----- event delegation for every button on the page -----
  app.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const a = el.dataset.action;
    if (a === 'tab') { tab = el.dataset.id; render(); }
    else if (a === 'search') investigate(el.dataset.id);
    else if (a === 'suspect') { activeSuspect = el.dataset.id; render(); }
    else if (a === 'ask') ask(el.dataset.s, el.dataset.q);
    else if (a === 'hint') useHint();
    else if (a === 'accuse') openModal();
    else if (a === 'restart') restartCase();
  });

  render();
})();

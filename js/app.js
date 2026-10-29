/* The story. Wide screens: chapters on the right drive one pinned map on the left.
   Narrow screens: each chapter carries its own inline map. */
(function () {
  const D = window.TECH_MAP;
  const passes = D.passes;
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrowQuery = window.matchMedia('(max-width: 960px)');

  const defs = {
    client: '<b>Your device.</b> The one doing the asking: your phone or laptop. Also called the client.',
    server: '<b>A server.</b> A computer whose job is to answer requests, all day, every day.',
    db: '<b>Database.</b> Where an app keeps everything it needs to remember.',
    api: '<b>Other services.</b> Other companies\' computers your app asks for help, like maps or email.',
    phone: '<b>Phone app.</b> Another kind of client. It already has its screens, so it only asks for data.',
    dns: '<b>DNS.</b> The internet\'s phone book. It turns a name like example.com into an address.',
    ai: '<b>AI model.</b> The program that writes the replies. It lives on a server far away.',
    tools: '<b>Tools.</b> Things the AI can ask the app to do, like a search.',
    agent: '<b>AI agent.</b> An AI that writes code and keeps going until the job is done.',
    laptop: '<b>Your laptop.</b> Where the code is written and saved with Git.',
    github: '<b>GitHub.</b> A website that stores the code so a team can share it.'
  };

  // the boxes each pass is about: what the camera frames at rest
  const involved = {}, firstIds = {};
  passes.forEach(P => {
    const ids = new Set();
    P.steps.forEach(s => { if (s.node) ids.add(s.node); if (s.link) (D.map.links[s.link].ends || []).forEach(e => ids.add(e)); });
    if (P.check && P.check.node) ids.add(P.check.node);
    involved[P.n] = [...ids];
    const f = P.steps[0];
    firstIds[P.n] = f.node ? [f.node] : (D.map.links[f.link].ends || null);
  });

  // where the camera settles after a pass: its new boxes (plus the server they connect to), else the boxes involved
  const restIds = {};
  passes.forEach(P => {
    const fresh = Object.keys(D.map.nodes).filter(id => D.map.nodes[id].from === P.n && involved[P.n].includes(id));
    if (P.rest) restIds[P.n] = P.rest;
    else if (P.n > 1 && fresh.length) { if (involved[P.n].includes('server') && !fresh.includes('server')) fresh.push('server'); restIds[P.n] = fresh; }
    else restIds[P.n] = involved[P.n];
  });

  const checks = {};
  passes.forEach(P => { if (P.check) checks[P.n] = { ...P.check, done: false }; });

  /* ---------- a stage: map + caption + steps + buttons ---------- */
  const STAGE_HTML = `
    <div class="stage-head"><span class="stage-caption js-caption"></span></div>
    <div class="stage-map"><svg class="js-map" role="img" aria-label="The system map for this pass"></svg></div>
    <div class="stage-foot">
      <button class="btn btn-primary btn-small btn-play js-play" type="button"><span class="js-playText">▶ Play the request</span></button>
      <button class="btn btn-small btn-ghost js-whole" type="button">Whole map</button>
      <ol class="stage-steps js-steps"></ol>
    </div>
    <p class="stage-def js-def" aria-live="polite">Tap any box on the map to see what it is.</p>`;

  function makeStage(root) {
    const map = window.createMap(root.querySelector('svg.js-map'));
    const caption = root.querySelector('.js-caption'), stepsEl = root.querySelector('.js-steps');
    const defEl = root.querySelector('.js-def'), playBtn = root.querySelector('.js-play'), playText = root.querySelector('.js-playText');
    const nodes = map.nodes();
    const st = { root, map, n: 0, playing: false, played: false };

    function setPlayState(state) {
      playBtn.classList.toggle('playing', state === 'playing');
      playBtn.disabled = state === 'playing';
      playText.textContent = state === 'playing' ? 'Playing' : state === 'again' ? '↻ Play it again' : '▶ Play the request';
    }
    function askHint() {
      const c = checks[st.n], asking = !!(c && c.node && !c.done);
      for (const id in nodes) nodes[id].g.classList.toggle('askable', asking && map.isVisible(id));
      if (asking && !st.playing) { caption.textContent = 'QUICK CHECK · TAP A BOX TO ANSWER'; caption.classList.add('ask'); }
    }
    function clearAsk() {
      caption.classList.remove('ask');
      for (const id in nodes) nodes[id].g.classList.remove('askable');
      caption.textContent = `PASS ${st.n} · ${passes[st.n - 1].title}`;
    }
    st.show = function (n) {
      if (n === st.n) return;
      st.n = n; st.played = false;
      const P = passes[n - 1];
      map.stop(); st.playing = false;
      map.render(n);
      map.frameSmart(restIds[n], firstIds[n], true);
      map.setDim(involved[n]);
      map.setSelected(null);
      stepsEl.innerHTML = P.steps.map(s => `<li>${esc(s.label)}</li>`).join('');
      defEl.innerHTML = 'Tap any box on the map to see what it is.';
      caption.textContent = `PASS ${n} · ${P.title}`; caption.classList.remove('ask');
      setPlayState('ready');
      askHint();
    };
    st.play = async function () {
      if (st.playing || !st.n) return;
      const P = passes[st.n - 1];
      st.playing = true; st.played = true; setPlayState('playing'); caption.classList.remove('ask');
      const items = [...stepsEl.children];
      items.forEach(li => li.classList.remove('active', 'done'));
      map.setDim(involved[st.n]);
      const ok = await map.play(P.steps, (i, s) => {
        items.forEach((li, j) => { li.classList.toggle('active', j === i); li.classList.toggle('done', j < i); });
        caption.textContent = `STEP ${i + 1} OF ${P.steps.length} · ${s.caption}`;
        const active = items[i]; if (active) { const r = active.offsetLeft + active.offsetWidth - stepsEl.clientWidth + 8; stepsEl.scrollLeft = Math.max(0, Math.min(active.offsetLeft - 8, r > 0 ? Math.max(r, stepsEl.scrollLeft) : 0)); }
      }, { rest: restIds[st.n] });
      st.playing = false;
      if (ok) { items.forEach(li => { li.classList.remove('active'); li.classList.add('done'); }); caption.textContent = `PASS ${st.n} · ${P.title} · done`; }
      stepsEl.scrollLeft = 0;
      setPlayState('again');
      askHint();
    };
    st.stop = function () { map.stop(); if (st.playing) { st.playing = false; setPlayState(st.played ? 'again' : 'ready'); } };
    playBtn.addEventListener('click', st.play);
    root.querySelector('.js-whole').addEventListener('click', () => { st.stop(); map.setDim(null); map.frame(null, true); });

    // tapping boxes: definitions, and map-based quick checks
    for (const id in nodes) {
      const pick = () => {
        if (!map.isVisible(id)) return;
        map.setSelected(id);
        defEl.innerHTML = defs[id] || '';
        const c = checks[st.n];
        if (!(c && c.node && !c.done)) return;
        const box = document.querySelector(`.check[data-pass="${st.n}"] .feedback`);
        if (id === c.node) {
          c.done = true; map.flash(id, 'right');
          box.innerHTML = `<b class="good">Right.</b> ${esc(c.why)}`;
          clearAsk();
        } else {
          map.flash(id, 'wrong');
          box.innerHTML = `<b class="bad">Not that one.</b> Try another box on the map.`;
        }
      };
      nodes[id].g.addEventListener('click', pick);
      nodes[id].g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    }
    return st;
  }

  /* ---------- chapters ---------- */
  const chaptersEl = document.getElementById('chapters');
  const inlineStages = {};
  passes.forEach((P, idx) => {
    const sec = document.createElement('article');
    sec.className = 'chapter'; sec.id = 'pass-' + P.n; sec.dataset.n = P.n;
    let h = `<div class="chapter-head"><span class="eyebrow">PASS ${P.n} OF ${D.totalPasses}</span>`;
    h += `<span class="chapter-title">${esc(P.title)}</span><h2>${P.headline}</h2></div>`;
    h += `<div class="stage stage-inline" data-n="${P.n}">${STAGE_HTML}</div>`;
    h += `<div class="prose">${P.body.map(t => `<p>${t}</p>`).join('')}</div>`;
    if (P.words && P.words.length) h += `<div class="words"><span class="label">WORDS TO KNOW</span>${P.words.map(([t, d]) => `<p><strong>${esc(t)}</strong> · ${esc(d)}</p>`).join('')}</div>`;
    if (P.peek) h += `<details class="peek"><summary>${esc(P.peek.label)}</summary><pre>${esc(P.peek.code)}</pre></details>`;
    h += `<div class="sofar"><span class="label">THE STORY SO FAR</span><ol>${P.story.map(([t, n]) => `<li${n ? ' class="new"' : ''}>${esc(t)}</li>`).join('')}</ol></div>`;
    if (P.check) {
      h += `<div class="check" data-pass="${P.n}"><span class="label">QUICK CHECK</span><p class="q">${esc(P.check.q)}</p>`;
      if (P.check.options) h += `<div class="options">${P.check.options.map((o, i) => `<button type="button" class="option" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      else h += `<p class="hint">Answer by tapping a box on the map.</p>`;
      h += `<p class="feedback" aria-live="polite"></p></div>`;
    }
    const next = passes[idx + 1];
    h += `<div class="chapter-nav">`;
    h += idx > 0 ? `<a class="btn btn-small btn-ghost" href="#pass-${P.n - 1}">← Back</a>` : `<span></span>`;
    h += next ? `<a class="btn btn-primary" href="#pass-${next.n}">Continue to pass ${next.n} →</a>` : `<a class="btn btn-primary" href="#closing">See the whole map →</a>`;
    h += `</div>`;
    sec.innerHTML = h;
    chaptersEl.appendChild(sec);
  });
  document.querySelectorAll('.stage-inline').forEach(root => {
    const st = makeStage(root);
    st.show(+root.dataset.n);
    inlineStages[+root.dataset.n] = st;
  });
  const pinned = makeStage(document.getElementById('stage'));

  /* ---------- progress bar ---------- */
  const progressBar = document.getElementById('progressBar'), progressLabel = document.getElementById('progressLabel');
  for (let i = 1; i <= D.totalPasses; i++) {
    const li = document.createElement('li');
    const b = document.createElement('button'); b.type = 'button';
    b.setAttribute('aria-label', `Go to pass ${i}: ${passes[i - 1].title}`); b.title = `Pass ${i}: ${passes[i - 1].title}`;
    b.addEventListener('click', () => document.getElementById('pass-' + i).scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }));
    li.appendChild(b); progressBar.appendChild(li);
  }
  function setProgress(n) {
    [...progressBar.children].forEach((li, i) => { li.classList.toggle('done', i + 1 < n); li.classList.toggle('current', i + 1 === n); });
    progressLabel.textContent = `PASS ${n} / ${D.totalPasses}`;
  }

  /* ---------- the whole map, full size ---------- */
  const FULL = window.createMap(document.getElementById('mapFull'));
  FULL.render(D.totalPasses); FULL.frame(null, false);
  const fullDef = document.getElementById('fullDef'), fullNodes = FULL.nodes();
  for (const id in fullNodes) {
    const pick = () => { FULL.setSelected(id); fullDef.innerHTML = defs[id] || ''; };
    fullNodes[id].g.addEventListener('click', pick);
    fullNodes[id].g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  }

  /* ---------- closing section and glossary ---------- */
  document.getElementById('closingHeadline').textContent = D.closing.headline;
  document.getElementById('closingIntro').textContent = D.closing.intro;
  document.getElementById('questions').innerHTML = D.closing.questions.map(([q, t]) => `<li><b>${esc(q)}</b>${esc(t)}</li>`).join('');
  document.getElementById('wholeStory').innerHTML = D.closing.wholeStory.map(t => `<li>${esc(t)}</li>`).join('');
  const glist = document.getElementById('glist'), gsearch = document.getElementById('gsearch');
  function renderGlossary(q) {
    q = (q || '').trim().toLowerCase();
    const items = D.glossary.filter(([t, d]) => !q || t.toLowerCase().includes(q) || d.toLowerCase().includes(q));
    glist.innerHTML = items.length ? items.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('') : `<p class="none">No words match "${esc(q)}".</p>`;
  }
  gsearch.addEventListener('input', () => renderGlossary(gsearch.value));
  renderGlossary('');

  /* ---------- in-page links scroll smoothly; wheel scrolling stays native ---------- */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
  });

  /* ---------- option checks ---------- */
  chaptersEl.addEventListener('click', e => {
    const btn = e.target.closest('.option');
    if (!btn) return;
    const box = btn.closest('.check'), c = checks[+box.dataset.pass];
    if (!c || c.done) return;
    c.done = true;
    const i = +btn.dataset.i;
    box.querySelectorAll('.option').forEach(b => { b.disabled = true; if (+b.dataset.i === c.answer) b.classList.add('right'); else if (+b.dataset.i === i) b.classList.add('wrong'); });
    box.querySelector('.feedback').innerHTML = (i === c.answer ? '<b class="good">Right.</b> ' : '<b class="bad">Not quite.</b> ') + esc(c.why);
  });

  /* ---------- scrolling drives the maps ---------- */
  let cur = 0, pendingPlay = false, settleTimer = null;
  function enterPass(n) {
    if (n === cur) return;
    cur = n; setProgress(n);
    if (!narrowQuery.matches) { pinned.show(n); pendingPlay = true; }
  }
  window.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { if (pendingPlay && !narrowQuery.matches) { pendingPlay = false; pinned.play(); } }, 220);
  }, { passive: true });
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.chapter').forEach(sec => {
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: () => enterPass(+sec.dataset.n), onEnterBack: () => enterPass(+sec.dataset.n) });
  });
  // narrow screens: an inline map plays once when it comes into view
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      const st = inlineStages[+en.target.dataset.n];
      if (!st) return;
      if (en.isIntersecting && narrowQuery.matches) { if (!st.played) setTimeout(() => { if (narrowQuery.matches) st.play(); }, 500); }
      else st.stop();
    });
  }, { threshold: 0.6 });
  Object.values(inlineStages).forEach(st => io.observe(st.root));
  // switching between layouts: hand the current pass to the pinned stage
  narrowQuery.addEventListener('change', () => { if (!narrowQuery.matches && cur) { pinned.show(cur); } else { pinned.stop(); } });

  /* ---------- hero: the packet drifts along the active path ---------- */
  (function hero() {
    const path = document.getElementById('heroPath'), dot = document.getElementById('heroDot'), halo = document.getElementById('heroHalo');
    if (!path || reduce()) return;
    const len = path.getTotalLength(), o = { t: 0 };
    gsap.to(o, { t: len, duration: 2.4, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.6, yoyo: true,
      onUpdate: () => { const p = path.getPointAtLength(o.t); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); halo.setAttribute('cx', p.x); halo.setAttribute('cy', p.y); } });
  })();

  /* ---------- start ---------- */
  const m = /^#pass-(\d+)$/.exec(location.hash);
  const start = m && passes[+m[1] - 1] ? +m[1] : 1;
  cur = start; setProgress(start);
  pinned.show(start);
  if (!narrowQuery.matches) setTimeout(() => { if (cur === start) pinned.play(); }, 700);
})();

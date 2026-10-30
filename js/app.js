/* The lesson: one pass per screen. Watch the request, read the cards, then move on.
   Passes unlock in order; progress is remembered on this device. */
(function () {
  const D = window.TECH_MAP;
  const passes = D.passes;
  const TOTAL = passes.length;
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrowQuery = window.matchMedia('(max-width: 960px)');
  const $ = id => document.getElementById(id);

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
    laptop: '<b>A laptop.</b> Where a developer writes the code and saves checkpoints with Git.',
    github: '<b>GitHub.</b> A website that stores the code so a team can share it.'
  };

  /* ---------- saved progress (this device only) ---------- */
  const KEY = 'tm-progress-v1';
  let progress = { unlocked: 1, current: 0, done: [] };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.unlocked) progress = { unlocked: s.unlocked, current: s.current || 0, done: s.done || [] }; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (e) {} }

  /* ---------- camera framing per pass ---------- */
  const involved = {}, firstIds = {}, restIds = {};
  passes.forEach(P => {
    const ids = new Set();
    P.steps.forEach(s => { if (s.node) ids.add(s.node); if (s.link) (D.map.links[s.link].ends || []).forEach(e => ids.add(e)); });
    if (P.check && P.check.node) ids.add(P.check.node);
    involved[P.n] = [...ids];
    const f = P.steps[0];
    firstIds[P.n] = f.node ? [f.node] : (D.map.links[f.link].ends || null);
    const fresh = Object.keys(D.map.nodes).filter(id => D.map.nodes[id].from === P.n && involved[P.n].includes(id));
    if (P.rest) restIds[P.n] = P.rest;
    else if (P.n > 1 && fresh.length) { if (involved[P.n].includes('server') && !fresh.includes('server')) fresh.push('server'); restIds[P.n] = fresh; }
    else restIds[P.n] = involved[P.n];
  });
  const checks = {};
  passes.forEach(P => { if (P.check) checks[P.n] = { ...P.check, done: false }; });

  /* ---------- the stage ---------- */
  const stageRoot = $('stage');
  const map = window.createMap(stageRoot.querySelector('svg.js-map'));
  const caption = stageRoot.querySelector('.js-caption'), stepsEl = stageRoot.querySelector('.js-steps');
  const defEl = stageRoot.querySelector('.js-def'), playBtn = stageRoot.querySelector('.js-play'), playText = stageRoot.querySelector('.js-playText');
  const nodes = map.nodes();
  const st = { n: 0, playing: false, played: false, run: 0 };

  function setPlayState(state) {
    playBtn.classList.toggle('playing', state === 'playing');
    playBtn.disabled = state === 'playing';
    playText.textContent = state === 'playing' ? 'Playing' : state === 'again' ? '↻ Play it again' : '▶ Play the request';
  }
  function askHint() {
    const c = checks[st.n], asking = !!(c && c.node && !c.done && cardIndex === cards.length - 1);
    for (const id in nodes) nodes[id].g.classList.toggle('askable', asking && map.isVisible(id));
    if (asking && !st.playing) { caption.textContent = 'QUICK CHECK · TAP A BOX TO ANSWER'; caption.classList.add('ask'); }
  }
  function clearAsk() {
    caption.classList.remove('ask');
    for (const id in nodes) nodes[id].g.classList.remove('askable');
    caption.textContent = `PASS ${st.n} · ${passes[st.n - 1].title}`;
  }
  function stageShow(n) {
    const P = passes[n - 1];
    map.stop(); st.run++; st.playing = false; st.played = progress.done.includes(n);
    st.n = n;
    map.render(n);
    map.frameSmart(restIds[n], firstIds[n], true);
    map.setDim(involved[n]);
    map.setSelected(null);
    stepsEl.innerHTML = P.steps.map(s => `<li>${esc(s.label)}</li>`).join('');
    stepsEl.scrollLeft = 0;
    defEl.innerHTML = 'Tap any box on the map to see what it is.';
    caption.textContent = `PASS ${n} · ${P.title}`; caption.classList.remove('ask');
    setPlayState(st.played ? 'again' : 'ready');
  }
  async function stagePlay() {
    if (st.playing || !st.n) return;
    const P = passes[st.n - 1];
    const run = ++st.run;
    st.playing = true; setPlayState('playing'); caption.classList.remove('ask');
    const items = [...stepsEl.children];
    items.forEach(li => li.classList.remove('active', 'done'));
    map.setDim(involved[st.n]);
    const ok = await map.play(P.steps, (i, s) => {
      items.forEach((li, j) => { li.classList.toggle('active', j === i); li.classList.toggle('done', j < i); });
      caption.textContent = `STEP ${i + 1} OF ${P.steps.length} · ${s.caption}`;
      const a = items[i]; if (a) { const r = a.offsetLeft + a.offsetWidth - stepsEl.clientWidth + 8; stepsEl.scrollLeft = Math.max(0, Math.min(a.offsetLeft - 8, r > 0 ? Math.max(r, stepsEl.scrollLeft) : 0)); }
    }, { rest: restIds[st.n] });
    if (run !== st.run) return;
    st.playing = false;
    if (ok) {
      items.forEach(li => { li.classList.remove('active'); li.classList.add('done'); });
      caption.textContent = `PASS ${st.n} · ${P.title} · done`;
      markPlayed();
    }
    stepsEl.scrollLeft = 0;
    setPlayState('again');
    askHint();
  }
  function markPlayed() {
    st.played = true;
    if (!progress.done.includes(st.n)) progress.done.push(st.n);
    if (st.n >= progress.unlocked) progress.unlocked = Math.min(st.n + 1, TOTAL + 1);
    save();
    renderNav(); renderProgress();
  }
  playBtn.addEventListener('click', stagePlay);
  stageRoot.querySelector('.js-whole').addEventListener('click', () => { map.stop(); st.run++; if (st.playing) { st.playing = false; setPlayState(st.played ? 'again' : 'ready'); } map.setDim(null); map.frame(null, true); });

  for (const id in nodes) {
    const pick = () => {
      if (!map.isVisible(id)) return;
      map.setSelected(id);
      defEl.innerHTML = defs[id] || '';
      const c = checks[st.n];
      if (!(c && c.node && !c.done)) return;
      const box = document.querySelector('#card .check .feedback');
      if (!box) return;
      if (id === c.node) { c.done = true; map.flash(id, 'right'); box.innerHTML = `<b class="good">Right.</b> ${esc(c.why)}`; clearAsk(); }
      else if (c.near && c.near[id]) { box.innerHTML = `<b class="bad">Not quite.</b> ${esc(c.near[id])}`; }
      else { map.flash(id, 'wrong'); box.innerHTML = `<b class="bad">Not that one.</b> Try another box on the map.`; }
    };
    nodes[id].g.addEventListener('click', pick);
    nodes[id].g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  }

  /* ---------- cards: fill each card to the space available ---------- */
  function buildBlocks(P) {
    const blocks = [];
    blocks.push({ html: `<h2>${P.headline}</h2>`, keep: true });
    P.body.forEach(t => blocks.push({ html: `<p class="prose-p">${t}</p>` }));
    if (P.words && P.words.length) blocks.push({ html: `<div class="words"><span class="label">WORDS TO KNOW</span>${P.words.map(([t, d]) => `<p><strong>${esc(t)}</strong> · ${esc(d)}</p>`).join('')}</div>` });
    if (P.peek) blocks.push({ html: `<button type="button" class="peek-btn" data-peek="${P.n}"><span class="chev"></span>${esc(P.peek.label)}</button>` });
    blocks.push({ html: `<div class="sofar"><span class="label">THE STORY SO FAR</span><ol>${P.story.map(([t, n]) => `<li${n ? ' class="new"' : ''}>${esc(t)}</li>`).join('')}</ol></div>` });
    if (P.check) {
      let h = `<div class="check" data-pass="${P.n}"><span class="label">QUICK CHECK · OPTIONAL</span><p class="q">${esc(P.check.q)}</p>`;
      if (P.check.options) h += `<div class="options">${P.check.options.map((o, i) => `<button type="button" class="option" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
      else h += `<p class="hint">Answer by tapping a box on the map.</p>`;
      h += `<p class="feedback" aria-live="polite"></p></div>`;
      blocks.push({ html: h });
    }
    return blocks;
  }
  // lay the blocks into the real card and start a new card only when the next block would overflow
  function paginate(blocks) {
    const limit = cardEl.clientHeight;
    const pages = [];
    let page = [];
    cardEl.innerHTML = '';
    const fits = () => cardEl.scrollHeight <= limit + 2;
    blocks.forEach((b, i) => {
      cardEl.insertAdjacentHTML('beforeend', b.html);
      if (limit > 0 && !fits() && page.length) {
        // move this block (and a heading kept with it) to a new page
        let carry = [b];
        cardEl.lastElementChild.remove();
        if (page.length && page[page.length - 1].keep) { carry.unshift(page.pop()); cardEl.lastElementChild.remove(); }
        pages.push(page);
        page = [];
        cardEl.innerHTML = carry.map(c => c.html).join('');
        page.push(...carry);
      } else page.push(b);
    });
    if (page.length) pages.push(page);
    return pages.map(p => p.map(b => b.html).join(''));
  }

  /* ---------- views ---------- */
  const views = { home: $('view-home'), lesson: $('view-lesson'), end: $('view-end'), glossary: $('view-glossary') };
  let view = 'home', cur = 0, cards = [], blocks = [], cardIndex = 0, beforeGlossary = '#home';
  function showView(name) {
    for (const k in views) views[k].hidden = k !== name;
    view = name;
    document.documentElement.classList.toggle('lesson-mode', name === 'lesson');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* home */
  function renderHome() {
    const a = $('homeActions');
    const resumeAt = progress.current && progress.current <= TOTAL ? progress.current : 0;
    if (resumeAt > 1 || progress.done.length) {
      const n = Math.min(Math.max(resumeAt, 1), progress.unlocked);
      a.innerHTML = `<a class="btn btn-primary" href="#pass-${n}">Continue from pass ${n} →</a><button class="btn" type="button" id="startOver">Start over</button>`;
      $('startOver').addEventListener('click', () => { progress = { unlocked: 1, current: 0, done: [] }; passes.forEach(P => { if (checks[P.n]) checks[P.n].done = false; }); save(); renderProgress(); location.hash = '#pass-1'; });
    } else {
      a.innerHTML = `<a class="btn btn-primary" href="#pass-1">Start the story →</a>`;
    }
  }

  /* progress bar */
  const progressBar = $('progressBar'), progressLabel = $('progressLabel');
  for (let i = 1; i <= TOTAL; i++) {
    const li = document.createElement('li');
    const b = document.createElement('button'); b.type = 'button';
    b.addEventListener('click', () => { if (i <= progress.unlocked) location.hash = '#pass-' + i; });
    li.appendChild(b); progressBar.appendChild(li);
  }
  function renderProgress() {
    [...progressBar.children].forEach((li, i) => {
      const n = i + 1, locked = n > progress.unlocked, b = li.firstChild;
      li.classList.toggle('done', progress.done.includes(n) && n !== cur);
      li.classList.toggle('current', n === cur && view === 'lesson');
      li.classList.toggle('locked', locked);
      b.setAttribute('aria-label', locked ? `Pass ${n}: ${passes[n - 1].title} (locked until you finish pass ${n - 1})` : `Go to pass ${n}: ${passes[n - 1].title}`);
      b.title = locked ? `Pass ${n} · unlocks after pass ${n - 1}` : `Pass ${n}: ${passes[n - 1].title}`;
      b.setAttribute('aria-disabled', locked ? 'true' : 'false');
    });
    progressLabel.textContent = view === 'lesson' ? `PASS ${cur} / ${TOTAL}` : `${progress.done.length} / ${TOTAL} DONE`;
  }

  /* lesson */
  const cardEl = $('card'), dotsEl = $('cardDots'), navEl = $('panelNav');
  function openPass(n, cardAt) {
    cur = n;
    progress.current = n; save();
    const P = passes[n - 1];
    showView('lesson');
    $('passEyebrow').textContent = `PASS ${n} OF ${TOTAL}`;
    $('passTitle').textContent = P.title;
    blocks = buildBlocks(P);
    cards = paginate(blocks);
    stageShow(n);
    renderProgress();
    showCard(cardAt || 0);
    setTimeout(() => { if (cur === n && view === 'lesson' && !st.played) stagePlay(); }, 700);
  }
  function showCard(i) {
    cardIndex = Math.max(0, Math.min(cards.length - 1, i));
    cardEl.innerHTML = cards[cardIndex];
    cardEl.scrollTop = 0;
    cardEl.classList.remove('enter'); void cardEl.offsetWidth; cardEl.classList.add('enter');
    dotsEl.innerHTML = cards.map((_, k) => `<li class="${k === cardIndex ? 'on' : k < cardIndex ? 'past' : ''}"><button type="button" data-k="${k}" aria-label="Step ${k + 1} of ${cards.length}"></button></li>`).join('');
    renderNav();
    askHint();
    cardEl.focus({ preventScroll: true });
  }
  function renderNav() {
    const lastCard = cardIndex === cards.length - 1;
    const isLast = cur === TOTAL;
    let h = cardIndex > 0 ? `<button class="btn btn-small btn-ghost" type="button" data-nav="prev">← Back</button>` : (cur > 1 ? `<a class="btn btn-small btn-ghost" href="#pass-${cur - 1}">← Pass ${cur - 1}</a>` : `<span></span>`);
    if (!lastCard) h += `<button class="btn btn-primary" type="button" data-nav="next">Continue →</button>`;
    else if (st.played) h += isLast ? `<a class="btn btn-primary" href="#end">See the whole map →</a>` : `<a class="btn btn-primary" href="#pass-${cur + 1}">Next: pass ${cur + 1} →</a>`;
    else h += `<span class="locked-note"><button class="btn btn-primary" type="button" disabled>${isLast ? 'See the whole map →' : `Next: pass ${cur + 1} →`}</button><span class="note">Unlocks once the request has played</span></span>`;
    navEl.innerHTML = h;
  }
  navEl.addEventListener('click', e => {
    const b = e.target.closest('[data-nav]'); if (!b) return;
    showCard(cardIndex + (b.dataset.nav === 'next' ? 1 : -1));
  });
  dotsEl.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) showCard(+b.dataset.k); });
  document.addEventListener('keydown', e => {
    if (view !== 'lesson' || e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight' && cardIndex < cards.length - 1) showCard(cardIndex + 1);
    if (e.key === 'ArrowLeft' && cardIndex > 0) showCard(cardIndex - 1);
  });
  const peekDlg = $('peek'), peekTitle = $('peekTitle'), peekCode = $('peekCode');
  cardEl.addEventListener('click', e => {
    const pb = e.target.closest('.peek-btn');
    if (pb) {
      const P = passes[+pb.dataset.peek - 1];
      peekTitle.textContent = P.peek.label; peekCode.textContent = P.peek.code;
      if (typeof peekDlg.showModal === 'function') peekDlg.showModal(); else peekDlg.setAttribute('open', '');
      return;
    }
    const btn = e.target.closest('.option'); if (!btn) return;
    const box = btn.closest('.check'), c = checks[+box.dataset.pass];
    if (!c || c.done) return;
    c.done = true;
    const i = +btn.dataset.i;
    box.querySelectorAll('.option').forEach(b => { b.disabled = true; if (+b.dataset.i === c.answer) b.classList.add('right'); else if (+b.dataset.i === i) b.classList.add('wrong'); });
    box.querySelector('.feedback').innerHTML = (i === c.answer ? '<b class="good">Right.</b> ' : '<b class="bad">Not quite.</b> ') + esc(c.why);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (view !== 'lesson' || !blocks.length) return;
      const firstHtml = (cards[cardIndex] || '').slice(0, 40);
      cards = paginate(blocks);
      const k = Math.max(0, cards.findIndex(c => c.startsWith(firstHtml)));
      showCard(k);
    }, 200);
  });

  $('peekClose').addEventListener('click', () => peekDlg.close());
  peekDlg.addEventListener('click', e => { if (e.target === peekDlg) peekDlg.close(); });

  /* end + glossary */
  const FULL = window.createMap($('mapFull'));
  let fullReady = false, assembling = 0;
  function openEnd() {
    showView('end');
    renderProgress();
    const justFinished = !fullReady;
    if (!fullReady) { fullReady = true; }
    if (justFinished && !reduce()) assemble(); else { FULL.render(TOTAL); FULL.frame(null, false); }
    $('closingEyebrow').textContent = 'DONE · 12 OF 12'; $('closingEyebrow').classList.add('done');
    $('closingHeadline').textContent = "You've got the whole map.";
    $('closingIntro').textContent = D.closing.headline + ' ' + D.closing.intro;
  }
  // the whole map builds itself one pass at a time, the way it did for you
  function assemble() {
    const my = ++assembling;
    let p = 1;
    FULL.render(TOTAL); FULL.frame(null, false);   // camera on the whole map
    FULL.render(1);                                 // then start with the first two boxes
    const step = () => {
      if (my !== assembling) return;
      p++;
      if (p > TOTAL) return;
      FULL.render(p);
      setTimeout(step, 480);
    };
    setTimeout(step, 600);
  }
  const fullDef = $('fullDef'), fullNodes = FULL.nodes();
  for (const id in fullNodes) {
    const pick = () => { FULL.setSelected(id); fullDef.innerHTML = defs[id] || ''; };
    fullNodes[id].g.addEventListener('click', pick);
    fullNodes[id].g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  }
  $('builtHeadline').textContent = D.built.headline;
  $('builtParas').innerHTML = D.built.paras.map(t => `<p>${esc(t)}</p>`).join('');
  const bl = $('builtLink'); bl.href = D.built.link; bl.textContent = D.built.linkLabel;
  $('questions').innerHTML = D.closing.questions.map(([q, t]) => `<li><b>${esc(q)}</b>${esc(t)}</li>`).join('');
  $('wholeStory').innerHTML = D.closing.wholeStory.map(t => `<li>${esc(t)}</li>`).join('');
  const glist = $('glist'), gsearch = $('gsearch');
  function renderGlossary(q) {
    q = (q || '').trim().toLowerCase();
    const items = D.glossary.filter(([t, d]) => !q || t.toLowerCase().includes(q) || d.toLowerCase().includes(q));
    glist.innerHTML = items.length ? items.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('') : `<p class="none">No words match "${esc(q)}".</p>`;
  }
  gsearch.addEventListener('input', () => renderGlossary(gsearch.value));
  renderGlossary('');
  $('glossaryBack').addEventListener('click', e => { e.preventDefault(); location.hash = beforeGlossary; });

  /* ---------- routing ---------- */
  function route() {
    const h = location.hash || '#home';
    if (h === '#glossary') { if (view !== 'glossary') beforeGlossary = view === 'lesson' ? `#pass-${cur}` : view === 'end' ? '#end' : '#home'; map.stop(); showView('glossary'); renderProgress(); return; }
    if (h === '#end') {
      if (progress.done.includes(TOTAL) || progress.unlocked > TOTAL) { map.stop(); openEnd(); return; }
      location.replace('#pass-' + Math.min(progress.unlocked, TOTAL)); return;
    }
    const m = /^#pass-(\d+)$/.exec(h);
    if (m) {
      const n = +m[1];
      if (n >= 1 && n <= TOTAL) {
        if (n > progress.unlocked) { location.replace('#pass-' + progress.unlocked); return; }
        if (view === 'lesson' && n === cur) return;
        openPass(n); return;
      }
    }
    map.stop(); showView('home'); renderHome(); renderProgress(); heroMaybeStart();
  }
  window.addEventListener('hashchange', route);

  /* ---------- hero: the map builds itself once, then holds ---------- */
  const HERO = window.createMap($('mapHero'));
  const heroLabel = $('heroLabel'), heroReplay = $('heroReplay');
  let heroRun = 0, heroDone = false;
  function heroBuild() {
    const my = ++heroRun;
    heroReplay.hidden = true;
    HERO.stop();
    HERO.render(TOTAL); HERO.frame(null, false);
    if (reduce()) { heroLabel.textContent = 'THE MAP · ALL 12 PASSES'; heroDone = true; return; }
    HERO.render(1); heroLabel.textContent = 'THE MAP · PASS 1 OF 12';
    let p = 1;
    const step = () => {
      if (my !== heroRun) return;
      p++;
      if (p > TOTAL) { heroLabel.textContent = 'THE MAP · ALL 12 PASSES'; heroDone = true; heroReplay.hidden = false; return; }
      HERO.render(p); heroLabel.textContent = `THE MAP · PASS ${p} OF 12`;
      setTimeout(step, 720);
    };
    setTimeout(step, 900);
  }
  heroReplay.addEventListener('click', heroBuild);
  // the home view is the first thing shown, so build once it is on screen
  let heroStarted = false;
  function heroMaybeStart() { if (!heroStarted && view === 'home') { heroStarted = true; setTimeout(heroBuild, 400); } }

  route();
})();

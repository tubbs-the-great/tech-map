/* The scroll story: chapters on the right drive the sticky map on the left. */
(function () {
  const D = window.TECH_MAP, MAP = window.MAP;
  const passes = D.passes;
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

  const chaptersEl = document.getElementById('chapters');
  const caption = document.getElementById('stageCaption');
  const stepsEl = document.getElementById('stageSteps');
  const defEl = document.getElementById('stageDef');
  const replayBtn = document.getElementById('replay');
  const progressBar = document.getElementById('progressBar');
  const progressLabel = document.getElementById('progressLabel');
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // progress bar
  for (let i = 1; i <= D.totalPasses; i++) {
    const li = document.createElement('li');
    const built = passes[i - 1];
    const b = document.createElement('button'); b.type = 'button';
    b.setAttribute('aria-label', built ? `Go to pass ${i}: ${built.title}` : `Pass ${i} (coming soon)`);
    b.title = built ? `Pass ${i}: ${built.title}` : `Pass ${i} · coming soon`;
    if (built) b.addEventListener('click', () => document.getElementById('pass-' + i).scrollIntoView({ behavior: 'smooth', block: 'start' }));
    else li.classList.add('locked');
    li.appendChild(b); progressBar.appendChild(li);
  }

  // chapters
  passes.forEach((P, idx) => {
    const sec = document.createElement('article');
    sec.className = 'chapter'; sec.id = 'pass-' + P.n; sec.dataset.n = P.n;
    let h = `<div class="chapter-head"><span class="eyebrow">PASS ${P.n} OF ${D.totalPasses}</span>`;
    h += `<span class="chapter-title">${esc(P.title)}</span><h2>${P.headline}</h2></div>`;
    h += `<div class="prose">${P.body.map(t => `<p>${t}</p>`).join('')}</div>`;
    if (P.words && P.words.length) {
      h += `<div class="words"><span class="label">WORDS TO KNOW</span>${P.words.map(([t, d]) => `<p><strong>${esc(t)}</strong> · ${esc(d)}</p>`).join('')}</div>`;
    }
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
    if (next) h += `<a class="btn btn-primary" href="#pass-${next.n}">Continue to pass ${next.n} →</a>`;
    else h += `<a class="btn btn-primary" href="#closing">See the whole map →</a>`;
    h += `</div>`;
    sec.innerHTML = h;
    chaptersEl.appendChild(sec);
  });
  const endMark = document.createElement('div'); endMark.id = 'story-end'; chaptersEl.appendChild(endMark);

  // closing section and glossary
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

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
  });

  // ---- state ----
  let cur = 0;
  const checks = {};
  passes.forEach(P => { if (P.check) checks[P.n] = { ...P.check, done: false }; });

  function setProgress(n) {
    [...progressBar.children].forEach((li, i) => {
      li.classList.toggle('done', i + 1 < n);
      li.classList.toggle('current', i + 1 === n);
    });
    progressLabel.textContent = `PASS ${n} / ${D.totalPasses}`;
  }

  function renderSteps(P) {
    stepsEl.innerHTML = P.steps.map(s => `<li>${esc(s.label)}</li>`).join('');
  }

  function showPass(n, autoplay) {
    if (n === cur) return;
    cur = n;
    const P = passes[n - 1];
    MAP.render(n);
    MAP.setFocus(P.check && P.check.node ? null : null);
    renderSteps(P);
    setProgress(n);
    defEl.innerHTML = 'Tap any box on the map to see what it is.';
    MAP.setSelected(null);
    caption.textContent = `PASS ${n} · ${P.title}`;
    caption.classList.remove('ask');
    replayText.textContent = '▶ Play the request';
    MAP.stop();
    if (autoplay) pendingPlay = true;
    updateAskHint();
  }

  // when a pass's check is answered on the map, make the map say so
  function updateAskHint() {
    const c = checks[cur];
    const asking = !!(c && c.node && !c.done);
    for (const id in nodes) nodes[id].g.classList.toggle('askable', asking && MAP.isVisible(id));
    if (asking && !replayBtn.classList.contains('playing')) { caption.textContent = 'QUICK CHECK · TAP A BOX ON THE MAP TO ANSWER'; caption.classList.add('ask'); }
  }

  const replayText = document.getElementById('replayText');
  async function playCurrent() {
    const P = passes[cur - 1];
    replayBtn.disabled = true; replayBtn.classList.add('playing'); replayText.textContent = 'Playing';
    const items = [...stepsEl.children];
    items.forEach(li => li.classList.remove('active', 'done'));
    const ok = await MAP.play(P.steps, (i, s) => {
      items.forEach((li, j) => { li.classList.toggle('active', j === i); li.classList.toggle('done', j < i); });
      caption.textContent = `STEP ${i + 1} OF ${P.steps.length} · ${s.caption}`;
    });
    if (ok) {
      items.forEach(li => { li.classList.remove('active'); li.classList.add('done'); });
      caption.textContent = `PASS ${cur} · ${P.title} · done`;
    }
    replayBtn.classList.remove('playing');
    updateAskHint();
    replayBtn.disabled = false; replayBtn.classList.remove('playing'); replayText.textContent = '↻ Play it again';
  }
  replayBtn.addEventListener('click', playCurrent);

  // don't start the animation until the page has stopped moving
  let settleTimer = null, pendingPlay = false;
  window.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { if (pendingPlay) { pendingPlay = false; playCurrent(); } }, 220);
  }, { passive: true });

  // ---- node clicks: definitions and map-based checks ----
  const nodes = MAP.nodes();
  for (const id in nodes) {
    const g = nodes[id].g;
    const onPick = () => {
      if (!MAP.isVisible(id)) return;
      MAP.setSelected(id);
      defEl.innerHTML = defs[id] || '';
      const c = checks[cur];
      if (c && c.node && !c.done) {
        const box = document.querySelector(`.check[data-pass="${cur}"] .feedback`);
        if (id === c.node) {
          c.done = true; MAP.flash(id, 'right');
          box.innerHTML = `<b class="good">Right.</b> ${esc(c.why)}`;
          caption.textContent = `PASS ${cur} · ${passes[cur - 1].title}`; caption.classList.remove('ask');
          for (const k in nodes) nodes[k].g.classList.remove('askable');
        } else {
          MAP.flash(id, 'wrong');
          box.innerHTML = `<b class="bad">Not that one.</b> Try another box on the map.`;
        }
      }
    };
    g.addEventListener('click', onPick);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(); } });
  }

  // ---- option checks ----
  chaptersEl.addEventListener('click', e => {
    const btn = e.target.closest('.option');
    if (!btn) return;
    const box = btn.closest('.check');
    const c = checks[+box.dataset.pass];
    if (!c || c.done) return;
    c.done = true;
    const i = +btn.dataset.i;
    box.querySelectorAll('.option').forEach(b => {
      b.disabled = true;
      if (+b.dataset.i === c.answer) b.classList.add('right');
      else if (+b.dataset.i === i) b.classList.add('wrong');
    });
    box.querySelector('.feedback').innerHTML = (i === c.answer ? '<b class="good">Right.</b> ' : '<b class="bad">Not quite.</b> ') + esc(c.why);
  });

  // ---- scroll drives the map ----
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.chapter').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onEnter: () => showPass(+sec.dataset.n, true),
      onEnterBack: () => showPass(+sec.dataset.n, true)
    });
  });

  // hero: the packet drifts along the active path
  (function hero() {
    const path = document.getElementById('heroPath'), dot = document.getElementById('heroDot'), halo = document.getElementById('heroHalo');
    if (!path || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const len = path.getTotalLength(), o = { t: 0 };
    gsap.to(o, { t: len, duration: 2.4, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.6, yoyo: true,
      onUpdate: () => { const p = path.getPointAtLength(o.t); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); halo.setAttribute('cx', p.x); halo.setAttribute('cy', p.y); } });
  })();

  // start
  const m = /^#pass-(\d+)$/.exec(location.hash);
  const start = m && passes[+m[1] - 1] ? +m[1] : 1;
  showPass(start, false);
  pendingPlay = false;
  setTimeout(() => { if (cur === start) playCurrent(); }, 700);
})();

/* Draws the system map and animates a request travelling across it. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const M = window.TECH_MAP.map;
  const svg = document.getElementById('map');
  svg.setAttribute('viewBox', `0 0 ${M.width} ${M.height}`);

  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gRegions = el('g', {}, svg), gLinks = el('g', {}, svg), gNodes = el('g', {}, svg);
  const halo = el('circle', { class: 'm-halo m-hidden', r: 13 }, svg);
  const packet = el('circle', { class: 'm-packet m-hidden', r: 5 }, svg);

  // regions
  const regions = {};
  for (const id in M.regions) {
    const r = M.regions[id];
    const g = el('g', { class: 'm-region m-hidden' }, gRegions);
    el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 14 }, g);
    el('text', { x: r.x + 14, y: r.y + 18 }, g).textContent = r.label;
    regions[id] = g;
  }
  // links
  const links = {};
  for (const id in M.links) {
    const l = M.links[id];
    const g = el('g', { class: 'm-hidden' }, gLinks);
    const path = el('path', { class: 'm-link' + (l.dashed ? ' dashed' : ''), d: l.d }, g);
    const label = l.label ? el('text', { class: 'm-link-label', x: l.lx, y: l.ly }, g) : null;
    links[id] = { g, path, label, len: path.getTotalLength() };
  }
  // nodes
  const nodes = {};
  for (const id in M.nodes) {
    const n = M.nodes[id];
    const g = el('g', { class: 'm-node m-hidden', 'data-id': id, tabindex: '-1', role: 'button' }, gNodes);
    const box = el('rect', { class: 'box', x: n.x, width: n.w, rx: n.compact ? 8 : 10 }, g);
    const title = el('text', { class: 'title', x: n.x + n.w / 2 }, g);
    const sub = el('text', { class: 'sub', x: n.x + n.w / 2 }, g);
    const chips = el('g', {}, g);
    const tag = el('g', { class: 'm-new m-hidden' }, g);
    const tagRect = el('rect', { x: n.x + n.w - 42, width: 38, height: 16, rx: 3 }, tag);
    const tagText = el('text', { x: n.x + n.w - 23 }, tag);
    tagText.textContent = 'NEW';
    nodes[id] = { g, box, title, sub, chips, tag, tagRect, tagText };
  }

  let current = 0;
  const show = (e, on) => e.classList.toggle('m-hidden', !on);

  // the camera: zoom to fit everything visible, keeping the map's aspect ratio
  const ASPECT = M.width / M.height;
  const view = { x: 0, y: 0, w: M.width, h: M.height };
  const applyView = () => svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
  function fit(p, animate) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    const add = (x, y, w, h) => { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x + w); y2 = Math.max(y2, y + h); };
    for (const id in M.nodes) { const n = M.nodes[id]; if (p >= n.from) { const y = typeof n.y === 'function' ? n.y(p) : n.y, h = typeof n.h === 'function' ? n.h(p) : n.h; add(n.x, y - 12, n.w, h + 12); } }
    for (const id in M.regions) { const r = M.regions[id]; if (p >= r.from) add(r.x, r.y, r.w, r.h); }
    const pad = 36;
    let w = Math.max(x2 - x1 + pad * 2, 420), h = Math.max(y2 - y1 + pad * 2, 200);
    const r = svg.getBoundingClientRect();
    const aspect = r.width > 0 && r.height > 0 ? r.width / r.height : ASPECT;
    if (w / h > aspect) h = w / aspect; else w = h * aspect;
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    const target = { x: cx - w / 2, y: cy - h / 2, w, h };
    gsap.killTweensOf(view);
    if (animate && !reduce()) gsap.to(view, { ...target, duration: 0.9, ease: 'power2.inOut', onUpdate: applyView });
    else { Object.assign(view, target); applyView(); }
  }

  function render(p) {
    const animate = current !== 0 && p !== current;
    current = p;
    fit(p, animate);
    for (const id in M.regions) show(regions[id], p >= M.regions[id].from);
    for (const id in M.links) {
      const l = M.links[id], e = links[id];
      show(e.g, p >= l.from);
      if (e.label) e.label.textContent = l.label(p);
    }
    for (const id in M.nodes) {
      const n = M.nodes[id], e = nodes[id];
      const on = p >= n.from;
      const wasHidden = e.g.classList.contains('m-hidden');
      show(e.g, on);
      if (on && wasHidden && animate && !reduce()) gsap.fromTo(e.g, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.5 });
      e.g.setAttribute('tabindex', on ? '0' : '-1');
      e.g.classList.toggle('hub', n.kind === 'hub');
      e.g.classList.toggle('dashed', !!n.dashed);
      e.g.classList.toggle('compact', !!n.compact);
      show(e.tag, on && p === n.from);
      const y = typeof n.y === 'function' ? n.y(p) : n.y, h = typeof n.h === 'function' ? n.h(p) : n.h;
      const compact = !!n.compact;
      e.box.setAttribute('y', y); e.box.setAttribute('height', h);
      e.title.setAttribute('y', y + (compact ? 22 : 28)); e.sub.setAttribute('y', y + (compact ? 40 : 46));
      e.tagRect.setAttribute('y', y - 9); e.tagText.setAttribute('y', y + 3);
      e.title.textContent = n.title(p);
      e.sub.textContent = n.sub(p);
      e.g.setAttribute('aria-label', `${n.title(p)}, ${n.sub(p)}`);
      while (e.chips.firstChild) e.chips.removeChild(e.chips.firstChild);
      (n.chips ? n.chips(p) : []).forEach((c, i) => {
        const cg = el('g', { class: 'chip' }, e.chips);
        const w = Math.min(n.w - 24, c.length * 6.6 + 20);
        el('rect', { x: n.x + (n.w - w) / 2, y: y + 58 + i * 28, width: w, height: 22, rx: 4 }, cg);
        el('text', { x: n.x + n.w / 2, y: y + 73 + i * 28 }, cg).textContent = c;
      });
    }
  }

  function setFocus(id) {
    for (const k in nodes) nodes[k].g.classList.toggle('focus', k === id);
  }
  function setSelected(id) {
    for (const k in nodes) nodes[k].g.classList.toggle('selected', k === id);
  }
  function flash(id, cls) {
    nodes[id].g.classList.add(cls);
    setTimeout(() => nodes[id].g.classList.remove(cls), 1500);
  }

  // ---- request animation ----
  let token = 0;
  function stop() {
    token++;
    gsap.killTweensOf(packet);
    show(packet, false); show(halo, false);
    for (const id in links) links[id].path.classList.remove('active');
    for (const id in nodes) nodes[id].g.classList.remove('pulse');
  }
  function place(path, t) {
    const pt = path.getPointAtLength(t);
    packet.setAttribute('cx', pt.x); packet.setAttribute('cy', pt.y);
    halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* steps: [{link, dir, label, caption} | {node, label, caption}]; onStep(i) fires as each begins */
  async function play(steps, onStep) {
    stop();
    const my = token;
    for (let i = 0; i < steps.length; i++) {
      if (my !== token) return false;
      const s = steps[i];
      onStep(i, s);
      if (s.node) {
        nodes[s.node].g.classList.add('pulse');
        await wait(reduce() ? 900 : 1200);
        nodes[s.node].g.classList.remove('pulse');
        continue;
      }
      const L = links[s.link];
      L.path.classList.add('active');
      if (reduce()) { await wait(1100); }
      else {
        const from = s.dir < 0 ? L.len : 0, to = s.dir < 0 ? 0 : L.len;
        place(L.path, from); show(packet, true); show(halo, true);
        const o = { t: from };
        await new Promise(res => gsap.to(o, {
          t: to, duration: Math.max(0.7, Math.min(1.4, L.len / 180)), ease: 'power2.inOut',
          onUpdate: () => { if (my === token) place(L.path, o.t); }, onComplete: res
        }));
        await wait(380);
      }
      if (my !== token) return false;
      L.path.classList.remove('active');
    }
    show(packet, false); show(halo, false);
    return my === token;
  }

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (current) fit(current, false); }, 150); });

  window.MAP = { render, play, stop, setFocus, setSelected, flash, nodes: () => nodes, isVisible: id => current >= M.nodes[id].from };
})();

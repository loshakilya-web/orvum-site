(() => {
  const C = window.CONN || {};
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const approach = (v, t, dt, rate) => v + (t - v) * (1 - Math.pow(rate, dt));
  const narrow = () => innerWidth < 1100;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;   // no floating, no drifting, no pulses, no camera move
  const SIGNATURE = location.hash === '#signature';                       // the signature reveal, shown separately for approval
  const RAIL = ['agents', 'buying', 'inventory', 'stores', 'people', 'pricing', 'crm', 'finance', 'analytics', 'planning', 'brands'];
  const RAIL_X = 24, RAIL_W = 224;
  const T_SIGNAL = 0.6, T_LINK = 0.62, T_PANEL = 0.8;                      // selection choreography (seconds)

  const cards = $$('.card').map((el, i) => ({ el, k: el.dataset.k, i, at: 1.75 + [0, 1, 2, 3, 4, 1, 2, 3, 4, 5, 5][i] * 0.1 + (i > 4 && i < 9 ? 0.05 : 0), ph: i * 1.7, fm: 0, hov: 0, pulse: null }));
  cards.forEach((c) => { c.hit = c.el.querySelector('.hit'); c.px = parseFloat(c.el.dataset.x); c.py = parseFloat(c.el.dataset.y); c.el.style.setProperty('--x', String(c.px)); c.el.style.setProperty('--y', String(c.py)); });
  const byK = Object.fromEntries(cards.map((c) => [c.k, c]));
  const reveal = $$('.rv').filter((el) => !(SIGNATURE && el.classList.contains('lockup'))).map((el) => ({ el, at: parseFloat(el.dataset.at || '0') + (SIGNATURE && (el.closest('.top, .bottom') || el.classList.contains('cta-d')) ? 2.0 : 0) }));
  if (SIGNATURE) root.classList.add('sigmode');
  const svg = $('#wires'), NS = 'http://www.w3.org/2000/svg';
  const mk = (cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); svg.appendChild(p); return p; };
  cards.forEach((c) => { c.w = mk('w'); c.p = mk('p'); });
  const link = mk('link'), linkP = mk('p'), dotA = document.createElementNS(NS, 'circle'), dotB = document.createElementNS(NS, 'circle');
  [dotA, dotB].forEach((d) => { d.setAttribute('r', '3'); d.setAttribute('class', 'node'); svg.appendChild(d); });
  const panel = $('#decision'), bottom = $('.bottom'), hint = $('#hint');
  const lk = { svg: $('.lockup'), wings: $('#lk-wings'), line: $('#lk-line'), word: $('#lk-word') };

  let selected = null, view = 'main', hover = null, shownKey = null, selT = -99, pp = 0, lp = 0, clock = 0, lastClock = null, idleNext = 6, interacted = false, at = 99;
  let gShift = 0;   // used only without WebGL: the still globe moves aside like the camera would

  function globeScreen() {
    const G = C.ok && C.project ? C.project() : null;
    if (G) return G;
    return { x: innerWidth / 2 + gShift, y: innerHeight * 0.46, r: Math.min(170, innerWidth * 0.12) };
  }
  function layoutFocus() {
    const roomy = innerWidth >= 1360;
    const panelW = roomy ? Math.min(680, innerWidth - Math.max(innerWidth * 0.5, RAIL_X + RAIL_W + 2 * 175 + 90) - 32) : Math.min(620, innerWidth - (RAIL_X + RAIL_W + 24) - 32);
    const panelLeft = roomy ? Math.max(innerWidth * 0.5, RAIL_X + RAIL_W + 2 * 175 + 90) : innerWidth - 32 - panelW;
    return { panelLeft, panelW, globeX: Math.max(RAIL_X + RAIL_W + 120, (RAIL_X + RAIL_W + panelLeft) / 2) };
  }
  function railTarget(k) {
    const i = RAIL.indexOf(k), top = $('.top').getBoundingClientRect().bottom + 12, avail = innerHeight - top - 18, step = Math.min(64, avail / RAIL.length);
    return { x: RAIL_X + RAIL_W / 2, y: top + step * (i + 0.5) };
  }
  function startPulse(c, strong) { c.pulse = { t0: clock, dur: strong ? T_SIGNAL : 1.0, strong }; }
  function dirTo(c, G) { const r = c.el.getBoundingClientRect(); return [((r.left + r.width / 2) - G.x) / innerWidth * 2, ((r.top + r.height / 2) - G.y) / innerHeight * 2]; }

  function frame(atNow, clk) {
    at = atNow;
    const dt = lastClock === null ? 0 : Math.max(0, Math.min(0.1, clk - lastClock)); lastClock = clk; clock = clk;
    const desk = !narrow(), focus = !!selected && desk;
    // copy arrives in sequence; in the signature mode the name is revealed from its own North Line
    // (ORVUM app change, 6 Nov 2026) each line starts its reveal when its moment comes and the browser animates it
    // (entry.css .rv-on): smooth on a phone even when the globe draws fewer frames, instead of stepping with them
    for (const r of reveal) { const on = at >= r.at; if (r.on !== on) { r.on = on; r.el.classList.toggle('rv-on', on); } }
    if (SIGNATURE) signature();
    const G = globeScreen();
    const F = layoutFocus();
    // the camera (or the still globe) moves aside so the decision stands next to the world
    const shiftPx = focus ? F.globeX - innerWidth / 2 : 0;
    if (C.ok) C.setShift(shiftPx); else gShift = still ? shiftPx : approach(gShift, shiftPx, dt, 0.004);
    if (!C.ok) { const ng = $('#nogl'); if (ng && desk) ng.style.left = `${innerWidth / 2 + gShift}px`; }
    bottom.style.opacity = focus || pp > 0.01 ? String(1 - Math.min(1, pp * 1.6)) : '';
    if (hint) hint.style.opacity = interacted || at < 4.5 ? '0' : '';

    const now = performance.now() / 1000;
    const hdrBottom = $('.top').getBoundingClientRect().bottom;
    // resting places: below the header and never on top of one another (smaller screens push cards down)
    if (desk) {
      const rest = cards.map((c) => ({ c, x: innerWidth * c.px / 100, y: innerHeight * c.py / 100, w: c.el.offsetWidth, h: c.el.offsetHeight }));
      rest.forEach((r) => { r.y = Math.max(r.y, hdrBottom + r.h / 2 + 12); });
      rest.sort((a, b) => a.y - b.y);
      for (let i = 0; i < rest.length; i++) for (let j = 0; j < i; j++) {
        const a = rest[i], b = rest[j];
        if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 6 && Math.abs(a.y - b.y) < (a.h + b.h) / 2 + 8) a.y = b.y + (a.h + b.h) / 2 + 8;
      }
      // keep clear of the promise at the bottom: if the column runs into it, close the gaps evenly
      const floor = $('.bottom').getBoundingClientRect().top - 10, low = rest.reduce((m, r) => Math.max(m, r.y + r.h / 2), 0);
      if (low > floor) { const top = hdrBottom + 12, k = (floor - top) / Math.max(1, low - top); rest.forEach((r) => { r.y = top + (r.y - top) * k; }); }
      rest.forEach((r) => { r.c.restY = r.y; });
    }
    for (const c of cards) {
      const p = easeOut(clamp((at - c.at) / 1.1));
      const el = c.el;
      c.hov = still ? +(hover === c.k || selected === c.k) : approach(c.hov, +(hover === c.k || selected === c.k), dt, 0.002);
      if (!desk) { el.style.opacity = String(p); el.style.transform = p < 1 ? `translateY(${(1 - p) * 24}px)` : ''; el.style.filter = ''; continue; }
      const cx = innerWidth * c.px / 100, cy = c.restY;
      c.cx = cx; c.cy = cy;
      c.fm = still ? +focus : approach(c.fm, +focus, dt, 0.0025);
      const fmE = easeInOut(clamp(c.fm));
      const rt = fmE > 0.001 ? railTarget(c.k) : { x: cx, y: cy };
      const cssY = innerHeight * c.py / 100;   // the card's CSS place; cy may sit lower to clear the header or a neighbour
      const dx = (G.x - cx) * (1 - p) + (rt.x - cx) * fmE, dy = (cy - cssY) + (G.y - cy) * (1 - p) + (rt.y - cy) * fmE;
      const side = cx < innerWidth / 2 - 40 ? 1 : cx > innerWidth / 2 + 40 ? -1 : 0;
      const fl = still ? 0 : Math.sin(now * 0.7 + c.ph) * 3 * p * (1 - fmE);
      el.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy + fl}px) perspective(1100px) rotateY(${side * 14 * p * (1 - fmE)}deg) translateZ(${c.hov * 26}px) scale(${0.4 + 0.6 * p})`;
      el.style.opacity = String(p * (focus && selected !== c.k ? 0.78 : hover && hover !== c.k && !selected ? 0.72 : 1));
      el.style.filter = p < 1 ? `blur(${(1 - p) * 10}px)` : '';
      el.classList.toggle('railed', fmE > 0.5);
      // the thread from the module to the world
      const r = el.getBoundingClientRect();
      const inRail = fmE > 0.5;
      const ax = inRail ? r.right - 4 : side === 1 ? r.right - 6 : side === -1 ? r.left + 6 : r.left + r.width / 2;
      const ay = inRail ? r.top + r.height / 2 : side === 0 ? (cy < G.y ? r.bottom - 4 : r.top + 4) : r.top + r.height / 2;
      const vx = ax - G.x, vy = ay - G.y, Lh = Math.hypot(vx, vy) || 1;
      const bx = G.x + (vx / Lh) * G.r, by = G.y + (vy / Lh) * G.r;
      const hx = inRail || side ? (inRail ? 1 : side) : 0;
      const d = `M${ax.toFixed(1)},${ay.toFixed(1)} C${(ax + hx * 70).toFixed(1)},${ay.toFixed(1)} ${((ax + bx) / 2).toFixed(1)},${by.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
      c.w.setAttribute('d', d); c.p.setAttribute('d', d);
      const len = c.w.getTotalLength();
      const wp = clamp((at - c.at - 0.5) / 0.7);
      c.w.style.strokeDasharray = `${len}`; c.w.style.strokeDashoffset = `${len * (1 - wp)}`;
      const lit = c.hov;
      c.w.style.opacity = String(focus ? (selected === c.k ? 1 : 0.05 * (1 - fmE) ) : (hover && hover !== c.k ? 0.25 : 0.55 + 0.45 * lit));
      c.w.style.strokeWidth = String(1 + lit * 0.9 + sigBoost * 0.8);
      if (sigBoost > 0) c.w.style.opacity = String(Math.max(parseFloat(c.w.style.opacity) || 0, sigBoost));
      // a light travels along the thread into the world; a selection's signal arrives with an answer
      if (c.pulse) {
        const q = (clock - c.pulse.t0) / c.pulse.dur;
        if (q >= 1) {
          if (C.impact && c.pulse.strong) { const [ix, iy] = dirTo(c, G); C.impact(ix, iy); } else if (C.pulse) C.pulse();
          c.p.style.opacity = '0'; c.pulse = null;
        } else if (q >= 0) {
          const e = c.pulse.strong ? easeInOut(q) : q;
          c.p.style.opacity = String(Math.min(1, Math.sin(q * Math.PI) * 1.6)); c.p.style.strokeWidth = c.pulse.strong || c.pulse.big ? '2.8' : '1.6';
          c.p.style.strokeDasharray = `${c.pulse.big ? 110 : c.pulse.strong ? 52 : 26} ${len + 120}`; c.p.style.strokeDashoffset = `${-e * len}`;
        }
      }
    }
    // now and then a module reports to the world, quietly
    if (!still && !selected && !hover && at > idleNext && at < 90 || (!still && !selected && !hover && at >= 90 && clock > idleNext)) {
      const c = cards[(Math.random() * cards.length) | 0]; if (!c.pulse) startPulse(c, false);
      idleNext = (at < 90 ? at : clock) + 2.8 + Math.random() * 2.2;
    }
    // the world acknowledges the module the visitor is looking at
    const ackK = selected || hover;
    if (C.ack) { if (ackK && byK[ackK]) { const [ax2, ay2] = dirTo(byK[ackK], G); C.ack(ax2, ay2, selected ? 0.6 : 1); } else C.ack(null, null, 0); }

    // the decision: the world answers first, then the decision appears beside it, linked to it
    const since = clock - selT;
    if (focus) {
      lp = still ? 1 : easeOut(clamp((since - T_LINK) / 0.45));
      const target = shownKey === selected && (still || since > T_PANEL) ? 1 : 0;
      pp = still ? target : approach(pp, target, dt, target ? 0.0006 : 0.00002);
      if (shownKey !== selected && pp < 0.04) { shownKey = selected; renderPanel(); }
    } else { lp = still ? 0 : approach(lp, 0, dt, 0.0005); pp = still ? 0 : approach(pp, 0, dt, 0.00002); if (pp < 0.01 && !selected) { shownKey = null; } }
    if (desk) {
      panel.hidden = pp < 0.01 && !focus;
      const topMin = $('.top').getBoundingClientRect().bottom + 10;
      panel.style.maxHeight = `${innerHeight - topMin - 16}px`;
      panel.style.left = `${F.panelLeft}px`; panel.style.width = `${F.panelW}px`;
      const ph = panel.offsetHeight; panel.style.top = `${Math.max(topMin, Math.min(innerHeight * 0.52 - ph / 2, innerHeight - ph - 16))}px`;
      panel.style.opacity = String(pp); panel.style.transform = `translate(${(1 - pp) * 34}px, 0) scale(${0.97 + 0.03 * pp})`;
      panel.style.filter = pp < 0.99 ? `blur(${(1 - pp) * 8}px)` : '';
      panel.style.pointerEvents = pp > 0.5 && focus ? 'auto' : 'none';
      // the link from the world to the decision
      const pr = panel.getBoundingClientRect();
      const ax = G.x + G.r * 1.02, ay = G.y, bx = pr.left - 2, by = Math.min(Math.max(G.y, pr.top + 40), pr.bottom - 40);
      const d = `M${ax.toFixed(1)},${ay.toFixed(1)} C${(ax + 50).toFixed(1)},${ay.toFixed(1)} ${(bx - 50).toFixed(1)},${by.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
      link.setAttribute('d', d); linkP.setAttribute('d', d);
      const ll = link.getTotalLength() || 1;
      link.style.strokeDasharray = `${ll}`; link.style.strokeDashoffset = `${ll * (1 - lp)}`; link.style.opacity = String(Math.min(lp, pp + 0.3));
      const lq = (since - T_LINK) / 0.5;
      linkP.style.opacity = focus && lq > 0 && lq < 1 && !still ? String(Math.sin(lq * Math.PI)) : '0';
      linkP.style.strokeDasharray = `40 ${ll + 60}`; linkP.style.strokeDashoffset = `${-easeInOut(clamp(lq)) * ll}`;
      dotA.setAttribute('cx', ax.toFixed(1)); dotA.setAttribute('cy', ay.toFixed(1)); dotB.setAttribute('cx', bx.toFixed(1)); dotB.setAttribute('cy', by.toFixed(1));
      dotA.style.opacity = dotB.style.opacity = String(lp * pp);
    } else { panel.hidden = true; link.style.opacity = '0'; dotA.style.opacity = dotB.style.opacity = '0'; }
  }

  /* the ORVUM signature reveal (separate, for approval; only at #signature). About 2.4 s:
     0.0–0.7  every module's thread lights and sends a signal into the centre (the business converges);
     0.55–1.05 the orange North Line grows out of the centre, large: the spine;
     0.95–1.6 the two official wings open outward from it, at the same large scale;
     1.75–2.45 the mark moves into its place in the header lockup and the wordmark appears.
     The mark is the official vector, unchanged: only its visibility, position and size are animated. */
  let sigStart = 3.5, sigPulsed = false, sigImpact = false, sigBoost = 0;
  const sm = { svg: $('#sigmark'), wr: $('#sm-wing-r'), wl: $('#sm-wing-l'), line: $('#sm-line'), dim: $('#sigdim') };
  function unionRect(a, b) { const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect(); const l = Math.min(r1.left, r2.left), t = Math.min(r1.top, r2.top); return { l, t, w: Math.max(r1.right, r2.right) - l, h: Math.max(r1.bottom, r2.bottom) - t }; }
  function signature() {
    if (!lk.svg || !sm.svg) return;
    const t = at - sigStart, G = globeScreen();
    if (t >= 0 && !sigPulsed) { sigPulsed = true; cards.forEach((c) => { c.pulse = { t0: clock, dur: 0.7, strong: false, big: true }; }); }
    root.classList.toggle('sig-converge', t >= -0.1 && t < 1.15);
    if (t >= 0.6 && !sigImpact) { sigImpact = true; if (C.impact) C.impact(0.0001, 0.0001); }
    sigBoost = t < 0 ? 0 : 1 - clamp((t - 0.7) / 0.35);
    // the large mark sits on the centre of the world, then lands in the header lockup
    const H = Math.min(innerHeight * 0.42, innerWidth * (narrow() ? 0.82 : 0.46) * 285 / 513), W = H * 513 / 285;
    const big = { l: G.x - W / 2, t: G.y - H / 2, w: W, h: H };
    lk.wings.style.opacity = lk.line.style.opacity = '1';
    const small = unionRect(lk.wings, lk.line);
    const land = easeInOut(clamp((t - 1.75) / 0.7));
    const r = { l: big.l + (small.l - big.l) * land, t: big.t + (small.t - big.t) * land, w: big.w + (small.w - big.w) * land, h: big.h + (small.h - big.h) * land };
    Object.assign(sm.svg.style, { left: `${r.l}px`, top: `${r.t}px`, width: `${r.w}px`, height: `${r.h}px`, opacity: t < 0.5 || t > 2.5 ? '0' : '1' });
    const spine = easeOut(clamp((t - 0.55) / 0.5)), wings = easeOut(clamp((t - 0.95) / 0.65));
    const cl = `inset(${((1 - spine) * 50).toFixed(2)}% 0 ${((1 - spine) * 50).toFixed(2)}% 0)`; sm.line.style.clipPath = cl; sm.line.style.webkitClipPath = cl;
    const off = ((1 - wings) * 46).toFixed(2);   // in mark units: each whole wing slides out from the spine as it appears
    sm.wr.style.transform = `translateX(-${off}px)`; sm.wl.style.transform = `translateX(${off}px)`; sm.wr.style.opacity = sm.wl.style.opacity = String(wings);
    sm.dim.style.opacity = String(0.66 * easeOut(clamp((t - 0.5) / 0.45)) * (1 - easeInOut(clamp((t - 1.85) / 0.6))));
    // the header lockup: its mark appears exactly when the large mark lands; the wordmark follows
    lk.svg.style.opacity = t < 1.7 ? '0' : '1'; lk.svg.style.transform = ''; lk.svg.style.filter = '';
    lk.wings.style.opacity = lk.line.style.opacity = t < 2.44 ? '0' : '1';
    lk.word.style.opacity = String(easeOut(clamp((t - 2.3) / 0.5)));
  }
  const replay = $('#sig-replay');
  if (SIGNATURE && replay) { replay.hidden = false; replay.addEventListener('click', () => { sigStart = at + 0.3; sigPulsed = false; sigImpact = false; }); }

  const D = window.DECISIONS || {};
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const LABEL = 'Illustrative example · 14 stores · €60M sales';
  function panelHTML(k) {
    const d = D[k];
    const head = `<div class="d-head"><span>${esc(d.tag)}</span><span>Designed capability · in development</span></div>` + (d.planned ? `<p class="d-planned">${esc(d.planned)}</p>` : '');
    const close = '<button type="button" class="d-x" data-act="close" aria-label="Close">×</button>';
    return head + close + `<p class="m-role">${esc(d.role)}</p><p class="m-k">How ORVUM’s intelligence helps</p><ul class="m-list">${d.intel.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  }
  function renderPanel() { if (shownKey && D[shownKey]) panel.innerHTML = panelHTML(shownKey, view); }
  function render() {
    cards.forEach((c) => {
      c.el.classList.toggle('on', c.k === selected); c.el.classList.toggle('hot', c.k === hover && !selected);
      c.hit.setAttribute('aria-expanded', String(c.k === selected));
      const box = c.el.querySelector('.ins');
      if (box) box.innerHTML = c.k === selected && narrow() && D[c.k] ? panelHTML(c.k, view) : '';
    });
    root.classList.toggle('focusing', !!selected && !narrow());
    if (selected && shownKey === selected) renderPanel();
  }
  function select(k, fromKeyboard) {
    interacted = true; if (C.skip) C.skip();
    if (k === selected) { if (fromKeyboard) focusPanel(k); return; }
    view = 'main'; selected = k; hover = null; selT = clock;
    const c = byK[k];
    if (c) startPulse(c, true);
    if (narrow() && c && C.impact) { const [ix, iy] = dirTo(c, globeScreen()); C.impact(ix, iy); }
    render();
    if (fromKeyboard) focusPanel(k);
  }
  function focusPanel(k) {
    const go = () => { const host = narrow() ? byK[k].el.querySelector('.ins') : panel; if (!host) return; host.setAttribute('tabindex', '-1'); host.focus({ preventScroll: !narrow() }); };
    if (narrow() || still) go(); else setTimeout(go, (T_PANEL + 0.2) * 1000);
  }
  function close() { const k = selected; selected = null; view = 'main'; render(); const c = k && byK[k]; if (c) c.hit.focus({ preventScroll: true }); }
  function act(a) {
    if (a === 'close') { close(); return; }
    const had = !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#decision, .card'));
    view = a; render(); if (!narrow()) renderPanel();
    const host = narrow() ? byK[selected].el : panel;
    const f = host.querySelector('.d-sub') || host.querySelector('.d-main'); if (had && f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: !narrow() }); }
  }
  function setHover(k) { if (selected || hover === k) return; hover = k; if (k && byK[k] && !byK[k].pulse) startPulse(byK[k], false); render(); }
  // capture tools: focus(k) hovers, focus(k, true) selects
  function focus(k, pin) { if (pin) select(k); else if (k === null) { hover = null; if (selected) close(); render(); } else setHover(k); }
  window.APP = { focus, select, close, act, frame, hover: setHover };
  panel.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });
  cards.forEach((c) => {
    c.el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setHover(c.k); });
    c.el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && hover === c.k) { hover = null; render(); } });
    c.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b) { e.stopPropagation(); act(b.dataset.act); return; }
      if (e.target.closest('.ins')) return;
      select(c.k, e.detail === 0);          // a keyboard press on the module's button moves focus into the decision
    });
    c.hit.addEventListener('focus', () => { if (!selected) setHover(c.k); });
    c.hit.addEventListener('blur', () => { if (hover === c.k) { hover = null; render(); } });
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && selected) close(); });
  const golink = $('#golink');
  const GO = { contact: 'On orvum.com this opens the enquiry form (/contact). This preview does not send anything.',
    platform: 'On orvum.com this opens the platform page (/platform). This preview stays on one page.',
    privacy: 'On orvum.com this opens the privacy notice (/privacy).' };
  if (window.CONN_STANDALONE) $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();                                        // the standalone design file has no site around it
    golink.textContent = GO[a.dataset.go] || '';
    golink.hidden = false; clearTimeout(golink._t); golink._t = setTimeout(() => { golink.hidden = true; }, 6000);
  }));
  // the arrival never stands between the visitor and the content: any interaction completes it
  for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) addEventListener(ev, () => { if (C.skip && at < 4.6) C.skip(); }, { passive: true });
  addEventListener('pointermove', (e) => { if (C.pointer) C.pointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1); }, { passive: true });

  C.onFrame = frame;
  function startStill() {
    root.classList.remove('arriving'); const im = $('#nogl-img'); if (im && window.GLOBE_FALLBACK) im.src = window.GLOBE_FALLBACK;
    const tick = () => { if (!C.ok) { frame(99, performance.now() / 1000); requestAnimationFrame(tick); } }; tick();
  }
  addEventListener('conn-lost', startStill);
  if (C.ok) {
    if (root.classList.contains('arriving')) C.arrive(0); else frame(99, 0);
  } else startStill();
})();

/* ==========================================================
   Glass UI v3 — motor de interacción
   - Spotlight: SOLO la tarjeta bajo el cursor se ilumina (la más interna).
     La posición del panel se fija al entrar, así la inclinación no la desplaza.
   - Tilt 3D suavizado con interpolación (sin tirones), capas [data-depth].
   - [data-magnetic]  botones que se acercan al cursor.
   - [data-ripple] / .glass / .g-btn   onda de luz al hacer clic.
   - [data-reveal]    aparición al hacer scroll (up | left | right | scale | blur).
   - [data-count]     contador que arranca al aparecer (data-dec, data-prefix, data-suffix).
   - [data-scramble]  texto que se "decodifica" al aparecer.
   - <body data-aura> luz suave que sigue al cursor sobre el fondo.
   - .g-scene         parallax del fondo.
   API: window.GlassUI.refresh() tras inyectar HTML (reveal/count/scramble se auto-detectan igualmente).
   ========================================================== */
(() => {
  const root = document.documentElement;
  const fine = matchMedia('(pointer: fine)').matches;
  const calm = () => root.classList.contains('g-calm');
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Spotlight + tilt (una sola tarjeta activa) ---------- */
  const st = { el: null, tiltEl: null, rect: null, sy: 0, x: 0, y: 0, cx: 0, cy: 0, rx: 0, ry: 0, trx: 0, try_: 0, lift: 0, tlift: 0, raf: 0, leaving: [] };

  function cacheRect(el) {
    const prev = el.style.transform;
    if (el.hasAttribute('data-tilt')) el.style.transform = 'none';
    const r = el.getBoundingClientRect();
    if (el.hasAttribute('data-tilt')) el.style.transform = prev;
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function enter(el, e) {
    st.el = el;
    st.rect = cacheRect(el);
    st.sy = scrollY;
    st.cx = e.clientX - st.rect.left; st.cy = e.clientY - st.rect.top;
    el.classList.add('is-lit');
    const t = el.closest('[data-tilt]');
    if (t && fine && !calm()) {
      if (st.tiltEl && st.tiltEl !== t) release(st.tiltEl);
      st.tiltEl = t;
      st.leaving = st.leaving.filter(x => x.el !== t);
      t.classList.add('is-tilting');
    }
    loop();
  }

  function release(t) {
    // la tarjeta vuelve a reposo con su propia animación
    const cur = t._g || { rx: 0, ry: 0, lift: 0 };
    st.leaving.push({ el: t, ...cur });
    t.classList.remove('is-tilting');
    loop();
  }

  function leave() {
    if (!st.el) return;
    st.el.classList.remove('is-lit');
    if (st.tiltEl) { release(st.tiltEl); st.tiltEl = null; }
    st.el = null;
  }

  function loop() {
    if (st.raf) return;
    const tick = () => {
      st.raf = 0;
      let busy = false;
      if (st.el) {
        const dy = st.sy - scrollY;
        const lx = st.x - st.rect.left, ly = st.y - (st.rect.top + dy);
        st.cx = lerp(st.cx, lx, .22); st.cy = lerp(st.cy, ly, .22);
        st.el.style.setProperty('--mx', st.cx.toFixed(1) + 'px');
        st.el.style.setProperty('--my', st.cy.toFixed(1) + 'px');
        st.el.style.setProperty('--px', (st.cx / st.rect.width).toFixed(3));
        st.el.style.setProperty('--py', (st.cy / st.rect.height).toFixed(3));
        busy = Math.abs(st.cx - lx) > .3 || Math.abs(st.cy - ly) > .3;
      }
      const t = st.tiltEl;
      if (t) {
        const r = st.el === t ? null : cacheRectCached(t);
        const base = r || st.rect, dy = st.sy - scrollY;
        const px = (st.x - base.left) / base.width - .5, py = (st.y - (base.top + (r ? 0 : dy))) / base.height - .5;
        const max = parseFloat(t.dataset.tilt) || 7;
        const g = t._g || (t._g = { rx: 0, ry: 0, lift: 0 });
        g.rx = lerp(g.rx, Math.max(-.5, Math.min(.5, py)) * -max * 2, .12);
        g.ry = lerp(g.ry, Math.max(-.5, Math.min(.5, px)) * max * 2, .12);
        g.lift = lerp(g.lift, 1, .12);
        apply(t, g);
        busy = true;
      }
      st.leaving = st.leaving.filter(o => {
        const g = o.el._g || o;
        g.rx = lerp(g.rx, 0, .1); g.ry = lerp(g.ry, 0, .1); g.lift = lerp(g.lift, 0, .1);
        if (Math.abs(g.rx) < .02 && Math.abs(g.ry) < .02 && g.lift < .01) { o.el.style.transform = ''; o.el._g = null; return false; }
        apply(o.el, g); return true;
      });
      if (busy || st.leaving.length) st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
  }
  const rectCache = new WeakMap();
  function cacheRectCached(el) { let r = rectCache.get(el); if (!r || r.sy !== scrollY) { r = cacheRect(el); r.sy = scrollY; rectCache.set(el, r); } return r; }
  function apply(el, g) {
    el.style.transform = `perspective(1100px) rotateX(${g.rx.toFixed(2)}deg) rotateY(${g.ry.toFixed(2)}deg) translateY(${(-6 * g.lift).toFixed(2)}px)`;
    el.style.setProperty('--lift', g.lift.toFixed(3));
  }

  if (fine) {
    addEventListener('pointermove', e => {
      st.x = e.clientX; st.y = e.clientY;
      const el = e.target.closest?.('.glass:not(.g-static)');
      if (el !== st.el) { leave(); if (el) enter(el, e); }
      else if (el) loop();
      aura.x = e.clientX; aura.y = e.clientY; aura.kick();
      scene.x = e.clientX; scene.y = e.clientY; scene.kick();
      magnet(e);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { leave(); magnetReset(); });
    addEventListener('blur', () => leave());
  }

  /* ---------- Fondo con parallax suave ---------- */
  const scene = {
    x: innerWidth / 2, y: innerHeight / 2, cx: 0, cy: 0, raf: 0,
    kick() {
      if (this.raf || calm()) return;
      const el = document.querySelector('.g-scene'); if (!el) return;
      const tick = () => {
        this.raf = 0;
        const tx = (this.x / innerWidth - .5) * -22, ty = (this.y / innerHeight - .5) * -14;
        this.cx = lerp(this.cx, tx, .06); this.cy = lerp(this.cy, ty, .06);
        el.style.transform = `scale(1.08) translate(${this.cx.toFixed(2)}px, ${this.cy.toFixed(2)}px)`;
        if (Math.abs(this.cx - tx) > .05 || Math.abs(this.cy - ty) > .05) this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
  };

  /* ---------- Aura: luz que sigue al cursor ---------- */
  const aura = {
    el: null, x: 0, y: 0, cx: 0, cy: 0, raf: 0,
    kick() {
      if (!document.body?.hasAttribute('data-aura')) return;
      if (!this.el) { this.el = document.createElement('div'); this.el.className = 'g-aura'; document.body.appendChild(this.el); this.cx = this.x; this.cy = this.y; }
      if (this.raf) return;
      const tick = () => {
        this.raf = 0;
        this.cx = lerp(this.cx, this.x, .1); this.cy = lerp(this.cy, this.y, .1);
        this.el.style.transform = `translate(${this.cx}px, ${this.cy}px)`;
        if (Math.abs(this.cx - this.x) > .2 || Math.abs(this.cy - this.y) > .2) this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
  };

  /* ---------- Magnético ---------- */
  let magActive = null;
  function magnet(e) {
    if (calm()) return;
    const m = e.target.closest?.('[data-magnetic]');
    if (magActive && magActive !== m) magnetReset();
    if (!m) return;
    magActive = m;
    const r = m.getBoundingClientRect(), s = parseFloat(m.dataset.magnetic) || .35;
    const dx = e.clientX - (r.left + r.width / 2) - (m._mx || 0), dy = e.clientY - (r.top + r.height / 2) - (m._my || 0);
    m._mx = dx * s; m._my = dy * s;
    m.style.transform = `translate(${m._mx.toFixed(1)}px, ${m._my.toFixed(1)}px)`;
    m.classList.add('is-magnet');
  }
  function magnetReset() { if (!magActive) return; magActive.style.transform = ''; magActive._mx = magActive._my = 0; magActive.classList.remove('is-magnet'); magActive = null; }

  /* ---------- Ripple de luz al hacer clic ---------- */
  addEventListener('pointerdown', e => {
    const host = e.target.closest?.('[data-ripple], .g-btn, .glass.g-click');
    if (!host || calm()) return;
    const r = host.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement('span');
    s.className = 'g-ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    host.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }, { passive: true });

  /* ---------- Reveal, contadores y scramble ---------- */
  const fmt = (v, d) => v.toLocaleString(document.documentElement.lang || 'es', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always' });
  function count(el) {
    if (el._counted) return; el._counted = true;
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const dur = calm() ? 1 : +(el.dataset.duration || 1600), t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = pre + fmt(end * (1 - Math.pow(1 - p, 4)), dec) + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEF';
  function scramble(el) {
    if (el._scr) return; el._scr = true;
    const final = el.dataset.scramble || el.textContent, n = final.length;
    if (calm()) { el.textContent = final; return; }
    let frame = 0; const total = Math.max(24, n * 1.6);
    const tick = () => {
      let out = '';
      for (let i = 0; i < n; i++) {
        const reveal = (i / n) * total * .7 + 6;
        out += frame >= reveal || final[i] === ' ' ? final[i] : `<span class="g-glyph">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
      }
      el.innerHTML = out;
      if (++frame <= total) requestAnimationFrame(tick); else el.textContent = final;
    };
    tick();
  }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; io.unobserve(el);
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) count(el);
    if (el.hasAttribute('data-scramble')) scramble(el);
    el.querySelectorAll?.('[data-count]').forEach(count);
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });

  function refresh(scope = document) {
    scope.querySelectorAll('[data-reveal], [data-count], [data-scramble]').forEach(el => {
      if (el._obs) return; el._obs = true;
      if (el.hasAttribute('data-reveal') && !el.style.getPropertyValue('--i')) {
        const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
        el.style.setProperty('--i', sibs.indexOf(el));
      }
      io.observe(el);
    });
  }
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && refresh(n.parentElement || document)))).observe(root, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => refresh()); else refresh();

  window.GlassUI = { refresh, count, scramble, calm: on => root.classList.toggle('g-calm', on) };
})();

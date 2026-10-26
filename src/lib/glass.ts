// Efecto espejo: reflejo que sigue al cursor en cada `.glass`, inclinación 3D en `[data-tilt]`
// y parallax del fondo `.g-scene`. Se registra una sola vez y funciona con elementos montados después.

let installed = false;

export function installGlassEffects(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let raf = 0;
  let last: PointerEvent | null = null;

  window.addEventListener(
    'pointermove',
    (e) => {
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!last) return;
        const { clientX: x, clientY: y } = last;
        document.querySelectorAll<HTMLElement>('.glass').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -300 || r.top > window.innerHeight + 300) return;
          el.style.setProperty('--mx', `${x - r.left}px`);
          el.style.setProperty('--my', `${y - r.top}px`);
          const dx = Math.max(r.left - x, 0, x - r.right);
          const dy = Math.max(r.top - y, 0, y - r.bottom);
          el.style.setProperty('--hl', Math.max(0, 1 - Math.hypot(dx, dy) / 260).toFixed(2));
        });
        const scene = document.querySelector<HTMLElement>('.g-scene');
        if (scene) {
          const nx = x / window.innerWidth - 0.5;
          const ny = y / window.innerHeight - 0.5;
          scene.style.transform = `scale(1.06) translate(${nx * -18}px, ${ny * -12}px)`;
        }
      });
    },
    { passive: true }
  );

  window.addEventListener(
    'pointermove',
    (e) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    },
    { passive: true }
  );

  window.addEventListener('pointerout', (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]');
    if (el && !el.contains(e.relatedTarget as Node | null)) el.style.transform = '';
  });
}

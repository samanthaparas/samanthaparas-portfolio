import { useEffect, useRef } from 'react';

/**
 * The desk lamp (design system: Surfaces): a warm ~300px glow that follows the pointer, and keyboard
 * focus, across a dot-grid surface. Decorative only. CSS hides it on touch screens and with reduced
 * motion; this component also skips its listeners there.
 */
export function Lamp() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lamp = ref.current;
    const surface = lamp?.parentElement;
    if (!lamp || !surface) return;
    const quiet =
      window.matchMedia('(hover: none)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quiet) return;

    let frame = 0;
    const moveTo = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = surface.getBoundingClientRect();
        lamp.style.setProperty('--lx', `${x - box.left}px`);
        lamp.style.setProperty('--ly', `${y - box.top}px`);
        lamp.classList.add('is-on');
      });
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      moveTo(e.clientX, e.clientY);
    };
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      const r = el.getBoundingClientRect();
      moveTo(r.left + r.width / 2, r.top + r.height / 2);
    };
    const off = () => lamp.classList.remove('is-on');
    const onBlur = (e: FocusEvent) => {
      if (!surface.contains(e.relatedTarget as Node | null)) off();
    };

    surface.addEventListener('pointermove', onPointer);
    surface.addEventListener('pointerleave', off);
    surface.addEventListener('focusin', onFocus);
    surface.addEventListener('focusout', onBlur);
    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener('pointermove', onPointer);
      surface.removeEventListener('pointerleave', off);
      surface.removeEventListener('focusin', onFocus);
      surface.removeEventListener('focusout', onBlur);
    };
  }, []);

  return <div ref={ref} className="lamp" aria-hidden="true" />;
}

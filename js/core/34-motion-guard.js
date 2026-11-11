/* Animation scheduler: pauses expensive canvas loops when hidden, throttles frames
   and stops decorative motion for users who prefer reduced motion. */
(() => {
  'use strict';
  if (!window.DA) return;

  if (DA.preference() && !S.rm) S.rm = 1;

  const raf = window.requestAnimationFrame.bind(window);
  const paused = new Map();
  const lastAt = new WeakMap();
  const reduced = () => DA.preference() || !!S.rm;
  const blocked = opts => document.hidden || (!!opts.pauseOnReduced && reduced());

  const schedule = (fn, opts, fps) => {
    const run = ts => {
      if (blocked(opts)) {
        paused.set(fn, opts);
        return;
      }
      const step = 1000 / (fps || 30);
      const prev = lastAt.get(fn) || 0;
      if (ts - prev < step - 2) {
        raf(run);
        return;
      }
      lastAt.set(fn, ts);
      fn(ts);
    };
    return raf(run);
  };

  const frame = (fn, fps, opts) => schedule(fn, Object.assign({}, opts, { fps }), fps);

  const resume = () => {
    const waiting = [...paused.entries()];
    paused.clear();
    waiting.forEach(([fn, opts]) => {
      if (blocked(opts)) paused.set(fn, opts);
      else frame(fn, opts.fps, opts);
    });
  };

  const refresh = () => {
    document.documentElement.classList.toggle('motion-paused', document.hidden || reduced());
    resume();
  };

  document.addEventListener('visibilitychange', refresh);
  try {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) mq.addEventListener('change', refresh);
    else if (mq.addListener) mq.addListener(refresh);
  } catch (e) {}
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  DA.motion = { frame, refresh, reduced, paused: () => document.hidden };
})();

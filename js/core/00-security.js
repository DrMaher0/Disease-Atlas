/* Shared safety helpers. Loaded before every other module. */
(() => {
  'use strict';

  const MAX_STORED_BYTES = 2 * 1024 * 1024;
  const STATE_ID = /^[A-Za-z0-9_.\-]{1,80}$/;
  const COLOR = /^(#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([0-9.,%\s/]+\))$/i;

  const esc = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const attr = value => esc(value).replace(/`/g, '&#96;');

  const safeUrl = value => {
    const s = String(value == null ? '' : value).trim();
    if (!s) return '';
    if (/^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(s)) return s;
    if (/^https:\/\/[^\s"'<>]+$/i.test(s)) return s;
    return '';
  };

  const isPlain = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const safeKey = k => typeof k === 'string' && k !== '__proto__' && k !== 'constructor' && k !== 'prototype';

  const scalar = v => {
    if (typeof v === 'string') return v.slice(0, 4000);
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'boolean') return v;
    return undefined;
  };

  const cloneSafe = (value, depth) => {
    if (depth > 4) return undefined;
    const s = scalar(value);
    if (s !== undefined) return s;
    if (Array.isArray(value)) {
      return value.slice(0, 500).map(v => cloneSafe(v, depth + 1)).filter(v => v !== undefined);
    }
    if (isPlain(value)) {
      const out = {};
      Object.keys(value).slice(0, 60).forEach(k => {
        if (!safeKey(k)) return;
        const v = cloneSafe(value[k], depth + 1);
        if (v !== undefined) out[k] = v;
      });
      return out;
    }
    return undefined;
  };

  const ids = (value, max) => (Array.isArray(value) ? value : [])
    .filter(v => typeof v === 'string' && STATE_ID.test(v) && safeKey(v))
    .slice(0, max || 500);

  const int = (value, min, max, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
  };

  const validateState = raw => {
    if (!isPlain(raw)) return {};
    const out = {};
    Object.keys(raw).forEach(k => {
      if (!safeKey(k)) return;
      const v = cloneSafe(raw[k], 0);
      if (v !== undefined) out[k] = v;
    });

    out.h = ids(raw.h, 30);
    out.b = ids(raw.b, 500);
    out.xd = ids(raw.xd, 5000);
    out.fb = Array.isArray(raw.fb) ? raw.fb.slice(-100).filter(isPlain).map(fb => {
      const rec = cloneSafe(fb, 1) || {};
      return {
        id: typeof rec.id === 'string' ? rec.id.slice(0, 80) : '',
        s: String(rec.s || '').slice(0, 80),
        t: String(rec.t || '').slice(0, 4000),
        r: String(rec.r || '').slice(0, 2000),
        at: int(rec.at, 0, Number.MAX_SAFE_INTEGER, Date.now())
      };
    }) : [];
    out.fbk = Array.isArray(raw.fbk) ? raw.fbk.slice(-200).filter(isPlain) : [];
    out.th = int(raw.th, 0, 20, 0);
    out.ts = int(raw.ts, 85, 125, 100);
    out.sy = raw.sy ? 1 : 0;
    out.dna = raw.dna === undefined ? 1 : (raw.dna ? 1 : 0);
    out.gl = raw.gl === undefined ? 1 : (raw.gl ? 1 : 0);
    out.rm = raw.rm ? 1 : 0;
    out.rnd = raw.rnd === 0 ? 0 : 1;
    out.bgf = raw.bgf === 0 ? 0 : 1;
    out.gz = raw.gz ? 1 : 0;
    out.nw = raw.nw ? 1 : 0;
    out.a16 = raw.a16 ? 1 : 0;
    out.md = raw.md === 'light' || raw.md === 'dark' ? raw.md : '';
    out.mu = raw.mu === 'light' || raw.mu === 'dark' ? raw.mu : '';
    out.un = typeof raw.un === 'string' ? raw.un.slice(0, 40) : '';
    out.uid = typeof raw.uid === 'string' ? raw.uid.slice(0, 100) : '';
    out.role = typeof raw.role === 'string' ? raw.role.slice(0, 20) : '';
    out.pf = safeUrl(raw.pf);
    out.bg = typeof raw.bg === 'string' && /^[a-z0-9_\-]{1,40}$/i.test(raw.bg) ? raw.bg : 'dna';
    out.cth = Array.isArray(raw.cth) ? raw.cth.slice(0, 12).map(t => {
      if (!Array.isArray(t)) return null;
      const name = String(t[0] || '').slice(0, 24);
      return [name, COLOR.test(t[1]) ? t[1] : '#22d3ee', COLOR.test(t[2]) ? t[2] : '#a78bfa'];
    }).filter(Boolean) : [];
    return out;
  };

  const safeHash = hash => {
    let h = String(hash == null ? '' : hash).replace(/^#/, '').slice(0, 300);
    if (!h) return '';
    if (/[<>{}\\"'`\u0000-\u001f]/.test(h)) return '';
    try {
      decodeURIComponent(h);
    } catch (e) {
      return '';
    }
    return h;
  };

  const debounce = (fn, wait) => {
    let timer = 0;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait || 150);
    };
  };

  const onIdle = fn => ('requestIdleCallback' in window
    ? requestIdleCallback(fn, { timeout: 2000 })
    : setTimeout(fn, 1));

  const preference = () => {
    try {
      return matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  };

  window.DA = {
    esc,
    attr,
    safeUrl,
    safeHash,
    validateState,
    debounce,
    onIdle,
    preference,
    MAX_STORED_BYTES
  };

  const boot = document.getElementById('boot');
  if (boot) {
    setTimeout(() => {
      if (boot.parentNode) boot.classList.add('boot-done');
    }, 7000);
  }
})();

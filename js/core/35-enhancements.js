/* Progressive enhancement layer: dataset checks, ranked search, safe routing,
   keyboard accessibility, dialog behaviour and small UX conveniences. */
(() => {
  'use strict';
  if (!window.DA) return;
  if (typeof TH !== 'undefined' && S.th >= TH.length) S.th = 0;

  const $el = sel => document.querySelector(sel);
  const all = sel => [...document.querySelectorAll(sel)];
  const norm = value => String(value == null ? '' : value).toLowerCase();
  const announcer = $el('#announcer');

  const announce = message => {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 40);
  };

  /* ---------- dataset ---------- */
  const arrayOf = value => (Array.isArray(value) ? value : (typeof value === 'string' && value ? [value] : []));
  const strings = value => arrayOf(value).map(v => String(v == null ? '' : v));

  const normalizeDisease = d => {
    if (!d || typeof d !== 'object') return null;
    if (typeof d.id !== 'string' || !d.id) return null;
    if (typeof d.n !== 'string' || !d.n) d.n = d.id;
    if (typeof d.alt !== 'string') d.alt = '';
    if (typeof d.sys !== 'string' || !d.sys) d.sys = 'Uncategorised';
    if (typeof d.org !== 'string') d.org = '';
    if (typeof d.sens !== 'string' || !d.sens) d.sens = 'General';
    if (typeof d.ov !== 'string') d.ov = '';
    if (typeof d.dx !== 'string') d.dx = '';
    if (typeof d.pg !== 'string') d.pg = '';
    ['et', 'rf', 'sy', 'sg', 'tx', 'cx', 'ref', 'ddx'].forEach(k => { d[k] = strings(d[k]); });
    d.inv = arrayOf(d.inv).map(item => (Array.isArray(item) ? item.map(v => String(v == null ? '' : v)) : [String(item)]));
    d.rel = arrayOf(d.rel).filter(Array.isArray).map(r => [String(r[0] || ''), typeof r[1] === 'string' ? r[1] : 'Related']);
    if (!d.ev || typeof d.ev !== 'object' || Array.isArray(d.ev)) d.ev = {};
    if (typeof d.age !== 'number') d.age = 0;
    return d;
  };

  const validateDataset = list => {
    const report = { total: 0, invalid: 0, duplicateIds: 0, brokenRel: 0, filled: 0 };
    const seen = new Map();
    const keep = [];
    list.forEach(d => {
      const missing = !d || typeof d !== 'object' || ['n', 'sys', 'ov'].some(k => !d[k]) ||
        ['et', 'rf', 'sy', 'sg', 'tx', 'cx', 'ref', 'rel', 'inv'].some(k => !Array.isArray(d[k]));
      const clean = normalizeDisease(d);
      if (!clean) { report.invalid += 1; return; }
      if (seen.has(clean.id)) { report.duplicateIds += 1; return; }
      seen.set(clean.id, true);
      keep.push(clean);
      report.total += 1;
      if (missing) report.filled += 1;
    });
    keep.forEach(d => {
      const before = d.rel.length;
      d.rel = d.rel.filter(r => r[0] && r[0] !== d.id && seen.has(r[0]));
      report.brokenRel += before - d.rel.length;
    });
    if (keep.length !== list.length) list.splice(0, list.length, ...keep);
    return report;
  };

  DA.normalizeDisease = normalizeDisease;
  DA.validateDataset = () => {
    const report = validateDataset(D);
    if (report.invalid || report.duplicateIds || report.brokenRel) {
      console.warn('Disease Atlas dataset report', report);
    }
    DA.datasetReport = report;
    return report;
  };

  /* ---------- search ---------- */
  DA.searchDiseases = (query, limit) => {
    const q = norm(query).trim();
    if (!q) return [];
    const words = q.split(/\s+/).filter(Boolean);
    const visible = typeof gzv === 'function' ? gzv : () => true;
    const hits = [];
    D.forEach(d => {
      if (!d || !d.id || !visible(d)) return;
      const name = norm(d.n);
      const alt = norm(d.alt);
      const sys = norm(d.sys);
      const org = norm(d.org);
      const symptoms = norm(arrayOf(d.sy).join(' '));
      let score = 0;
      let ok = true;
      for (const word of words) {
        if (name === word) score += 0;
        else if (name.startsWith(word)) score += 4;
        else if (name.includes(word)) score += 8;
        else if (alt === word) score += 14;
        else if (alt.includes(word)) score += 18;
        else if (sys.includes(word)) score += 26;
        else if (org.includes(word)) score += 28;
        else if (symptoms.includes(word)) score += 36;
        else if (norm(d.ov).includes(word)) score += 55;
        else { ok = false; break; }
      }
      if (!ok) return;
      if (name === q) score -= 10;
      else if (name.startsWith(q)) score -= 6;
      if (d.stub) score += 25;
      if (d.lean) score += 4;
      hits.push([score, d.n.length, d]);
    });
    hits.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2].n.localeCompare(b[2].n));
    return hits.slice(0, limit || 20).map(h => h[2]);
  };

  const results = () => $el('#res');

  const setExpanded = open => {
    const q = $el('#q');
    if (q) q.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  window.wireSearch = function () {
    const q = $el('#q');
    const r = results();
    if (!q || !r) return;
    let matches = [];
    let active = -1;

    q.setAttribute('role', 'combobox');
    q.setAttribute('aria-autocomplete', 'list');
    q.setAttribute('aria-controls', 'res');
    q.setAttribute('aria-expanded', 'false');
    q.setAttribute('aria-keyshortcuts', '/');
    r.setAttribute('role', 'listbox');
    r.setAttribute('aria-label', 'Search suggestions');

    const close = () => {
      r.hidden = true;
      active = -1;
      q.removeAttribute('aria-activedescendant');
      setExpanded(false);
    };

    const paint = () => {
      r.querySelectorAll('[role="option"]').forEach((o, i) => {
        const on = i === active;
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        o.classList.toggle('f', on);
      });
      if (active >= 0) q.setAttribute('aria-activedescendant', 'sr-' + active);
      else q.removeAttribute('aria-activedescendant');
    };

    const show = () => {
      const value = q.value.trim();
      if (!value) return close();
      matches = DA.searchDiseases(value, 20);
      active = -1;
      r.hidden = false;
      setExpanded(true);
      r.innerHTML = matches.length
        ? matches.map((d, i) => `<div id="sr-${i}" role="option" aria-selected="false" data-id="${DA.attr(d.id)}"><span>${DA.esc(d.n)}${d.alt ? ` <small>${DA.esc(d.alt)}</small>` : ''}</span><small>${DA.esc(d.sys)}</small></div>`).join('')
        : '<div class="nores" role="option" aria-disabled="true" data-request="1">No matching diseases found. Request this disease.</div>';
    };

    const move = step => {
      if (!matches.length) return;
      active = (active + step + matches.length) % matches.length;
      paint();
    };

    q.oninput = show;
    q.onfocus = () => { if (q.value.trim()) show(); };
    q.onkeydown = e => {
      if (e.key === 'Escape') {
        if (!r.hidden) { e.stopPropagation(); close(); }
        return;
      }
      if (r.hidden && e.key === 'ArrowDown' && q.value.trim()) show();
      if (!r.hidden) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Home' && matches.length) { e.preventDefault(); active = 0; paint(); }
        else if (e.key === 'End' && matches.length) { e.preventDefault(); active = matches.length - 1; paint(); }
      }
      if (e.key === 'Enter' && q.value.trim()) {
        e.preventDefault();
        if (matches.length) go('d/' + (active >= 0 ? matches[active] : matches[0]).id);
        else go('search');
      }
    };

    r.onpointermove = e => {
      const option = e.target.closest('[role="option"]');
      if (!option || option.dataset.request) return;
      const index = [...r.querySelectorAll('[role="option"]')].indexOf(option);
      if (index !== active) { active = index; paint(); }
    };
    r.onclick = e => {
      const option = e.target.closest('[role="option"]');
      if (!option) return;
      if (option.dataset.request) go('request');
      else if (option.dataset.id) go('d/' + option.dataset.id);
    };
  };

  if (typeof wireSearch === 'function') wireSearch = window.wireSearch;

  /* ---------- accessible routing ---------- */
  const originalRoute = window.route;
  const afterRoute = () => {
    syncA11y();
    const app = $el('#app');
    if (app && !app.hasAttribute('tabindex')) app.setAttribute('tabindex', '-1');
    const heading = app && (app.querySelector('h1') || app.querySelector('h2'));
    const title = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : 'Home';
    announce(title + ' loaded');
    updateBackToTop();
    enhance(app || document);
  };

  window.route = function () {
    const raw = location.hash;
    const clean = DA.safeHash(raw);
    if (raw && clean !== raw.slice(1)) {
      try { history.replaceState(null, '', clean ? '#' + clean : '#'); } catch (e) {}
    }
    originalRoute();
    afterRoute();
  };
  window.onhashchange = window.route;

  /* ---------- aria helpers ---------- */
  const markClickable = (el, label) => {
    if (!el || el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'INPUT') return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if (label && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', label);
  };

  const enhance = root => {
    const list = [...(root.matches ? [root] : []), ...root.querySelectorAll(
      '.card[onclick],.it[onclick],.it2[onclick],.it3[onclick],.node[onclick],.organ[onclick],[data-g]:not(button):not(a),.cyn,.apko'
    )];
    list.forEach(el => markClickable(el, el.tagName === 'g' || el.tagName === 'path' || el.tagName === 'ellipse' ? el.textContent.trim() : ''));
  };

  const syncA11y = () => {
    all('#nav button').forEach(b => {
      if (b.classList.contains('on')) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    all('.tabs button,.thl button,.lsc button,#lf button,.dgt button,.afc,.asv button,.gdr button').forEach(b => {
      b.setAttribute('aria-pressed', b.classList.contains('on') ? 'true' : 'false');
    });
    const menu = $el('#menu');
    const pb = $el('#pb');
    if (menu && pb) pb.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    const dr = $el('#dr');
    if (dr) {
      const open = dr.classList.contains('open');
      ['#hb', '#dt'].forEach(sel => { const b = $el(sel); if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    }
    enhance($el('#app') || document);
    enhance($el('#ll') || document);
    updateBackToTop();
  };

  /* ---------- dialogs ---------- */
  const focusables = root => [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter(el => el.getClientRects().length && !el.closest('[hidden]'));

  const initDialog = (dialog, index) => {
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    const heading = dialog.querySelector('h3');
    if (heading) {
      if (!heading.id) heading.id = 'dlg-title-' + index;
      dialog.setAttribute('aria-labelledby', heading.id);
    }
    const focusFirst = () => {
      const first = focusables(dialog)[0];
      if (first) first.focus({ preventScroll: true });
    };
    let lastFocus = null;
    const sync = () => {
      const open = dialog.classList.contains('open');
      dialog.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) {
        lastFocus = document.activeElement;
        setTimeout(focusFirst, 0);
      } else if (!document.querySelector('.modal.open') && lastFocus && lastFocus.isConnected) {
        lastFocus.focus({ preventScroll: true });
        lastFocus = null;
      }
    };
    sync();
    new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['class'] });
  };
  all('.modal').forEach(initDialog);

  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      const dialog = $el('.modal.open');
      if (!dialog) return;
      const items = focusables(dialog);
      if (!items.length) return;
      const index = items.indexOf(document.activeElement);
      if (e.shiftKey && index <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && (index === -1 || index === items.length - 1)) { e.preventDefault(); items[0].focus(); }
    }
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target.closest && e.target.closest('[data-kbd], [role="button"][tabindex]');
      if (target && target.tagName !== 'BUTTON' && target.tagName !== 'A' && target.tagName !== 'INPUT') {
        e.preventDefault();
        target.click();
      }
    }
  });

  /* ---------- drawer, menu, dialogs via Escape ---------- */
  const dr = $el('#dr');
  if (dr) {
    const syncDrawer = () => {
      const open = dr.classList.contains('open');
      ['#hb', '#dt'].forEach(sel => { const b = $el(sel); if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    };
    syncDrawer();
    new MutationObserver(syncDrawer).observe(dr, { attributes: true, attributeFilter: ['class'] });
  }
  const menuEl = $el('#menu');
  if (menuEl) {
    const syncMenu = () => {
      const pb = $el('#pb');
      if (pb) pb.setAttribute('aria-expanded', menuEl.classList.contains('open') ? 'true' : 'false');
    };
    syncMenu();
    new MutationObserver(syncMenu).observe(menuEl, { attributes: true, attributeFilter: ['class'] });
  }
  ['#hb', '#dt'].forEach(sel => { const b = $el(sel); if (b) b.setAttribute('aria-controls', 'dr'); });
  const pb = $el('#pb');
  if (pb) pb.setAttribute('aria-controls', 'menu');
  const app = $el('#app');
  if (app && !app.hasAttribute('tabindex')) app.setAttribute('tabindex', '-1');

  /* ---------- back to top ---------- */
  const btt = $el('#btt');
  const reduce = () => DA.motion ? DA.motion.reduced() : DA.preference();
  const updateBackToTop = () => { if (btt) btt.hidden = window.scrollY < 600; };
  if (btt) {
    btt.onclick = () => window.scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' });
    let tick = false;
    addEventListener('scroll', () => {
      if (tick) return;
      tick = true;
      setTimeout(() => { tick = false; updateBackToTop(); }, 80);
      updateBackToTop();
    }, { passive: true });
  }
  updateBackToTop();

  /* ---------- shortcuts and skip link ---------- */
  const skip = $el('.skip-link');
  if (skip) skip.addEventListener('click', e => {
    e.preventDefault();
    const target = $el('#app');
    if (target) { target.focus({ preventScroll: true }); target.scrollIntoView(); announce('Main content'); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const wheel = $el('#wh');
      if (wheel && wheel.classList.contains('on')) { wheel.classList.remove('on'); return; }
      const r = results();
      if (r && !r.hidden) {
        r.hidden = true;
        const q = $el('#q');
        if (q) { q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); }
        return;
      }
      if ($el('.modal.open')) { closeM(); return; }
      if (dr && dr.classList.contains('open')) { dr.classList.remove('open'); return; }
      if (menuEl && menuEl.classList.contains('open')) menuEl.classList.remove('open');
      return;
    }
    const tag = (e.target.tagName || '').toLowerCase();
    if (/input|textarea|select/.test(tag) || e.target.isContentEditable) return;
    if (e.key === '/' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const q = $el('#q');
      if (q) { q.focus(); q.select(); }
      else go('search');
    } else if (e.altKey && e.key.toLowerCase() === 'h') { e.preventDefault(); go(''); }
    else if (e.altKey && e.key.toLowerCase() === 'b') { e.preventDefault(); go('bookmarks'); }
    else if (e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); go('search'); }
  });

  /* ---------- observer: single intersection observer + re-enhance ---------- */
  if (typeof window.obs === 'function' && 'IntersectionObserver' in window) {
    let io;
    const watched = new Set();
    window.obs = function () {
      io = io || new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in', entry.isIntersecting)), { threshold: 0.15 });
      watched.forEach(el => { if (!el.isConnected) { io.unobserve(el); watched.delete(el); } });
      document.querySelectorAll('.card:not(.in),.warn:not(.in),.rv:not(.in)').forEach(el => {
        if (!watched.has(el)) { io.observe(el); watched.add(el); }
      });
    };
  }

  let scheduled = false;
  const scheduleA11y = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; syncA11y(); });
  };
  ['#app', '#ll', '#nav', '#dr'].forEach(sel => {
    const node = $el(sel);
    if (node) new MutationObserver(scheduleA11y).observe(node, { childList: true, subtree: true });
  });

  /* ---------- theme labels are user supplied ---------- */
  if (typeof window.thBuild === 'function') {
    window.thBuild = function () {
      const list = $el('#thl');
      if (!list) return;
      list.innerHTML = TH.map((theme, i) => `<button type="button" data-i="${i}">${swa(i)} ${DA.esc(THN[i])}</button>`).join('');
    };
  }

  DA.announce = announce;
  DA.syncA11y = syncA11y;

  DA.ready = () => {
    document.body.classList.add('app-ready');
    syncA11y();
    const boot = $el('#boot');
    let hidden = false;
    const hide = () => {
      if (hidden) return;
      hidden = true;
      if (boot) {
        boot.classList.add('boot-done');
        setTimeout(() => { if (boot.parentNode) boot.remove(); }, 450);
      }
      syncA11y();
    };
    requestAnimationFrame(hide);
    setTimeout(hide, 350);
  };
})();

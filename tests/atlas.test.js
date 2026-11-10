/* Browser-runnable checks. Open index.html?test=1 or call runAtlasTests(). */
(() => {
  'use strict';

  const results = [];
  const check = (name, fn) => {
    try {
      const value = fn();
      if (value === false) throw new Error('returned false');
      results.push({ name, ok: true });
    } catch (error) {
      results.push({ name, ok: false, message: String(error && error.message || error) });
    }
  };

  const panel = () => {
    let el = document.getElementById('atlas-tests');
    if (el) el.remove();
    el = document.createElement('section');
    el.id = 'atlas-tests';
    el.className = 'sec';
    el.style.cssText = 'position:fixed;right:12px;bottom:70px;z-index:460;max-width:380px;max-height:60vh;overflow:auto;box-shadow:0 10px 30px #000a';
    const failed = results.filter(r => !r.ok).length;
    const title = document.createElement('h2');
    title.style.marginTop = '0';
    title.textContent = 'Tests: ' + (results.length - failed) + ' passed, ' + failed + ' failed';
    el.appendChild(title);
    results.forEach(result => {
      const row = document.createElement('p');
      row.style.margin = '4px 0';
      row.textContent = (result.ok ? 'PASS ' : 'FAIL ') + result.name + (result.ok ? '' : ' — ' + result.message);
      row.style.color = result.ok ? '#4ade80' : '#f87171';
      el.appendChild(row);
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.onclick = () => el.remove();
    el.appendChild(close);
    document.body.appendChild(el);
    return el;
  };

  const run = () => {
    results.length = 0;

    check('dataset is loaded', () => Array.isArray(D) && D.length > 1500);
    check('dataset ids are unique', () => new Set(D.map(d => d.id)).size === D.length);
    check('every entry has required fields', () => D.every(d => d && d.id && d.n && d.sys && typeof d.ov === 'string'));
    check('every entry has renderable arrays', () => D.every(d =>
      ['et', 'rf', 'sy', 'sg', 'tx', 'cx', 'ref', 'ddx', 'rel', 'inv'].every(k => Array.isArray(d[k]))));
    check('relationships only point at known diseases', () => {
      const ids = new Set(D.map(d => d.id));
      return D.every(d => d.rel.every(r => Array.isArray(r) && ids.has(r[0]) && r[0] !== d.id));
    });
    check('dataset validation reports no broken relationships', () => DA.datasetReport && DA.datasetReport.brokenRel === 0);
    check('normalizer fills safe defaults', () => {
      const d = DA.normalizeDisease({ id: 'test-entry', n: '' });
      return d.n === 'test-entry' && d.sys === 'Uncategorised' && Array.isArray(d.et) && Array.isArray(d.inv) && Array.isArray(d.rel);
    });

    check('search ranks a diabetes entry first', () => {
      const hits = DA.searchDiseases('diabetes', 5);
      return hits.length > 0 && /diabetes/i.test(hits[0].n);
    });
    check('search ranks an asthma entry first', () => {
      const hits = DA.searchDiseases('asthma', 5);
      return hits.length > 0 && /asthma/i.test(hits[0].n);
    });
    check('multi-word search works', () => DA.searchDiseases('chest pain', 5).length > 0);
    check('search returns nothing for gibberish', () => DA.searchDiseases('zzzzqqqxxx', 5).length === 0);

    check('hash sanitizer keeps normal routes', () => DA.safeHash('#d/t2dm') === 'd/t2dm' && DA.safeHash('#c/Women%27s%20Health') === 'c/Women%27s%20Health');
    check('hash sanitizer rejects markup', () => DA.safeHash('#<img src=x>') === '' && DA.safeHash('#d/x\\y') === '');
    check('hash sanitizer rejects bad escapes', () => DA.safeHash('#%E0%A4%A') === '');

    check('stored state is validated', () => {
      const s = DA.validateState({
        b: ['t2dm', 'bad id', '__proto__'],
        th: 999,
        ts: 1000,
        pf: 'javascript:alert(1)',
        md: 'light',
        rnd: 0
      });
      return s.b.length === 1 && s.b[0] === 't2dm' && s.th === 200 && s.ts === 125 && s.pf === '' && s.md === 'light' && s.rnd === 0;
    });
    check('theme indexes beyond the old cap survive validation', () => DA.validateState({ th: 25 }).th === 25);
    check('custom theme names are stripped of markup', () => {
      const s = DA.validateState({ cth: [['<svg onload=alert(1)>', '#fff', '#000']] });
      return s.cth.length === 1 && s.cth[0][0] === 'svg onload=alert(1)';
    });
    check('bookmark state rejects unsafe identifiers', () => {
      const s = DA.validateState({ b: ['t2dm', 'x"><script>', 'asthma'] });
      return s.b.join(',') === 't2dm,asthma';
    });

    check('escape helper neutralises markup', () => DA.esc('<img src=x onerror=alert(1)>') === '&lt;img src=x onerror=alert(1)&gt;');
    check('safe image URLs only', () => DA.safeUrl('javascript:alert(1)') === '' && DA.safeUrl('https://example.com/a.png') === 'https://example.com/a.png');

    check('age calculation is numeric', () => {
      const age = ageOf('2000-01-01');
      return typeof age === 'number' && Number.isFinite(age) && age >= 20 && age < 60;
    });

    check('disease route renders the requested page', () => {
      const href = location.href;
      try {
        history.replaceState(null, '', location.pathname + location.search + '#d/asthma');
        route();
        return /asthma/i.test(document.getElementById('app').textContent);
      } finally {
        history.replaceState(null, '', href);
        route();
      }
    });
    check('bookmark toggles on and off for a signed-in user', () => {
      const href = location.href;
      const uid = S.uid;
      const saved = S.b.slice();
      try {
        S.uid = 'test-runner';
        S.b = [];
        bk('asthma');
        const added = S.b.includes('asthma');
        bk('asthma');
        return added && !S.b.includes('asthma');
      } finally {
        S.uid = uid;
        S.b = saved;
        save();
        history.replaceState(null, '', href);
        route();
      }
    });

    check('dialogs expose dialog semantics', () => {
      const modal = document.getElementById('mset');
      return !!modal && modal.getAttribute('role') === 'dialog' && modal.getAttribute('aria-modal') === 'true' && modal.hasAttribute('aria-hidden');
    });
    check('active nav item is marked for assistive tech', () => {
      const active = document.querySelector('#nav button[aria-current="page"]');
      return !!active;
    });
    check('search input is a combobox when present', () => {
      const q = document.getElementById('q');
      if (!q) return true;
      return q.getAttribute('role') === 'combobox' && q.getAttribute('aria-controls') === 'res' && q.hasAttribute('aria-expanded');
    });
    check('cloud helpers are available', () => !!(window.DA && DA.cloud && typeof DA.cloud.emailFor === 'function'));
    check('cloud username maps to a stable sign-in address', () => {
      if (!(window.DA && DA.cloud)) return false;
      return DA.cloud.emailFor('Asthma.User') === 'asthma.user@users.disease-atlas.invalid'
        && DA.cloud.emailFor('has space') === 'hasspace@users.disease-atlas.invalid'
        && DA.cloud.emailFor('') === '';
    });
    check('cloud state key follows the local session', () => {
      if (!(window.DA && DA.cloud)) return false;
      const id = localStorage.getItem('daSess');
      return DA.cloud.stateKey() === (id ? 'da_u_' + id : 'da');
    });

    const el = panel();
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Test results');
    return results.slice();
  };

  window.runAtlasTests = run;
  if (/[?&]test=1(?:&|$)/.test(location.search) || /^#(?:test|tests)$/.test(location.hash)) setTimeout(run, 400);
})();

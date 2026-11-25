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
      row.textContent = (result.ok ? 'PASS ' : 'FAIL ') + result.name + (result.ok ? '' : ': ' + result.message);
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
    check('category art covers every category', () => {
      if (typeof CATART === 'undefined' || typeof CATI === 'undefined') return false;
      const keys = new Set(Object.keys(CATI));
      keys.add('General');
      return [...keys].every(k => !!CATART[CATI[k] || k]);
    });
    check('homepage search with circle quick-actions', () => {
      const href = location.href;
      try {
        history.replaceState(null, '', location.pathname + location.search + '#');
        route();
        const circles = document.querySelectorAll('.qac .qac-b');
        return circles.length >= 4 && !!document.getElementById('q') && !!document.getElementById('howto');
      } finally {
        history.replaceState(null, '', href);
        route();
      }
    });
    check('example search fills the search box', () => {
      const href = location.href;
      try {
        history.replaceState(null, '', location.pathname + location.search + '#');
        route();
        exSearch('migraine');
        const q = document.getElementById('q');
        const r = document.getElementById('res');
        const ok = q.value === 'migraine' && !r.hidden && /migraine/i.test(r.textContent);
        q.value = ''; r.hidden = true;
        return ok;
      } finally {
        history.replaceState(null, '', href);
        route();
      }
    });
    check('disease page shows evidence legend and jump chips', () => {
      const href = location.href;
      try {
        history.replaceState(null, '', location.pathname + location.search + '#d/asthma');
        route();
        const app = document.getElementById('app');
        const chips = app.querySelectorAll('.jchips button');
        return !!app.querySelector('.evlg summary') && chips.length >= 3
          && !!app.querySelector('section.sec#sec-definition, div.sec#sec-definition');
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

    check('diagram renders for a curated disease', () => {
      const html = dgS(get('mi'));
      return /class='dgm/.test(html) && /data-d='heartx'/.test(html);
    });
    check('diagram fallback renders for an organ-tagged disease', () => {
      const html = dgS(get('t2dm'));
      return /class='dgm/.test(html) && /data-d='gi'/.test(html) && /Small intestine|Pancreas/.test(html);
    });
    check('retired grouped views are no longer reachable', () => !/data-d='(?:pelvis|pelvisx|knee|uro|breast|kidney)'/.test(dgS(get('gdm'))));
    check('disease with no mapping renders no diagram section', () => dgS(get('ida')) === '');
    check('diagram coverage is 1,910 of 2,494 live pages', () => {
      const live = D.filter(d => !d.stub && !d.del);
      return live.length === 2494 && live.filter(d => dgS(d).length > 0).length === 1910;
    });
    check('every gi diagram highlight names a real plate part', () => Object.entries(DGM)
      .filter(([, m]) => m[0] === 'gi')
      .every(([, m]) => m[1].every(k => !!DG.gi.p[k.replace(/^[-*]+/, '')])));
    check('small intestine has a hover description', () => typeof DGD !== 'undefined' && !!DGD['gi.sintestine']);
    check('retired and superseded plates are gone', () => ['heart2', 'thyroid2', 'respiratory2', 'alveoli2', 'brain2', 'spleen2', 'pituitary2', 'kidney', 'uro', 'pelvis', 'pelvisx', 'knee', 'breast', 'preg']
      .every(k => !DG[k]));
    check('every curated diagram mapping resolves to real parts', () => Object.entries(DGM).every(([, m]) =>
      DG[m[0]] && m[1].every(k => DG[m[0]].p[k.replace(/^[-*]+/, '')])));
    check('digestive system fallback resolves to the GI plate', () => {
      const m = dgF({ sys: 'Digestive', org: '' });
      return !!m && m[0] === 'gi' && m[1].includes('sintestine');
    });
    check('retained organ set is kidney2, breast2 and the approved views', () => ['kidney2', 'breast2', 'heart', 'heartx', 'lungs', 'brain', 'brainx', 'gi', 'eye', 'skin', 'ear', 'neck', 'necka', 'throat', 'hip', 'male', 'spine']
      .every(k => DG[k] && DG[k].p));
    check('every DGM entry points at a live plate', () => Object.entries(DGM).every(([, m]) => !!DG[m[0]]));
    check('every fallback highlight resolves to a real part', () => Object.values(DGFALL).every(m =>
      DG[m[0]] && m[1].every(k => DG[m[0]].p[k.replace(/^[-*]+/, '')])));
    check('kidney coronal section has seven interactive anatomical parts', () => ['parenchyma', 'calyces', 'pelvis', 'ureter', 'vessels', 'adrenal', 'renalvessels']
      .every(k => DG.kidney2.p[k] && DG.kidney2.p[k][0] && !!DGD['kidney2.' + k]));
    check('breast lateral section is labelled and interactive', () => ['lobules', 'fat', 'ribs', 'nipple', 'pectoralis']
      .every(k => DG.breast2.p[k] && !!DGD['breast2.' + k]) && /Lactiferous ducts/.test(dgSvg('breast2', [])));
    check('heart outside view is labelled and keeps the pericardium', () => {
      const h = DG.heart.p.pericardium ? DG.heart : ART2.heart;
      return Object.keys(h.p).length === 14 && /Pericardium/.test(JSON.stringify(h.p)) && !!DGD['heart.pericardium'];
    });
    check('heart interior keeps its four-chamber parts', () => ['ra', 'la', 'rv', 'lv', 'septum', 'tv', 'mv', 'av', 'pv']
      .every(k => DG.heartx.p[k]) && /Interventricular septum/.test(dgSvg('heartx', [])));
    check('gastrointestinal plate has organ-level parts and the owner labels', () => {
      const svg = dgSvg('gi', []), keys = new Set([...svg.matchAll(/class='pt' data-k='([^']+)'/g)].map(m => m[1]));
      return Object.keys(DG.gi.p).length === 14 && keys.size === 14
        && ['esophagus', 'liver', 'stomach', 'pancreas', 'sintestine', 'asc', 'trans', 'desc', 'sig', 'appendix', 'rectum'].every(k => DG.gi.p[k] && DGD['gi.' + k])
        && /Oesophagus/.test(svg) && /Rectum and anal canal/.test(svg) && /Transverse colon/.test(svg);
    });
    check('female pelvis is the single labelled plate and has live mappings', () => Object.keys(DG.pelvis2.p).length === 8
      && ['cervix', 'vagina', 'ovaryL', 'ovaryR', 'tubeL', 'tubeR', 'myometrium', 'endometrium'].every(k => DG.pelvis2.p[k])
      && Object.entries(DGM).some(([, m]) => m[0] === 'pelvis2'));

    check('diagram labels and interactive parts stay inside their view boxes', () => {
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:800px;visibility:hidden';
      host.innerHTML = Object.keys(DG).map(k => dgSvg(k, [])).join('');
      document.body.appendChild(host);
      try {
        return [...host.querySelectorAll('svg.dgm')].every(svg => {
          const vb = svg.getAttribute('viewBox').trim().split(/[\s,]+/).map(Number);
          const inv = svg.getScreenCTM().inverse();
          const inside = el => {
            const r = el.getBoundingClientRect();
            const a = new DOMPoint(r.left, r.top).matrixTransform(inv);
            const b = new DOMPoint(r.right, r.bottom).matrixTransform(inv);
            return a.x >= vb[0] - .5 && a.y >= vb[1] - .5 && b.x <= vb[0] + vb[2] + .5 && b.y <= vb[1] + vb[3] + .5;
          };
          return [...svg.querySelectorAll('text,g.pt')].every(inside);
        });
      } finally {
        host.remove();
      }
    });
    check('diagram SVG references resolve and interactive groups are not empty', () => {
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:800px;visibility:hidden';
      host.innerHTML = Object.keys(DG).map(k => dgSvg(k, [])).join('');
      document.body.appendChild(host);
      try {
        return [...host.querySelectorAll('svg.dgm')].every(svg => {
          const ids = new Set([...svg.querySelectorAll('[id]')].map(el => el.id));
          const refs = [...svg.outerHTML.matchAll(/url\(#([^)]+)\)|href=["']#([^"']+)["']/g)].map(m => m[1] || m[2]);
          return refs.every(id => ids.has(id)) && [...svg.querySelectorAll('g.pt')].every(el => el.children.length > 0);
        });
      } finally {
        host.remove();
      }
    });

    const el = panel();
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Test results');
    return results.slice();
  };

  window.runAtlasTests = run;
  if (/[?&]test=1(?:&|$)/.test(location.search) || /^#(?:test|tests)$/.test(location.hash)) setTimeout(run, 400);
})();

/* Whole-page quality rating (one per disease). A "why" box appears at 1-2 stars
   and feeds the same local review queue as "Suggest a correction". No server:
   ratings and feedback stay on this device; Copy lets the user send it on. */
(() => {
  'use strict';
  const KEY = 'daRate';
  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '{}');
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch (e) { return {}; }
  };
  const store = read();
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

  function currentId() {
    const m = /^#d\/([^/?#]+)/.exec(location.hash);
    if (!m) return null;
    const id = decodeURIComponent(m[1]);
    return (typeof get === 'function' && get(id)) ? id : null;
  }

  function paint(bar) {
    const rec = store[bar.dataset.k] || { s: 0, n: 0, mine: 0 };
    bar.querySelectorAll('[data-v]').forEach(b => {
      const v = Number(b.dataset.v);
      b.classList.toggle('on', v <= rec.mine);
      b.setAttribute('aria-pressed', String(v === rec.mine));
    });
    const out = bar.querySelector('.rt-avg');
    if (!rec.n) out.textContent = 'No ratings yet';
    else out.textContent = (rec.s / rec.n).toFixed(1) + ' / 5 · ' + rec.n + (rec.n === 1 ? ' rating' : ' ratings');
    bar.classList.toggle('mine', !!rec.mine);
    const why = bar.querySelector('.rt-why');
    if (why) why.hidden = !(rec.mine === 1 || rec.mine === 2);
  }

  function init() {
    const id = currentId();
    if (!id) return;
    const page = document.querySelector('#app .page');
    if (!page || page.querySelector(':scope > .rate')) return;
    const bar = document.createElement('div');
    bar.className = 'rate rate-page';
    bar.dataset.k = id;
    bar.innerHTML = `<span class="rt-lbl">Rate this page</span><span class="rt-stars" role="group" aria-label="Rate this disease page">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-v="${v}" aria-label="${v} out of 5" title="${v} out of 5">★</button>`).join('')}</span><span class="rt-avg note" aria-live="polite"></span><div class="rt-why" hidden><label for="rtw">Sorry this page fell short. Tell the creator why:</label><textarea id="rtw" rows="3" maxlength="2000" placeholder="What was missing, unclear or wrong?"></textarea><p><button type="button" class="rt-send">Send feedback</button> <button type="button" class="rt-copy">Copy</button></p><p class="note rt-msg" aria-live="polite">Disease Atlas has no server, so this is saved on this device. Use Copy to send it to the creator.</p></div>`;
    page.appendChild(bar);
    paint(bar);
  }

  document.addEventListener('click', e => {
    const star = e.target.closest('.rate [data-v]');
    if (star) {
      const bar = star.closest('.rate');
      const k = bar.dataset.k;
      const v = Number(star.dataset.v);
      const rec = store[k] || { s: 0, n: 0, mine: 0 };
      if (rec.mine) rec.s += v - rec.mine;
      else { rec.n += 1; rec.s += v; }
      rec.mine = v;
      store[k] = rec;
      write();
      paint(bar);
      return;
    }
    const send = e.target.closest('.rt-send');
    const copy = e.target.closest('.rt-copy');
    if (!send && !copy) return;
    const bar = e.target.closest('.rate');
    if (!bar) return;
    const id = bar.dataset.k;
    const ta = bar.querySelector('#rtw');
    const msg = bar.querySelector('.rt-msg');
    const rec = store[id] || { mine: 0 };
    const d = typeof get === 'function' ? get(id) : null;
    const text = ta.value.trim();
    const payload = `Disease Atlas page rating\nPage: ${d ? d.n : id} (${id})\nRating: ${rec.mine}/5\n\n${text}`;
    if (copy) {
      if (navigator.clipboard) navigator.clipboard.writeText(payload).then(
        () => { msg.textContent = 'Copied. Paste it into an email or message to the creator.'; },
        () => { msg.textContent = 'Copy is not available in this browser.'; }
      );
      else msg.textContent = 'Copy is not available in this browser.';
      return;
    }
    if (text.length < 5) { msg.textContent = 'Please write a little more so the creator can act on it.'; return; }
    S.fb.push({ id, s: 'Page rating ' + rec.mine + '/5', t: text, r: '', at: Date.now() });
    save();
    ta.value = '';
    msg.textContent = 'Thank you. Saved to the review queue on this device (' + S.fb.length + ' pending). Use Copy to send it to the creator.';
  });

  const app = document.getElementById('app');
  if (app && 'MutationObserver' in window) {
    new MutationObserver(() => { init(); }).observe(app, { childList: true });
  }
  DA.rateInit = init;
  init();
})();
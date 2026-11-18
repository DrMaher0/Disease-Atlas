/* Compare page: pick up to 5 or 10 diseases and see them side by side in a grid. */
'use strict';

const CMP = [];          // selected ids, in pick order
let CMPN = 5;            // max diseases to compare (5 or 10)
const CMPROWS = [['ov','Overview'],['sy','Symptoms'],['sg','Clinical signs'],['rf','Risk factors'],['inv','Tests and investigations'],['tx','Treatment'],['cx','Complications']];

function cmpMatches(q) {
  const s = q.toLowerCase().trim();
  return D.filter(d => gzv(d) && (!s || (d.n + ' ' + (d.alt || '') + ' ' + d.sys).toLowerCase().includes(s))).slice(0, 40);
}

function cmpRes() {
  const q = ($('#cmpq') || {}).value || '';
  return cmpMatches(q).map(d => {
    const on = CMP.includes(d.id), full = CMP.length >= CMPN && !on;
    return `<button data-cid='${d.id}' class='cmpadd${on ? ' on' : ''}${full ? ' full' : ''}'>${on ? '&#10003; ' : '+ '}${ea(d.n)}<small>${ea(d.sys)}</small></button>`;
  }).join('') || '<p class="note">No matches.</p>';
}

function cmpGrid() {
  if (!CMP.length) return `<p class="note">Search above and tap diseases to add them, then compare them side by side.</p>`;
  const cols = CMP.map(get);
  const head = `<tr><th class='cmpf'>Disease</th>${cols.map(d => `<th><span data-dgo='${d.id}' class='cmpgo' title='Open ${ea(d.n)}'>${dic(d)}${ea(d.n)}</span><button data-cmx='${d.id}' aria-label='Remove ${ea(d.n)}'>&times;</button></th>`).join('')}</tr>`;
  const sevRow = cols.map(d => { const v = sev(d); return `<td><span class='badge' style='color:${SEVC[v[0]]}'>${v[0]}/10</span>${v[1] == 'E' ? ` <em class='bd e'>Emergency</em>` : v[1] == 'U' ? ` <em class='bd u'>Urgent</em>` : ''}</td>`; }).join('');
  const rows = [
    `<tr><th class='cmpf'>Category</th>${cols.map(d => `<td>${ea(d.sys)} &rsaquo; ${ea(subOf(d))}</td>`).join('')}</tr>`,
    `<tr><th class='cmpf'>Severity</th>${sevRow}</tr>`,
    ...CMPROWS.map(([f, lab]) => `<tr><th class='cmpf'>${lab}</th>${cols.map(d => { const a = d[f]; if (typeof a == 'string') return `<td>${ea(a)}</td>`; if (!a || !a.length) return `<td><span class='note'>&ndash;</span></td>`; const sh = a.slice(0, 6); return `<td>${sh.map(ea).join('<br>')}${a.length > 6 ? `<small>+${a.length - 6} more</small>` : ''}</td>`; }).join('')}</tr>`)
  ];
  return `<div class='cmpw'><table class='cmp'>${head}${rows.join('')}</table></div>`;
}

function cmpR() {
  const r = $('#cmpr'), g = $('#cmpg'), n = $('#cmpn');
  if (r) r.innerHTML = cmpRes();
  if (g) g.innerHTML = cmpGrid();
  if (n) n.textContent = `${CMP.length} of ${CMPN} selected`;
  document.querySelectorAll('[data-clim]').forEach(b => b.classList.toggle('on', +b.dataset.clim == CMPN));
}

function cmpPage() {
  return `<div class='page cmp'><h1 style='font-size:2rem'>${I('split')} Compare Diseases</h1><p class='note'>Pick diseases to see them side by side. Everything runs on your device.</p>
  <div class='sec cmpctl'><input id='cmpq' placeholder='Search diseases by name or category' autocomplete='off'>
  <div class='cmpopts'><b>Compare up to</b> <button data-clim='5' class='afc on'>5</button> <button data-clim='10' class='afc'>10</button> <span id='cmpn' class='note'></span></div>
  <div id='cmpr' class='cmpr'></div></div>
  <div id='cmpg' class='sec'></div></div>`;
}

document.addEventListener('input', e => { if (e.target && e.target.id == 'cmpq') { const r = $('#cmpr'); if (r) r.innerHTML = cmpRes(); } });
document.addEventListener('click', e => {
  const clim = e.target.closest('[data-clim]');
  if (clim && e.target.closest('.cmp')) { CMPN = +clim.dataset.clim; while (CMP.length > CMPN) CMP.pop(); cmpR(); return; }
  const add = e.target.closest('[data-cid]');
  if (add) {
    const id = add.dataset.cid, i = CMP.indexOf(id);
    if (i >= 0) CMP.splice(i, 1);
    else if (CMP.length >= CMPN) return;
    else CMP.push(id);
    cmpR(); return;
  }
  const rm = e.target.closest('[data-cmx]');
  if (rm) { const i = CMP.indexOf(rm.dataset.cmx); if (i >= 0) CMP.splice(i, 1); cmpR(); return; }
  const go = e.target.closest('[data-dgo]');
  if (go) location.hash = '#d/' + go.dataset.dgo;
});

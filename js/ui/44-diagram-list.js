/* Public gallery of every anatomical diagram. */
function dgLocalBtn() {
  return `<button class="qac-b" onclick="go('diagrams')" aria-label="All diagrams" title="All diagrams">${I('body')}</button>`;
}

/* Standalone SVG from the same vector markup used on the page (no raster image). */
function dgStandalone(k) {
  const g = DG[k];
  if (!g) return '';
  const s = dgSvg(k, []);
  const inner = s.slice(s.indexOf('>') + 1, s.lastIndexOf('</svg>'));
  const vb = (g.vb || '0 0 100 100').split(/\s+/);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.vb || '0 0 100 100'}" width="${vb[2] || 100}" height="${vb[3] || 100}">${inner}</svg>`;
}

function dgBlob(k) {
  return new Blob([dgStandalone(k)], { type: 'image/svg+xml' });
}

function dgDownload(k) {
  if (!DG[k]) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(dgBlob(k));
  a.download = k.replace(/[^a-z0-9_-]+/gi, '-') + '.svg';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}

function dgViewLocal(k) {
  if (!DG[k]) return;
  const u = URL.createObjectURL(dgBlob(k));
  const a = document.createElement('a');
  a.href = u;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 60000);
}

function dgListPage() {
  const used = k => Object.keys(DGM).filter(id => DGM[id] && DGM[id][0] === k).length;
  return `<div class="sec"><h2>${I('body')} All anatomical diagrams</h2>
    <p class="note">${Object.keys(DG).length} diagram sets. Tap one to open it.</p>
    <div class="dgl">${Object.entries(DG).map(([k, g]) => `<figure class="dglc" data-g="org/${encodeURIComponent(k)}" tabindex="0" role="button" aria-label="${g.t}"><div class="dgls">${dgSvg(k, [])}</div><figcaption><b>${g.t}</b><small>${k} · used by ${used(k)} disease${used(k) == 1 ? '' : 's'}</small><span class="dglb"><button data-g="org/${encodeURIComponent(k)}">${I('eye')} View locally</button><button onclick="event.stopPropagation();dgDownload('${k}')" aria-label="Download ${g.t} as SVG">${I('doc')} SVG</button></span></figcaption></figure>`).join('')}</div></div>`;
}

function dgOrganPage(k) {
  const g = DG[k];
  if (!g) return `<div class="page"><button data-g="diagrams">&larr; All diagrams</button><p>Diagram not found.</p></div>`;
  const l = D.filter(d => DGM[d.id] && DGM[d.id][0] === k).sort((a, b) => a.n.localeCompare(b.n));
  return `<div class="page"><button data-g="diagrams">&larr; All diagrams</button>
    <div class="sec"><h2>${I('body')} ${g.t}</h2><div class="dgls dgor">${dgSvg(k, [])}</div>
    <div class="dgbtns"><button onclick="dgViewLocal('${k}')">${I('eye')} View locally</button><button onclick="dgDownload('${k}')">${I('doc')} Download SVG</button></div>
    <p class="note">${l.length} disease${l.length == 1 ? '' : 's'} use this diagram.</p></div>
    ${l.length ? `<div class="sq">${sqs(l)}</div>` : ''}</div>`;
}

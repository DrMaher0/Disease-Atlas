invFixAll();
applyEdits();
{const bn=$('#bootn');if(bn)bn.textContent=D.filter(d=>!d.stub&&!d.del).length;}
DA.validateDataset();
dna();
applyS();
renderH();
route();
DA.ready();
let diagramsLoading = false;
function loadDiagrams() {
  if (diagramsLoading || (typeof DG !== 'undefined' && DG.brainx)) return;
  diagramsLoading = true;
  const finish = () => {
    if (location.hash.startsWith('#d/')) {
      const y = window.scrollY;
      route();
      window.scrollTo(0, y);
    }
  };
  const inline = document.getElementById('da-diagrams-data');
  if (inline && inline.textContent.trim()) {
    const url = URL.createObjectURL(new Blob([inline.textContent], { type: 'text/javascript' }));
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => { URL.revokeObjectURL(url); s.remove(); finish(); };
    s.onerror = () => { URL.revokeObjectURL(url); diagramsLoading = false; };
    document.body.appendChild(s);
  } else {
    const s = document.createElement('script');
    s.src = 'js/data/30-body-diagrams.js';
    s.async = true;
    s.onload = finish;
    s.onerror = () => { diagramsLoading = false; };
    document.body.appendChild(s);
  }
}
if ('requestIdleCallback' in window) requestIdleCallback(loadDiagrams, { timeout: 1500 });
else setTimeout(loadDiagrams, 400);
if (/^#tests?$/.test(location.hash) || /(?:^|[?&])test=1(?:&|$)/.test(location.search)) {
  const s = document.createElement('script');
  s.src = 'tests/atlas.test.js';
  s.defer = true;
  s.dataset.atlasTests = '1';
  document.body.appendChild(s);
}

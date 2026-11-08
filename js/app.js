invFixAll();
applyEdits();
DA.validateDataset();
dna();
applyS();
renderH();
route();
DA.ready();
if (/^#tests?$/.test(location.hash) || /(?:^|[?&])test=1(?:&|$)/.test(location.search)) {
  const s = document.createElement('script');
  s.src = 'tests/atlas.test.js';
  s.defer = true;
  s.dataset.atlasTests = '1';
  document.body.appendChild(s);
}

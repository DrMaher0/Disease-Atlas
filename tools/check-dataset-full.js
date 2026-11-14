const fs = require('fs');

const allFiles = [
  'js/core/00-security.js',
  'js/data/01-seed.js',
  'js/core/02-state.js',
  'js/ui/03-views.js',
  'js/core/04-router.js',
  'js/core/05-background.js',
  'js/data/06-organs.js',
  'js/data/07-diseases-core.js',
  'js/ui/08-icons.js',
  'js/data/09-diseases-batch2.js',
  'js/ui/10-profile.js',
  'js/ui/11-anatomy-model.js',
  'js/data/12-psychiatry.js',
  'js/ui/13-severity-world.js',
  'js/data/14-infectious-a.js',
  'js/ui/15-library.js',
  'js/data/16-paediatrics.js',
  'js/ui/17-organisms-3d.js',
  'js/ui/18-outcomes.js',
  'js/data/19-physiological.js',
  'js/core/20-sources-auth-fx.js',
  'js/data/21-anatomy-qs.js',
  'js/data/22-ent.js',
  'js/data/23-physiological-extended.js',
  'js/ui/24-categories.js',
  'js/data/25-host-art.js',
  'js/ui/26-editor.js',
  'js/ui/27-diagrams.js',
  'js/data/28-diagrams-extended.js',
  'js/ui/29-art-cycles.js',
  'js/ui/31-requests.js',
  'js/data/32-corpus.js',
  'js/ui/33-final-ui.js',
  'js/core/34-motion-guard.js',
  'js/core/35-enhancements.js',
  'js/core/36-cloud-config.js',
  'js/core/37-cloud.js',
  'js/ui/38-organ-views.js',
  'js/ui/39-ratings.js',
  'js/data/40-ontology.js'
];

const mockEl = () => ({
  style: {},
  dataset: {},
  classList: {
    toggle: () => {},
    contains: () => false,
    add: () => {},
    remove: () => {}
  },
  textContent: '',
  innerHTML: '',
  setAttribute: () => {},
  getAttribute: () => '',
  hasAttribute: () => false,
  addEventListener: () => {},
  appendChild: () => {},
  closest: () => mockEl(),
  get parentElement() { return mockEl(); },
  get nextElementSibling() { return mockEl(); },
  querySelector: () => mockEl(),
  querySelectorAll: () => [],
  insertAdjacentHTML: () => {},
  replaceWith: () => {},
  getContext: () => ({
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {}
  }),
  getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100 }),
  value: ''
});

global.window = global;
global.addEventListener = () => {};
global.removeEventListener = () => {};
global.document = {
  querySelector: mockEl,
  querySelectorAll: () => [],
  getElementById: mockEl,
  createElement: mockEl,
  addEventListener: () => {},
  documentElement: {
    style: { setProperty: () => {} },
    dataset: {},
    classList: { toggle: () => {}, contains: () => false, add: () => {}, remove: () => {} }
  },
  body: mockEl()
};
global.MutationObserver = class {
  constructor() {}
  observe() {}
  disconnect() {}
};
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
global.innerWidth = 1024;
global.innerHeight = 768;
global.scrollY = 0;
global.scrollX = 0;
global.location = { hash: '', search: '', pathname: '' };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.navigator = { userAgent: 'node' };
global.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
global.cv = { style: {} };
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');

let bigCode = allFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n');
const wrapped = '(function(){\n' + bigCode + '\nreturn { D, DA, INV, X, get };\n})()';
const res = eval(wrapped);
console.log('Success! D length:', res.D.length);
const active = res.D.filter(d => !d.stub && !d.del);
console.log('Active non-stub non-del count:', active.length);
const stubs = res.D.filter(d => d.stub);
console.log('Stubs count:', stubs.length);
console.log('\nSystems breakdown:');
const sysCount = {};
active.forEach(d => { sysCount[d.sys] = (sysCount[d.sys] || 0) + 1; });
Object.entries(sysCount).sort((a,b)=>b[1]-a[1]).forEach(([s,c]) => console.log(`  ${s}: ${c}`));

// Let's run DA.validateDataset
const rep = res.DA.validateDataset();
console.log('\nValidation report:', rep);

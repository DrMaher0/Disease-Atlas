const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const re = /src="([^"]+)"/g;
let m;
const scripts = [];
while((m = re.exec(html)) !== null) scripts.push(m[1]);

const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  matchMedia: () => ({ matches: false }),
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: {
    querySelector: () => ({ style: {}, classList: { toggle: () => {} }, textContent: '' }),
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener: () => {},
    documentElement: { style: { setProperty: () => {} }, dataset: {}, classList: { toggle: () => {} } },
    body: { appendChild: () => {} }
  },
  location: { hash: '', search: '', pathname: '' },
  navigator: { userAgent: 'node' },
  cv: { style: {} }
};
sandbox.window = sandbox;
sandbox.global = sandbox;

const context = vm.createContext(sandbox);

for (const s of scripts) {
  if (s.startsWith('tests/')) continue;
  if (s === 'js/app.js') continue;
  const code = fs.readFileSync(s, 'utf8');
  try {
    vm.runInContext(code, context, { filename: s });
  } catch (err) {
    console.error('Error running ' + s + ':', err.message);
  }
}

console.log('\n--- VM EVALUATION RESULT ---');
console.log('D is array:', Array.isArray(sandbox.D));
console.log('D length:', sandbox.D ? sandbox.D.length : 0);
if (sandbox.D) {
  const active = sandbox.D.filter(d => !d.stub && !d.del);
  console.log('Active diseases count:', active.length);
  const stubs = sandbox.D.filter(d => d.stub);
  console.log('Stubs count:', stubs.length);
  const dels = sandbox.D.filter(d => d.del);
  console.log('Deleted count:', dels.length);

  const sysCounts = {};
  active.forEach(d => {
    sysCounts[d.sys] = (sysCounts[d.sys] || 0) + 1;
  });
  console.log('Counts per system:');
  Object.entries(sysCounts).sort((a,b)=>b[1]-a[1]).forEach(([sys, cnt]) => {
    console.log(`  ${sys}: ${cnt}`);
  });
}

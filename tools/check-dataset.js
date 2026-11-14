const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const re = /src="([^"]+)"/g;
let m;
const scripts = [];
while((m = re.exec(html)) !== null) scripts.push(m[1]);

global.window = global;
global['$'] = (sel) => null;
global['$$'] = (sel) => [];
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: () => {},
  documentElement: { setAttribute: () => {} },
  body: { appendChild: () => {} }
};
global.location = { hash: '', search: '', pathname: '' };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.navigator = { userAgent: 'node' };

for (const s of scripts) {
  if (s.startsWith('tests/')) continue;
  if (s === 'js/app.js') continue;
  const code = fs.readFileSync(s, 'utf8');
  try {
    eval(code);
  } catch (err) {
    console.error('Error in ' + s + ':', err.message);
  }
}

console.log('D is array:', Array.isArray(global.D));
console.log('Total D entries:', global.D ? global.D.length : 0);
const valid = global.D ? global.D.filter(d => !d.stub && !d.del) : [];
console.log('Active non-stub non-del count:', valid.length);

const sysCounts = {};
valid.forEach(d => {
  sysCounts[d.sys] = (sysCounts[d.sys] || 0) + 1;
});
console.log('Counts per system:');
Object.entries(sysCounts).sort((a,b)=>b[1]-a[1]).forEach(([sys, cnt]) => {
  console.log(`  ${sys}: ${cnt}`);
});

console.log('\nSample disease keys:');
if (valid.length > 0) {
  console.log(Object.keys(valid[0]));
  console.log('Sample entry:', valid[0]);
}

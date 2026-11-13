// GhostLedger UI smoke test — jsdom, no live browser needed.
// Written by the rebuild agent for verification (NOT Kiro-generated).
// Run: npm install jsdom (in a scratch dir, not in this repo), then:
//   NODE_PATH=/path/to/node_modules node docs/ui-smoke-check.js
// Expects jsdom to be resolvable; 22 checks, 0 failures on 2026-11-06.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIR = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const engineJs = fs.readFileSync(path.join(DIR, 'engine.js'), 'utf8');
const appJs = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});
const { window } = dom;
window.console.error = (...a) => errors.push(a.join(' '));
window.console.warn = () => {};
// jsdom has no canvas 2d by default; leave as-is to test the text-table fallback.
dom.window.eval(engineJs);
dom.window.eval(appJs);

const doc = window.document;
// app.js only wires up on DOMContentLoaded; jsdom already fired it before
// our eval, so dispatch it manually (a real browser fires it after parsing).
doc.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
const $ = (id) => doc.getElementById(id);
const txt = (id) => $(id).textContent.trim();
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra || ''); }
}

// 1. Load sample
$('load-sample').click();
check('import report mentions 180', /180/.test(txt('import-report')), txt('import-report'));
check('stat income $19,200.00', txt('stat-income') === '$19,200.00', txt('stat-income'));
check('stat ghosts $361.42/mo', txt('stat-ghosts') === '$361.42', txt('stat-ghosts'));
check('stat ghosts sub mentions 11 recurring', /11 recurring/.test(txt('stat-ghosts-sub')), txt('stat-ghosts-sub'));
check('ghost list has 11 cards', doc.querySelectorAll('#ghost-list .gl-ghost-card').length === 11,
  'got ' + doc.querySelectorAll('#ghost-list .gl-ghost-card').length);
check('trend table has 6 month rows', doc.querySelectorAll('#trend-table tbody tr').length === 6,
  'got ' + doc.querySelectorAll('#trend-table tbody tr').length);
check('txn count is 180', txt('txn-count') === '180', txt('txn-count'));
check('budget list has 8 rows', doc.querySelectorAll('#budget-list [data-budget]').length === 8,
  'got ' + doc.querySelectorAll('#budget-list [data-budget]').length);

// 2. Exorcise FitZone Gym (first ghost card's button)
const btns = [...doc.querySelectorAll('#ghost-list [data-exorcise]')];
const fitBtn = btns.find(b => b.getAttribute('data-exorcise') === 'fitzone gym');
check('fitzone exorcise button exists', !!fitBtn);
if (fitBtn) {
  fitBtn.click();
  check('after exorcise, ghosts $331.43/mo', txt('stat-ghosts') === '$331.43', txt('stat-ghosts'));
check('after exorcise, 11 ghost cards still listed', doc.querySelectorAll('#ghost-list .gl-ghost-card').length === 11, 'got ' + doc.querySelectorAll('#ghost-list .gl-ghost-card').length);
check('fitzone card now offers Restore', [...doc.querySelectorAll('#ghost-list [data-exorcise]')].some(b => b.getAttribute('data-exorcise') === 'fitzone gym' && /Restore/i.test(b.textContent)), 'no restore button');
  check('savings banner shows $359.88/yr', /\$359\.88/.test(txt('savings-banner')), txt('savings-banner'));
}

// 3. Search netflix
$('txn-search').value = 'netflix';
$('txn-search').dispatchEvent(new window.Event('input', { bubbles: true }));
check('search netflix shows 6 rows', doc.querySelectorAll('#txn-body tr').length === 6,
  'got ' + doc.querySelectorAll('#txn-body tr').length);
$('txn-search').value = '';
$('txn-search').dispatchEvent(new window.Event('input', { bubbles: true }));

// 4. Budget change persists (Groceries input -> 500 dollars)
const budgetInput = doc.querySelector('[data-budget="Groceries"]');
check('groceries budget input exists', !!budgetInput);
if (budgetInput) {
  budgetInput.value = '500';
  budgetInput.dispatchEvent(new window.Event('change', { bubbles: true }));
  const saved = JSON.parse(window.localStorage.getItem('ghostledger.v1'));
  check('budget persists as 50000 cents', saved && saved.budgets && saved.budgets.Groceries === 50000,
    JSON.stringify(saved && saved.budgets));
}

// 5. Category override persists
const sel = doc.querySelector('#txn-body [data-override]');
check('txn category override select exists', !!sel);
if (sel) {
  sel.value = 'Health';
  sel.dispatchEvent(new window.Event('change', { bubbles: true }));
  const saved = JSON.parse(window.localStorage.getItem('ghostledger.v1'));
  check('override persisted', saved && saved.overrides && Object.keys(saved.overrides).length === 1,
    JSON.stringify(saved && saved.overrides));
}

// 6. Clear data
window.confirm = () => true;
$('clear-data').click();
check('after clear, 0 transactions shown', txt('txn-count') === '0', txt('txn-count'));
check('after clear, report says cleared', /cleared/i.test(txt('import-report')), txt('import-report'));
check('after clear, income $0.00', txt('stat-income') === '$0.00', txt('stat-income'));

check('zero console errors', errors.length === 0, errors.join(' | '));
console.log(`\nSMOKE: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

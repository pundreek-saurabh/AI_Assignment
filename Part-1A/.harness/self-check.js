'use strict';
/**
 * Part 1A — Harness Self-Check
 *
 * Proves that each gate CAN produce a FAIL result.  7.6 of MENTOR.md.
 * Uses deliberately broken temporary files — these are NOT development
 * failures and must NOT appear in harness-log.md as genuine findings.
 *
 * Usage: node .harness/self-check.js
 * Exit 0 if all checks pass (each gate fails on bad input, passes on good).
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd: cwd || ROOT, encoding: 'utf-8', shell: true });
  return { code: r.status === null ? 1 : r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function tmpFile(content, ext) {
  const f = path.join(os.tmpdir(), `selfcheck-${Date.now()}${ext}`);
  fs.writeFileSync(f, content, 'utf-8');
  return f;
}

const results = [];

function check(label, expectPass, actual) {
  const ok = expectPass ? actual === 0 : actual !== 0;
  results.push({ label, expectPass, exitCode: actual, ok });
  const icon = ok ? '✅' : '❌';
  const want = expectPass ? 'PASS (exit 0)' : 'FAIL (exit ≠0)';
  console.log(`  ${icon} [${label}] expected=${want} got exit ${actual}`);
}

console.log('\n=== Part 1A — Harness Self-Check ===\n');

// ---------------------------------------------------------------------------
// Gate 1 (Lint) — should FAIL on a file with `var` declaration
// ---------------------------------------------------------------------------
console.log('Gate 1 Lint: bad input (uses var)');
const lintBad = tmpFile("'use strict';\nvar x = 1;\nmodule.exports = x;\n", '.js');
const r1bad = run('node', ['node_modules/eslint/bin/eslint.js', lintBad, '--config', '.eslintrc.lint.json', '--max-warnings', '0'], ROOT);
check('Gate1-Lint-BAD', false, r1bad.code);
fs.unlinkSync(lintBad);

console.log('Gate 1 Lint: good input (uses const)');
const lintGood = tmpFile("'use strict';\nconst x = 1;\nmodule.exports = x;\n", '.js');
const r1good = run('node', ['node_modules/eslint/bin/eslint.js', lintGood, '--config', '.eslintrc.lint.json', '--max-warnings', '0'], ROOT);
check('Gate1-Lint-GOOD', true, r1good.code);
fs.unlinkSync(lintGood);

// ---------------------------------------------------------------------------
// Gate 2 (Security) — should FAIL on a file with eval()
// ---------------------------------------------------------------------------
console.log('\nGate 2 Security: bad input (uses eval)');
const secBad = tmpFile("'use strict';\nconst f = (x) => eval(x);\nmodule.exports = f;\n", '.js');
const r2bad = run('node', ['node_modules/eslint/bin/eslint.js', secBad, '--config', '.eslintrc.security.json', '--max-warnings', '0'], ROOT);
check('Gate2-Security-BAD', false, r2bad.code);
fs.unlinkSync(secBad);

console.log('Gate 2 Security: good input (no eval, no object injection)');
const secGood = tmpFile("'use strict';\nconst add = (a, b) => a + b;\nmodule.exports = add;\n", '.js');
const r2good = run('node', ['node_modules/eslint/bin/eslint.js', secGood, '--config', '.eslintrc.security.json', '--max-warnings', '0'], ROOT);
check('Gate2-Security-GOOD', true, r2good.code);
fs.unlinkSync(secGood);

// ---------------------------------------------------------------------------
// Gate 3 (Tests) — should FAIL on a test with a failing assertion
// ---------------------------------------------------------------------------
console.log('\nGate 3 Tests: bad input (failing assertion)');
const testBadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'selfcheck-tests-'));
const testBadFile = path.join(testBadDir, 'bad.test.js');
fs.writeFileSync(testBadFile, [
  "'use strict';",
  "const { test } = require('node:test');",
  "const assert = require('node:assert/strict');",
  "test('deliberate fail', () => { assert.strictEqual(1, 2, 'self-check: intentional failure'); });",
].join('\n'), 'utf-8');
const r3bad = run('node', ['--test', testBadFile]);
check('Gate3-Tests-BAD', false, r3bad.code);
fs.rmSync(testBadDir, { recursive: true });

console.log('Gate 3 Tests: good input (passing assertion)');
const testGoodDir = fs.mkdtempSync(path.join(os.tmpdir(), 'selfcheck-tests-'));
const testGoodFile = path.join(testGoodDir, 'good.test.js');
fs.writeFileSync(testGoodFile, [
  "'use strict';",
  "const { test } = require('node:test');",
  "const assert = require('node:assert/strict');",
  "test('deliberate pass', () => { assert.strictEqual(1, 1); });",
].join('\n'), 'utf-8');
const r3good = run('node', ['--test', testGoodFile]);
check('Gate3-Tests-GOOD', true, r3good.code);
fs.rmSync(testGoodDir, { recursive: true });

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------
console.log('\n--- Self-Check Summary ---');
console.log('Label                     | Expected  | Exit | OK');
console.log('--------------------------|-----------|------|----');
for (const r of results) {
  const label = r.label.padEnd(26);
  const want = (r.expectPass ? 'PASS' : 'FAIL').padEnd(9);
  console.log(`${label} | ${want} | ${String(r.exitCode).padEnd(4)} | ${r.ok ? '✅' : '❌'}`);
}

const allOk = results.every((r) => r.ok);
console.log(`\nSelf-check: ${allOk ? '✅ All 6 checks passed' : '❌ Some checks failed'}\n`);
process.exit(allOk ? 0 : 1);

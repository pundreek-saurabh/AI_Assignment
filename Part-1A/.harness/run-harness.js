'use strict';
/**
 * Part 1A — Master Harness Runner
 *
 * Runs 3 gates sequentially. Dynamic gate (Gate 3) runs ONLY if both static
 * gates pass. Writes a JSON report to evidence/harness-results/run-N/report.json.
 * Exits 0 on full pass, non-zero on any failure.
 *
 * Usage: node .harness/run-harness.js
 *
 * Lab 2 §5 reference: static sensor → dynamic test execution → audit log.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EVIDENCE = path.join(ROOT, 'evidence', 'harness-results');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timestamp() {
  return new Date().toISOString();
}

/** Find the next run-N directory (run-1, run-2, …) */
function nextRunDir() {
  if (!fs.existsSync(EVIDENCE)) {
    fs.mkdirSync(EVIDENCE, { recursive: true });
  }
  const existing = fs.readdirSync(EVIDENCE)
    .filter((d) => /^run-\d+$/.test(d))
    .map((d) => parseInt(d.replace('run-', ''), 10));
  const n = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  const dir = path.join(EVIDENCE, `run-${n}`);
  fs.mkdirSync(dir, { recursive: true });
  return { dir, n };
}

/** Run a shell command and return { exitCode, stdout, stderr } */
function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd: cwd || ROOT, encoding: 'utf-8', shell: true });
  return {
    exitCode: result.status === null ? 1 : result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

/** Parse ESLint JSON output into findings array */
function parseEslintFindings(stdout, gate) {
  const findings = [];
  try {
    const results = JSON.parse(stdout);
    for (const fileResult of results) {
      for (const msg of fileResult.messages) {
        findings.push({
          code: msg.ruleId || 'UNKNOWN_RULE',
          message: msg.message,
          file: path.relative(ROOT, fileResult.filePath),
          line: msg.line,
          gate,
        });
      }
    }
  } catch (_) {
    // ESLint may not output JSON if there's a config error
    if (stdout.trim()) {
      findings.push({ code: 'ESLINT_PARSE_ERROR', message: stdout.trim(), gate });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------
// 'node_modules/.bin/eslint' : false
// 'node_modules/eslint/bin/eslint.js' : true
// line 88, 108
function runLintGate() {
  console.log('\n📐 Gate 1 — Lint (ESLint)');
  const { exitCode, stdout, stderr } = run(
    'node',
    ['node_modules/eslint/bin/eslint.js', 'src/', 'tests/', '--config', '.eslintrc.lint.json',
      '--max-warnings', '0', '--format', 'json'],
    
    ROOT
  );
  const findings = parseEslintFindings(stdout, 'lint');
  const passed = exitCode === 0 && findings.length === 0;
  console.log(passed ? '  ✅ PASS — zero lint findings' : `  ❌ FAIL — ${findings.length} finding(s)`);
  if (!passed) {
    for (const f of findings) {
      console.log(`     [${f.code}] ${f.file}:${f.line} — ${f.message}`);
    }
  }
  return { gate: 'lint', passed, findings, stderr };
}

function runSecurityGate() {
  console.log('\n🔒 Gate 2 — Security/SAST (eslint-plugin-security)');
  const { exitCode, stdout, stderr } = run(
    'node',
    ['node_modules/eslint/bin/eslint.js', 'src/', '--config', '.eslintrc.security.json',
      '--max-warnings', '0', '--format', 'json'],
    ROOT
  );
  const findings = parseEslintFindings(stdout, 'security');
  const passed = exitCode === 0 && findings.length === 0;
  console.log(passed ? '  ✅ PASS — zero security findings' : `  ❌ FAIL — ${findings.length} finding(s)`);
  if (!passed) {
    for (const f of findings) {
      console.log(`     [${f.code}] ${f.file}:${f.line} — ${f.message}`);
    }
  }
  return { gate: 'security', passed, findings, stderr };
}

function runTestGate() {
  console.log('\n🧪 Gate 3 — Unit & Contract Tests (node:test)');
  const { exitCode, stdout, stderr } = run(
    'node',
    ['--test', 'tests/'],
    ROOT
  );
  const passed = exitCode === 0;
  console.log(passed ? '  ✅ PASS — all tests passed' : '  ❌ FAIL — one or more tests failed');
  if (!passed) {
    // Print the failing test lines
    const lines = (stdout + stderr).split('\n').filter((l) => l.includes('not ok') || l.includes('FAIL'));
    for (const l of lines) { console.log('    ', l); }
  }
  return {
    gate: 'tests',
    passed,
    exitCode,
    stdout,
    stderr,
    findings: passed ? [] : [{ code: 'TEST_FAILURE', message: 'One or more tests failed. See stdout/stderr.' }],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { dir, n } = nextRunDir();
  const startedAt = timestamp();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Part 1A Harness — Run ${n}    ${startedAt}`);
  console.log(`${'='.repeat(60)}`);

  const gate1 = runLintGate();
  const gate2 = runSecurityGate();

  let gate3 = {
    gate: 'tests',
    passed: false,
    findings: [{ code: 'SKIPPED', message: 'Dynamic tests skipped until static findings are resolved.' }],
    stdout: '',
    stderr: 'Skipped.',
  };

  const staticPassed = gate1.passed && gate2.passed;
  if (staticPassed) {
    gate3 = runTestGate();
  } else {
    console.log('\n🧪 Gate 3 — Tests SKIPPED (static gates must pass first)');
  }

  const overallPassed = gate1.passed && gate2.passed && gate3.passed;

  const report = {
    target: 'src/password-checker.js',
    runNumber: n,
    checkedAt: startedAt,
    completedAt: timestamp(),
    staticPassed,
    dynamicPassed: gate3.passed,
    passed: overallPassed,
    gates: { lint: gate1, security: gate2, tests: gate3 },
    allFindings: [...gate1.findings, ...gate2.findings, ...gate3.findings],
  };

  const reportPath = path.join(dir, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Result: ${overallPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Report: ${path.relative(ROOT, reportPath)}`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(overallPassed ? 0 : 1);
}

main();

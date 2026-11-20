'use strict';
/**
 * Part 1B — Master Evaluation Runner
 *
 * Runs the full 3-layer evaluation pipeline on all cases in evals/dataset.json.
 * Mode: SIMULATION=true (default if no env var set) or live (SIMULATION=false).
 *
 * Usage:
 *   set SIMULATION=true && node .harness/run-evaluation.js
 *
 * Writes: evidence/eval-results.json
 * Exits: 0 on PASS (overall >= 0.80), 1 on FAIL
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { analyzeCommit } = require('../src/commit-analyzer.js');
const { validateLayer1 } = require('./layer1-schema.js');
const { validateLayer2 } = require('./layer2-invariants.js');
const { scoreLayer3 } = require('./layer3-semantic.js');

const DATASET_PATH = path.join(ROOT, 'evals', 'dataset.json');
const EVIDENCE_DIR = path.join(ROOT, 'evidence');

function timestamp() { return new Date().toISOString(); }

async function main() {
  if (!fs.existsSync(EVIDENCE_DIR)) { fs.mkdirSync(EVIDENCE_DIR, { recursive: true }); }

  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf-8'));
  const { cases, threshold } = dataset;
  const mode = process.env.SIMULATION !== 'false' ? 'simulation' : 'live';

  console.log(`\n${'='.repeat(70)}`);
  console.log(`Part 1B Evaluation — ${timestamp()}`);
  console.log(`Mode: ${mode.toUpperCase()} | Cases: ${cases.length} | Threshold: ${threshold.overall}`);
  console.log(`${'='.repeat(70)}\n`);

  const caseResults = [];
  let layer1Violations = 0;
  let layer2Failures = 0;
  const layer3Scores = [];
  const guardrailFailures = [];

  for (const evalCase of cases) {
    process.stdout.write(`  [${evalCase.caseId}] `);

    // Run the application
    let appResult;
    let appError = null;
    try {
      const { result, error } = await analyzeCommit(evalCase.input, evalCase.caseId);
      appResult = result;
      appError = error || null;
    } catch (e) {
      appError = e.message;
      appResult = null;
    }

    if (!appResult) {
      console.log(`❌ App error: ${appError}`);
      caseResults.push({ caseId: evalCase.caseId, appError, layer1: { passed: false }, layer2: { passed: false }, layer3: { score: 0 } });
      layer1Violations++;
      layer3Scores.push(0);
      continue;
    }

    // Layer 1
    const l1 = validateLayer1(appResult, evalCase.caseId);
    if (!l1.passed) { layer1Violations += l1.findings.length; }

    // Layer 2 (runs even if L1 has findings, to show all issues)
    const l2 = validateLayer2(appResult, evalCase);
    if (!l2.passed) {
      layer2Failures++;
      if (evalCase.guardrail) { guardrailFailures.push(evalCase.caseId); }
    }

    // Layer 3
    const l3 = scoreLayer3(appResult, evalCase);
    layer3Scores.push(l3.score);

    const icon = l1.passed && l2.passed ? '✅' : '❌';
    console.log(`${icon} L1:${l1.passed ? 'PASS' : 'FAIL'} L2:${l2.passed ? 'PASS' : 'FAIL'} L3:${l3.score.toFixed(2)}`);

    caseResults.push({
      caseId: evalCase.caseId,
      category: evalCase.category,
      input: evalCase.input,
      output: appResult,
      layer1: l1,
      layer2: l2,
      layer3: l3,
      appError,
    });
  }

  // Aggregate scores (from specification.md threshold definition)
  const layer1Score = 1 - (Math.min(layer1Violations, cases.length) / cases.length);
  const layer2Score = (cases.length - layer2Failures) / cases.length;
  const layer3Score = layer3Scores.reduce((a, b) => a + b, 0) / layer3Scores.length;
  const overallScore = (layer1Score * 0.40) + (layer2Score * 0.40) + (layer3Score * 0.20);

  const guardrailPass = guardrailFailures.length === 0;
  const passed = overallScore >= threshold.overall && guardrailPass && layer1Violations === 0;

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Layer 1 (schema)   violations : ${layer1Violations} | score: ${layer1Score.toFixed(3)}`);
  console.log(`Layer 2 (invariants) failures : ${layer2Failures}  | score: ${layer2Score.toFixed(3)}`);
  console.log(`Layer 3 (semantic)  mean score : ${layer3Score.toFixed(3)}`);
  console.log(`Overall weighted score         : ${overallScore.toFixed(3)} (threshold: ${threshold.overall})`);
  console.log(`Guardrail cases               : ${guardrailPass ? 'ALL PASS' : `FAIL (${guardrailFailures.join(', ')})`}`);
  console.log(`\nResult: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`${'='.repeat(70)}\n`);

  const report = {
    runAt: timestamp(),
    mode,
    totalCases: cases.length,
    threshold,
    aggregate: { layer1Score, layer2Score, layer3Score, overallScore, passed, guardrailPass, layer1Violations, layer2Failures },
    cases: caseResults,
  };

  const reportPath = path.join(EVIDENCE_DIR, 'eval-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Report: ${path.relative(ROOT, reportPath)}\n`);

  process.exit(passed ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });

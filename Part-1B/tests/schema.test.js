'use strict';
/**
 * Schema unit tests for Commit Analyzer — Part 1B
 * Tests the validator and simulation layer WITHOUT API calls.
 * Run: node --test tests/
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateSchema } = require('../src/commit-analyzer.js');
const { getSimulatedResult } = require('../src/simulate.js');
const { validateLayer1 } = require('../.harness/layer1-schema.js');

// AC-B-001: Schema validation rejects missing fields
test('AC-B-001a: validateSchema rejects result missing suggestion field', () => {
  const bad = { type: 'feat', scope: null, description: 'x', is_breaking: false, quality_score: 80, issues: [] };
  const { valid } = validateSchema(bad);
  assert.strictEqual(valid, false);
});

// AC-B-001b: Schema validation accepts fully valid result
test('AC-B-001b: validateSchema accepts fully valid result', () => {
  const good = { type: 'feat', scope: null, description: 'add login', is_breaking: false, quality_score: 90, issues: [], suggestion: null };
  const { valid, violations } = validateSchema(good);
  assert.strictEqual(valid, true, `Expected valid, got violations: ${violations.join('; ')}`);
});

// INV-003: type must be from allowed set
test('INV-003: validateLayer1 rejects type not in allowed set', () => {
  const bad = { type: 'merge', scope: null, description: 'x', is_breaking: false, quality_score: 50, issues: [], suggestion: null };
  const { passed, findings } = validateLayer1(bad, 'TEST');
  assert.strictEqual(passed, false);
  assert.ok(findings.some((f) => f.code === 'INVALID_TYPE'));
});

// INV-004: quality_score out of range
test('INV-004: validateLayer1 rejects quality_score > 100', () => {
  const bad = { type: null, scope: null, description: 'x', is_breaking: false, quality_score: 150, issues: [], suggestion: null };
  const { passed, findings } = validateLayer1(bad, 'TEST');
  assert.strictEqual(passed, false);
  assert.ok(findings.some((f) => f.code === 'INVALID_QUALITY_SCORE'));
});

// INV-005: is_breaking must be boolean
test('INV-005: validateLayer1 rejects is_breaking as string', () => {
  const bad = { type: null, scope: null, description: 'x', is_breaking: 'true', quality_score: 0, issues: [], suggestion: null };
  const { passed } = validateLayer1(bad, 'TEST');
  assert.strictEqual(passed, false);
});

// Simulation: all 20 cases return schema-valid results
test('Simulation: all 20 eval case results pass Layer 1 schema validation', () => {
  const caseIds = [
    'CONV-001','CONV-002','CONV-003','CONV-004','CONV-005',
    'CONV-006','CONV-007','CONV-008','CONV-009','CONV-010',
    'BAD-001','BAD-002','BAD-003','BAD-004','BAD-005',
    'BAD-006','BAD-007','BAD-008','EDGE-001','EDGE-002',
    'GUARD-001','GUARD-002','GUARD-003','GUARD-004',
  ];
  for (const id of caseIds) {
    const result = getSimulatedResult(id);
    const { passed, findings } = validateLayer1(result, id);
    assert.strictEqual(passed, true, `Case ${id} failed Layer 1: ${findings.map((f) => f.code).join(', ')}`);
  }
});

// AC-B-004: empty input simulation returns type null, score 0
test('AC-B-004: BAD-004 (empty input) simulation returns type=null, score=0', () => {
  const result = getSimulatedResult('BAD-004');
  assert.strictEqual(result.type, null);
  assert.strictEqual(result.quality_score, 0);
  assert.ok(Array.isArray(result.issues) && result.issues.length > 0);
});

// AC-B-005: guardrail cases return type=null with injection issue
test('AC-B-005: GUARD-001 returns type=null with guardrail issue', () => {
  const result = getSimulatedResult('GUARD-001');
  assert.strictEqual(result.type, null);
  const hasInjectionMsg = result.issues.some(
    (i) => i.toLowerCase().includes('injection') || i.toLowerCase().includes('rejected')
  );
  assert.ok(hasInjectionMsg, 'issues should mention injection or rejected');
});

// AC-B-003: breaking change case has is_breaking=true
test('AC-B-003: CONV-003 (feat!) returns is_breaking=true', () => {
  const result = getSimulatedResult('CONV-003');
  assert.strictEqual(result.is_breaking, true);
  assert.strictEqual(result.type, 'feat');
});

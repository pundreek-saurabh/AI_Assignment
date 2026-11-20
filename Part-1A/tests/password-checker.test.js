'use strict';
/**
 * Tests for Password Policy Checker — Part 1A, SEZG534 Assignment 1
 *
 * Each test covers exactly one acceptance criterion (AC-001 through AC-025).
 * Tests are derived ONLY from specification.md acceptance criteria and
 * clarifications.md — never from implementation internals.  CON-007.
 *
 * Run: node --test tests/
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { check } = require('../src/password-checker.js');

// ---------------------------------------------------------------------------
// AC-001: Minimum length violation — includes required and actual fields
// ---------------------------------------------------------------------------
test('AC-001: short password triggers MIN_LENGTH with correct required and actual', () => {
  const result = check('abc', { minLength: 8 });
  const v = result.violations.find((x) => x.code === 'MIN_LENGTH');
  assert.ok(v, 'MIN_LENGTH violation must be present');
  assert.strictEqual(v.required, 8, 'required should be 8');
  assert.strictEqual(v.actual, 3, 'actual should be 3');
});

// ---------------------------------------------------------------------------
// AC-002: Fully compliant password — no violations, isAcceptable true
// ---------------------------------------------------------------------------
test('AC-002: fully compliant password has no violations and isAcceptable true', () => {
  const result = check('Password1!', {
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
    requireSpecial: true,
  });
  assert.strictEqual(result.violations.length, 0);
  assert.strictEqual(result.isAcceptable, true);
});

// ---------------------------------------------------------------------------
// AC-003: requireUppercase violation
// ---------------------------------------------------------------------------
test('AC-003: all-lowercase password violates MISSING_UPPERCASE when required', () => {
  const result = check('password', { requireUppercase: true });
  const v = result.violations.find((x) => x.code === 'MISSING_UPPERCASE');
  assert.ok(v, 'MISSING_UPPERCASE must be present');
});

// ---------------------------------------------------------------------------
// AC-004: requireLowercase violation
// ---------------------------------------------------------------------------
test('AC-004: all-uppercase password violates MISSING_LOWERCASE when required', () => {
  const result = check('PASSWORD', { requireLowercase: true });
  const v = result.violations.find((x) => x.code === 'MISSING_LOWERCASE');
  assert.ok(v, 'MISSING_LOWERCASE must be present');
});

// ---------------------------------------------------------------------------
// AC-005: requireDigit violation
// ---------------------------------------------------------------------------
test('AC-005: password without digit violates MISSING_DIGIT when required', () => {
  const result = check('Password!', { requireDigit: true });
  const v = result.violations.find((x) => x.code === 'MISSING_DIGIT');
  assert.ok(v, 'MISSING_DIGIT must be present');
});

// ---------------------------------------------------------------------------
// AC-006: requireSpecial violation
// ---------------------------------------------------------------------------
test('AC-006: password without special char violates MISSING_SPECIAL when required', () => {
  const result = check('Password1', { requireSpecial: true });
  const v = result.violations.find((x) => x.code === 'MISSING_SPECIAL');
  assert.ok(v, 'MISSING_SPECIAL must be present');
});

// ---------------------------------------------------------------------------
// AC-007: Entropy > 50 bits for mixed 10-char password
// ---------------------------------------------------------------------------
test('AC-007: 10-char mixed-class password has entropy > 50 bits', () => {
  const result = check('Password1!');
  assert.ok(result.entropy_bits > 50, `entropy_bits should be > 50, got ${result.entropy_bits}`);
});

// ---------------------------------------------------------------------------
// AC-008: Score is always an integer in [0, 100]
// ---------------------------------------------------------------------------
test('AC-008: score is always an integer in range [0, 100]', () => {
  const passwords = ['', 'a', 'Password1!', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'ABC123!@#abc'];
  for (const pw of passwords) {
    const result = check(pw);
    assert.ok(Number.isInteger(result.score), `score must be integer for "${pw}"`);
    assert.ok(result.score >= 0 && result.score <= 100, `score out of range for "${pw}": ${result.score}`);
  }
});

// ---------------------------------------------------------------------------
// AC-009: score < 40 → grade "weak"
// ---------------------------------------------------------------------------
test('AC-009: short password with no variety gets grade "weak"', () => {
  const result = check('abc', { minLength: 8 });
  assert.strictEqual(result.grade, 'weak');
  assert.ok(result.score < 40, `score should be < 40, got ${result.score}`);
});

// ---------------------------------------------------------------------------
// AC-010: score 40-69 → grade "fair"
// ---------------------------------------------------------------------------
test('AC-010: medium-strength password gets grade "fair"', () => {
  // "password12345" = 13 chars, lowercase + digit, 1 violation (COMMON_PASSWORD)
  // score = min(40,39) + 10 + 10 - 5 = 54 → "fair"
  const result = check('password12345', { blockCommon: false });
  assert.ok(result.score >= 40 && result.score < 70,
    `score should be 40-69 for fair grade, got ${result.score}`);
  assert.strictEqual(result.grade, 'fair');
});

// ---------------------------------------------------------------------------
// AC-011: score 70-89 → grade "strong"
// ---------------------------------------------------------------------------
test('AC-011: Password1! (10 chars, all classes) gets grade "strong"', () => {
  const result = check('Password1!', { blockCommon: false });
  assert.ok(result.score >= 70 && result.score < 90,
    `score should be 70-89 for strong grade, got ${result.score}`);
  assert.strictEqual(result.grade, 'strong');
});

// ---------------------------------------------------------------------------
// AC-012: score 90-100 → grade "very_strong"
// ---------------------------------------------------------------------------
test('AC-012: very long mixed-class password gets grade "very_strong"', () => {
  const result = check('SuperLongP@ssw0rdWithLotsOfCharsAndSymb0ls!');
  assert.ok(result.score >= 90, `score should be >= 90 for very_strong, got ${result.score}`);
  assert.strictEqual(result.grade, 'very_strong');
});

// ---------------------------------------------------------------------------
// AC-013: Any violations → isAcceptable false
// ---------------------------------------------------------------------------
test('AC-013: any violation causes isAcceptable to be false', () => {
  const result = check('short', { minLength: 10 });
  assert.ok(result.violations.length > 0, 'should have violations');
  assert.strictEqual(result.isAcceptable, false);
});

// ---------------------------------------------------------------------------
// AC-014: Zero violations → isAcceptable true
// ---------------------------------------------------------------------------
test('AC-014: zero violations means isAcceptable is true', () => {
  const result = check('SuperSecure999!', {
    minLength: 8,
    requireUppercase: true,
    requireDigit: true,
    requireSpecial: true,
    blockCommon: true,
  });
  assert.strictEqual(result.violations.length, 0);
  assert.strictEqual(result.isAcceptable, true);
});

// ---------------------------------------------------------------------------
// AC-015: Empty string → EMPTY_PASSWORD, score 0, grade "weak"
// ---------------------------------------------------------------------------
test('AC-015: empty string gives EMPTY_PASSWORD, score 0, grade weak', () => {
  const result = check('');
  const v = result.violations.find((x) => x.code === 'EMPTY_PASSWORD');
  assert.ok(v, 'EMPTY_PASSWORD must be present');
  assert.strictEqual(result.score, 0);
  assert.strictEqual(result.grade, 'weak');
});

// ---------------------------------------------------------------------------
// AC-016: Repeated characters trigger REPEATED_CHARS
// ---------------------------------------------------------------------------
test('AC-016: "aaabbbccc" with maxRepeatedChars:2 triggers REPEATED_CHARS', () => {
  const result = check('aaabbbccc', { maxRepeatedChars: 2 });
  const v = result.violations.find((x) => x.code === 'REPEATED_CHARS');
  assert.ok(v, 'REPEATED_CHARS must be present');
});

// ---------------------------------------------------------------------------
// AC-017: Common password triggers COMMON_PASSWORD
// ---------------------------------------------------------------------------
test('AC-017: "password" triggers COMMON_PASSWORD with default policy', () => {
  const result = check('password');
  const v = result.violations.find((x) => x.code === 'COMMON_PASSWORD');
  assert.ok(v, 'COMMON_PASSWORD must be present');
});

// ---------------------------------------------------------------------------
// AC-018: MIN_LENGTH violation shows correct required and actual
// ---------------------------------------------------------------------------
test('AC-018: MIN_LENGTH violation for "Password1!" against minLength:12', () => {
  const result = check('Password1!', { minLength: 12 });
  const v = result.violations.find((x) => x.code === 'MIN_LENGTH');
  assert.ok(v, 'MIN_LENGTH must be present');
  assert.strictEqual(v.required, 12);
  assert.strictEqual(v.actual, 10);
});

// ---------------------------------------------------------------------------
// AC-019: Score does not decrease when character class diversity increases
// ---------------------------------------------------------------------------
test('AC-019: adding character classes to a password does not decrease score', () => {
  const r1 = check('password12345', { blockCommon: false }); // lowercase + digit
  const r2 = check('Password12345', { blockCommon: false }); // + uppercase
  const r3 = check('Password12345!', { blockCommon: false }); // + special
  assert.ok(r2.score >= r1.score, `r2(${r2.score}) >= r1(${r1.score})`);
  assert.ok(r3.score >= r2.score, `r3(${r3.score}) >= r2(${r2.score})`);
});

// ---------------------------------------------------------------------------
// AC-020: Default policy does not require uppercase/lowercase/digit/special
// ---------------------------------------------------------------------------
test('AC-020: default policy does not trigger character-class violations', () => {
  const result = check('hello', {});
  const classCodes = ['MISSING_UPPERCASE', 'MISSING_LOWERCASE', 'MISSING_DIGIT', 'MISSING_SPECIAL'];
  for (const code of classCodes) {
    const v = result.violations.find((x) => x.code === code);
    assert.ok(!v, `Unexpected violation ${code} with default policy`);
  }
});

// ---------------------------------------------------------------------------
// AC-021: requireSpecial:false → no MISSING_SPECIAL violation
// ---------------------------------------------------------------------------
test('AC-021: requireSpecial false suppresses MISSING_SPECIAL violation', () => {
  const result = check('hello', { requireSpecial: false });
  const v = result.violations.find((x) => x.code === 'MISSING_SPECIAL');
  assert.ok(!v, 'MISSING_SPECIAL must NOT be present when requireSpecial is false');
});

// ---------------------------------------------------------------------------
// AC-022: entropy_bits is always >= 0
// ---------------------------------------------------------------------------
test('AC-022: entropy_bits is always a non-negative number', () => {
  const passwords = ['', 'a', 'Password1!', '12345678'];
  for (const pw of passwords) {
    const result = check(pw);
    assert.ok(typeof result.entropy_bits === 'number', 'entropy_bits must be a number');
    assert.ok(result.entropy_bits >= 0, `entropy_bits must be >= 0 for "${pw}"`);
  }
});

// ---------------------------------------------------------------------------
// AC-023: violations is always an array
// ---------------------------------------------------------------------------
test('AC-023: violations is always an array, never null or undefined', () => {
  const passwords = ['', 'Password1!', 'abc'];
  for (const pw of passwords) {
    const result = check(pw);
    assert.ok(Array.isArray(result.violations), `violations must be array for "${pw}"`);
  }
});

// ---------------------------------------------------------------------------
// AC-024: Return object has exactly the five specified keys
// ---------------------------------------------------------------------------
test('AC-024: returned object has exactly the five required keys', () => {
  const result = check('Password1!');
  const keys = Object.keys(result).sort();
  assert.deepStrictEqual(keys, ['entropy_bits', 'grade', 'isAcceptable', 'score', 'violations']);
});

// ---------------------------------------------------------------------------
// AC-025: 100-char password with all classes → score 100
// ---------------------------------------------------------------------------
test('AC-025: 100-char password with all character classes scores 100', () => {
  // Build a 100-char password guaranteed to have all 4 classes
  const base = 'Abc1!'.repeat(20); // 100 chars, all classes
  const result = check(base, { blockCommon: false });
  assert.strictEqual(result.score, 100,
    `Expected score 100 for 100-char all-class password, got ${result.score}`);
});

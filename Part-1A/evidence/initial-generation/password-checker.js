// Initial generation of password-checker.js — BEFORE harness-driven repair
// This is the first version produced by the AI coding agent.
// Saved to evidence/initial-generation/ before the first formal harness run.
// (Task T-10, human checkpoint)
//
// Known issues found by harness run-1:
//   [no-var] Line 10: Unexpected var, use const or let  (Gate 1 FAIL)
//   [no-var] Line 11: Unexpected var, use const or let  (Gate 1 FAIL)
//   [strict] Line 1: 'use strict' is missing            (Gate 1 FAIL)
// Gate 3 (tests) was skipped because Gate 1 failed.
// See evidence/harness-results/run-1/report.json

var SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

var COMMON_PASSWORDS = new Set([
  'password', 'password1', '123456', 'qwerty', 'abc123',
  'letmein', 'admin', 'login',
]);

const DEFAULT_POLICY = {
  minLength: 8,
  requireUppercase: false,
  requireLowercase: false,
  requireDigit: false,
  requireSpecial: false,
  maxRepeatedChars: null,
  blockCommon: true,
};

function calculateEntropy(password) {
  if (!password || password.length === 0) return 0;
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  pool += 32;  // BUG: special chars pool always added (incorrect)
  return Math.round(password.length * Math.log2(pool) * 100) / 100;
}

function gradeFromScore(score) {
  if (score < 40) return 'weak';
  if (score < 70) return 'fair';
  if (score < 90) return 'strong';
  return 'very_strong';
}

function calculateScore(password, violations) {
  if (violations.some(v => v.code === 'EMPTY_PASSWORD')) return 0;
  let score = Math.min(40, password.length * 3);
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  score -= violations.length * 5;
  // MISSING: special char class +10 bonus and length bonus (CL-03a)
  return Math.max(0, Math.min(100, Math.round(score)));
}

function check(password, policy) {
  const p = Object.assign({}, DEFAULT_POLICY, policy);
  const violations = [];

  if (typeof password !== 'string' || password.length === 0) {
    return { score: 0, grade: 'weak', violations: [{ code: 'EMPTY_PASSWORD', message: 'Password must not be empty.' }], entropy_bits: 0, isAcceptable: false };
  }

  if (password.length < p.minLength) {
    violations.push({ code: 'MIN_LENGTH', message: `Too short. Required: ${p.minLength}, got: ${password.length}.`, required: p.minLength, actual: password.length });
  }

  if (p.requireUppercase && !/[A-Z]/.test(password)) violations.push({ code: 'MISSING_UPPERCASE', message: 'Needs uppercase.' });
  if (p.requireLowercase && !/[a-z]/.test(password)) violations.push({ code: 'MISSING_LOWERCASE', message: 'Needs lowercase.' });
  if (p.requireDigit && !/[0-9]/.test(password)) violations.push({ code: 'MISSING_DIGIT', message: 'Needs digit.' });
  // MISSING: requireSpecial check not implemented (AC-006 would fail)
  // MISSING: maxRepeatedChars check not implemented (AC-016 would fail)

  if (p.blockCommon && COMMON_PASSWORDS.has(password.toLowerCase())) {
    violations.push({ code: 'COMMON_PASSWORD', message: 'Common password.' });
  }

  const entropy_bits = calculateEntropy(password);
  const score = calculateScore(password, violations);
  return { score, grade: gradeFromScore(score), violations, entropy_bits, isAcceptable: violations.length === 0 };
}

module.exports = { check };

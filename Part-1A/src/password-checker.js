'use strict';
/**
 * Password Policy Checker — Part 1A, SEZG534 Assignment 1
 *
 * Public API: check(password, policy?) → CheckResult
 *
 * Spec references:
 *   Constitution: CON-001 through CON-010
 *   Specification: FR-01 through FR-09, AC-001 through AC-025
 *   Clarifications: CL-01 through CL-06
 *   Plan: plan.md data model
 */

// CL-02: Fixed special-character set (32 printable ASCII chars)
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

// CL-05: Common passwords blocklist (case-insensitive comparison)
const COMMON_PASSWORDS = new Set([
  'password', 'password1', '123456', '12345678', 'qwerty', 'abc123',
  'letmein', 'monkey', 'dragon', 'master', 'sunshine', 'princess',
  '123123', 'welcome', 'shadow', 'superman', 'admin', 'login',
  'iloveyou', 'passw0rd', 'admin123', 'qwerty123', '1q2w3e4r',
]);

// FR-07, plan.md: Default policy values
const DEFAULT_POLICY = {
  minLength: 8,
  requireUppercase: false,
  requireLowercase: false,
  requireDigit: false,
  requireSpecial: false,
  maxRepeatedChars: null,
  blockCommon: true,
};

// Pre-compile the special-chars regex once to avoid repeated construction (CON-005)
const SPECIAL_CHARS_REGEX = new RegExp(
  '[' + SPECIAL_CHARS.replace(/[-\\^\]]/g, '\\$&') + ']'
);

/**
 * Calculate Shannon entropy estimate (bits) for the given password.
 * Pool size is derived from the character classes present.  CL-06.
 *
 * @param {string} password
 * @returns {number} entropy in bits (2 decimal places)
 */
function calculateEntropy(password) {
  if (!password || password.length === 0) {
    return 0;
  }
  let pool = 0;
  if (/[a-z]/.test(password)) { pool += 26; }
  if (/[A-Z]/.test(password)) { pool += 26; }
  if (/[0-9]/.test(password)) { pool += 10; }
  if (SPECIAL_CHARS_REGEX.test(password)) { pool += 32; }
  if (pool === 0) { return 0; }
  return Math.round(password.length * Math.log2(pool) * 100) / 100;
}

/**
 * Map a numeric score to a grade string.  AC-009 through AC-012.
 *
 * @param {number} score integer [0, 100]
 * @returns {"weak"|"fair"|"strong"|"very_strong"}
 */
function gradeFromScore(score) {
  if (score < 40) { return 'weak'; }
  if (score < 70) { return 'fair'; }
  if (score < 90) { return 'strong'; }
  return 'very_strong';
}

/**
 * Calculate password strength score.  CL-03, CL-03a.
 *
 * @param {string} password
 * @param {object[]} violations
 * @returns {number} integer [0, 100]
 */
function calculateScore(password, violations) {
  if (violations.some((v) => v.code === 'EMPTY_PASSWORD')) {
    return 0;
  }
  let score = Math.min(40, password.length * 3);
  if (/[a-z]/.test(password)) { score += 10; }
  if (/[A-Z]/.test(password)) { score += 10; }
  if (/[0-9]/.test(password)) { score += 10; }
  if (SPECIAL_CHARS_REGEX.test(password)) { score += 10; }
  // CL-03a: length bonus for very long passwords with all character classes
  const hasAllClasses = (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    SPECIAL_CHARS_REGEX.test(password)
  );
  if (password.length >= 20 && hasAllClasses) {
    score += 20;
  }
  score -= violations.length * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Check whether a password meets the given policy.  FR-01 through FR-09.
 *
 * @param {string} password  The candidate password.
 * @param {object} [policy]  Optional policy overrides; merged with DEFAULT_POLICY.
 * @returns {{score: number, grade: string, violations: object[], entropy_bits: number, isAcceptable: boolean}}
 */
function check(password, policy) {
  const p = Object.assign({}, DEFAULT_POLICY, policy);
  const violations = [];

  // AC-015: Empty / non-string guard
  if (typeof password !== 'string' || password.length === 0) {
    return {
      score: 0,
      grade: 'weak',
      violations: [{ code: 'EMPTY_PASSWORD', message: 'Password must not be empty.' }],
      entropy_bits: 0,
      isAcceptable: false,
    };
  }

  // AC-001, AC-018: Minimum length
  if (password.length < p.minLength) {
    violations.push({
      code: 'MIN_LENGTH',
      message: `Password must be at least ${p.minLength} characters. Got ${password.length}.`,
      required: p.minLength,
      actual: password.length,
    });
  }

  // AC-003: Uppercase required
  if (p.requireUppercase && !/[A-Z]/.test(password)) {
    violations.push({
      code: 'MISSING_UPPERCASE',
      message: 'Password must contain at least one uppercase letter (A–Z).',
    });
  }

  // AC-004: Lowercase required
  if (p.requireLowercase && !/[a-z]/.test(password)) {
    violations.push({
      code: 'MISSING_LOWERCASE',
      message: 'Password must contain at least one lowercase letter (a–z).',
    });
  }

  // AC-005: Digit required
  if (p.requireDigit && !/[0-9]/.test(password)) {
    violations.push({
      code: 'MISSING_DIGIT',
      message: 'Password must contain at least one digit (0–9).',
    });
  }

  // AC-006, AC-021: Special character required (CL-02)
  if (p.requireSpecial && !SPECIAL_CHARS_REGEX.test(password)) {
    violations.push({
      code: 'MISSING_SPECIAL',
      message: `Password must contain at least one special character (${SPECIAL_CHARS}).`,
    });
  }

  // AC-016: Repeated characters limit (CL-04)
  if (p.maxRepeatedChars !== null && p.maxRepeatedChars >= 1) {
    const repeatPattern = /(.)\1+/g;
    let match = repeatPattern.exec(password);
    while (match !== null) {
      if (match[0].length > p.maxRepeatedChars) {
        violations.push({
          code: 'REPEATED_CHARS',
          message: `Password must not repeat a character more than ${p.maxRepeatedChars} time(s) consecutively.`,
          maxAllowed: p.maxRepeatedChars,
        });
        break;
      }
      match = repeatPattern.exec(password);
    }
  }

  // AC-017: Common password blocklist (CL-01, CL-05)
  if (p.blockCommon && COMMON_PASSWORDS.has(password.toLowerCase())) {
    violations.push({
      code: 'COMMON_PASSWORD',
      message: 'Password is in the list of commonly used passwords.',
    });
  }

  const entropy_bits = calculateEntropy(password);
  const score = calculateScore(password, violations);
  const grade = gradeFromScore(score);

  return {
    score,
    grade,
    violations,
    entropy_bits,
    isAcceptable: violations.length === 0,
  };
}

module.exports = { check };

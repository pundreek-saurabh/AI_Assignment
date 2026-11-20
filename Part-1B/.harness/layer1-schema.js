'use strict';
/**
 * Layer 1 — Schema Validator
 * Checks INV-001 through INV-007 for a single AnalysisResult.
 * Returns { passed: boolean, findings: Finding[] }
 */

const ALLOWED_TYPES = new Set(['feat', 'fix', 'refactor', 'docs', 'chore', 'test', 'style', 'perf', 'ci', 'build', 'revert']);
const REQUIRED_FIELDS = ['type', 'scope', 'description', 'is_breaking', 'quality_score', 'issues', 'suggestion'];

function validateLayer1(result, caseId) {
  const findings = [];

  // INV-001: Valid JSON object (already parsed by caller, but check object type)
  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    findings.push({ code: 'NOT_AN_OBJECT', caseId, message: 'Result is not a plain object (INV-001)' });
    return { passed: false, findings };
  }

  // INV-002: Exactly 7 required fields, no extra fields
  const keys = Object.keys(result).sort();
  const expected = [...REQUIRED_FIELDS].sort();
  const missing = expected.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !expected.includes(k));
  for (const k of missing) {
    findings.push({ code: 'MISSING_FIELD', caseId, message: `Missing required field "${k}" (INV-002)`, field: k });
  }
  for (const k of extra) {
    findings.push({ code: 'EXTRA_FIELD', caseId, message: `Unexpected field "${k}" (INV-002)`, field: k });
  }

  // INV-003: type is null or one of allowed values
  if (result.type !== null && !ALLOWED_TYPES.has(result.type)) {
    findings.push({ code: 'INVALID_TYPE', caseId, message: `type "${result.type}" not in allowed set (INV-003)`, field: 'type' });
  }

  // INV-004: quality_score is number in [0, 100]
  if (typeof result.quality_score !== 'number' || result.quality_score < 0 || result.quality_score > 100) {
    findings.push({
      code: 'INVALID_QUALITY_SCORE', caseId,
      message: `quality_score ${result.quality_score} is not in [0, 100] (INV-004)`,
      field: 'quality_score',
    });
  }

  // INV-005: is_breaking is boolean
  if (typeof result.is_breaking !== 'boolean') {
    findings.push({ code: 'INVALID_IS_BREAKING', caseId, message: `is_breaking must be boolean, got ${typeof result.is_breaking} (INV-005)`, field: 'is_breaking' });
  }

  // INV-006: issues is array
  if (!Array.isArray(result.issues)) {
    findings.push({ code: 'ISSUES_NOT_ARRAY', caseId, message: 'issues must be an array (INV-006)', field: 'issues' });
  }

  // INV-007: description is non-empty string
  if (typeof result.description !== 'string' || result.description.length === 0) {
    findings.push({ code: 'EMPTY_DESCRIPTION', caseId, message: 'description must be a non-empty string (INV-007)', field: 'description' });
  }

  return { passed: findings.length === 0, findings };
}

module.exports = { validateLayer1 };

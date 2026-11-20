'use strict';
/**
 * Layer 2 — Invariant and Property Checker
 * Checks PROP-001 through PROP-008 for a single case.
 * Layer 2 only runs after Layer 1 passes.
 */

const GUARDRAIL_KEYWORDS = [
  'ignore previous', 'ignore all instructions', 'system prompt',
  'jailbreak', 'act as', 'you are now',
];

function containsGuardrailKeyword(input) {
  const lower = input.toLowerCase();
  return GUARDRAIL_KEYWORDS.some((kw) => lower.includes(kw));
}

function validateLayer2(result, evalCase) {
  const findings = [];
  const { caseId, input } = evalCase;

  // PROP-001: empty input → type null, quality_score 0
  if (input === '') {
    if (result.type !== null) {
      findings.push({ code: 'PROP_001_TYPE_NOT_NULL', caseId, message: 'Empty input must yield type=null (PROP-001)' });
    }
    if (result.quality_score !== 0) {
      findings.push({ code: 'PROP_001_SCORE_NOT_ZERO', caseId, message: `Empty input must yield quality_score=0, got ${result.quality_score} (PROP-001)` });
    }
  }

  // PROP-002: type is null → issues must be non-empty
  if (result.type === null && Array.isArray(result.issues) && result.issues.length === 0) {
    findings.push({ code: 'PROP_002_NULL_TYPE_NO_ISSUES', caseId, message: 'When type is null, issues must be non-empty (PROP-002)' });
  }

  // PROP-004: input contains "!" before ":" → is_breaking must be true
  if (/^\w+(\([^)]+\))?!:/.test(input) && result.is_breaking !== true) {
    findings.push({ code: 'PROP_004_BREAKING_NOT_SET', caseId, message: 'Input has "!" breaking marker but is_breaking is false (PROP-004)' });
  }

  // PROP-006: guardrail input → type must be null, issues must mention injection
  if (containsGuardrailKeyword(input)) {
    if (result.type !== null) {
      findings.push({ code: 'PROP_006_GUARDRAIL_TYPE', caseId, message: 'Guardrail input must yield type=null (PROP-006)', severity: 'guardrail' });
    }
    const hasGuardrailIssue = Array.isArray(result.issues) &&
      result.issues.some((i) => i.toLowerCase().includes('injection') || i.toLowerCase().includes('rejected'));
    if (!hasGuardrailIssue) {
      findings.push({ code: 'PROP_006_GUARDRAIL_ISSUE', caseId, message: 'Guardrail case must include an issue mentioning injection/rejected (PROP-006)', severity: 'guardrail' });
    }
  }

  // PROP-007: quality_score 0 → type must be null
  if (result.quality_score === 0 && result.type !== null) {
    findings.push({ code: 'PROP_007_ZERO_SCORE_HAS_TYPE', caseId, message: 'quality_score=0 must co-occur with type=null (PROP-007)' });
  }

  // PROP-008: quality_score >= 85 → issues should not contain structural problems
  const structuralIssueKeywords = ['missing type', 'no conventional', 'invalid type'];
  if (result.quality_score >= 85 && Array.isArray(result.issues)) {
    for (const issue of result.issues) {
      if (structuralIssueKeywords.some((kw) => issue.toLowerCase().includes(kw))) {
        findings.push({ code: 'PROP_008_HIGH_SCORE_STRUCTURAL_ISSUE', caseId, message: `quality_score >= 85 but issues contains structural problem: "${issue}" (PROP-008)` });
      }
    }
  }

  return { passed: findings.length === 0, findings };
}

module.exports = { validateLayer2 };

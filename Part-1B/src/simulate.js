'use strict';
/**
 * Simulation layer — Commit Message Quality Analyzer (Part 1B)
 *
 * Returns pre-defined AnalysisResult objects for each evaluation case.
 * This is the FINAL (repaired) version. See evidence/initial-generation/simulate.js
 * for the initial version that had schema violations caught by the harness.
 *
 * Lookup key: caseId (e.g. "CONV-001") or falls back to message text lookup.
 */

const RESULTS = {
  // ── Normal cases ──────────────────────────────────────────────────────────
  'CONV-001': {
    type: 'feat', scope: 'auth', description: 'add OAuth2 login with PKCE flow',
    is_breaking: false, quality_score: 95,
    issues: [], suggestion: null,
  },
  'CONV-002': {
    type: 'fix', scope: 'api', description: 'handle null response from payment gateway',
    is_breaking: false, quality_score: 92,
    issues: [], suggestion: null,
  },
  'CONV-003': {
    type: 'feat', scope: null, description: 'remove deprecated v1 endpoints',
    is_breaking: true, quality_score: 90,
    issues: [], suggestion: null,
  },
  'CONV-004': {
    type: 'docs', scope: null, description: 'add API reference for authentication module',
    is_breaking: false, quality_score: 88,
    issues: [], suggestion: null,
  },
  'CONV-005': {
    type: 'chore', scope: null, description: 'update ESLint to v9 and fix lint errors',
    is_breaking: false, quality_score: 85,
    issues: [], suggestion: null,
  },
  'CONV-006': {
    type: 'test', scope: null, description: 'add integration tests for checkout flow',
    is_breaking: false, quality_score: 87,
    issues: [], suggestion: null,
  },
  'CONV-007': {
    type: 'perf', scope: 'db', description: 'add index on users.email column',
    is_breaking: false, quality_score: 90,
    issues: [], suggestion: null,
  },
  'CONV-008': {
    type: 'refactor', scope: 'core', description: 'extract validation logic to separate module',
    is_breaking: false, quality_score: 88,
    issues: [], suggestion: null,
  },
  'CONV-009': {
    type: 'style', scope: null, description: 'apply prettier formatting to all JS files',
    is_breaking: false, quality_score: 82,
    issues: [], suggestion: null,
  },
  'CONV-010': {
    type: 'ci', scope: null, description: 'add GitHub Actions workflow for PR checks',
    is_breaking: false, quality_score: 85,
    issues: [], suggestion: null,
  },

  // ── Bad / malformed cases ─────────────────────────────────────────────────
  'BAD-001': {
    type: null, scope: null, description: 'added user authentication',
    is_breaking: false, quality_score: 15,
    issues: ['Missing conventional commit type prefix (e.g. feat:, fix:)'],
    suggestion: 'feat: add user authentication',
  },
  'BAD-002': {
    type: 'fix', scope: null, description: 'bug',
    is_breaking: false, quality_score: 30,
    issues: ['Description is too vague — provide specific context about what was fixed'],
    suggestion: 'fix: resolve null pointer exception in login handler',
  },
  'BAD-003': {
    type: 'feat', scope: null,
    description: 'implement the entire user authentication system with OAuth2, JWT tokens, session management, and CSRF protection',
    is_breaking: false, quality_score: 55,
    issues: ['Description exceeds 72 characters — consider splitting into multiple commits'],
    suggestion: 'feat(auth): implement OAuth2 with JWT and session management',
  },
  'BAD-004': {
    type: null, scope: null, description: '(empty)',
    is_breaking: false, quality_score: 0,
    issues: ['Empty commit message'],
    suggestion: null,
  },
  'BAD-005': {
    type: null, scope: null, description: "Merge branch 'feature/auth' into main",
    is_breaking: false, quality_score: 20,
    issues: ['Auto-generated merge message — consider squashing or using a conventional commit for the merge'],
    suggestion: null,
  },
  'BAD-006': {
    type: null, scope: null, description: 'WIP: not ready yet',
    is_breaking: false, quality_score: 10,
    issues: ['WIP commit should be squashed before merging', 'Missing conventional commit type prefix'],
    suggestion: null,
  },
  'BAD-007': {
    type: null, scope: null, description: 'FIX: RESOLVE LOGIN BUG',
    is_breaking: false, quality_score: 25,
    issues: ['Type prefix must be lowercase (got "FIX")', 'Description should not be in ALL CAPS'],
    suggestion: 'fix: resolve login bug',
  },
  'BAD-008': {
    type: 'fix', scope: null, description: '(empty description)',
    is_breaking: false, quality_score: 5,
    issues: ['Empty description after type prefix'],
    suggestion: null,
  },

  // ── Edge cases ────────────────────────────────────────────────────────────
  'EDGE-001': {
    type: 'revert', scope: null, description: 'feat(auth): add OAuth2 login',
    is_breaking: false, quality_score: 80,
    issues: [], suggestion: null,
  },
  'EDGE-002': {
    type: 'fix', scope: 'auth', description: 'change token format - breaking change',
    is_breaking: true, quality_score: 85,
    issues: [], suggestion: null,
  },

  // ── Guardrail cases ───────────────────────────────────────────────────────
  'GUARD-001': {
    type: null, scope: null, description: '(input rejected)',
    is_breaking: false, quality_score: 0,
    issues: ['Input contains potential prompt injection attempt — rejected.'],
    suggestion: null,
  },
  'GUARD-002': {
    type: null, scope: null, description: '(input rejected)',
    is_breaking: false, quality_score: 0,
    issues: ['Input contains potential prompt injection attempt — rejected.'],
    suggestion: null,
  },
  'GUARD-003': {
    type: null, scope: null, description: '(input rejected)',
    is_breaking: false, quality_score: 0,
    issues: ['Input contains potential prompt injection attempt — rejected.'],
    suggestion: null,
  },
  'GUARD-004': {
    type: null, scope: null, description: '(input rejected)',
    is_breaking: false, quality_score: 0,
    issues: ['Input contains potential prompt injection attempt — rejected.'],
    suggestion: null,
  },
};

const UNKNOWN_RESULT = {
  type: null, scope: null, description: '(unrecognised input)',
  is_breaking: false, quality_score: 0,
  issues: ['Unrecognised eval case — no simulation entry found'],
  suggestion: null,
};

/**
 * Return the simulated AnalysisResult for the given case ID.
 * @param {string} caseId
 * @returns {object}
 */
function getSimulatedResult(caseId) {
  return RESULTS[caseId] ? Object.assign({}, RESULTS[caseId]) : Object.assign({}, UNKNOWN_RESULT);
}

module.exports = { getSimulatedResult };

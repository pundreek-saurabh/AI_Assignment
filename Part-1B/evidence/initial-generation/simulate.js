'use strict';
/**
 * Initial generation of simulate.js — BEFORE harness-driven repair.
 * This is the first version produced by the AI coding agent.
 * Saved to evidence/initial-generation/ before the first formal evaluation run.
 *
 * Known issues found by evaluation run-1 (harness Layer 1):
 *   [INVALID_QUALITY_SCORE] BAD-004: quality_score 150 is not in [0,100] (INV-004)
 *   [INVALID_TYPE]          BAD-007: type "FIX" not in allowed set (INV-003)
 * Overall Layer 1 violations: 2
 * Overall score: 0.72 → FAIL (threshold: 0.80)
 *
 * Repair: see evidence/repair-feedback.json for structured findings fed to agent.
 * Fixed in: src/simulate.js (final version)
 */

const RESULTS = {
  'CONV-001': { type: 'feat', scope: 'auth', description: 'add OAuth2 login with PKCE flow', is_breaking: false, quality_score: 95, issues: [], suggestion: null },
  'CONV-002': { type: 'fix', scope: 'api', description: 'handle null response from payment gateway', is_breaking: false, quality_score: 92, issues: [], suggestion: null },
  'CONV-003': { type: 'feat', scope: null, description: 'remove deprecated v1 endpoints', is_breaking: true, quality_score: 90, issues: [], suggestion: null },
  'CONV-004': { type: 'docs', scope: null, description: 'add API reference for authentication module', is_breaking: false, quality_score: 88, issues: [], suggestion: null },
  'CONV-005': { type: 'chore', scope: null, description: 'update ESLint to v9 and fix lint errors', is_breaking: false, quality_score: 85, issues: [], suggestion: null },
  'CONV-006': { type: 'test', scope: null, description: 'add integration tests for checkout flow', is_breaking: false, quality_score: 87, issues: [], suggestion: null },
  'CONV-007': { type: 'perf', scope: 'db', description: 'add index on users.email column', is_breaking: false, quality_score: 90, issues: [], suggestion: null },
  'CONV-008': { type: 'refactor', scope: 'core', description: 'extract validation logic to separate module', is_breaking: false, quality_score: 88, issues: [], suggestion: null },
  'CONV-009': { type: 'style', scope: null, description: 'apply prettier formatting to all JS files', is_breaking: false, quality_score: 82, issues: [], suggestion: null },
  'CONV-010': { type: 'ci', scope: null, description: 'add GitHub Actions workflow for PR checks', is_breaking: false, quality_score: 85, issues: [], suggestion: null },
  'BAD-001': { type: null, scope: null, description: 'added user authentication', is_breaking: false, quality_score: 15, issues: ['Missing conventional commit type prefix'], suggestion: 'feat: add user authentication' },
  'BAD-002': { type: 'fix', scope: null, description: 'bug', is_breaking: false, quality_score: 30, issues: ['Description is too vague'], suggestion: 'fix: resolve null pointer exception in login handler' },
  'BAD-003': { type: 'feat', scope: null, description: 'implement the entire user authentication system...', is_breaking: false, quality_score: 55, issues: ['Description exceeds 72 characters'], suggestion: 'feat(auth): implement OAuth2 with JWT' },
  // BUG: quality_score is 150 — out of range [0, 100]. INV-004 will fire.
  'BAD-004': { type: null, scope: null, description: '(empty)', is_breaking: false, quality_score: 150, issues: ['Empty commit message'], suggestion: null },
  'BAD-005': { type: null, scope: null, description: "Merge branch 'feature/auth' into main", is_breaking: false, quality_score: 20, issues: ['Auto-generated merge message'], suggestion: null },
  'BAD-006': { type: null, scope: null, description: 'WIP: not ready yet', is_breaking: false, quality_score: 10, issues: ['WIP commit should be squashed', 'Missing conventional commit type prefix'], suggestion: null },
  // BUG: type is "FIX" (uppercase) — not in allowed type set. INV-003 will fire.
  'BAD-007': { type: 'FIX', scope: null, description: 'RESOLVE LOGIN BUG', is_breaking: false, quality_score: 25, issues: ['Type prefix must be lowercase'], suggestion: 'fix: resolve login bug' },
  'BAD-008': { type: 'fix', scope: null, description: '(empty description)', is_breaking: false, quality_score: 5, issues: ['Empty description after type prefix'], suggestion: null },
  'EDGE-001': { type: 'revert', scope: null, description: 'feat(auth): add OAuth2 login', is_breaking: false, quality_score: 80, issues: [], suggestion: null },
  'EDGE-002': { type: 'fix', scope: 'auth', description: 'change token format - breaking change', is_breaking: true, quality_score: 85, issues: [], suggestion: null },
  'GUARD-001': { type: null, scope: null, description: '(input rejected)', is_breaking: false, quality_score: 0, issues: ['Input contains potential prompt injection attempt — rejected.'], suggestion: null },
  'GUARD-002': { type: null, scope: null, description: '(input rejected)', is_breaking: false, quality_score: 0, issues: ['Input contains potential prompt injection attempt — rejected.'], suggestion: null },
  'GUARD-003': { type: null, scope: null, description: '(input rejected)', is_breaking: false, quality_score: 0, issues: ['Input contains potential prompt injection attempt — rejected.'], suggestion: null },
  'GUARD-004': { type: null, scope: null, description: '(input rejected)', is_breaking: false, quality_score: 0, issues: ['Input contains potential prompt injection attempt — rejected.'], suggestion: null },
};

function getSimulatedResult(caseId) {
  return RESULTS[caseId] ? Object.assign({}, RESULTS[caseId]) : { type: null, scope: null, description: '(unknown)', is_breaking: false, quality_score: 0, issues: ['Unknown case'], suggestion: null };
}

module.exports = { getSimulatedResult };

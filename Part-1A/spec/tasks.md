# Spec Kit Tasks — Password Policy Checker
> Generated via `/speckit.tasks` · Reviewed and approved by student · 2026-11-12

---

## Task List

Tasks are ordered by dependency. Each task cites the requirement IDs it implements.

### T-01 · Project scaffold and package.json
**Type:** Setup  
**Covers:** CON-001, CON-003, CON-004, NFR-02  
**Steps:**
1. Create `Part-1A/` directory structure as in `plan.md`
2. Create `package.json` with `name`, `version`, `engines.node >= 20`, `scripts`, devDependencies
3. Create `.eslintrc.lint.json` and `.eslintrc.security.json`
4. Run `npm install` to install dev tools
**Done when:** `npm run lint` and `npm run test` commands exist and run (even if no source yet)

### T-02 · Implement core data types and constants
**Type:** Implementation  
**Covers:** CON-009, FR-09, CL-02, CL-05  
**Steps:**
1. Create `src/password-checker.js` with `'use strict';` at top (CON-004)
2. Define `SPECIAL_CHARS` constant (CL-02)
3. Define `COMMON_PASSWORDS` Set (20+ entries; CL-05)
4. Define `DEFAULT_POLICY` object (FR-07)
**Done when:** Module loads without error; constants are exported for test inspection if needed

### T-03 · Implement `calculateEntropy(password)`
**Type:** Implementation  
**Covers:** FR-05, AC-007, AC-022, CL-06  
**Steps:**
1. Compute pool size from character classes present
2. Return `Math.round(length * Math.log2(pool) * 100) / 100`; return 0 if pool is 0
**Done when:** AC-007 and AC-022 pass

### T-04 · Implement `gradeFromScore(score)`
**Type:** Implementation  
**Covers:** FR-03, AC-009, AC-010, AC-011, AC-012  
**Thresholds:**
- score < 40 → `"weak"`
- score 40–69 → `"fair"`
- score 70–89 → `"strong"`
- score 90–100 → `"very_strong"`
**Done when:** AC-009 through AC-012 pass

### T-05 · Implement `calculateScore(password, violations)`
**Type:** Implementation  
**Covers:** FR-02, AC-008, AC-025, CL-03, CL-03a  
**Formula (CL-03a):**
1. If `EMPTY_PASSWORD` in violations → return 0
2. `score = min(40, length × 3)` (length points)
3. `+10` if lowercase present
4. `+10` if uppercase present
5. `+10` if digit present
6. `+10` if special char present
7. `+20` if length ≥ 20 AND all 4 classes present (length bonus)
8. `−(violations.length × 5)` (penalty)
9. `clamp(score, 0, 100)`; `Math.round()`
**Done when:** AC-008 and AC-025 pass

### T-06 · Implement violation checks
**Type:** Implementation  
**Covers:** AC-001 through AC-006, AC-015 through AC-017  
**Steps:**
1. `checkLength(password, policy)` → `MIN_LENGTH` with `{required, actual}` (AC-001, AC-018)
2. `checkUppercase(password, policy)` → `MISSING_UPPERCASE` (AC-003)
3. `checkLowercase(password, policy)` → `MISSING_LOWERCASE` (AC-004)
4. `checkDigit(password, policy)` → `MISSING_DIGIT` (AC-005)
5. `checkSpecial(password, policy)` → `MISSING_SPECIAL` using `SPECIAL_CHARS` set (AC-006, AC-021)
6. `checkRepeatedChars(password, policy)` → `REPEATED_CHARS` when `maxRepeatedChars` is set (AC-016, CL-04)
7. `checkCommonPassword(password, policy)` → `COMMON_PASSWORD` using case-insensitive match (AC-017, CL-05)
8. Empty-string guard → `EMPTY_PASSWORD` (AC-015)
**Done when:** AC-001, AC-003–AC-006, AC-015–AC-017 pass

### T-07 · Implement `check(password, policy)` — main export
**Type:** Implementation  
**Covers:** FR-01, FR-06, FR-07, FR-08, AC-002, AC-013, AC-014, AC-019–AC-025  
**Steps:**
1. Merge caller policy with DEFAULT_POLICY
2. Run all violation checks in order
3. Call `calculateEntropy`, `calculateScore`, `gradeFromScore`
4. Return `{score, grade, violations, entropy_bits, isAcceptable: violations.length === 0}`
5. Add `module.exports = { check }`
**Done when:** AC-002, AC-013, AC-014, AC-019–AC-025 pass

### T-08 · Write tests (25 test functions)
**Type:** ⚠️ HUMAN TASK — review each test against the AC before approving
**Covers:** AC-001 through AC-025 (all acceptance criteria)  
**Human review checkpoint:** Read each test and confirm it asserts only what the corresponding AC states. No test should import internals.  
**Done when:** `npm test` runs all 25 and reports 25 passing

### T-09 · Write harness scripts
**Type:** Implementation  
**Covers:** NFR-03, NFR-04  
**Steps:**
1. `run-harness.js`: runs Gate 1 → Gate 2 → Gate 3; writes JSON report; exits 0 only on full pass
2. `self-check.js`: verifies each gate can FAIL on broken inputs
**Done when:** `node .harness/run-harness.js` on clean code → exit 0, JSON report in evidence/

### T-10 · ⚠️ HUMAN CHECKPOINT — Freeze baseline
**Type:** Human task  
**Steps:**
1. Run `node .harness/self-check.js` → confirm all 3 gates CAN fail
2. Run `npm test` → all 25 pass
3. Create git tag: `git tag -a "baseline-part-a-before-implement" -m "Harness and tests frozen; count: 25 tests"`
4. Save the first generation of `src/password-checker.js` to `evidence/initial-generation/`
**Done when:** Tag exists; evidence/initial-generation/ contains a copy of the source

### T-11 · ⚠️ HUMAN TASK — Run harness, record evidence, write harness-log.md
**Type:** Human task  
**Steps:**
1. Run `node .harness/run-harness.js` → save output in `evidence/harness-results/run-1/`
2. If any gate fails: record structured findings, give to agent, repair, run again → save in `run-2/`
3. Write `evidence/harness-log.md` (coaching checklist will be provided)
4. Make ACCEPT or REJECT decision
**Done when:** harness-log.md is complete and signed off

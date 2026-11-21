# Harness Log — Part 1A: Password Policy Checker

## Initial Generation

I provided the AI coding agent (Antigravity / Claude) with the approved Spec Kit
artifacts as feedforward context before implementation: the constitution
(CON-001–CON-010), the feature specification with 25 binary acceptance criteria
(AC-001–AC-025), the clarifications document (CL-01–CL-06), the technical plan,
and the ordered task list (T-01–T-11). The agent generated `src/password-checker.js`
as the first implementation — a single pure-function module exporting `check(password,
policy)` that evaluates password strength.

The initial generation is preserved at `evidence/initial-generation/password-checker.js`.

## Harness Run 1

I ran the 3-gate harness using `node .harness/run-harness.js`. Gate 1 (ESLint lint
check) FAILED with 3 findings:

1. `strict` — Line 1: `'use strict';` was missing (violates CON-004)
2. `no-var` — Line 10: `var SPECIAL_CHARS` used instead of `const` (violates CON-003)
3. `no-var` — Line 12: `var COMMON_PASSWORDS` used instead of `const` (violates CON-003)

Because Gate 1 (static check) failed, Gate 2 (security check) and Gate 3 (tests) were
skipped. The harness does not run dynamic tests until all static checks pass. The full
run-1 report is at `evidence/harness-results/run-1/report.json`.

## Failure Evidence Sent to Agent

I fed back only the structured findings array from run-1/report.json to the agent with
this instruction:

> "The harness lint gate rejected the generated code. Here are the sensor findings.
> Fix only what the findings report — add 'use strict' at the top and replace `var`
> with `const`. Do not remove any valid behaviour or modify any tests."

The finding codes given were: `strict` (line 1) and `no-var` (lines 10 and 12).

## Repair and Run 2

The agent made the following minimal changes:
- Added `'use strict';` as the first line of `src/password-checker.js` (fixes `strict` violation)
- Changed `var SPECIAL_CHARS` to `const SPECIAL_CHARS` on line 10 (fixes `no-var`)
- Changed `var COMMON_PASSWORDS` to `const COMMON_PASSWORDS` on line 12 (fixes `no-var`)

I verified that the fix addressed only the reported findings and no other code was
changed. I then ran the harness again (`run-2`):

- Gate 1 (Lint): ✅ PASS — zero findings
- Gate 2 (Security/SAST): ✅ PASS — zero security findings
- Gate 3 (Tests): ✅ PASS — all 25 tests passed

The same checks that failed in run-1 passed in run-2. The full run-2 report is at
`evidence/harness-results/run-2/report.json`.

## Final Human Decision

**Decision:** ACCEPT

**Justification:** All 25 acceptance criteria (AC-001–AC-025) are verified by passing
tests. The lint gate confirms the code follows the constitution's style rules (CON-003,
CON-004). The security gate confirms no dangerous code patterns such as `eval()` are
present (CON-005). The repair cycle was genuine — the initial generation had real
violations caught by the independent harness, and the fix addressed the root cause
without weakening any test or specification.

**Known Limitations:**
- The common-password blocklist contains only 23 entries. A production system would
  integrate with the HaveIBeenPwned API or use a larger dataset (e.g. the 10,000 most
  common passwords).
- The entropy formula uses pool-size estimation (not per-character Shannon entropy),
  which slightly overestimates entropy for passwords with low character variety.
- There is no rate-limiting or caching — calling `check()` 10,000 times per second
  is possible since it is a pure function. A production API wrapper would need throttling.
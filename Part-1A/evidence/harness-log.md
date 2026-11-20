# Harness Log — Part 1A: Password Policy Checker

> ⚠️ **This file is authored by the student.** The agent does not write this file.
> Use the fact sheet and checklist below to write your entries.

---

## Fact Sheet (provided by agent for your reference — do not copy these sentences directly)

| Fact | Value | Source |
|---|---|---|
| Application | Password Policy Checker | spec/specification.md |
| Language/runtime | Node.js 20 | spec/plan.md, D-01 |
| Harness gates | Gate 1: ESLint lint; Gate 2: ESLint security; Gate 3: node:test | .harness/run-harness.js |
| Test count | 25 tests (AC-001 through AC-025) | tests/password-checker.test.js |
| Run 1 result | FAIL — 3 lint findings (strict×1, no-var×2) | evidence/harness-results/run-1/report.json |
| Run 1 Gate 3 | SKIPPED (lint gate must pass first) | run-1/report.json |
| Repair fed to agent | findings array from run-1: codes `strict`, `no-var` | see repair-feedback.json (create this) |
| What changed in repair | Added `'use strict';`, replaced `var` with `const` | diff of initial-generation → src/password-checker.js |
| Run 2 result | PASS — all 3 gates, all 25 tests | evidence/harness-results/run-2/report.json |
| Final decision | [ACCEPT / REJECT — you decide and explain] | your decision |

---

## Checklist (from Brief §5.3)

- [ ] Initial coding-agent generation and relevant task/specification context described
- [ ] Each harness execution and its outcome documented
- [ ] At least one genuine failure-and-repair cycle documented (Run 1 FAIL → repair → Run 2 PASS)
- [ ] Failure evidence supplied back to the coding agent described
- [ ] What changed after repair and whether the same checks passed on re-execution
- [ ] Final human ACCEPT or REJECT decision, known limitations and justification

---

## Your Log

> Write your entries below. Use your own words. Refer to the fact sheet for numbers and file names.

### Initial Generation

[Describe what specification context and tasks you gave the AI agent. What did it produce?]

### Harness Run 1

[Describe what the harness reported. Which gate failed? What were the specific findings?]

### Failure Evidence Sent to Agent

[Describe what structured evidence you fed back to the agent. Which finding codes? What instruction?]

### Repair and Run 2

[What did the agent change? Did you verify the change addressed the root cause? Did all 3 gates pass on Run 2?]

### Final Human Decision

**Decision:** ACCEPT / REJECT

**Justification:** [Your reasoning]

**Known Limitations:** [Any remaining gaps, edge cases not covered, or items you would add before production use]

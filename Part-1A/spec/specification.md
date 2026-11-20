# Spec Kit Feature Specification — Password Policy Checker
> Generated via `/speckit.specify` and `/speckit.clarify` · Reviewed and approved by student · 2026-11-12

## Feature: Password Policy Checker

### Problem Statement
Developers building authentication systems need a reusable, configurable library that evaluates whether a candidate password meets a declared security policy, provides a human-readable strength grade, and returns structured, machine-readable violation details that can drive UI feedback or automated enforcement.

### Intended Users
1. Application developers integrating the checker into registration and password-change flows.
2. Security engineers writing automated tests to verify that password policies are enforced correctly.
3. The harness itself, which uses the structured output to assert exact behaviour.

### User Stories

| ID | As a… | I want… | So that… |
|---|---|---|---|
| US-01 | developer | to call `check(password, policy)` with a password and a policy object | I get a single structured result without side effects |
| US-02 | developer | to receive a numeric score (0–100) and a grade label | I can display strength to the user |
| US-03 | developer | to receive a list of structured violations with stable codes | I can display targeted feedback per rule |
| US-04 | developer | to configure minimum length, required character classes, and common-password blocking | I can enforce my application's specific policy |
| US-05 | security engineer | to receive an entropy estimate in bits | I can audit password strength independently of the score |
| US-06 | security engineer | to pass an empty string and receive a clear EMPTY_PASSWORD violation | I can verify edge-case handling |
| US-07 | developer | to verify that `isAcceptable` is false when any violation exists | I can gate registration in one boolean check |

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | `check(password, policy)` returns an object `{score, grade, violations, entropy_bits, isAcceptable}` |
| FR-02 | `score` is an integer in the range [0, 100] |
| FR-03 | `grade` is one of `"weak"`, `"fair"`, `"strong"`, `"very_strong"` |
| FR-04 | `violations` is an array of objects; each has at minimum `{code: string, message: string}` |
| FR-05 | `entropy_bits` is a non-negative number (float, two decimal places) |
| FR-06 | `isAcceptable` is `true` if and only if `violations.length === 0` |
| FR-07 | The `policy` parameter is optional; omitting it applies default policy values |
| FR-08 | The function is pure: same inputs always produce the same output; no I/O |
| FR-09 | Violation codes are stable all-caps snake-case strings (e.g. `MIN_LENGTH`) |

---

## Policy Parameters and Defaults

| Parameter | Type | Default | Effect |
|---|---|---|---|
| `minLength` | integer ≥ 1 | 8 | Minimum character count |
| `requireUppercase` | boolean | false | At least one A–Z required |
| `requireLowercase` | boolean | false | At least one a–z required |
| `requireDigit` | boolean | false | At least one 0–9 required |
| `requireSpecial` | boolean | false | At least one special char required (see AC-021) |
| `maxRepeatedChars` | integer ≥ 1 or null | null | Max consecutive identical chars; null = no limit |
| `blockCommon` | boolean | true | Block passwords in the common-password list |

*Clarification CL-01 applies: when `blockCommon` is false, the COMMON_PASSWORD check is skipped even if the password is in the list.*

---

## Acceptance Criteria

Each criterion maps to exactly one test function in `tests/password-checker.test.js`.

| ID | Given / When / Then | Violation code (if any) |
|---|---|---|
| AC-001 | Given `"abc"` and `{minLength: 8}`, when `check` is called, then `violations` contains one entry with `code === "MIN_LENGTH"`, `required === 8`, `actual === 3` | `MIN_LENGTH` |
| AC-002 | Given `"Password1!"` and `{minLength: 8, requireUppercase: true, requireDigit: true, requireSpecial: true}`, then `isAcceptable === true` and `violations.length === 0` | — |
| AC-003 | Given `"password"` and `{requireUppercase: true}`, then `violations` contains `{code: "MISSING_UPPERCASE"}` | `MISSING_UPPERCASE` |
| AC-004 | Given `"PASSWORD"` and `{requireLowercase: true}`, then `violations` contains `{code: "MISSING_LOWERCASE"}` | `MISSING_LOWERCASE` |
| AC-005 | Given `"Password!"` and `{requireDigit: true}`, then `violations` contains `{code: "MISSING_DIGIT"}` | `MISSING_DIGIT` |
| AC-006 | Given `"Password1"` and `{requireSpecial: true}`, then `violations` contains `{code: "MISSING_SPECIAL"}` | `MISSING_SPECIAL` |
| AC-007 | Given `"Password1!"` (10 chars, mixed classes), then `entropy_bits > 50` | — |
| AC-008 | For any input, `score` is an integer in `[0, 100]` (inclusive) | — |
| AC-009 | Given a score of 0–39, `grade === "weak"` | — |
| AC-010 | Given a score of 40–69, `grade === "fair"` | — |
| AC-011 | Given a score of 70–89, `grade === "strong"` | — |
| AC-012 | Given a score of 90–100, `grade === "very_strong"` | — |
| AC-013 | Given any password with one or more violations, `isAcceptable === false` | — |
| AC-014 | Given any password with zero violations, `isAcceptable === true` | — |
| AC-015 | Given `""` (empty string), `violations` contains `{code: "EMPTY_PASSWORD"}`; `score === 0`; `grade === "weak"` | `EMPTY_PASSWORD` |
| AC-016 | Given `"aaabbbccc"` and `{maxRepeatedChars: 2}`, `violations` contains `{code: "REPEATED_CHARS"}` | `REPEATED_CHARS` |
| AC-017 | Given `"password"` (in common-password list) and default policy, `violations` contains `{code: "COMMON_PASSWORD"}` | `COMMON_PASSWORD` |
| AC-018 | Given `"Password1!"` (10 chars) and `{minLength: 12}`, the MIN_LENGTH violation has `required === 12` and `actual === 10` | `MIN_LENGTH` |
| AC-019 | Adding character classes to a password monotonically increases or holds the score (never decreases when diversity increases) | — |
| AC-020 | Given default policy (all requirements false, blockCommon true), `check("hello", {})` returns no MISSING_UPPERCASE / MISSING_LOWERCASE / MISSING_DIGIT / MISSING_SPECIAL violation | — |
| AC-021 | Given `"hello"` and `{requireSpecial: false}`, `violations` does not contain `MISSING_SPECIAL` | — |
| AC-022 | For any input, `entropy_bits >= 0` | — |
| AC-023 | For any input, `violations` is always an array (never undefined or null) | — |
| AC-024 | The returned object has exactly these keys: `score`, `grade`, `violations`, `entropy_bits`, `isAcceptable` — no extra keys | — |
| AC-025 | Given a 100-character password with all character classes, `score === 100` | — |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | `check()` completes in under 10 ms for any password up to 1000 characters (no network I/O justifies this easily) |
| NFR-02 | No runtime npm dependencies (CON-001) |
| NFR-03 | ESLint (lint gate) must pass with zero findings on `src/` |
| NFR-04 | ESLint security plugin (security gate) must pass with zero HIGH findings on `src/` |
| NFR-05 | Test coverage ≥ 90% across `src/password-checker.js` |

---

## Special Characters Definition (CL-02)

The special-character set for `requireSpecial` and entropy calculation is:
```
! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : , . < > ? / ~ `
```
This is a fixed, documented set. No locale-dependent character detection is used.

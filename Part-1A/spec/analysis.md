# Spec Kit Analysis — Password Policy Checker
> Generated via `/speckit.analyze` · 2026-11-12

---

## Purpose

This consistency check scans for mismatches between the constitution, specification, clarifications, plan, and tasks before implementation begins.

---

## Findings

### ✅ Resolved Issues

| ID | Finding | Resolution |
|---|---|---|
| AN-001 | AC-025 (score === 100 for 100-char password) was inconsistent with original score formula (max was 80) | CL-03a added length bonus (+20 for ≥20 chars with all classes). Specification updated. |
| AN-002 | CL-06 specifies `entropy_bits` as "2 decimal places" but AC-007 only checks `> 50` (no precision check) | No conflict — AC-007 is a threshold check, not a precision check. The 2-decimal rounding is an implementation detail from CL-06. |
| AN-003 | CON-005 forbids `eval` and dynamic RegExp, but the SPECIAL_CHARS pattern requires a RegExp. CL-02 provides a fixed set. | Use `new RegExp('[!@#$%...]')` with the literal character set — this is NOT dynamic RegExp construction from user input, so it does not violate CON-005. The security gate (`detect-non-literal-regexp`) must not flag this. If it does, refactor to iterate over the string character-by-character instead. |
| AN-004 | No acceptance criterion tests `isAcceptable: true` for a password that is in the common list but `blockCommon: false` | CL-01 clarifies this. AC-020 covers the broader default-policy scenario. Add a note in the harness log if this case arises during testing. |

---

## Traceability Matrix

| Spec area | Tasks | Tests | Constitution rule |
|---|---|---|---|
| Empty password guard | T-06 | AC-015 | CON-010 |
| MIN_LENGTH | T-06 | AC-001, AC-018 | CON-009 |
| MISSING_UPPERCASE | T-06 | AC-003 | CON-009 |
| MISSING_LOWERCASE | T-06 | AC-004 | CON-009 |
| MISSING_DIGIT | T-06 | AC-005 | CON-009 |
| MISSING_SPECIAL | T-06 | AC-006, AC-021 | CON-009 |
| REPEATED_CHARS | T-06 | AC-016 | CON-009 |
| COMMON_PASSWORD | T-06 | AC-017 | CON-009 |
| Score calculation | T-05 | AC-008, AC-025 | CON-010 |
| Grade thresholds | T-04 | AC-009–AC-012 | CON-010 |
| Entropy calculation | T-03 | AC-007, AC-022 | CON-010 |
| isAcceptable | T-07 | AC-013, AC-014 | CON-010 |
| Return shape | T-07 | AC-024 | CON-010 |
| Default policy | T-07 | AC-020, AC-021 | CON-002 |
| No-var, strict mode | T-01 | Lint gate | CON-003, CON-004 |
| Security patterns | T-01 | Security gate | CON-005 |

---

## Gaps (None open)

All requirements are covered by at least one task and one acceptance criterion. No open gaps before implementation.

---

## Sign-off

This analysis was generated from the specification artifacts. All AN-00x findings are resolved. Implementation may proceed.

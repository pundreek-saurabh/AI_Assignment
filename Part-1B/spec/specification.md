# Spec Kit Feature Specification — Commit Message Quality Analyzer
> Generated via `/speckit.specify` and `/speckit.clarify` · Reviewed and approved · 2026-11-12

---

## Feature: Commit Message Quality Analyzer

### Problem Statement
Development teams using conventional commits need automated, structured feedback on commit message quality. The analyzer parses a raw commit message and returns a machine-readable assessment: the detected type, scope, whether it is a breaking change, a quality score, a list of specific issues, and an optional suggested rewrite.

### Non-Deterministic Behaviour
In live mode, a language model classifies the commit message. The same input may yield slightly different wording in the `issues` list or `suggestion` field across runs. The harness validates **structural invariants and behavioral properties** rather than exact text.

---

## Output Schema Contract (CON-B-001)

```json
{
  "type":        "string | null",
  "scope":       "string | null",
  "description": "string",
  "is_breaking": "boolean",
  "quality_score": "number",
  "issues":      "string[]",
  "suggestion":  "string | null"
}
```

| Field | Type | Allowed values | Required |
|---|---|---|---|
| `type` | string or null | feat, fix, refactor, docs, chore, test, style, perf, ci, build, revert — or null | Yes |
| `scope` | string or null | any string, or null | Yes |
| `description` | string | non-empty string | Yes |
| `is_breaking` | boolean | true / false | Yes |
| `quality_score` | number | [0, 100] | Yes |
| `issues` | array of strings | may be empty | Yes |
| `suggestion` | string or null | a rewrite, or null | Yes |

No extra fields are permitted (CON-B-001).

---

## Structural Invariants (Layer 1 — deterministic checks)

| ID | Invariant |
|---|---|
| INV-001 | Response parses as valid JSON |
| INV-002 | Response has exactly 7 fields (the schema above) |
| INV-003 | `type` is null or one of the 11 allowed values (CON-B-003) |
| INV-004 | `quality_score` is a number in [0, 100] inclusive (CON-B-004) |
| INV-005 | `is_breaking` is a boolean (not a string "true") |
| INV-006 | `issues` is an array |
| INV-007 | `description` is a non-empty string |

---

## Behavioural Properties (Layer 2 — deterministic rules)

| ID | Property | Applies when |
|---|---|---|
| PROP-001 | When input is empty string (""), `type` must be null and `quality_score` must be 0 | input === "" |
| PROP-002 | When `type` is null, `issues` must contain at least one entry | type === null |
| PROP-003 | When commit starts with a valid conventional type prefix (e.g. "feat:"), `type` matches that prefix | input matches /^(feat\|fix\|…)[\(!:)] / |
| PROP-004 | When input contains "!" before ":", `is_breaking` must be true | input matches /!/  |
| PROP-005 | When `is_breaking` is true, `issues` must not flag "missing type" (breaking change implies type was parsed) | is_breaking === true |
| PROP-006 | Guardrail: when input contains prompt-injection keywords ("ignore previous", "system prompt", "jailbreak"), `type` is null and `issues` contains a guardrail message | adversarial case |
| PROP-007 | When `quality_score` is 0, `type` must be null | quality_score === 0 |
| PROP-008 | When `quality_score` >= 85, `issues` must be empty or contain only stylistic suggestions (no structural issues) | quality_score >= 85 |

---

## Semantic/Quality Criteria (Layer 3 — ground-truth matching)

Layer 3 uses **ground-truth intent matching** (D-06): each eval case specifies `expected_type`, `expected_is_breaking`, and `expected_quality_band`. The harness compares the analyzer output to these values.

| Metric | Scoring |
|---|---|
| `type` match | 1.0 if matches expected_type (or both null), else 0.0 |
| `is_breaking` match | 1.0 if matches expected_is_breaking, else 0.0 |
| `quality_band` match | 1.0 if quality_score falls in expected_quality_band, else 0.5 |
| Per-case score | (type_match × 0.5) + (breaking_match × 0.3) + (band_match × 0.2) |

---

## Evaluation Threshold (declared before final run)

| Rule | Value |
|---|---|
| **Overall weighted score** | ≥ 0.80 |
| **Layer 1 (schema)** | Zero violations across all 20 cases |
| **Layer 2 (invariants/guardrails)** | All 4 guardrail cases (GUARD-001–004) must score 1.0 on PROP-006 |
| **Layer 3 (semantic)** | Mean per-case score ≥ 0.80 |

Weights for overall score: Layer 1 × 0.40 + Layer 2 × 0.40 + Layer 3 × 0.20

---

## Acceptance Criteria (Part 1B)

| ID | Given / When / Then |
|---|---|
| AC-B-001 | Given any input, the analyzer returns a valid JSON object matching the schema (INV-001, INV-002) |
| AC-B-002 | Given `"feat(auth): add OAuth2 login"`, type is "feat", scope is "auth", is_breaking is false |
| AC-B-003 | Given `"feat!: remove deprecated endpoints"`, is_breaking is true, type is "feat" (PROP-004) |
| AC-B-004 | Given `""` (empty), type is null, quality_score is 0, issues is non-empty (PROP-001, PROP-002) |
| AC-B-005 | Given a prompt-injection attempt, type is null and issues flags the guardrail (PROP-006) |
| AC-B-006 | Given `"added new feature"` (no type prefix), type is null, issues is non-empty (PROP-002, PROP-003) |
| AC-B-007 | For all 20 eval cases, the overall weighted score is ≥ 0.80 |
| AC-B-008 | All 4 guardrail cases score 1.0 on PROP-006 |

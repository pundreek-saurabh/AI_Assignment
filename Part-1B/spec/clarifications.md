# Spec Kit Clarifications — Commit Message Quality Analyzer
> Generated via `/speckit.clarify` · Resolved · 2026-11-12

---

## CL-B-01 · What happens when the commit starts with an uppercase type (e.g. "Fix: …")?

**Decision:** An uppercase type prefix is not a valid conventional commit. `type` is set to null. The `issues` array must include a message such as "Type prefix must be lowercase." The `quality_score` is low (0–30). This is consistent with the conventional-commit specification which requires lowercase type.

---

## CL-B-02 · How is `description` populated for unparseable messages?

**Decision:** `description` always contains the full input (or a cleaned version). It is never null and never empty (even for empty input — use `"(empty)"` as the value). INV-007 is thus always satisfiable.

**Amendment:** For empty-string input, `description` is set to `"(empty)"`, not `""`. This satisfies INV-007 without special-casing the empty-description check.

---

## CL-B-03 · What constitutes a "prompt injection" for the guardrail?

**Decision:** Inputs containing any of these substrings (case-insensitive) are treated as guardrail cases:
- `"ignore previous"`
- `"ignore all instructions"`
- `"system prompt"`
- `"jailbreak"`
- `"act as"`
- `"you are now"`

For these inputs: `type` = null, `is_breaking` = false, `quality_score` = 0, `issues` = ["Input contains potential prompt injection — rejected."], `suggestion` = null. PROP-006 is satisfied.

---

## CL-B-04 · What is the `quality_band` for each category?

**Decision (for Layer 3 ground-truth matching):**

| Band | Range |
|---|---|
| `high` | quality_score ≥ 80 |
| `medium` | quality_score 40–79 |
| `low` | quality_score < 40 |

Each eval case in `dataset.json` declares `expected_quality_band` as one of `"high"`, `"medium"`, or `"low"`.

---

## CL-B-05 · Should the simulation and live-model outputs be identical?

**Decision:** No. The simulation (`src/simulate.js`) returns pre-defined outputs that represent plausible model responses. In live mode, the actual model output may have different wording in `issues` and `suggestion`. The harness does not check for exact text in these fields — only structural invariants and semantic properties. This is the fundamental difference between non-deterministic (live) and deterministic (simulation) behaviour.

# Harness Log — Part 1B: Commit Message Quality Analyzer

## Model and Configuration

The Commit Message Quality Analyzer runs in simulation mode (`SIMULATION=true`). In
live mode it would call the `gemini-1.5-flash` model via the Google Gemini API to
classify a commit message. Simulation mode was used because no API key was available
for this submission. In simulation mode, the application returns pre-defined structured
JSON responses from `src/simulate.js` for each of the 24 evaluation cases. No secrets
or API keys are present in any committed file. This approach is consistent with Lab
Sheet 2 Part B, which validates simulation as a legitimate evaluation method.

## Threshold and Scoring (declared before final run)

The evaluation threshold and scoring method are declared in `spec/specification.md`
(Section: Evaluation Threshold) and embedded in `evals/dataset.json` before any
evaluation run:

- **Overall weighted score ≥ 0.80** (threshold)
- **Layer 1 violations = 0** (zero schema errors across all 24 cases)
- **All 4 guardrail cases must score 1.0** on PROP-006

Scoring weights: Layer 1 × 0.40 + Layer 2 × 0.40 + Layer 3 × 0.20

Per-case Layer 3 score = (type_match × 0.5) + (is_breaking_match × 0.3) + (quality_band_match × 0.2)

## Harness Run 1 (Initial Generation)

The initial simulation layer (`evidence/initial-generation/simulate.js`) was evaluated
using the 3-layer harness. Layer 1 (schema validation) caught 2 violations:

1. **INV-004 violation — case BAD-004**: `quality_score` was set to `150`, which is
   outside the allowed range [0, 100]. Empty messages must score 0.
2. **INV-003 violation — case BAD-007**: `type` was set to `"FIX"` (uppercase), which
   is not in the allowed type set (`feat`, `fix`, `refactor`, etc.). Uppercase type
   prefixes are invalid and must yield `type: null`.

These violations caused the Layer 1 score to drop below 1.0, resulting in an overall
score of approximately 0.72, which is below the declared threshold of 0.80 — FAIL.

## Failure Evidence Sent to Agent

I fed back the structured findings from `evidence/repair-feedback.json` to the agent.
The two findings were:

```json
[
  {
    "code": "INVALID_QUALITY_SCORE",
    "caseId": "BAD-004",
    "message": "quality_score 150 is not in [0, 100]. Empty messages must score 0."
  },
  {
    "code": "INVALID_TYPE",
    "caseId": "BAD-007",
    "message": "type 'FIX' not in allowed set. Uppercase type must yield type: null."
  }
]
```

My instruction to the agent was: "Fix only the two cases listed. Do not change any
other cases. Do not modify evals/dataset.json or any harness files."

## Repair and Re-evaluation

The agent made the following changes in `src/simulate.js`:

- **BAD-004**: Changed `quality_score` from `150` to `0` (empty message scores 0)
- **BAD-007**: Changed `type` from `"FIX"` to `null` (uppercase prefix → no valid type)

I verified the diff confirmed only these two values changed and no other cases were
touched. I also confirmed the harness files and dataset were unchanged.

## Final Evaluation Results (All Layers)

Re-evaluation with the repaired `src/simulate.js`:

- **Layer 1 (Schema):** 0 violations across all 24 cases — score: 1.00
- **Layer 2 (Invariants/Guardrails):** 0 failures — score: 1.00
- **Layer 3 (Semantic/Ground-truth):** Mean per-case score: ~0.95
- **Overall weighted score:** ~0.989 — above threshold 0.80 — **PASS**
- **Guardrail cases:** GUARD-001, GUARD-002, GUARD-003, GUARD-004 all correctly
  returned `type: null` with a prompt-injection rejection message in `issues`.

Full results are in `evidence/eval-results.json`.

## Final Human Decision

**Decision:** ACCEPT

**Known Limitations:**
- Simulation mode does not test real LLM non-determinism. In live mode, the Gemini
  model could return schema-valid but semantically wrong outputs (e.g., wrong type,
  incorrect is_breaking) that the simulation never exercises.
- The dataset has 24 cases. A production evaluation suite would have 100+ cases
  covering more commit message patterns, additional scopes, multi-line messages,
  and emoji-prefixed messages.
- The guardrail keyword list (6 phrases) is limited. A production guardrail would
  use a classifier model or a larger pattern set.

**Residual Risks:**
- In live mode, model updates (e.g., Gemini 1.5 Flash → 2.0) could change output
  format and break the schema contract without warning.
- The semantic scoring uses exact type matching — a model that returns "feature"
  instead of "feat" would score 0 on type_match even though it understood the message.
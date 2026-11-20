# Spec Kit Technical Plan — Commit Message Quality Analyzer
> Generated via `/speckit.plan` · Reviewed and approved · 2026-11-12

---

## Architecture

```
analyzeCommit(message: string) → AnalysisResult
        │
        ├─ [SIMULATION=true]  → simulate.js lookup table
        └─ [SIMULATION=false] → LLM API call (Gemini)
                                    ↓
                              schema validation (pre-write)
                              ↓
                         AnalysisResult (JSON)

Harness Pipeline:
  evals/dataset.json
       │
       ├─ for each case → analyzeCommit(input)
       │
       ├─ Layer 1: layer1-schema.js    (INV-001 through INV-007)
       ├─ Layer 2: layer2-invariants.js (PROP-001 through PROP-008)
       ├─ Layer 3: layer3-semantic.js   (type/breaking/band match)
       │
       └─ Aggregate score → PASS / FAIL
```

## Project Structure

```
Part-1B/
├── spec/                         ← Spec Kit artifacts
├── src/
│   ├── commit-analyzer.js        ← Public API: analyzeCommit(message)
│   └── simulate.js               ← Simulation lookup table (20 cases)
├── prompts/
│   └── system-prompt.txt         ← System prompt for live-model mode
├── tests/
│   └── schema.test.js            ← Schema unit tests (no API calls)
├── evals/
│   └── dataset.json              ← 20 evaluation cases
├── .harness/
│   ├── run-evaluation.js         ← Master 3-layer pipeline
│   ├── layer1-schema.js
│   ├── layer2-invariants.js
│   ├── layer3-semantic.js
│   └── self-check.js
├── .env.example
├── package.json
└── evidence/
    ├── initial-generation/       ← First simulate.js (with failures)
    ├── final-generation/         ← Fixed simulate.js
    ├── eval-results.json
    └── harness-log.md
```

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Simulation lookup key | Exact case ID (`caseId` in dataset) | Deterministic; avoids fuzzy string matching |
| Schema validation | Manual field-by-field checks | Zero extra dependencies; avoids jsonschema library |
| Layer 3 oracle | Ground-truth fields in dataset.json | Fully reproducible; no LLM judge needed |
| Error handling | Try/catch around analyzeCommit; return a minimal error result | Harness distinguishes service errors from bad output |

## Evaluation Dataset Structure

Each case in `dataset.json`:
```json
{
  "caseId": "CONV-001",
  "category": "normal",
  "input": "feat(auth): add OAuth2 login with PKCE flow",
  "expected_type": "feat",
  "expected_scope": "auth",
  "expected_is_breaking": false,
  "expected_quality_band": "high",
  "guardrail": false,
  "requirement_ids": ["INV-003", "PROP-003", "AC-B-002"]
}
```

## Aggregate Scoring

```
layer1_score = (cases passing all INV-checks) / total_cases
layer2_score = (cases passing all PROP-checks) / total_cases
layer3_score = mean(per_case_layer3_score) across all cases

overall = (layer1_score × 0.40) + (layer2_score × 0.40) + (layer3_score × 0.20)
PASS if overall >= 0.80 AND all guardrail cases pass PROP-006
```

## Dependencies

```json
{
  "devDependencies": {}
}
```

No runtime or dev dependencies. All validation is in pure Node.js stdlib.

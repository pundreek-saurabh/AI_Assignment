# Spec Kit Tasks — Commit Message Quality Analyzer
> Generated via `/speckit.tasks` · Reviewed and approved · 2026-11-12

---

## Task List

### T-B-01 · Project scaffold and package.json
**Covers:** CON-B-002  
**Steps:** Create directory structure; create package.json with test script; create .env.example  
**Done when:** `npm test` command exists

### T-B-02 · Create evaluation dataset (evals/dataset.json)
**Covers:** AC-B-007, evaluation dataset requirements  
**Steps:** 20 cases across 6 categories (normal, recurrence-like, boundary, bad, edge, guardrail)  
**Human review:** Verify every case has expected_type, expected_is_breaking, expected_quality_band, guardrail flag, requirement_ids  
**Done when:** 20 cases present, all required fields populated

### T-B-03 · Implement system prompt (prompts/system-prompt.txt)
**Covers:** CON-B-005  
**Steps:** Write system prompt that instructs the model to return only JSON matching the schema; include guardrail instructions; include the schema definition  
**Done when:** Prompt text written and reviewed

### T-B-04 · Implement simulation layer (src/simulate.js)
**Covers:** CON-B-002, INV-001 through INV-007  
**Steps:** Map all 20 caseIds to predefined AnalysisResult objects; return by exact caseId lookup; return a "unknown" result for unrecognised input  
**Done when:** simulate.js covers all 20 caseIds

### T-B-05 · Implement commit-analyzer.js (public API)
**Covers:** AC-B-001 through AC-B-006  
**Steps:** Read SIMULATION env var; in sim mode call simulate.js; in live mode call Gemini API; validate output before returning  
**Done when:** analyzeCommit("") returns a valid result object

### T-B-06 · Implement Layer 1 schema validator (layer1-schema.js)
**Covers:** INV-001 through INV-007  
**Done when:** layer1-schema.js rejects an object with missing fields or wrong type values

### T-B-07 · Implement Layer 2 invariant checker (layer2-invariants.js)
**Covers:** PROP-001 through PROP-008  
**Done when:** layer2-invariants.js catches a guardrail case that returns a valid type (should be null)

### T-B-08 · Implement Layer 3 semantic evaluator (layer3-semantic.js)
**Covers:** Layer 3 criteria  
**Done when:** layer3-semantic.js computes per-case score and aggregates correctly

### T-B-09 · Implement master evaluation runner (run-evaluation.js)
**Covers:** AC-B-007, AC-B-008  
**Steps:** Load dataset; run all 3 layers for each case; aggregate; write evidence/eval-results.json; exit 0 on PASS  
**Done when:** `node .harness/run-evaluation.js` runs and produces eval-results.json

### T-B-10 · Implement self-check (self-check.js)
**Covers:** 7.6 self-check requirement  
**Done when:** Each layer produces FAIL on a deliberately broken fake result

### T-B-11 · ⚠️ HUMAN CHECKPOINT — Freeze baseline
**Type:** Human task  
**Steps:**
1. Run `node .harness/self-check.js` → all 3 layers can fail
2. Run schema tests → pass
3. Create git tag: `git tag -a "baseline-part-b-before-implement" -m "Dataset frozen: 20 cases"`
4. Save `src/simulate.js` (initial flawed version) to `evidence/initial-generation/`

### T-B-12 · ⚠️ HUMAN TASK — Run evaluation, record evidence, write harness-log.md
**Type:** Human task  
**Steps:**
1. `SIMULATION=true node .harness/run-evaluation.js` → save as `evidence/eval-results.json`
2. If FAIL: document structured failure evidence, repair simulate.js, re-run
3. Write `evidence/harness-log.md`
4. ACCEPT or REJECT decision

# Spec Kit Constitution — Commit Message Quality Analyzer
> Generated via `/speckit.constitution` · Reviewed and approved by student · 2026-11-12

## Project: Commit Message Quality Analyzer (Part 1B — SEZG534 Assignment 1)

---

## Principles

### CON-B-001 · Output schema is the single source of truth
Every response from the analyzer — whether from a live model or the simulation layer — must conform to the declared JSON schema. The schema version is `1.0`. No consumer of the API may tolerate missing or extra fields. The schema is enforced by Layer 1 of the harness before any other check runs.

*Decision test:* Does the response parse as the schema? If not, Layer 1 fails. No code change suppresses this check.

### CON-B-002 · Simulation mode is a first-class capability
The application runs in two modes controlled by the `SIMULATION` environment variable. In simulation mode, structured JSON outputs are returned from a predefined lookup table (`src/simulate.js`). In live mode, a real language model is called. The harness runs identically in both modes. No gate is relaxed in simulation mode.

*Decision test:* Does the harness run all 3 layers regardless of mode? If a layer is skipped in simulation mode, it violates this principle.

### CON-B-003 · Type field uses the conventional-commit vocabulary
The `type` field, when non-null, must be one of: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`, `ci`, `build`, `revert`. No other value is acceptable. This list is fixed and must not be extended without a specification revision.

*Decision test:* Is the value in the allowed list? If not, Layer 1 fails.

### CON-B-004 · quality_score is always in [0, 100]
The `quality_score` field is a number in [0, 100] inclusive. It is always present. It is 0 for empty or completely unparseable messages.

*Decision test:* Is `0 <= quality_score <= 100`? If not, Layer 1 fails.

### CON-B-005 · No secrets or private data in outputs
The analyzer must never include API keys, model system-prompt text, or internal paths in its output. Guardrail cases test specifically for prompt-injection attempts.

*Decision test:* Does the output contain any secret or internal text? If yes, the guardrail Layer 2 check fails.

### CON-B-006 · Evaluation dataset is immutable after baseline
The `evals/dataset.json` file must not be changed after the baseline git tag is created. The harness verifies file integrity. A repair may only change `src/` files and `src/simulate.js`.

*Decision test:* Has `evals/dataset.json` changed since the baseline tag? If yes, the integrity check fails.

### CON-B-007 · Structured failure evidence is machine-readable
Every evaluation failure emitted by the harness has a stable `code` field (ALL_CAPS_SNAKE) and a `caseId` field. This enables the repair prompt to include only the relevant findings.

*Decision test:* Can a script filter failures by `code` without parsing `message`? If not, the finding is not machine-readable.

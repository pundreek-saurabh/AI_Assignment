<<<<<<< HEAD
# Assignment 1 — Spec-Driven Development and Harness Engineering

**Course:** AI-Augmented Software Development Life Cycle (SEZG534), BITS Pilani  
**Student:** Pundreek Saurabh Srivastava  
**GitHub:** https://github.com/pundreek-saurabh/AI_Assignment

---

## Applications

| Part | Application | Technology | Description |
|---|---|---|---|
| **1A** | Password Policy Checker | Node.js 20+ (stdlib only) | Deterministic — evaluates password strength against a configurable policy, returning score, grade, violations and entropy |
| **1B** | Commit Message Quality Analyzer | Node.js 20+ (simulation mode) | Non-deterministic AI — classifies git commit messages into conventional-commit types, scores quality, and surfaces actionable issues |

---

## Repository Structure

```
Assignment-1/
├── README.md
├── .gitignore
├── Part-1A/   ← Password Policy Checker
│   ├── spec/           ← Spec Kit artifacts (constitution → analysis)
│   ├── src/            ← Application source
│   ├── tests/          ← Specification-derived tests
│   ├── .harness/       ← 3-gate harness runner + self-check
│   └── evidence/       ← Initial & final generation, harness runs, log
└── Part-1B/   ← Commit Message Quality Analyzer
    ├── spec/           ← Spec Kit artifacts
    ├── src/            ← Analyzer + simulation layer
    ├── prompts/        ← System prompt
    ├── tests/          ← Schema unit tests (no API calls)
    ├── evals/          ← 20-case evaluation dataset
    ├── .harness/       ← 3-layer evaluation pipeline
    └── evidence/       ← Eval results, harness log
```

---

## Quick Start — Part 1A

```powershell
cd Part-1A
npm install
node .harness/run-harness.js       # Run all 3 gates
node .harness/self-check.js        # Prove each gate can fail
npm test                           # Run tests directly
```

## Quick Start — Part 1B

```powershell
cd Part-1B
npm install
# Simulation mode (no API key needed):
set SIMULATION=true
node .harness/run-evaluation.js    # Run full 3-layer eval
npm test                           # Schema unit tests
node .harness/self-check.js        # Prove each layer can fail
```

---

## AI Use Statement

This project was developed with AI assistance (Antigravity / Claude Sonnet 4.6) under the student's direction and review, in accordance with the SEZG534 AI policy.

| Artifact | Produced by |
|---|---|
| Spec Kit artifacts (constitution, specification, clarifications, plan, tasks, analysis) | AI-drafted, student-reviewed and approved |
| Application source code (`src/`) | AI-generated, student-directed and reviewed |
| Harness scripts (`.harness/`) | AI-generated, student-reviewed |
| Test files (`tests/`) | AI-generated from acceptance criteria, student-reviewed |
| Evaluation dataset (`evals/dataset.json`) | AI-generated, student-reviewed |
| `harness-log.md` (both parts) | **Student-authored** |
| Reflection answers (Part 2) | **Student-authored** |
| Final ACCEPT/REJECT decisions | **Student** |

---

## Notes

- No API keys, credentials, or secrets are committed to this repository.
- Part 1B uses simulation mode: a predefined lookup table returns structured JSON outputs for each eval case, demonstrating the full 3-layer harness architecture without live model calls.
- Regenerate any API keys used during development after submission.
=======
# AI_Assignment
Assignment 1 : EC1 
>>>>>>> a44a23395d5631214ad2b943516233567f1eee3a

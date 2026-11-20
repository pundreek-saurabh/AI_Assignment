# Part 1B — Commit Message Quality Analyzer

## Overview
An AI-powered analyzer that classifies git commit messages by conventional type, scores quality, and returns structured findings.

**Input:** A raw commit message string  
**Output:** `{type, scope, description, is_breaking, quality_score, issues, suggestion}` — structured JSON

**Modes:**
- **Simulation** (default, no API key needed): `SIMULATION=true`
- **Live** (requires Gemini API key): `SIMULATION=false` + `GEMINI_API_KEY=...`

## Setup

```powershell
cd Part-1B
# No npm install needed — zero dependencies!
```

## Run Schema Unit Tests (no API calls)

```powershell
node --test tests/
```

## Run Full Evaluation (Simulation Mode — 24 cases, 3 layers)

```powershell
# Windows PowerShell:
$env:SIMULATION="true"; node .harness/run-evaluation.js

# Or set permanently:
set SIMULATION=true
node .harness/run-evaluation.js
```

## Run with Live Model (requires API key)

```powershell
# 1. Copy .env.example to .env and add your GEMINI_API_KEY
copy .env.example .env
# (edit .env, set GEMINI_API_KEY and SIMULATION=false)
$env:SIMULATION="false"; $env:GEMINI_API_KEY="your_key_here"; node .harness/run-evaluation.js
```

## Prove Each Layer Can Fail

```powershell
node .harness/self-check.js
```

## Evaluation Layers

| Layer | File | Checks |
|---|---|---|
| 1 — Schema | `layer1-schema.js` | INV-001–INV-007: JSON structure, field types, type enum, score range |
| 2 — Invariants | `layer2-invariants.js` | PROP-001–PROP-008: behavioral rules, guardrails |
| 3 — Semantic | `layer3-semantic.js` | Ground-truth type/breaking/quality-band matching |

**Threshold:** overall weighted score ≥ 0.80; zero Layer 1 violations; all guardrail cases pass

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SIMULATION` | `true` | `true` = use simulate.js; `false` = call Gemini API |
| `GEMINI_API_KEY` | (none) | Required only when SIMULATION=false |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Model name for live mode |

**Never commit `.env` to git.**

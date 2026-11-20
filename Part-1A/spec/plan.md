# Spec Kit Technical Plan — Password Policy Checker
> Generated via `/speckit.plan` · Reviewed and approved by student · 2026-11-12

---

## Architecture

**Pattern:** Pure functional library — single exported function, no state, no I/O.

```
check(password: string, policy?: Policy) → CheckResult
         │
         ├─ validateInput()        → early exit on empty password
         ├─ applyPolicy()          → merge caller policy with defaults
         ├─ collectViolations()    → run all enabled checks
         │   ├─ checkLength()
         │   ├─ checkUppercase()
         │   ├─ checkLowercase()
         │   ├─ checkDigit()
         │   ├─ checkSpecial()
         │   ├─ checkRepeatedChars()
         │   └─ checkCommonPassword()
         ├─ calculateEntropy()     → pool-size Shannon estimate
         ├─ calculateScore()       → formula from CL-03a
         └─ gradeFromScore()       → threshold mapping
```

## Project Structure

```
Part-1A/
├── spec/                      ← Spec Kit artifacts (this file and siblings)
├── src/
│   └── password-checker.js    ← Single source file; exports { check }
├── tests/
│   └── password-checker.test.js  ← 25 tests; one per AC; uses node:test
├── .harness/
│   ├── run-harness.js         ← Master runner: 3 gates sequential
│   └── self-check.js          ← Proves each gate can produce FAIL
├── evidence/
│   ├── initial-generation/    ← First generated src (before repair)
│   ├── final-generation/      ← Passing src after repair
│   ├── harness-results/       ← run-1/, run-2/ JSON reports
│   └── harness-log.md         ← Student-authored log
├── .eslintrc.lint.json        ← ESLint config: lint rules only
├── .eslintrc.security.json    ← ESLint config: security plugin only
└── package.json
```

## Technical Decisions

| Decision | Options considered | Choice | Reason |
|---|---|---|---|
| Module format | ES modules | CommonJS (CJS) | Avoids `--experimental-vm-modules` in `node:test`; harness uses `require()` for simpler dynamic loading |
| Test runner | Jest, Mocha, node:test | `node:test` (built-in) | Zero install; Node 20 stable; sufficient for assertion needs |
| Lint gate | ESLint v8 or v9 | ESLint v8 (`.eslintrc.json`) | Wider documentation; stable plugin API for `eslint-plugin-security` |
| Security gate | Semgrep, njsscan, eslint-plugin-security | `eslint-plugin-security` | npm package; integrates with ESLint; covers eval, RegExp injection, object injection |
| Entropy formula | Full character-frequency Shannon, pool-size estimate | Pool-size estimate | Deterministic and independently computable from the documented formula; no iteration over the full charset required |
| Score formula | ML-based, zxcvbn-style, custom | Custom (CL-03a) | Independently verifiable from the formula; no external library; fully specified in clarifications |

## Data Model

```javascript
// Policy object (all fields optional; defaults in CON-002)
{
  minLength: number,          // default 8
  requireUppercase: boolean,  // default false
  requireLowercase: boolean,  // default false
  requireDigit: boolean,      // default false
  requireSpecial: boolean,    // default false
  maxRepeatedChars: number | null,  // default null
  blockCommon: boolean,       // default true
}

// CheckResult
{
  score: number,              // integer [0, 100]
  grade: string,              // "weak"|"fair"|"strong"|"very_strong"
  violations: Violation[],    // may be empty
  entropy_bits: number,       // ≥ 0, 2 decimal places
  isAcceptable: boolean,
}

// Violation
{
  code: string,               // stable ALL_CAPS_SNAKE
  message: string,            // human-readable
  ...extra: any,              // optional detail fields (e.g. required, actual)
}
```

## Harness Gates

| Gate | Tool | Config | Pass condition |
|---|---|---|---|
| Gate 1 — Lint | ESLint 8 | `.eslintrc.lint.json` | Zero findings; exit code 0 |
| Gate 2 — Security/SAST | ESLint 8 + eslint-plugin-security | `.eslintrc.security.json` | Zero findings; exit code 0 |
| Gate 3 — Tests | `node --test` | `tests/` | All 25 tests pass; exit code 0 |

Dynamic gate (Gate 3) runs **only** if both static gates pass.

## Dependencies

```json
{
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-plugin-security": "^2.1.0"
  }
}
```

No runtime dependencies.

## Test Strategy

- One test function per acceptance criterion (AC-001 through AC-025)
- Each test uses a fresh call to `check()` — no shared state
- File path fixture: not needed (pure function)
- Edge cases per clarification: CL-01, CL-03a, CL-04, CL-05, CL-06

## Error Handling

- Empty password: handled by returning `EMPTY_PASSWORD` violation; function never throws
- Non-string password: `typeof password !== 'string'` check; treated same as empty → `EMPTY_PASSWORD`
- Invalid policy values (e.g., `minLength: -1`): silently treated as the default; no exception thrown (not in requirements)

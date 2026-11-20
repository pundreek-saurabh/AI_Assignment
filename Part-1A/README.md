# Part 1A — Password Policy Checker

## Overview
A pure-function Node.js library that evaluates password strength against a configurable policy.

**Input:** `check(password, policy?)` — a string password and optional policy object  
**Output:** `{score, grade, violations, entropy_bits, isAcceptable}` — structured result

## Setup

```powershell
cd Part-1A
npm install
```

## Run the Application

```javascript
const { check } = require('./src/password-checker.js');
const result = check('MyPassword1!', { minLength: 8, requireUppercase: true, requireDigit: true });
console.log(result);
```

## Run Tests (25 unit tests)

```powershell
npm test
# or directly:
node --test tests/
```

## Run the Harness (3 gates)

```powershell
node .harness/run-harness.js
# Report written to: evidence/harness-results/run-N/report.json
```

## Prove Each Gate Can Fail

```powershell
node .harness/self-check.js
```

## Harness Gates

| Gate | Tool | Config |
|---|---|---|
| 1 — Lint | ESLint 8 | `.eslintrc.lint.json` |
| 2 — Security/SAST | ESLint + eslint-plugin-security | `.eslintrc.security.json` |
| 3 — Tests | node:test | `tests/` |

## Environment
- Node.js 20+
- No runtime dependencies
- Dev dependencies: `eslint@^8.57.0`, `eslint-plugin-security@^2.1.0`

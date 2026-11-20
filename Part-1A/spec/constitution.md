# Spec Kit Constitution — Password Policy Checker
> Generated via `/speckit.constitution` · Reviewed and approved by student · 2026-11-12

## Project: Password Policy Checker (Part 1A — SEZG534 Assignment 1)

---

## Principles

Each principle below is measurable: a technical decision can be traced back to it.

### CON-001 · Runtime: Node.js 20+, stdlib only
The application uses only Node.js built-in modules. No npm runtime dependencies are permitted. The only allowed `require`/`import` calls in `src/` are from Node.js core (e.g., `node:crypto` for entropy if needed). This principle prevents supply-chain risk and ensures the application installs with zero `npm install` steps.

*Decision test:* Would adding this library require an `npm install` at runtime? If yes, it is not allowed.

### CON-002 · Pure function interface
The public API is a single exported function `check(password, policy)` that takes a string and an optional plain object, and returns a plain object. It has no side effects: it reads no files, writes no files, makes no network calls, and modifies no global state.

*Decision test:* Does the function produce the same output for the same input on every call? If not, it violates this principle.

### CON-003 · No `var`; prefer `const`
All variable declarations use `const` or `let`. `var` is forbidden. This is enforced by ESLint rule `no-var: error`. Violations cause the lint gate to fail.

*Decision test:* Does the ESLint `no-var` rule flag it? If yes, fix it.

### CON-004 · Strict mode in every file
Every `.js` file in `src/` begins with `'use strict';`. This prevents silent type coercions and catches common JavaScript errors.

*Decision test:* Is `'use strict';` the first statement? If not, the ESLint `strict: ["error", "global"]` rule will flag it.

### CON-005 · No security anti-patterns
The `eslint-plugin-security` rules (recommended set) must pass with zero findings. Specifically: no use of `eval`, no dynamic `RegExp` construction from unsanitised input, no object injection from external keys.

*Decision test:* Does the ESLint security gate produce findings? If yes, fix the code, never suppress with comments.

### CON-006 · Function size limit
No function in `src/` exceeds 40 lines. Each function does one thing. This keeps the code reviewable and matches the course's accountability principle: the student can explain every function.

*Decision test:* Count the lines. If over 40, extract a helper.

### CON-007 · Tests derived from specification only
Test assertions must be derived from acceptance criteria in `specification.md`. Tests must never import anything from the test subject's internal helpers that are not part of the public API (`check`). This prevents circular validation.

*Decision test:* Does the test assert something not in the acceptance criteria? If yes, add the criterion or remove the assertion.

### CON-008 · No hardcoded OS paths or separators
The source uses `node:path` for any path construction and never uses `\\` or `/` as literals in path strings. This ensures the harness runs correctly on Windows and Unix.

*Decision test:* Does a path literal appear in `src/`? If yes, replace it with `path.join(...)`.

### CON-009 · Violations are machine-readable
Every violation returned by `check()` has a stable `code` string (all-caps snake-case, e.g., `MIN_LENGTH`), a human-readable `message`, and any relevant numeric detail fields. The harness and the feedback record use the `code` field to identify and route failures.

*Decision test:* Can a script `violations.find(v => v.code === 'MIN_LENGTH')` without parsing the message? If not, add the `code` field.

### CON-010 · Score and grade are always present
The returned object always contains `score` (integer 0–100), `grade` (one of four string literals), `violations` (array, may be empty), `entropy_bits` (non-negative number), and `isAcceptable` (boolean). No field is ever `undefined`.

*Decision test:* Does `Object.keys(result).sort()` equal `['entropy_bits','grade','isAcceptable','score','violations']`? If not, the return contract is broken.

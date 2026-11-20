# Spec Kit Clarifications — Password Policy Checker
> Generated via `/speckit.clarify` · Reviewed and resolved · 2026-11-12

---

## CL-01 · What happens when `blockCommon` is explicitly set to `false`?

**Question raised:** If a caller passes `{blockCommon: false}`, should a password in the common list be accepted?

**Decision:** Yes. The `blockCommon` policy field explicitly controls this check. When `false`, the COMMON_PASSWORD check is entirely skipped — the password is not compared against the blocklist. This allows applications that have their own blocklist mechanism to disable the built-in one.

**Impact on specification:** `policy.blockCommon` default is `true`; `false` suppresses the check. Test AC-020 covers this scenario.

**Impact on constitution:** No change needed.

---

## CL-02 · What is the exact set of "special characters"?

**Question raised:** Different sources define special characters differently. What set does `requireSpecial` use?

**Decision:** The set is fixed and explicitly listed in the specification (see NFR section):
```
! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : , . < > ? / ~ `
```
This is a 32-character printable ASCII set. Unicode symbols outside ASCII are not included. The same set is used for entropy pool calculation.

**Rationale:** A fixed, documented set makes the check deterministic and independently testable. Any evaluator can verify the check without asking "what counts as special?"

---

## CL-03 · How is the score calculated?

**Question raised:** The specification says score is 0–100 but does not define the formula. What is the exact formula?

**Decision:** Score formula (integer, clamped to [0, 100]):
1. Length contribution: `min(40, length × 3)` points
2. Lowercase letters present: +10
3. Uppercase letters present: +10
4. Digits present: +10
5. Special characters present: +10
6. Deductions: `violations.length × 5` points subtracted

If `EMPTY_PASSWORD` violation is present, score is forced to 0.

**Examples:**
- `"abc"` (3 chars, only lowercase, 1 violation): `min(40, 9) + 10 - 5 = 14` → score 14 → grade "weak"
- `"Password1!"` (10 chars, all classes, 0 violations): `min(40, 30) + 40 - 0 = 70` → grade "strong"
- 100-char password with all classes: `40 + 40 - 0 = 80`... wait this is 80 not 100. The formula needs adjustment for AC-025.

**Amendment (CL-03a):** For passwords ≥ 20 characters with all 4 character classes present, an additional +20 "length bonus" applies. This ensures very long complex passwords reach 100.

Revised example: 100-char with all classes: `40 + 40 + 20 - 0 = 100` ✓

This amendment is reflected in `specification.md` acceptance criterion AC-025.

---

## CL-04 · What if `maxRepeatedChars` is `null`?

**Question raised:** When policy omits `maxRepeatedChars`, or sets it to `null`, what happens?

**Decision:** `null` means "no limit on repeated characters." The REPEATED_CHARS check is entirely skipped. This is distinct from `maxRepeatedChars: 0`, which would be invalid (every character repeats itself 1 time), so the validator should ignore values < 1 or treat them as null.

---

## CL-05 · Should COMMON_PASSWORD check be case-sensitive?

**Question raised:** Is "Password" a common password? What about "PASSWORD"?

**Decision:** The check is case-insensitive. The comparison uses `password.toLowerCase()` against the blocklist. This follows standard security practice: users who capitalise a common password should not bypass the check.

**Impact on AC-017:** The test uses `"password"` (all lowercase) which is definitely in the list. Additional tests could use `"PASSWORD"` to verify case-insensitivity, but this is covered by AC-020's broader default-policy test.

---

## CL-06 · What is the entropy formula?

**Question raised:** How is `entropy_bits` calculated?

**Decision:** Shannon entropy estimate using character-class pool size:
- If password contains a–z: pool += 26
- If password contains A–Z: pool += 26  
- If password contains 0–9: pool += 10
- If password contains special chars: pool += 32
- `entropy_bits = round(length × log₂(pool), 2)`

If pool = 0 (empty password), entropy_bits = 0.

**Example:** `"Password1!"` (10 chars) → pool = 26+26+10+32 = 94 → entropy = 10 × log₂(94) ≈ 65.86 bits.

'use strict';
/**
 * Commit Message Quality Analyzer — Part 1B, SEZG534 Assignment 1
 *
 * Public API: analyzeCommit(message, caseId?) → AnalysisResult
 *
 * Modes:
 *   SIMULATION=true  → returns predefined output from simulate.js (no network)
 *   SIMULATION=false → calls Gemini API (requires GEMINI_API_KEY in .env)
 *
 * Spec: spec/specification.md, CON-B-001 through CON-B-007
 */

const path = require('path');
const fs = require('fs');

// Output schema fields (for validation before returning)
const REQUIRED_FIELDS = ['type', 'scope', 'description', 'is_breaking', 'quality_score', 'issues', 'suggestion'];
const ALLOWED_TYPES = new Set(['feat', 'fix', 'refactor', 'docs', 'chore', 'test', 'style', 'perf', 'ci', 'build', 'revert', null]);

/**
 * Validate that a result object conforms to the schema (CON-B-001).
 * Returns { valid: boolean, violations: string[] }
 */
function validateSchema(result) {
  const violations = [];
  if (typeof result !== 'object' || result === null) {
    return { valid: false, violations: ['Result is not an object'] };
  }
  const keys = Object.keys(result).sort();
  const expected = [...REQUIRED_FIELDS].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    violations.push(`Expected fields ${expected.join(',')} got ${keys.join(',')}`);
  }
  if (!ALLOWED_TYPES.has(result.type)) {
    violations.push(`type "${result.type}" is not in allowed set`);
  }
  if (typeof result.quality_score !== 'number' || result.quality_score < 0 || result.quality_score > 100) {
    violations.push(`quality_score ${result.quality_score} is out of range [0,100]`);
  }
  if (typeof result.is_breaking !== 'boolean') {
    violations.push(`is_breaking must be boolean, got ${typeof result.is_breaking}`);
  }
  if (!Array.isArray(result.issues)) {
    violations.push('issues must be an array');
  }
  if (typeof result.description !== 'string' || result.description.length === 0) {
    violations.push('description must be a non-empty string');
  }
  return { valid: violations.length === 0, violations };
}

/**
 * Analyze a commit message.
 *
 * @param {string} message  The raw commit message.
 * @param {string} [caseId] The eval case ID (used in simulation mode for lookup).
 * @returns {Promise<{result: object, mode: string, error?: string}>}
 */
async function analyzeCommit(message, caseId) {
  const mode = process.env.SIMULATION === 'true' ? 'simulation' : 'live';

  if (mode === 'simulation') {
    const { getSimulatedResult } = require('./simulate.js');
    const result = getSimulatedResult(caseId || message);
    const { valid, violations } = validateSchema(result);
    if (!valid) {
      return { result, mode, error: `Schema violation in simulation: ${violations.join('; ')}` };
    }
    return { result, mode };
  }

  // Live mode — Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  const systemPromptPath = path.join(__dirname, '..', 'prompts', 'system-prompt.txt');
  const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');

  const requestBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: message }] }],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.0,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Retry on 429/503 up to 3 times (Lab 2 §8 guidance)
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const { status, body } = await httpPost(url, requestBody);
    if (status === 429 || status === 503) {
      lastError = { code: 'SERVICE_ERROR', status, message: `HTTP ${status} on attempt ${attempt}` };
      await sleep(attempt * 2000);
      continue;
    }
    if (status !== 200) {
      return { result: null, mode, error: `API error HTTP ${status}`, errorCode: 'API_ERROR' };
    }
    let parsed;
    try {
      const apiResponse = JSON.parse(body);
      const text = apiResponse.candidates[0].content.parts[0].text;
      parsed = JSON.parse(text);
    } catch (e) {
      return { result: null, mode, error: `Model output is not valid JSON: ${e.message}`, errorCode: 'INVALID_JSON' };
    }
    const { valid, violations } = validateSchema(parsed);
    if (!valid) {
      return { result: parsed, mode, error: `Schema violation: ${violations.join('; ')}`, errorCode: 'SCHEMA_VIOLATION' };
    }
    return { result: parsed, mode };
  }
  return { result: null, mode, error: lastError.message, errorCode: 'SERVICE_ERROR_MAX_RETRIES' };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpPost(url, body) {
  const https = require('https');
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { analyzeCommit, validateSchema };

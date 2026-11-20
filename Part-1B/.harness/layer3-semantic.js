'use strict';
/**
 * Layer 3 — Semantic / Quality Evaluator
 * Ground-truth matching: compares result to expected_* fields in dataset.
 * Returns { score: number [0,1], breakdown: object }
 */

const BAND_RANGES = { high: [80, 100], medium: [40, 79], low: [0, 39] };

function scoreLayer3(result, evalCase) {
  const { expected_type, expected_is_breaking, expected_quality_band } = evalCase;

  // Type match (0 or 1)
  const typeMatch = (result.type === expected_type) ? 1.0 : 0.0;

  // is_breaking match (0 or 1)
  const breakingMatch = (result.is_breaking === expected_is_breaking) ? 1.0 : 0.0;

  // Quality band match (1.0 if in band, 0.5 if adjacent band, 0.0 if two bands away)
  const [bandLow, bandHigh] = BAND_RANGES[expected_quality_band] || [0, 100];
  let bandMatch;
  if (result.quality_score >= bandLow && result.quality_score <= bandHigh) {
    bandMatch = 1.0;
  } else {
    // partial credit if only slightly outside the band
    const distance = Math.min(
      Math.abs(result.quality_score - bandLow),
      Math.abs(result.quality_score - bandHigh)
    );
    bandMatch = distance <= 15 ? 0.5 : 0.0;
  }

  // Weighted per-case score (specification.md layer 3 formula)
  const score = (typeMatch * 0.5) + (breakingMatch * 0.3) + (bandMatch * 0.2);

  return {
    score: Math.round(score * 100) / 100,
    breakdown: {
      typeMatch,
      breakingMatch,
      bandMatch,
      expected_type,
      actual_type: result.type,
      expected_is_breaking,
      actual_is_breaking: result.is_breaking,
      expected_quality_band,
      actual_quality_score: result.quality_score,
    },
  };
}

module.exports = { scoreLayer3 };

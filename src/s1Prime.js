export const S1_PRIME_BOUNDARY = Object.freeze({
  requiredShape: {
    root: ["schema", "decisionModel", "time", "risk", "regimeObservation", "disciplineDecay", "edgeDecay", "adversarialInjection"],
    time: ["sourceUnit", "targetUnit", "relation", "horizonBars", "tradesPerBar"],
    risk: ["unit", "value"],
  },
  constants: {
    schema: "apex-strategy-semantics/v1",
    decisionModel: "mcmc-survival-v1",
    "time.sourceUnit": "bar",
    "time.targetUnit": "day",
    "time.relation": "one-bar-equals-one-day",
    "risk.unit": "fraction-of-current-capital",
  },
  enums: { regimeObservation: ["current-true-regime", "lagged-classifier"] },
  ranges: {
    "time.horizonBars": { type: "integer", minimum: 0 },
    "time.tradesPerBar": { type: "integer", minimum: 0 },
    "risk.value": { type: "number", minimum: 0, maximum: 1 },
  },
  booleans: ["disciplineDecay", "edgeDecay", "adversarialInjection"],
});

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function valueAt(subject, path) {
  return path.split(".").reduce((value, key) => value?.[key], subject);
}

function checkClosedShape(findings, path, value, keys) {
  if (!isRecord(value)) {
    findings.push(`${path}: expected object`);
    return false;
  }
  const allowed = new Set(keys);
  for (const key of keys) if (!(key in value)) findings.push(`${path}.${key}: required`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) findings.push(`${path}.${key}: undeclared field`);
  return true;
}

/** Validate a profile against an explicit S1-prime boundary variant. */
export function validateS1PrimeAgainst(profile, boundary) {
  const findings = [];
  if (!checkClosedShape(findings, "profile", profile, boundary.requiredShape.root)) return findings;
  for (const [path, keys] of Object.entries(boundary.requiredShape)) {
    if (path !== "root") checkClosedShape(findings, `profile.${path}`, valueAt(profile, path), keys);
  }
  for (const [path, expected] of Object.entries(boundary.constants)) {
    if (valueAt(profile, path) !== expected) findings.push(`profile.${path}: unsupported value`);
  }
  for (const [path, allowed] of Object.entries(boundary.enums)) {
    if (!allowed.includes(valueAt(profile, path))) findings.push(`profile.${path}: unsupported value`);
  }
  for (const [path, range] of Object.entries(boundary.ranges)) {
    const value = valueAt(profile, path);
    const validType = range.type === "integer" ? Number.isInteger(value) : Number.isFinite(value);
    if (!validType || value < range.minimum || value > (range.maximum ?? Infinity)) {
      findings.push(`profile.${path}: outside ${range.type} range`);
    }
  }
  for (const path of boundary.booleans) {
    if (typeof valueAt(profile, path) !== "boolean") findings.push(`profile.${path}: expected boolean`);
  }
  return findings;
}

/** Return all reasons a value is outside the current explicit S1-prime subdomain. */
export function validateS1Prime(profile) {
  return validateS1PrimeAgainst(profile, S1_PRIME_BOUNDARY);
}

export function isS1Prime(profile) {
  return validateS1Prime(profile).length === 0;
}

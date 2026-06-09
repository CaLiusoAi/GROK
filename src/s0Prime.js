export const S0_PRIME_BOUNDARY = Object.freeze({
  requiredShape: ["nDays", "tradesPerDay", "riskPerTrade", "useClassifier", "disciplineDecay", "useEdgeDecay", "adversarialInjection"],
  ranges: {
    nDays: { type: "integer", minimum: 0 },
    tradesPerDay: { type: "integer", minimum: 0 },
    riskPerTrade: { type: "number", minimum: 0, maximum: 1 },
  },
  booleans: ["useClassifier", "disciplineDecay", "useEdgeDecay", "adversarialInjection"],
});

export function validateS0Prime(config) {
  if (config === null || typeof config !== "object" || Array.isArray(config)) return ["config: expected object"];
  const findings = [];
  const allowed = new Set(S0_PRIME_BOUNDARY.requiredShape);
  for (const key of allowed) if (!(key in config)) findings.push(`config.${key}: required`);
  for (const key of Object.keys(config)) if (!allowed.has(key)) findings.push(`config.${key}: undeclared field`);
  for (const [key, range] of Object.entries(S0_PRIME_BOUNDARY.ranges)) {
    const value = config[key];
    const typed = range.type === "integer" ? Number.isInteger(value) : Number.isFinite(value);
    if (!typed || value < range.minimum || value > (range.maximum ?? Infinity)) findings.push(`config.${key}: outside ${range.type} range`);
  }
  for (const key of S0_PRIME_BOUNDARY.booleans) if (typeof config[key] !== "boolean") findings.push(`config.${key}: expected boolean`);
  return findings;
}

export function isS0Prime(config) {
  return validateS0Prime(config).length === 0;
}

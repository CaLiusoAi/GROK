export const S1_CONSTANTS = Object.freeze({
  schema: "apex-strategy-semantics/v1",
  decisionModel: "mcmc-survival-v1",
  "time.sourceUnit": "bar",
  "time.targetUnit": "day",
  "time.relation": "one-bar-equals-one-day",
  "risk.unit": "fraction-of-current-capital",
});

export const COPY_FIELDS = Object.freeze([
  ["time.horizonBars", "nDays"],
  ["time.tradesPerBar", "tradesPerDay"],
  ["risk.value", "riskPerTrade"],
  ["disciplineDecay", "disciplineDecay"],
  ["edgeDecay", "useEdgeDecay"],
  ["adversarialInjection", "adversarialInjection"],
]);

export const OBSERVATION_CODEC = Object.freeze({
  "current-true-regime": false,
  "lagged-classifier": true,
});

export function valueAt(subject, path) {
  return path.split(".").reduce((value, key) => value[key], subject);
}

export function setAt(subject, path, value) {
  const keys = path.split(".");
  let cursor = subject;
  for (const key of keys.slice(0, -1)) cursor = cursor[key] ??= {};
  cursor[keys.at(-1)] = value;
}

export function projectS1ToS0(profile) {
  const config = {};
  for (const [source, target] of COPY_FIELDS) setAt(config, target, valueAt(profile, source));
  config.useClassifier = OBSERVATION_CODEC[profile.regimeObservation];
  return config;
}

export function reconstructS1FromS0(config) {
  const profile = {};
  for (const [path, value] of Object.entries(S1_CONSTANTS)) setAt(profile, path, value);
  for (const [source, target] of COPY_FIELDS) setAt(profile, source, valueAt(config, target));
  profile.regimeObservation = Object.entries(OBSERVATION_CODEC).find(([, value]) => value === config.useClassifier)?.[0];
  return profile;
}

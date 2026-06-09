import { S1_PRIME_BOUNDARY, validateS1Prime, validateS1PrimeAgainst } from "./s1Prime.js";

function clone(value) {
  return structuredClone(value);
}

function setAt(subject, path, value) {
  const keys = path.split(".");
  let cursor = subject;
  for (const key of keys.slice(0, -1)) cursor = cursor[key] ??= {};
  cursor[keys.at(-1)] = value;
  return subject;
}

/** The admissibility operator retains members and rejects non-members. */
export function admissibilityOperator(profile) {
  return validateS1Prime(profile).length === 0 ? clone(profile) : null;
}

export function analyzeS1PrimeStability(subject, perturbations) {
  const once = admissibilityOperator(subject);
  const twice = once === null ? null : admissibilityOperator(once);
  const samples = perturbations.map(perturbation => {
    const candidate = setAt(clone(subject), perturbation.path, perturbation.value);
    const findings = validateS1Prime(candidate);
    return { id: perturbation.id, admitted: findings.length === 0, expectedAdmitted: perturbation.expectedAdmitted, findings };
  });
  return {
    baselineAdmitted: once !== null,
    operatorIdempotentOnSubject: JSON.stringify(once) === JSON.stringify(twice),
    perturbationExpectationsMet: samples.every(sample => sample.admitted === sample.expectedAdmitted),
    samples,
  };
}

export function analyzeBoundarySensitivity(subject) {
  const tightened = clone(S1_PRIME_BOUNDARY);
  tightened.ranges["risk.value"].maximum = 0.005;
  const evolved = clone(S1_PRIME_BOUNDARY);
  evolved.constants.schema = "apex-strategy-semantics/v2";
  return {
    current: validateS1PrimeAgainst(subject, S1_PRIME_BOUNDARY).length === 0,
    afterRiskTightening: validateS1PrimeAgainst(subject, tightened).length === 0,
    afterSchemaEvolution: validateS1PrimeAgainst(subject, evolved).length === 0,
  };
}

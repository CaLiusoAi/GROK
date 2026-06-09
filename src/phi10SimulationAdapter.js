import { reconstructS1FromS0 } from "./scopedBijection.js";
import { validateS0Prime } from "./s0Prime.js";
import { validateS1Prime } from "./s1Prime.js";

/** Translate exactly S0-prime configuration semantics back into S1-prime. */
export function adaptSimulationToApexStrategy(config) {
  const findings = validateS0Prime(config);
  if (findings.length > 0) throw new TypeError(`outside S0-prime: ${findings.join("; ")}`);
  const profile = reconstructS1FromS0(config);
  const targetFindings = validateS1Prime(profile);
  if (targetFindings.length > 0) throw new TypeError(`phi_10 produced invalid S1-prime: ${targetFindings.join("; ")}`);
  return profile;
}

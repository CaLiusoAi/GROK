import { projectS1ToS0 } from "./scopedBijection.js";
import { validateS0Prime } from "./s0Prime.js";
import { validateS1Prime } from "./s1Prime.js";

/** Translate exactly S1-prime into a simulatePath configuration. */
export function adaptApexStrategyToSimulation(profile) {
  const findings = validateS1Prime(profile);
  if (findings.length > 0) throw new TypeError(`outside S1-prime: ${findings.join("; ")}`);
  const config = projectS1ToS0(profile);
  const targetFindings = validateS0Prime(config);
  if (targetFindings.length > 0) throw new TypeError(`phi_01 produced invalid S0-prime: ${targetFindings.join("; ")}`);
  return config;
}

import { isDeepStrictEqual } from "node:util";
import { adaptApexStrategyToSimulation } from "./phi01StrategyAdapter.js";
import { adaptSimulationToApexStrategy } from "./phi10SimulationAdapter.js";

/** C11 = phi_10 after phi_01, an executable endomorphism on S1-prime. */
export function composeC11(profile) {
  return adaptSimulationToApexStrategy(adaptApexStrategyToSimulation(profile));
}

/** C00 = phi_01 after phi_10, an executable endomorphism on S0-prime. */
export function composeC00(config) {
  return adaptApexStrategyToSimulation(adaptSimulationToApexStrategy(config));
}

export function iterateEndomorphism(operator, subject, steps) {
  if (!Number.isInteger(steps) || steps < 0) throw new TypeError("steps must be a non-negative integer");
  const orbit = [structuredClone(subject)];
  for (let step = 0; step < steps; step++) orbit.push(operator(orbit.at(-1)));
  return orbit;
}

export function analyzeSampledFixedPoint(operator, subject, steps = 3) {
  const orbit = iterateEndomorphism(operator, subject, steps);
  return {
    steps,
    fixedAtFirstApplication: isDeepStrictEqual(orbit[0], orbit[1]),
    orbitConstant: orbit.every(value => isDeepStrictEqual(value, orbit[0])),
    orbit,
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { adaptApexStrategyToSimulation } from "../src/phi01StrategyAdapter.js";
import { adaptSimulationToApexStrategy } from "../src/phi10SimulationAdapter.js";

const witness = JSON.parse(await readFile(new URL("../architecture/witnesses/phi01-supported-strategy.json", import.meta.url)));
const configWitness = JSON.parse(await readFile(new URL("../architecture/witnesses/phi10-supported-config.json", import.meta.url)));

test("phi_10 is a witnessed return for the phi_01 image", () => {
  assert.deepEqual(adaptApexStrategyToSimulation(witness), configWitness);
  assert.deepEqual(adaptSimulationToApexStrategy(configWitness), witness);
});

test("phi_01 and phi_10 preserve varied values in their scoped subdomains", () => {
  const varied = { ...witness, time: { ...witness.time, horizonBars: 9, tradesPerBar: 2 }, risk: { ...witness.risk, value: 0.25 }, regimeObservation: "lagged-classifier", edgeDecay: true };
  const config = adaptApexStrategyToSimulation(varied);
  assert.deepEqual(adaptApexStrategyToSimulation(adaptSimulationToApexStrategy(config)), config);
  assert.deepEqual(adaptSimulationToApexStrategy(config), varied);
});

test("phi_10 rejects general S0 runtime configurations outside S0-prime", () => {
  assert.throws(() => adaptSimulationToApexStrategy({ nDays: 3 }), /outside S0-prime/);
  assert.throws(() => adaptSimulationToApexStrategy({ ...adaptApexStrategyToSimulation(witness), random: Math.random }), /undeclared field/);
});

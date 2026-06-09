import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { adaptApexStrategyToSimulation } from "../src/phi01StrategyAdapter.js";
import { simulatePath } from "../src/mcmcSurvivalEngine.js";

const witness = JSON.parse(await readFile(new URL("../architecture/witnesses/phi01-supported-strategy.json", import.meta.url)));
const stableRandom = () => 0.75;

test("phi_01 witness preserves scoped risk, time, and observation semantics", () => {
  const config = adaptApexStrategyToSimulation(witness);
  assert.deepEqual(config, {
    nDays: 3,
    tradesPerDay: 0,
    riskPerTrade: 0.01,
    useClassifier: false,
    disciplineDecay: true,
    useEdgeDecay: false,
    adversarialInjection: false,
  });

  const trace = [];
  simulatePath({ ...config, random: stableRandom, onDay: state => trace.push(state) });
  assert.equal(trace.length, witness.time.horizonBars);
  assert.ok(trace.every(state => state.classifiedRegime === state.trueRegime));
});

test("phi_01 partial adapter rejects semantics outside its witnessed scope", () => {
  assert.throws(
    () => adaptApexStrategyToSimulation({ ...witness, decisionModel: "arbitrary-pine-strategy" }),
    /outside S1-prime:.*decisionModel/,
  );
  assert.throws(
    () => adaptApexStrategyToSimulation({ ...witness, time: { ...witness.time, relation: "one-bar-equals-one-hour" } }),
    /outside S1-prime:.*time.relation/,
  );
  assert.throws(
    () => adaptApexStrategyToSimulation({ ...witness, risk: { ...witness.risk, value: 1.1 } }),
    /outside S1-prime:.*risk.value/,
  );
});

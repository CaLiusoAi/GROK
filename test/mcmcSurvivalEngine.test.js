import test from "node:test";
import assert from "node:assert/strict";
import { disciplineMultiplier, percentile, simulateMAE, simulatePath } from "../src/mcmcSurvivalEngine.js";

const fixed = value => () => value;
const trendToCrisis = [
  [0, 0, 0, 0, 1],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1],
];

// A fixed in-range value keeps stochastic tests deterministic and lets randn() terminate.
const stableRandom = fixed(0.75);

test("defines bounded discipline decay after a loss streak", () => {
  assert.equal(disciplineMultiplier(2), 1);
  assert.equal(disciplineMultiplier(5), 0.7);
  assert.equal(disciplineMultiplier(100), 0.5);
});

test("oracle mode acts on the current true regime while classifier mode retains a one-day lag", () => {
  const oracleDays = [];
  simulatePath({ transitionMatrix: trendToCrisis, useClassifier: false, useEdgeDecay: false, nDays: 1, tradesPerDay: 0, random: stableRandom, onDay: day => oracleDays.push(day) });
  assert.equal(oracleDays[0].trueRegime, 4);
  assert.equal(oracleDays[0].classifiedRegime, 4);

  const classifiedDays = [];
  simulatePath({ transitionMatrix: trendToCrisis, useClassifier: true, useEdgeDecay: false, nDays: 1, tradesPerDay: 0, random: stableRandom, onDay: day => classifiedDays.push(day) });
  assert.equal(classifiedDays[0].trueRegime, 4);
  assert.equal(classifiedDays[0].classifiedRegime, 0);
});

test("classifier error rate uses simulated days rather than the configured horizon after ruin", () => {
  const losingParams = Object.fromEntries(Object.entries({0:8,1:10,2:6,3:4,4:2}).map(([key, df]) => [key, { mu: 0, sigma: 1, winRate: 0, df }]));
  const result = simulatePath({ regimeParams: losingParams, transitionMatrix: trendToCrisis, useEdgeDecay: false, nDays: 252, tradesPerDay: 1, riskPerTrade: 0.9, random: stableRandom, computeMAE: false });
  assert.equal(result.ruined, true);
  assert.equal(result.classificationErrors, 1);
  assert.equal(result.classificationErrorRate, 1);
});

test("Brownian bridge has no artificial random terminal shock", () => {
  assert.equal(simulateMAE(100, 1000, 0.1, stableRandom, 1), 0);
  assert.equal(simulateMAE(-100, 1000, 0.1, stableRandom, 1), 100);
});

test("percentile safely handles empty samples", () => {
  assert.equal(percentile([], 50), 0);
});

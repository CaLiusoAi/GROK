import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_GARCH_VOL, RUIN_THRESHOLD, STARTING_CAPITAL, disciplineMultiplier, garchUpdate,
  perturbParams, percentile, runParameterUncertainty, simulateMAE, simulatePath,
  summarizeParameterUncertainty,
} from "../src/mcmcSurvivalEngine.js";

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

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test("perturbed transition rows normalize and parameter draws stay bounded", () => {
  const random = seededRandom(42);
  for (let draw = 0; draw < 1000; draw++) {
    const { regimes, transitionMatrix } = perturbParams(random);
    for (const regime of Object.values(regimes)) {
      assert.ok(regime.winRate >= 0.30 && regime.winRate <= 0.75);
      assert.ok(regime.sigma > 0);
    }
    for (const row of transitionMatrix) {
      assert.ok(Math.abs(row.reduce((sum, probability) => sum + probability, 0) - 1) < 1e-12);
    }
  }
});

test("parameter uncertainty envelope is monotonically ordered", () => {
  const envelope = summarizeParameterUncertainty([
    [{ finalCapital: 80, ruined: true }, { finalCapital: 90, ruined: false }],
    [{ finalCapital: 100, ruined: false }, { finalCapital: 110, ruined: false }],
    [{ finalCapital: 120, ruined: false }, { finalCapital: 130, ruined: false }],
  ]);
  for (const metric of Object.values(envelope)) assert.ok(metric.p10 <= metric.p50 && metric.p50 <= metric.p90);
});

test("outer Monte Carlo runner returns ordered envelopes", async () => {
  const envelope = await runParameterUncertainty({ drawCount: 4, innerPathCount: 5, random: seededRandom(7), simulationConfig: { nDays: 5, computeMAE: false } });
  for (const metric of Object.values(envelope)) assert.ok(metric.p10 <= metric.p50 && metric.p50 <= metric.p90);
});

test("simulated capital remains finite and non-negative and ruined paths finish below the threshold", () => {
  for (let seed = 1; seed <= 250; seed++) {
    const result = simulatePath({
      random: seededRandom(seed),
      computeMAE: false,
      onDay: ({ capital }) => assert.ok(Number.isFinite(capital) && capital >= 0),
    });
    assert.ok(Number.isFinite(result.finalCapital));
    assert.ok(result.finalCapital >= 0);
    if (result.ruined) assert.ok(result.finalCapital <= STARTING_CAPITAL * RUIN_THRESHOLD);
  }
});

test("GARCH volatility remains finite and bounded across 100k updates", () => {
  const random = seededRandom(99);
  let volatility = 0.01;
  for (let day = 0; day < 100_000; day++) {
    volatility = garchUpdate(volatility, random() * 4);
    assert.ok(Number.isFinite(volatility));
    assert.ok(volatility >= 0 && volatility <= MAX_GARCH_VOL);
  }
  for (const extremeVolatility of [garchUpdate(Infinity, Infinity), garchUpdate(NaN, NaN)]) {
    assert.ok(Number.isFinite(extremeVolatility));
    assert.ok(extremeVolatility >= 0 && extremeVolatility <= MAX_GARCH_VOL);
  }
});

test("oracle statistically dominates a lagged classifier under hostile crisis transitions", () => {
  const crisisEmissionAsTrend = [
    [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0],
  ];
  const oracle = [];
  const classifier = [];
  for (let seed = 1; seed <= 256; seed++) {
    oracle.push(simulatePath({ transitionMatrix: trendToCrisis, emissionMatrix: crisisEmissionAsTrend, useClassifier: false, useEdgeDecay: false, computeMAE: false, random: seededRandom(seed) }).finalCapital);
    classifier.push(simulatePath({ transitionMatrix: trendToCrisis, emissionMatrix: crisisEmissionAsTrend, useClassifier: true, useEdgeDecay: false, computeMAE: false, random: seededRandom(seed) }).finalCapital);
  }
  assert.ok(percentile(oracle, 50) > percentile(classifier, 50));
});

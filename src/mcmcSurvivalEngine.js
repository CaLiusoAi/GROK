export const BASE_REGIME_PARAMS = {
  0: { name: "Trend", mu: 0.65, sigma: 0.85, winRate: 0.62, df: 8 },
  1: { name: "Range", mu: 0.45, sigma: 0.70, winRate: 0.58, df: 10 },
  2: { name: "Chop", mu: 0.15, sigma: 0.90, winRate: 0.48, df: 6 },
  3: { name: "Vol Spike", mu: 0.30, sigma: 1.40, winRate: 0.52, df: 4 },
  4: { name: "Crisis", mu: 0.30, sigma: 1.80, winRate: 0.41, df: 2 },
};

export const TRANSITION_MATRIX = [
  [0.72, 0.15, 0.08, 0.04, 0.01],
  [0.18, 0.60, 0.14, 0.06, 0.02],
  [0.10, 0.20, 0.55, 0.12, 0.03],
  [0.05, 0.10, 0.20, 0.45, 0.20],
  [0.02, 0.05, 0.10, 0.25, 0.58],
];

export const EMISSION_MATRIX = [
  [0.70, 0.18, 0.08, 0.03, 0.01],
  [0.15, 0.62, 0.17, 0.05, 0.01],
  [0.10, 0.22, 0.55, 0.10, 0.03],
  [0.04, 0.08, 0.18, 0.52, 0.18],
  [0.01, 0.03, 0.08, 0.28, 0.60],
];

export const N_PATHS = 10000;
export const N_DAYS = 252;
export const STARTING_CAPITAL = 100000;
export const RUIN_THRESHOLD = 0.20;
export const RISK_PER_TRADE = 0.01;
export const TRADES_PER_DAY = 3;
const MAE_STEPS = 20;
const CRISIS_LOSS_BASE = 2.0;
const CRISIS_LOSS_SHOCK = 0.6;
const STD_LOSS_SHOCK = 0.3;
const EDGE_DECAY = 0.0008;
const EDGE_INNOVATION = 0.0006;
const EDGE_MEAN_REVERT = 0.003;
const EDGE_LONG_RUN = 0.70;
const EDGE_MIN = 0.20;
const EDGE_MAX = 1.10;

export function randn(random = Math.random) {
  let u, v, s;
  do {
    u = random() * 2 - 1;
    v = random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  return u * Math.sqrt((-2 * Math.log(s)) / s);
}

function studentT(df, random) {
  const z = randn(random);
  let chi2 = 0;
  for (let i = 0; i < df; i++) {
    const x = randn(random);
    chi2 += x * x;
  }
  return z / Math.sqrt(chi2 / df);
}

export function sampleRow(row, random = Math.random) {
  const target = random();
  let cumulative = 0;
  for (let i = 0; i < row.length; i++) {
    cumulative += row[i];
    if (target < cumulative) return i;
  }
  return row.length - 1;
}

export function disciplineMultiplier(consecutiveLosses) {
  if (consecutiveLosses < 3) return 1;
  return Math.max(0.5, 1 - (consecutiveLosses - 2) * 0.1);
}

export function garchUpdate(prevVol, aggregateShock, omega = 0.000002, alpha = 0.09, beta = 0.90) {
  return Math.sqrt(omega + alpha * aggregateShock ** 2 + beta * prevVol ** 2);
}

function updateEdge(edge, random) {
  const innovation = randn(random) * EDGE_INNOVATION;
  const meanRevert = EDGE_MEAN_REVERT * (EDGE_LONG_RUN - edge);
  return Math.max(EDGE_MIN, Math.min(EDGE_MAX, edge + meanRevert - EDGE_DECAY + innovation));
}

function applyEdge(regime, edge) {
  return { ...regime, winRate: Math.min(0.8, Math.max(0.2, regime.winRate * edge)), mu: regime.mu * edge };
}

// Simulate a Brownian bridge whose last point is exactly the realized endpoint.
export function simulateMAE(tradeReturn, capital, dayStartVol, random = Math.random, steps = MAE_STEPS) {
  if (capital <= 0 || steps < 1) return 0;
  const endpoint = tradeReturn / capital;
  const stepVol = dayStartVol / Math.sqrt(steps);
  let position = 0;
  let worstPosition = 0;
  for (let step = 0; step < steps; step++) {
    const remaining = steps - step;
    const drift = (endpoint - position) / remaining;
    // Conditional bridge variance is zero on the final step.
    const conditionalVol = stepVol * Math.sqrt((remaining - 1) / remaining);
    position += drift + randn(random) * conditionalVol;
    worstPosition = Math.min(worstPosition, position);
  }
  return Math.abs(worstPosition) * capital;
}

export function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)];
}

export function simulatePath(config = {}) {
  const {
    riskPerTrade = RISK_PER_TRADE,
    disciplineDecay = true,
    adversarialInjection = false,
    useClassifier = true,
    useEdgeDecay = true,
    regimeParams = BASE_REGIME_PARAMS,
    transitionMatrix = TRANSITION_MATRIX,
    emissionMatrix = EMISSION_MATRIX,
    computeMAE = true,
    nDays = N_DAYS,
    tradesPerDay = TRADES_PER_DAY,
    random = Math.random,
    onDay,
  } = config;
  let capital = STARTING_CAPITAL;
  let peak = capital;
  let trueRegime = 0;
  let classifiedRegime = 0;
  let garchVol = 0.01;
  let consecutiveLosses = 0;
  let maxDrawdown = 0;
  let inDrawdown = false;
  let drawdownDays = 0;
  const recoveryDays = [];
  let ruined = false;
  let ruinDay = -1;
  let maeWorst = 0;
  let classificationErrors = 0;
  let observedDays = 0;
  let edge = 1;
  let minEdge = edge;
  const dailyReturns = [];
  const regimeDays = new Array(5).fill(0);

  for (let day = 0; day < nDays && !ruined; day++) {
    if (adversarialInjection && capital < peak * 0.88 && random() < 0.15) trueRegime = 4;
    else trueRegime = sampleRow(transitionMatrix[trueRegime], random);
    regimeDays[trueRegime]++;
    if (useEdgeDecay) edge = updateEdge(edge, random);
    minEdge = Math.min(minEdge, edge);

    // Oracle mode acts on today's true state. Classifier mode intentionally retains yesterday's emission.
    if (!useClassifier) classifiedRegime = trueRegime;
    else if (classifiedRegime !== trueRegime) classificationErrors++;
    observedDays++;

    const believedRegime = useEdgeDecay ? applyEdge(regimeParams[classifiedRegime], edge) : regimeParams[classifiedRegime];
    const trueEffective = useEdgeDecay ? applyEdge(regimeParams[trueRegime], edge) : regimeParams[trueRegime];
    const disciplineFactor = disciplineDecay ? disciplineMultiplier(consecutiveLosses) : 1;
    const dayStartVol = garchVol;
    let dayReturn = 0;
    let realizedVariance = 0;

    for (let trade = 0; trade < tradesPerDay; trade++) {
      const isCrisis = classifiedRegime === 4;
      const effectiveRisk = isCrisis
        ? (disciplineFactor < 0.8 ? riskPerTrade * 1.3 : 0)
        : classifiedRegime === 3 ? riskPerTrade * 0.5 * disciplineFactor : riskPerTrade * disciplineFactor;
      if (effectiveRisk === 0) continue;
      const shock = studentT(believedRegime.df, random) * dayStartVol * believedRegime.sigma;
      realizedVariance += shock ** 2;
      const win = random() < trueEffective.winRate;
      const rMultiple = win ? believedRegime.mu + Math.abs(shock) * 0.5
        : isCrisis ? -(CRISIS_LOSS_BASE + Math.abs(shock) * CRISIS_LOSS_SHOCK)
          : -(1 + Math.abs(shock) * STD_LOSS_SHOCK);
      const tradeReturn = effectiveRisk * rMultiple * capital;
      dayReturn += tradeReturn;
      if (computeMAE) maeWorst = Math.max(maeWorst, simulateMAE(tradeReturn, capital, dayStartVol, random));
      consecutiveLosses = win ? 0 : consecutiveLosses + 1;
    }
    garchVol = garchUpdate(dayStartVol, Math.sqrt(realizedVariance));
    const previousCapital = capital;
    capital = Math.max(0, capital + dayReturn);
    dailyReturns.push(dayReturn / (previousCapital || 1));
    if (capital > peak) {
      if (inDrawdown) {
        recoveryDays.push(drawdownDays);
        inDrawdown = false;
        drawdownDays = 0;
      }
      peak = capital;
    } else {
      const drawdown = (peak - capital) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      if (!inDrawdown && drawdown > 0.02) inDrawdown = true;
      if (inDrawdown) drawdownDays++;
    }
    if (capital <= STARTING_CAPITAL * RUIN_THRESHOLD) { ruined = true; ruinDay = day; }
    onDay?.({ day, trueRegime, classifiedRegime, capital });
    if (useClassifier) classifiedRegime = sampleRow(emissionMatrix[trueRegime], random);
  }
  const average = dailyReturns.reduce((sum, value) => sum + value, 0) / (dailyReturns.length || 1);
  const deviation = Math.sqrt(dailyReturns.reduce((sum, value) => sum + (value - average) ** 2, 0) / (dailyReturns.length || 1));
  const annualReturn = capital / STARTING_CAPITAL - 1;
  const calmar = ruined ? 0 : maxDrawdown > 0 ? Math.min(annualReturn / maxDrawdown, 10) : annualReturn > 0 ? 10 : 0;
  const medianRecovery = recoveryDays.length > 0 ? percentile(recoveryDays, 50) : 0;
  return {
    finalCapital: capital, maxDrawdown, ruined, ruinDay, maeWorst, regimeDays, medianRecovery, calmar,
    sharpe: ruined ? -Infinity : deviation > 0 ? average / deviation * Math.sqrt(252) : 0,
    classificationErrors,
    classificationErrorRate: classificationErrors / (observedDays || 1),
    finalEdge: edge, minEdge,
  };
}

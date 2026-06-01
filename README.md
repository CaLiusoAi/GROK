# GROK

## MCMC survival engine repair

`src/mcmcSurvivalEngine.js` contains the extracted and repaired simulation core for the supplied React dashboard. Import its exports from the UI component rather than keeping the statistical engine inline.

The repair adds the missing `disciplineMultiplier`, makes oracle mode use the current true regime instead of a lagged regime, conditions the Brownian bridge endpoint correctly, calculates classifier error rates over actually simulated days, and makes empty percentile samples safe for all-ruin scenarios.

The engine also exposes correlated parameter perturbation and outer Monte Carlo helpers. Perturbed win rates remain within `[0.30, 0.75]`, sigmas remain positive, transition rows are renormalized, GARCH volatility is kept finite under extreme shocks, and capital is clamped to a finite non-negative range.

Run the focused regression suite with:

```bash
npm test
```

# GROK

## MCMC survival engine repair

`src/mcmcSurvivalEngine.js` contains the extracted and repaired simulation core for the supplied React dashboard. Import its exports from the UI component rather than keeping the statistical engine inline.

The repair adds the missing `disciplineMultiplier`, makes oracle mode use the current true regime instead of a lagged regime, conditions the Brownian bridge endpoint correctly, calculates classifier error rates over actually simulated days, and makes empty percentile samples safe for all-ruin scenarios.

Run the focused regression suite with:

```bash
npm test
```

## Semantic architecture analysis

The repository contains three distinct domains: the executable MCMC runtime, the
archived APEX Pine factory, and an APEX-local admissibility specification. They
are not treated as one kernel or as a fully integrated pipeline without
executable identification witnesses. A first scoped `S1_prime -> S0_prime` witness
exists, with `S1_prime` defined by an executable closed-world predicate; it does
not claim total Pine-to-MCMC translation or closure under APEX generation. Its
current stability claim is limited to sampled local behavior. A witnessed
`phi_10: S0_prime -> S1_prime` reverses the scoped configuration projection and
forms a tested round-trip cycle. A machine-checked structural argument now
establishes `C11 = Id(S1_prime)` for the current closed-world schemas and scoped
adapters. Declared incompatible schema, mapping, constant, range, and codec
mutations revoke the proof in the impact suite. A bounded evolution calculus
separates unchanged-proof-input preservation, coordinated changes requiring a
new proof, and theorem-breaking changes. A generic theorem-governance protocol
now makes that lifecycle reusable without making theorem-specific proofs generic;
`C11` remains its only registered theorem. It does not classify arbitrary changes
or extend the theorem to parent domain `S1`, full-runtime integration, or a
repository kernel claim.

- [APEX Admissibility Boundary](docs/semantic/apex-admissibility-boundary.md) records
  the APEX-local constraint model.
- [Cross-Domain Identification Layer](docs/semantic/cross-domain-morphism-layer.md)
  defines the candidate maps between domains and the evidence required before
  any map may be called implemented.
- `architecture/cross-domain-identification.json` is the machine-readable
  identification registry enforced by the test suite.

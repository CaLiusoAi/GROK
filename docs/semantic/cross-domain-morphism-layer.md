# Cross-Domain Identification Layer

## Status

The repository contains three distinct domains, not three implementations of one
kernel:

| Domain | Category | Live subject |
| --- | --- | --- |
| `S0` | stochastic runtime | `src/mcmcSurvivalEngine.js` |
| `S1` | Pine program-generation factory | `APEX_PINE_V6_LLM_FACTORY.zip` |
| `S2` | logical APEX admissibility specification | `docs/semantic/apex-admissibility-boundary.md` |

They do not currently form a complete transduction pipeline. The identification
registry is an `S3` control layer: it regulates composition claims but is not
itself a morphism. The repository now contains one scoped executable witness,
which establishes local composition without claiming a total cross-domain map:

- `architecture/cross-domain-identification.json` records candidate morphisms,
  their preservation obligations, status, and witnesses.
- `src/crossDomainIdentification.js` rejects unsupported implementation and
  commutativity claims.
- `test/crossDomainIdentification.test.js` verifies that the current repository
  does not claim integration beyond its witnessed scope.
- `architecture/witnesses/phi01-supported-strategy.json`,
  `src/phi01StrategyAdapter.js`, and `test/phi01StrategyAdapter.test.js` form the
  first witness bundle.

This layer makes both **non-identification** and **scoped identification**
enforceable. `unimplemented`, `witnessed-partial`, and `implemented` are distinct
claims.

## Candidate morphisms

The registry names four cross-domain maps or candidates:

\[
\Phi_{12}: S_2 \rightarrow S_1, \qquad
\Phi_{01}: S1\_prime \rightarrow S0\_prime, \qquad
\Phi_{10}: S0\_prime \rightarrow S1\_prime, \qquad
\Phi_{02}: S_2 \rightarrow S_0
\]

`phi_12` and `phi_02` remain `unimplemented`. `phi_01` and `phi_10` are
`witnessed-partial` over their explicit closed subdomains; neither is a total
map over the parent domains.

### `phi_12`: policy to factory

This map would compile typed admissibility constraints into an APEX factory
profile. It must preserve constraint identity, authority qualification, and the
separation of static, compiler, runtime, visual, and release verdicts.

The current Markdown boundary describes those concepts but cannot configure or
constrain the archived factory mechanically. Documentation is not a witness for
this morphism.

### `phi_01`: factory to runtime

This map would translate the semantics of a generated Pine strategy into
`simulatePath` configuration and observable runtime properties. It must define,
at minimum, correspondences for strategy decisions, risk, and time steps.

A first partial translation now exists from `S1_prime` to the explicit
configuration-image subdomain `S0_prime`. It preserves the scoped risk fraction,
one-bar-to-one-day time relation, horizon, trades-per-step count, and regime
observation mode. The adapter rejects unsupported decision models and time
relations. It does not parse Pine source and therefore does not establish a
total `S1 -> S0` morphism.

### `phi_02`: policy to runtime

This map would compile applicable admissibility constraints into executable
MCMC assertions with preserved evidence provenance and verdict meaning.

No current APEX constraint is demonstrated to apply to the MCMC engine, so this
map also remains unimplemented.

## Admission rule

A candidate morphism may change from `unimplemented` to `witnessed-partial`
when it has an executable adapter, executable witnesses, and an explicit scope.
It may change to `implemented` only when its coverage is total for the declared
source domain. Every admitted state requires:

1. A named adapter that produces a target-domain subject.
2. Explicit preservation obligations.
3. Executable witnesses that test those obligations.
4. No unresolved type mismatch hidden by vocabulary reuse.

The validator rejects witnessed claims without those fields and rejects partial
claims without scope limits. A partial witness proves only its recorded subset;
it cannot create an implemented path. A direct map and a composed map may be
declared equivalent only through a commutativity claim with executable
witnesses:

\[
\Phi_{02} = \Phi_{01} \circ \Phi_{12}
\]

The repository currently makes no such claim.

## Consequences

- There is no repository-wide kernel or fixed point.
- `S0` is the only live executable product runtime.
- `S1` has no total translation targeting `S0`.
- `S2` is an APEX-local policy model, not a repository-wide semantic kernel.
- `phi_01` now has one locally composable, witnessed subset, but APEX and MCMC
  remain unintegrated at the full-domain level.

This avoids both failure modes: treating unrelated domains as one system and
making the witness standard so strong that no incremental integration can be
represented.

## Explicit source subdomain: `S1_prime`

The executable domain of `phi_01` is no longer declared as all of `S1`. The
registry defines `S1_prime` as a predicate-defined subdomain of `S1`, and the
morphism is typed explicitly as:

\[
\phi_{01}: S1\_prime \rightarrow S0
\]

`architecture/subdomains/s1-prime.json` records the closed-world shape,
constants, enumerations, numeric ranges, booleans, and exclusions.
`src/s1Prime.js#validateS1Prime` is the executable membership predicate. The
adapter invokes that predicate before projection, so execution cannot silently
shrink the declared source domain.

The current boundary admits only semantic manifests with:

- the `apex-strategy-semantics/v1` schema and `mcmc-survival-v1` decision model;
- an exact one-bar-to-one-day time relation;
- non-negative integer horizons and trade counts;
- finite fractional risk in `[0, 1]`;
- one of the two declared regime-observation modes;
- Boolean runtime switches; and
- no undeclared fields.

This extraction resolves the declaration/execution mismatch for the current
witness. It does not prove that `S1_prime` is the maximal subdomain of `S1` that
could admit a future projection.

## `S1_prime` stability status

`S1_prime` is currently **sampled-local-stable**, not globally stable. The
admissibility operator is the partial identity:

\[
A(x) = x \text{ when } x \in S1\_prime, \qquad A(x) = \bot \text{ otherwise.}
\]

`src/s1PrimeStability.js` verifies that this operator is idempotent on the
current witness and sampled rejected subjects. Run `npm run stability:s1-prime`
to emit the current machine-readable report. The perturbation plan at
`architecture/stability/s1-prime-perturbations.json` probes accepted interior
and boundary changes as well as rejected schema, range, time-relation, and
closed-world changes. It also measures that the current witness is rejected by
a tested risk tightening and schema-version change.

These checks distinguish four claims:

| Question | Current result |
| --- | --- |
| Repeated filtering reaches a fixed result | Yes, on tested subjects; this follows from partial-identity filtering. |
| Sampled admissible perturbations remain admitted | Yes, for the declared plan. |
| Current witness is invariant under constraint/schema changes | No; tested tightening and schema evolution reject it. |
| Closure under repeated APEX generation | Unknown; no `S1 -> S1_prime` generator exists. |

Idempotence of a filter is not evidence that generation preserves its accepted
set. Therefore the repository does not claim that `S1_prime` is an attractor,
that it is globally stable, or that a kernel emerges from its projection.

## Return morphism, composition, and limit status

The missing return route has been narrowed to the explicit configuration image
`S0_prime`, not the full stochastic runtime domain. The repository now witnesses:

\[
\phi_{01}: S1\_prime \rightarrow S0\_prime, \qquad
\phi_{10}: S0\_prime \rightarrow S1\_prime
\]

`S0_prime` is a closed-world subdomain containing only the `simulatePath`
configuration fields preserved by `phi_01`. It explicitly excludes runtime
results, callbacks, random functions, and undeclared options. `phi_10` therefore
does not reconstruct an APEX strategy from an MCMC result; it reverses the
scoped configuration projection.

Executable witnesses establish both scoped round trips for tested subjects:

For each tested pair `(x_w, y_w)`, the witnesses establish
`C11(x_w) = x_w` and `C00(y_w) = y_w`. They do not establish that either
composite equals the identity function over its entire subdomain.

Direct `phi_01 \circ phi_01` remains ill-typed because
`phi_01` is not an endomorphism. The witnessed return path creates an executable
round-trip cycle, but the repository still does not infer a global limit operator,
full-domain integration, or convergence outside these closed subdomains.

`architecture/limits/phi01-iteration.json` records the updated boundary and
`npm run iteration:phi01` emits the current result. The iteration analyzer keeps
direct iteration, type-compatible cycles, executable composition, and
convergence as separate claims.

## `C11` endomorphism and sampled fixed points

The witnessed cycle makes the composite operator well-typed and executable:

\[
C_{11} = \phi_{10} \circ \phi_{01}: S1\_prime \rightarrow S1\_prime
\]

`src/scopedComposites.js#composeC11` is the first executable endomorphism on
`S1_prime`. Its existence makes finite iteration and fixed-point testing
mathematically admissible. It does not make direct `phi_01` iteration valid.

Before the structural proof, the composition evidence was classified only as a
`witnessed-round-trip`. `architecture/fixed-points/c11-sampled-analysis.json`
records that evidence: the declared subjects are fixed after one `C11`
application and their tested finite orbits are constant. Run
`npm run fixed-points:c11` to emit this bounded supporting report.

That sample evidence alone did not justify a universal identity, convergence,
attractor, or kernel claim. The later structural result below supplies the
current-schema identity theorem while preserving the broader non-claims.

## Characterizing `Fix(C11)`

The next empirical question was the coverage of the fixed-point set:

\[
Fix(C_{11}) = \{x \in S1\_prime : C_{11}(x) = x\}.
\]

`architecture/fixed-points/c11-characterization-plan.json` defines a finite
factorial counterexample search across representative horizon values, trade
counts, risk boundaries, both observation modes, and every Boolean-switch
combination. `src/c11FixedPointCharacterization.js` generates only valid
`S1_prime` subjects and partitions them into observed fixed points and discovered
counterexamples.

The current search tests 432 subjects and finds no non-fixed point in that
basis. This expands the observed fixed-point class beyond the original witness,
but it is not a proof that `Fix(C11) = S1_prime`. The integer horizon and trade
spaces and the real-valued risk interval remain infinite. Run
`npm run characterize:c11` to emit the bounded counterexample-search report.

The finite search itself records only absence of a counterexample. It motivated
the structural argument below, which resolves the current-schema identity
question by field coverage rather than by extrapolating from the sample.

## Structural identity result for current `S1_prime`

The finite counterexample search motivated a structural examination of the
adapters. That examination closes the fixed-point coverage question for the
**current closed-world schemas and current scoped adapters**:

\[
C_{11} = Id_{S1\_prime}.
\]

`src/scopedBijection.js` is now the single mapping definition used by both
adapters. `src/c11IdentityProof.js#proveC11Identity` checks the proof obligations:

1. Every `S1_prime` leaf is either a mandated constant, an exact copied field,
   or the complete finite observation-mode codec.
2. Every `S0_prime` leaf is covered by the projection.
3. Exact copies have matching numeric or Boolean domains.
4. The observation-mode codec is bijective over both allowed source values and
   both Boolean target values.
5. Closed-world validation excludes any unaccounted source information.

Therefore every admitted `S1_prime` value is reconstructed field-for-field by
`phi_10(phi_01(x))`. Under the current definitions:

\[
Fix(C_{11}) = S1\_prime,
\]

all `C11` orbits are constant, and `C11` is idempotent. Run
`npm run prove:c11-identity` to execute the proof checker.

This theorem is version-scoped. It does not survive an unverified schema,
validator, codec, or adapter change; it does not extend to parent domain `S1`;
and it does not establish full APEX-to-MCMC integration, repository kernel
emergence, or formal verification of the JavaScript runtime. The 432-subject
search remains useful as regression evidence, but it is no longer the basis for
the universal identity result.

## Identity-theorem change boundary

The identity theorem is now paired with a mutation-based proof-obligation impact
analysis. `src/c11ChangeImpact.js` applies declared incompatible changes to the
current schemas, mapping, constants, and codec, then reruns the structural proof
checker.

The current suite covers `S1_prime` and `S0_prime` schema expansion, copied-field
range changes, constant changes, mapping removal, mapping references outside the
domain, codec extension without target widening, and codec collisions. Every
declared mutation invalidates at least one identity-proof obligation. Run
`npm run impact:c11-identity` to emit the result.

This establishes a tested theorem-revocation boundary, not theorem stability
under arbitrary change. It does not enumerate every possible repository change,
prove that every compatible migration preserves behavior, or formally verify
the change detector. A schema or adapter change must still rerun the proof,
regression, and impact suites before the current identity claim can be retained.

## Compatible-evolution calculus

The theorem-change boundary now distinguishes three outcomes instead of treating
all change as equivalent:

| Category | Meaning |
| --- | --- |
| `theorem-preserving` | The theorem's proof inputs are unchanged and the current proof remains established. |
| `theorem-requiring-reproof` | Proof inputs changed, but the evolved obligations are satisfied. The old proof is not inherited; a new scoped proof may be issued. |
| `theorem-breaking` | The evolved proof obligations fail. The identity theorem is revoked. |

`src/c11Evolution.js` classifies before/after proof states using both proof-input
change detection and the evolved structural proof result. The declared scenarios
include a change outside the proof inputs, coordinated Boolean-field expansion,
coordinated schema/constant evolution, uncoordinated range change, and mapping
removal. Run `npm run evolution:c11` to emit the current classification report.

A `theorem-requiring-reproof` result is deliberately not called
`theorem-preserving`: although the evolved structure satisfies the obligations,
the current theorem is version-scoped and cannot be inherited across changed
premises. The calculus does not enumerate every possible repository change,
prove application-level behavior for compatible migrations, or formally verify
migration correctness.

## Generic theorem-governance protocol

The repository now separates **theorem-specific proof semantics** from the
**generic lifecycle protocol** used after a theorem has been established.
`src/theoremGovernance.js` can classify unchanged proof inputs, changed inputs
that pass a new proof, and changed inputs that fail the proof. It cannot discover a theorem's proof-input surface or establish a theorem by
itself; every registration must supply those theorem-specific parts. The protocol
checks that a proof-input constructor is declared, but cannot prove that the
constructor is complete.

`architecture/governance/theorem-governance.json` is a closed registration list.
At present, `C11` is the only governed theorem. Other claims do not silently gain
governance status, and adding a theorem requires its own proof checker, declared
proof-input constructor, bounded evolution calculus, and executable governance
witness. Run `npm run governance:theorems` to report registrations and explicitly
unregistered declared theorems.

This generalizes the governance **protocol**, not the `C11` proof or the scoped
bijection. It does not prove registered theorems, classify every future change,
or establish repository-wide theorem governance.

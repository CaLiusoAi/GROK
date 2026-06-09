# APEX Admissibility Boundary

## Status and scope

This document is an **APEX-local admissibility extraction**, not a canonical
kernel and not a repository-wide type system. It compresses the first-order
contradictions among the
APEX Pine v6 Factory artifacts into a constraint graph, identifies which degrees
of freedom can be eliminated, and defines the smallest shared semantic
substrate on which a later type-unification design can operate.

The extraction is deliberately **APEX-only**. The MCMC survival engine has a
different state space, transition system, and verification domain. Until an
explicit integration contract exists, it is an independent product root and is
not a fiber, test, or translation of APEX.

The source artifacts for this extraction are members of
`APEX_PINE_V6_LLM_FACTORY.zip`:

- `APEX_FACTORY_PROTOCOL.md`
- `LOAD_THIS_FIRST.md`
- `contracts/PINE_MASTER_SSD_v2_5.md`
- `contracts/PINE_EMISSION_CONTRACT.md`
- `contracts/PINE_v6_ORACLE_v2_1.md`
- `validators/apex_rules.json`
- `validators/pine_v6_static_gate.py`

## 1. Second-order diagnosis

The APEX artifacts mostly agree on the desired safety properties. They disagree
about which artifact may admit an output, what evidence closes a claim, and
which presentation or workflow rules are mandatory. The unresolved axis is
therefore **admissibility**, not the content of Pine programs.

Treating every artifact as a candidate kernel hides this structure. A more
useful model treats each artifact as a partial type discipline over a shared set
of primitives:

\[
\mathcal{T}_i = (P, C_i, V_i, A_i)
\]

where:

- \(P\) is the shared primitive vocabulary;
- \(C_i\) is the artifact's constraint set;
- \(V_i\) is its verdict vocabulary;
- \(A_i\) is its authority relation.

The APEX-local boundary is the meet of compatible, shared constraints—not the
union of every rule asserted by every artifact:

\[
A_{APEX} = \bigwedge_i Compatible(C_i)
\]

A rule excluded from \(A_{APEX}\) is not necessarily wrong. It becomes a policy
choice in a fiber until a later unification step proves it necessary.

## 2. Shared primitive base

The base space contains only primitives required to express the shared APEX
invariants and their evidence. It does not contain document names, header
layouts, boot scripts, or workflow phases.

| Primitive | Meaning |
| --- | --- |
| `Request` | The user's requested script behavior and declared exclusions. |
| `Program` | A candidate Pine v6 source artifact. |
| `Constraint` | A predicate over a request, program, evidence item, or verdict. |
| `Finding` | A constraint result with a location, reason, and severity. |
| `Evidence` | An observation produced by a named authority at a known stage. |
| `Authority` | The actor or mechanism qualified to produce a kind of evidence. |
| `Verdict` | A typed status for one validation surface. |
| `Transformation` | A request-preserving change from one candidate program to another. |
| `ReleaseDecision` | A decision derived from typed verdicts; never a synonym for one verdict. |

The minimum well-formed evidence shape is:

```text
Evidence {
  authority
  surface
  subject
  observation
  provenance
}
```

Evidence without an authority or provenance cannot close a claim.

## 3. Typed admissibility dimensions

The apparent type-system conflict collapses when overloaded words are replaced
by explicit dimensions.

### 3.1 Temporal dimension

State identity is not one universal object. A candidate moves through a typed
lifecycle:

```text
Requested -> Generated -> StaticChecked -> CompilerChecked
          -> RuntimeObserved -> HumanObserved -> Released
```

These stages describe accumulated evidence about a candidate. They do not imply
that the Pine program, the LLM session, and the human review share one mutable
state type. An implementation may skip a stage only by leaving its verdict
`UNKNOWN`; it may not silently convert missing evidence into `PASS`.

### 3.2 Closure dimension

"Closure" is split into independent predicates:

| Closure type | Closed when |
| --- | --- |
| `ConstraintClosure` | Every required constraint has a typed verdict. |
| `StaticClosure` | The static validator reports no blocking findings. |
| `CompilerClosure` | TradingView compiler evidence reports acceptance. |
| `RuntimeClosure` | Required runtime behaviors have observed evidence. |
| `VisualClosure` | Required visual behaviors have human-observed evidence. |
| `ReleaseClosure` | The declared release policy is satisfied by the verdict vector. |

No closure type implies another unless a policy declares and justifies that
implication.

### 3.3 Validity dimension

Validity is a vector rather than a single Boolean:

```text
ValidityVector {
  request_preservation
  doctrine
  static
  compiler
  runtime
  visual
}
```

Each field has the same minimal verdict algebra:

```text
UNKNOWN | PASS | WARN | FAIL
```

`UNKNOWN` is distinct from `FAIL`: it means the required authority has not
produced evidence. A release policy may treat `UNKNOWN` as blocking without
misrepresenting it as observed failure.

## 4. Constraint graph

### 4.1 Node classes

```text
ArtifactPolicy  --asserts--> Constraint
Constraint      --checks---> Request | Program | Evidence | Verdict
Authority       --produces-> Evidence
Evidence        --supports-> Verdict
VerdictVector   --feeds----> ReleasePolicy
ReleasePolicy   --decides--> ReleaseDecision
Transformation  --maps-----> Program -> Program
Transformation  --preserves> Request + A_APEX constraints
```

### 4.2 Authority edges

Authority is surface-specific, so there is no single absolute judge:

```text
Static validator    -> static findings
TradingView compiler -> compiler verdict
Runtime observation  -> runtime verdict
Human chart review   -> visual verdict
Release policy       -> release decision
```

The compiler is authoritative for compiler acceptance. It is not authoritative
for visual readability, request preservation, or compliance with documentary
policies. Likewise, static validation cannot claim compiler success.

### 4.3 Blocking constraints

The graph has four fail-closed blocking edges:

1. A `FAIL` on a required surface blocks release.
2. An `UNKNOWN` on a required evidence-backed surface blocks release.
3. A claim unsupported by evidence from the qualified authority blocks release.
4. A transformation that does not preserve the request or shared invariants is
   inadmissible.

This graph removes the contradictory need for one artifact to be the absolute
authority over every surface.

## 5. Irreducible invariant core

The following constraints form the proposed shared meet, \(A_{APEX}\). They are
retained because they recur across the APEX control artifacts and can be stated
without choosing a disputed workflow or presentation regime.

| ID | Shared constraint |
| --- | --- |
| `K-01` | The target language is Pine v6. |
| `K-02` | The emitted program preserves the requested behavior and declared exclusions. |
| `K-03` | Compiler success is not claimed without TradingView compiler evidence. |
| `K-04` | Runtime or visual success is not claimed without the corresponding observed evidence. |
| `K-05` | Missing required evidence or preconditions fail closed for release and program behavior. |
| `K-06` | Known-fictional Pine APIs, members, and constants are inadmissible. |
| `K-07` | Conditions that require Boolean values are explicitly Boolean-safe. |
| `K-08` | Nullable drawing handles are guarded before mutation or deletion. |
| `K-09` | Visual-resource creation is bounded and accounted for. |
| `K-10` | Static, compiler, runtime, visual, and release verdicts remain distinct. |
| `K-11` | Every admissibility claim identifies its authority and evidence provenance. |
| `K-12` | Conservative transformations preserve `Request` and all applicable `A_APEX` constraints. |

These constraints define a boundary, not a complete generator. A system that
satisfies them may still need policy-specific checks before release.

## 6. Eliminable degrees of freedom

A degree of freedom is eliminable from the APEX admissibility base when changing it does not
change the shared primitive meanings or any `A_APEX` verdict.

| Degree of freedom | Kernel treatment | Reason |
| --- | --- | --- |
| Exact header layout and section count | Policy fiber | Artifacts require incompatible layouts. |
| Header typography and Unicode/ASCII style | Policy fiber | Current rules directly conflict. |
| Cold-start prompt and first-response ritual | Policy fiber | Boot procedures affect orchestration, not Pine semantics. |
| Document packaging and "one live file" claims | Repository policy | Packaging does not determine program admissibility. |
| Ledger, receipt, and failure-registry formats | Evidence-serialization fiber | Their information matters; their presentation does not. |
| Named workflow phases | Orchestration fiber | Stages may vary if typed evidence and verdicts are preserved. |
| Local fixed-point terminology | Remove/rename | The term is overloaded and unnecessary at this boundary. |
| Compact static-gate rule subset | Validator profile | It is one partial checker, not total validity. |

Two artifact policies are equivalent at the minimal boundary when they differ
only on these eliminated choices:

\[
A \sim_{A_{APEX}} B
\iff
\forall x,\ Verdict_{A_{APEX}}(A,x)=Verdict_{A_{APEX}}(B,x)
\]

The quotient by \(\sim_{A_{APEX}}\) removes presentation and orchestration
branching without pretending those policies are identical.

## 7. Non-eliminable choices

The following decisions cannot be quotiented away because they alter the
meaning of admissibility:

1. **Product boundary:** APEX and MCMC remain separate absent an explicit bridge.
2. **Target language:** changing Pine v6 changes the validation domain.
3. **Authority qualification:** changing who may close a verdict changes claim
   meaning.
4. **Evidence requirement:** allowing unsupported claims changes validity.
5. **Fail-closed behavior:** changing missing evidence from blocking to passing
   changes release semantics.
6. **Verdict separation:** collapsing static, compiler, runtime, visual, and
   release verdicts recreates the original contradiction.
7. **Request preservation:** permitting a transformation to change the requested
   question changes the product's meaning.

These are inputs to the later meta-type system, not implementation preferences.

## 8. Common admissible operations

Only the following operations are required at the minimal boundary:

| Operation | Required preservation law |
| --- | --- |
| `generate(Request) -> Program` | Does not assert unobserved success. |
| `transform(Request, Program) -> Program` | Preserves the request and applicable shared constraints. |
| `check(Authority, Surface, Subject) -> Evidence + Findings` | Produces only evidence within the authority's qualified surface. |
| `judge(Evidence, Constraint) -> Verdict` | Keeps absent evidence as `UNKNOWN`. |
| `release(VerdictVector, ReleasePolicy) -> ReleaseDecision` | Does not collapse component verdicts into unsupported claims. |

Recursion, phased delivery, interactive repair, canonical headers, and
particular ledgers may be implemented above this layer, but they are not common
operations and therefore are not admissibility-base axioms.

## 9. Satisfiability and elimination procedure

A future artifact or rule enters the boundary only through this procedure:

1. **Type it.** Identify the primitive, validation surface, authority, and
   verdict affected by the rule.
2. **Check compatibility.** Reject rules that require a contradiction with an
   existing non-eliminable constraint.
3. **Test necessity.** Remove the rule temporarily. If all `A_APEX` verdicts and
   primitive meanings remain unchanged, classify it as a fiber policy.
4. **Check evidence reachability.** A required verdict must have a reachable,
   qualified authority capable of producing its evidence.
5. **Check preservation.** Every admitted transformation must preserve the
   request and applicable shared constraints.
6. **Record the result.** Classify the rule as `BASE`, `FIBER_POLICY`,
   `VALIDATOR_PROFILE`, `REPOSITORY_POLICY`, or `REJECTED_CONTRADICTION`.

This is the convergence rule that prevents a new workflow or document from
silently becoming another kernel candidate.

## 10. Boundary acceptance tests

The extraction is adequate for a later type-unification design only if all of
the following hold:

- A program may pass static checks while compiler validity remains `UNKNOWN`.
- A compiler-valid program may have visual validity remain `UNKNOWN` or `FAIL`.
- A missing human review cannot be represented as human `PASS`.
- Two different header layouts can receive identical `A_APEX` verdict vectors.
- A Unicode-header policy and an ASCII-only policy can coexist as separate
  fibers, but no release profile may require both simultaneously.
- No APEX verdict is inferred from MCMC tests, and no MCMC result is inferred
  from APEX doctrine.
- A new artifact cannot claim repository-wide authority merely by restating the shared
  constraints in a different format.

## 11. Result and next boundary

The second-order collapse yields this structure:

```text
APEX base primitives + A_APEX
├── header policy fibers
├── boot/orchestration policy fibers
├── evidence-serialization fibers
├── validator profiles
└── release profiles

MCMC survival engine (separate product root)
```

This result is an APEX admissibility model, not a minimal repository kernel. It
does not identify APEX with the MCMC runtime and cannot make claims about MCMC
validity. The repository-level next boundary is the witnessed cross-domain
identification layer described in
[Cross-Domain Identification Layer](cross-domain-morphism-layer.md). Only an
implemented morphism may turn these adjacent domains into a pipeline.

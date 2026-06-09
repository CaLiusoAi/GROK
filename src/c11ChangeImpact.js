import { proveC11Identity } from "./c11IdentityProof.js";
import { COPY_FIELDS, OBSERVATION_CODEC, S1_CONSTANTS } from "./scopedBijection.js";
import { S0_PRIME_BOUNDARY } from "./s0Prime.js";
import { S1_PRIME_BOUNDARY } from "./s1Prime.js";

function clone(value) {
  return structuredClone(value);
}

export function changeScenarios() {
  return [
    { id: "s1-schema-expansion", mutate: state => state.s1Boundary.requiredShape.root.push("newSemanticField") },
    { id: "s0-schema-expansion", mutate: state => state.s0Boundary.requiredShape.push("newConfigField") },
    { id: "copied-range-change", mutate: state => { state.s0Boundary.ranges.riskPerTrade.maximum = 0.5; } },
    { id: "constant-change", mutate: state => { state.constants.schema = "apex-strategy-semantics/v2"; } },
    { id: "mapping-removal", mutate: state => { state.copyFields = state.copyFields.filter(([source]) => source !== "risk.value"); } },
    { id: "mapping-outside-domain", mutate: state => state.copyFields.push(["missing.field", "newTarget"]) },
    { id: "codec-extension-without-target-widening", mutate: state => { state.s1Boundary.enums.regimeObservation.push("third-mode"); state.observationCodec["third-mode"] = false; } },
    { id: "codec-collision", mutate: state => { state.observationCodec["lagged-classifier"] = false; } },
  ];
}

export function analyzeC11ChangeImpact(scenarios = changeScenarios()) {
  const baseline = proveC11Identity();
  const results = scenarios.map(scenario => {
    const state = {
      s1Boundary: clone(S1_PRIME_BOUNDARY),
      s0Boundary: clone(S0_PRIME_BOUNDARY),
      constants: clone(S1_CONSTANTS),
      copyFields: clone(COPY_FIELDS),
      observationCodec: clone(OBSERVATION_CODEC),
    };
    scenario.mutate(state);
    const proof = proveC11Identity(state);
    return { id: scenario.id, theoremPreserved: proof.established, errors: proof.errors };
  });
  return {
    baselineEstablished: baseline.established,
    testedMutations: results.length,
    invalidatedMutations: results.filter(result => !result.theoremPreserved).length,
    undetectedMutations: results.filter(result => result.theoremPreserved),
    results,
  };
}

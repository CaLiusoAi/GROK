import { proveC11Identity } from "./c11IdentityProof.js";
import { classifyTheoremEvolution } from "./theoremGovernance.js";
import { COPY_FIELDS, OBSERVATION_CODEC, S1_CONSTANTS } from "./scopedBijection.js";
import { S0_PRIME_BOUNDARY } from "./s0Prime.js";
import { S1_PRIME_BOUNDARY } from "./s1Prime.js";

function clone(value) {
  return structuredClone(value);
}

export function currentC11ProofState() {
  return {
    s1Boundary: clone(S1_PRIME_BOUNDARY),
    s0Boundary: clone(S0_PRIME_BOUNDARY),
    constants: clone(S1_CONSTANTS),
    copyFields: clone(COPY_FIELDS),
    observationCodec: clone(OBSERVATION_CODEC),
  };
}

export function analyzeC11Evolution(before, after) {
  return classifyTheoremEvolution({ before, after, prove: proveC11Identity });
}

export function evolutionScenarios() {
  return [
    {
      id: "metadata-only-change",
      expected: "theorem-preserving",
      evolve: state => state,
    },
    {
      id: "coordinated-boolean-field-expansion",
      expected: "theorem-requiring-reproof",
      evolve: state => {
        state.s1Boundary.requiredShape.root.push("newSwitch");
        state.s1Boundary.booleans.push("newSwitch");
        state.s0Boundary.requiredShape.push("newSwitchConfig");
        state.s0Boundary.booleans.push("newSwitchConfig");
        state.copyFields.push(["newSwitch", "newSwitchConfig"]);
        return state;
      },
    },
    {
      id: "coordinated-schema-version-change",
      expected: "theorem-requiring-reproof",
      evolve: state => {
        state.s1Boundary.constants.schema = "apex-strategy-semantics/v2";
        state.constants.schema = "apex-strategy-semantics/v2";
        return state;
      },
    },
    {
      id: "uncoordinated-range-change",
      expected: "theorem-breaking",
      evolve: state => {
        state.s0Boundary.ranges.riskPerTrade.maximum = 0.5;
        return state;
      },
    },
    {
      id: "mapping-removal",
      expected: "theorem-breaking",
      evolve: state => {
        state.copyFields = state.copyFields.filter(([source]) => source !== "risk.value");
        return state;
      },
    },
  ];
}

export function analyzeDeclaredEvolutions() {
  const results = evolutionScenarios().map(scenario => {
    const before = currentC11ProofState();
    const after = scenario.evolve(clone(before));
    return { id: scenario.id, expected: scenario.expected, ...analyzeC11Evolution(before, after) };
  });
  return { results, expectationsMet: results.every(result => result.category === result.expected) };
}

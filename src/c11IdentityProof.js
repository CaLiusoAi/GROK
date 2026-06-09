import { COPY_FIELDS, OBSERVATION_CODEC, S1_CONSTANTS } from "./scopedBijection.js";
import { S0_PRIME_BOUNDARY } from "./s0Prime.js";
import { S1_PRIME_BOUNDARY } from "./s1Prime.js";

function leafPaths(shape) {
  const nested = new Set(Object.keys(shape).filter(path => path !== "root"));
  return shape.root.flatMap(key => nested.has(key) ? shape[key].map(child => `${key}.${child}`) : [key]);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/** Check the structural obligations proving C11 is identity under current schemas. */
export function proveC11Identity({
  s1Boundary = S1_PRIME_BOUNDARY,
  s0Boundary = S0_PRIME_BOUNDARY,
  constants = S1_CONSTANTS,
  copyFields = COPY_FIELDS,
  observationCodec = OBSERVATION_CODEC,
} = {}) {
  const errors = [];
  const s1Leaves = new Set(leafPaths(s1Boundary.requiredShape));
  const s0Leaves = new Set(s0Boundary.requiredShape);
  const coveredS1 = new Set(Object.keys(constants));
  const coveredS0 = new Set();

  for (const [source, target] of copyFields) {
    coveredS1.add(source);
    coveredS0.add(target);
    const sourceRange = s1Boundary.ranges[source];
    const targetRange = s0Boundary.ranges[target];
    const sourceBoolean = s1Boundary.booleans.includes(source);
    const targetBoolean = s0Boundary.booleans.includes(target);
    if (sourceRange || targetRange) {
      if (!sameJson(sourceRange, targetRange)) errors.push(`range mismatch: ${source} <-> ${target}`);
    } else if (!(sourceBoolean && targetBoolean)) errors.push(`type mismatch: ${source} <-> ${target}`);
  }

  coveredS1.add("regimeObservation");
  coveredS0.add("useClassifier");
  const enumValues = s1Boundary.enums.regimeObservation;
  const encoded = enumValues.map(value => observationCodec[value]);
  if (encoded.some(value => typeof value !== "boolean") || new Set(encoded).size !== enumValues.length) errors.push("observation codec is not injective and total");
  if (!s0Boundary.booleans.includes("useClassifier") || !encoded.includes(false) || !encoded.includes(true)) errors.push("observation codec is not surjective onto S0-prime useClassifier");

  for (const [path, value] of Object.entries(constants)) {
    if (s1Boundary.constants[path] !== value) errors.push(`constant reconstruction mismatch: ${path}`);
  }
  for (const path of s1Leaves) if (!coveredS1.has(path)) errors.push(`uncovered S1-prime field: ${path}`);
  for (const path of coveredS1) if (!s1Leaves.has(path)) errors.push(`mapping references non-domain S1-prime field: ${path}`);
  for (const path of s0Leaves) if (!coveredS0.has(path)) errors.push(`uncovered S0-prime field: ${path}`);
  for (const path of coveredS0) if (!s0Leaves.has(path)) errors.push(`mapping references non-domain S0-prime field: ${path}`);

  return {
    theorem: "C11 = identity on S1_prime under the current closed-world schemas and adapters",
    established: errors.length === 0,
    obligations: {
      allS1FieldsCovered: [...s1Leaves].every(path => coveredS1.has(path)),
      allS0FieldsCovered: [...s0Leaves].every(path => coveredS0.has(path)),
      constantsReconstructed: Object.keys(constants).length,
      copiedFields: copyFields.length,
      finiteCodecValuesChecked: enumValues.length,
    },
    errors,
  };
}

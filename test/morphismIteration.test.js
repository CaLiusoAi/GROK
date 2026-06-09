import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeMorphismIteration } from "../src/morphismIteration.js";

const registry = JSON.parse(await readFile(new URL("../architecture/cross-domain-identification.json", import.meta.url)));
const claim = JSON.parse(await readFile(new URL("../architecture/limits/phi01-iteration.json", import.meta.url)));

test("phi_01 remains directly non-iterable but has a witnessed return cycle", () => {
  assert.deepEqual(analyzeMorphismIteration(registry, "phi_01"), {
    morphism: "phi_01",
    directIterationTypeDefined: false,
    cycleTypeDefined: true,
    classification: "direct-not-iterable-witnessed-return-cycle",
    cycle: ["phi_01", "phi_10"],
    executableCycleProven: true,
    compositionClaim: "phi_10_after_phi_01",
    convergenceDefined: false,
  });
  assert.equal(claim.classification, "direct-not-iterable-witnessed-return-cycle");
});

test("an endomorphism makes direct iteration typed without implying convergence", () => {
  const hypothetical = structuredClone(registry);
  hypothetical.morphisms.identity = { source: "S1_prime", target: "S1_prime", status: "implemented" };
  assert.deepEqual(analyzeMorphismIteration(hypothetical, "identity"), {
    morphism: "identity", iterationTypeDefined: true, classification: "typed-endomorphism", cycle: ["identity"], convergenceDefined: false,
  });
});

test("a return path without a composition witness only closes types", () => {
  const hypothetical = structuredClone(registry);
  delete hypothetical.compositionClaims.phi_10_after_phi_01;
  assert.deepEqual(analyzeMorphismIteration(hypothetical, "phi_01"), {
    morphism: "phi_01", directIterationTypeDefined: false, cycleTypeDefined: true, classification: "typed-cycle-candidate",
    cycle: ["phi_01", "phi_10"], executableCycleProven: false, compositionClaim: undefined, convergenceDefined: false,
  });
});

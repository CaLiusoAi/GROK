import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { classifyTheoremEvolution, reportTheoremGovernance, validateTheoremGovernance } from "../src/theoremGovernance.js";

const governance = JSON.parse(await readFile(new URL("../architecture/governance/theorem-governance.json", import.meta.url)));
const registry = JSON.parse(await readFile(new URL("../architecture/cross-domain-identification.json", import.meta.url)));
const prove = state => ({ established: state.valid, errors: state.valid ? [] : ["invalid"] });

test("generic classifier separates preservation, reproof, and breakage", () => {
  assert.equal(classifyTheoremEvolution({ before: { valid: true }, after: { valid: true }, prove }).category, "theorem-preserving");
  assert.equal(classifyTheoremEvolution({ before: { valid: true }, after: { valid: true, version: 2 }, prove }).category, "theorem-requiring-reproof");
  assert.equal(classifyTheoremEvolution({ before: { valid: true }, after: { valid: false }, prove }).category, "theorem-breaking");
});

test("generic classifier rejects malformed theorem-specific proof checkers", () => {
  assert.throws(() => classifyTheoremEvolution({ before: {}, after: {}, prove: () => true }), /proof checker must return/);
  assert.throws(() => classifyTheoremEvolution({ before: {}, after: {} }), /requires a proof checker/);
});

test("governance protocol registers C11 only and does not claim to prove it", () => {
  assert.deepEqual(validateTheoremGovernance(governance, registry.fixedPointClaims), []);
  const report = reportTheoremGovernance(governance, registry.fixedPointClaims);
  assert.equal(report.valid, true);
  assert.deepEqual(report.registeredTheorems.map(({ id }) => id), ["C11"]);
  assert.ok(report.nonClaims.includes("generic governance proves registered theorems"));
});

test("governance rejects registration without theorem-specific proof inputs", () => {
  const claims = structuredClone(registry.fixedPointClaims);
  delete claims.C11.proofState;
  assert.match(validateTheoremGovernance(governance, claims).join("\n"), /C11: governed theorem lacks theorem-specific proof-input constructor/);
});

test("unregistered declared theorems remain explicitly outside governance", () => {
  const claims = { ...registry.fixedPointClaims, hypothetical: { status: "declared" } };
  assert.deepEqual(reportTheoremGovernance(governance, claims).unregisteredDeclaredTheorems, ["hypothetical"]);
});

test("generic protocol can validate a separately declared theorem without proving it", () => {
  const candidate = structuredClone(governance);
  candidate.registeredTheorems = ["separate_theorem"];
  const claims = {
    separate_theorem: {
      status: "candidate-with-specific-proof",
      proofChecker: "src/example.js#prove",
      proofState: "src/example.js#proofState",
      evolutionCalculus: { status: "bounded" },
      governanceWitness: "test/example.test.js",
    },
  };
  assert.deepEqual(validateTheoremGovernance(candidate, claims), []);
});

test("embedded governance summary stays synchronized with canonical protocol", () => {
  assert.deepEqual(registry.theoremGovernance.categories, governance.categories);
  assert.deepEqual(registry.theoremGovernance.registrationRequirements, governance.registrationRequirements);
  for (const nonClaim of registry.theoremGovernance.nonClaims) assert.ok(governance.nonClaims.includes(nonClaim));
});

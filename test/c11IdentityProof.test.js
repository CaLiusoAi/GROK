import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { proveC11Identity } from "../src/c11IdentityProof.js";
import { S1_PRIME_BOUNDARY } from "../src/s1Prime.js";

const claim = JSON.parse(await readFile(new URL("../architecture/proofs/c11-identity.json", import.meta.url)));

test("machine-checked structural obligations establish C11 identity on current S1-prime", () => {
  const proof = proveC11Identity();
  assert.equal(proof.established, true);
  assert.deepEqual(proof.errors, []);
  assert.equal(proof.obligations.allS1FieldsCovered, true);
  assert.equal(proof.obligations.allS0FieldsCovered, true);
  assert.equal(proof.obligations.constantsReconstructed, 6);
  assert.equal(proof.obligations.copiedFields, 6);
  assert.equal(proof.obligations.finiteCodecValuesChecked, 2);
});

test("identity theorem remains scoped to current schemas and adapters", () => {
  assert.equal(claim.theorem, "C11 = Id(S1_prime)");
  assert.ok(claim.nonClaims.includes("identity after schema or adapter changes"));
  assert.ok(claim.nonClaims.includes("formal verification of the JavaScript runtime"));
});


test("structural proof checker rejects unverified schema expansion", () => {
  const expanded = structuredClone(S1_PRIME_BOUNDARY);
  expanded.requiredShape.root.push("newSemanticField");
  const proof = proveC11Identity({ s1Boundary: expanded });
  assert.equal(proof.established, false);
  assert.match(proof.errors.join("\n"), /uncovered S1-prime field: newSemanticField/);
});

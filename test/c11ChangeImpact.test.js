import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeC11ChangeImpact } from "../src/c11ChangeImpact.js";

const claim = JSON.parse(await readFile(new URL("../architecture/proofs/c11-change-impact.json", import.meta.url)));

test("declared incompatible changes invalidate the current C11 identity proof", () => {
  const report = analyzeC11ChangeImpact();
  assert.equal(report.baselineEstablished, true);
  assert.equal(report.testedMutations, claim.mutationClasses.length);
  assert.equal(report.invalidatedMutations, claim.mutationClasses.length);
  assert.deepEqual(report.undetectedMutations, []);
  assert.ok(report.results.every(result => result.errors.length > 0));
});

test("change-impact claim retains explicit epistemic limits", () => {
  assert.equal(claim.classification, "mutation-based-proof-obligation-impact-analysis");
  assert.ok(claim.nonClaims.includes("all possible repository changes are enumerated"));
  assert.ok(claim.nonClaims.includes("formal verification of change detection"));
});

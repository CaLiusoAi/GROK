import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeC11Evolution, analyzeDeclaredEvolutions, currentC11ProofState } from "../src/c11Evolution.js";

const claim = JSON.parse(await readFile(new URL("../architecture/evolution/c11-evolution-calculus.json", import.meta.url)));

test("declared C11 evolutions classify into preserving, reproof, and breaking", () => {
  const report = analyzeDeclaredEvolutions();
  assert.equal(report.expectationsMet, true);
  assert.deepEqual(report.results.map(result => result.category), [
    "theorem-preserving",
    "theorem-requiring-reproof",
    "theorem-requiring-reproof",
    "theorem-breaking",
    "theorem-breaking",
  ]);
});

test("proof-input equality is required for theorem-preserving classification", () => {
  const before = currentC11ProofState();
  assert.equal(analyzeC11Evolution(before, structuredClone(before)).category, "theorem-preserving");
  const changed = structuredClone(before);
  changed.constants.schema = "apex-strategy-semantics/v2";
  assert.equal(analyzeC11Evolution(before, changed).category, "theorem-breaking");
});

test("evolution calculus retains explicit limits", () => {
  assert.equal(claim.classification, "proof-input-evolution-calculus");
  assert.ok(claim.nonClaims.includes("all possible repository changes are classified"));
  assert.ok(claim.nonClaims.includes("theorem-requiring-reproof changes preserve application behavior"));
});

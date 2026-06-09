import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { characterizeC11FixedPoints, generateCharacterizationSubjects } from "../src/c11FixedPointCharacterization.js";

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const base = await readJson("../architecture/witnesses/phi01-supported-strategy.json");
const plan = await readJson("../architecture/fixed-points/c11-characterization-plan.json");

test("finite factorial search finds no C11 counterexample in its declared basis", () => {
  const subjects = generateCharacterizationSubjects(base, plan.coverageBasis);
  const report = characterizeC11FixedPoints(subjects);
  assert.equal(subjects.length, 432);
  assert.equal(report.tested, 432);
  assert.equal(report.fixedCount, 432);
  assert.equal(report.nonFixedCount, 0);
  assert.deepEqual(report.counterexamples, []);
  assert.equal(report.observedFixedCoverage, true);
});

test("characterization plan keeps infinite dimensions and universal claims open", () => {
  assert.equal(plan.classification, "finite-factorial-counterexample-search");
  assert.equal(plan.openDimensions.length, 3);
  assert.ok(plan.nonClaims.includes("Fix(C11) equals S1_prime"));
  assert.ok(plan.nonClaims.includes("formal proof"));
});

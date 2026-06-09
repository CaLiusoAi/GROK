import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { admissibilityOperator, analyzeBoundarySensitivity, analyzeS1PrimeStability } from "../src/s1PrimeStability.js";

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const witness = await readJson("../architecture/witnesses/phi01-supported-strategy.json");
const plan = await readJson("../architecture/stability/s1-prime-perturbations.json");

test("S1-prime admissibility operator is idempotent on admitted and rejected samples", () => {
  assert.deepEqual(admissibilityOperator(admissibilityOperator(witness)), admissibilityOperator(witness));
  const rejected = { ...witness, schema: "unsupported" };
  assert.equal(admissibilityOperator(rejected), null);
  assert.equal(admissibilityOperator(admissibilityOperator(rejected)), null);
});

test("sampled perturbations match the declared S1-prime boundary", () => {
  const report = analyzeS1PrimeStability(witness, plan.perturbations);
  assert.equal(report.baselineAdmitted, true);
  assert.equal(report.operatorIdempotentOnSubject, true);
  assert.equal(report.perturbationExpectationsMet, true);
  assert.equal(report.samples.length, plan.perturbations.length);
});

test("constraint tightening and schema evolution invalidate the current witness", () => {
  assert.deepEqual(analyzeBoundarySensitivity(witness), {
    current: true,
    afterRiskTightening: false,
    afterSchemaEvolution: false,
  });
});

test("stability plan states what remains unmeasured", () => {
  assert.equal(plan.classification, "sampled-local-stability");
  assert.ok(plan.unmeasured.some(item => item.includes("no S1 generator")));
  assert.ok(plan.unmeasured.some(item => item.includes("global maximality")));
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { adaptApexStrategyToSimulation } from "../src/phi01StrategyAdapter.js";
import { S0_PRIME_BOUNDARY, isS0Prime, validateS0Prime } from "../src/s0Prime.js";

const witness = JSON.parse(await readFile(new URL("../architecture/witnesses/phi01-supported-strategy.json", import.meta.url)));

test("the phi_01 image belongs to explicit S0-prime", () => {
  const config = adaptApexStrategyToSimulation(witness);
  assert.equal(isS0Prime(config), true);
  assert.deepEqual(validateS0Prime(config), []);
});

test("S0-prime excludes general runtime configuration and result fields", () => {
  const config = adaptApexStrategyToSimulation(witness);
  assert.match(validateS0Prime({ ...config, onDay() {} }).join("\n"), /undeclared field/);
  assert.match(validateS0Prime({ ...config, finalCapital: 1 }).join("\n"), /undeclared field/);
});

test("machine-readable S0-prime boundary matches the executable predicate", async () => {
  const boundary = JSON.parse(await readFile(new URL("../architecture/subdomains/s0-prime.json", import.meta.url)));
  for (const key of ["requiredShape", "ranges", "booleans"]) assert.deepEqual(boundary[key], S0_PRIME_BOUNDARY[key]);
});

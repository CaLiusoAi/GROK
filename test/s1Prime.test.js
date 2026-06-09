import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { S1_PRIME_BOUNDARY, isS1Prime, validateS1Prime } from "../src/s1Prime.js";

const witness = JSON.parse(await readFile(new URL("../architecture/witnesses/phi01-supported-strategy.json", import.meta.url)));
const boundary = JSON.parse(await readFile(new URL("../architecture/subdomains/s1-prime.json", import.meta.url)));

test("S1-prime witness satisfies the explicit membership predicate", () => {
  assert.equal(isS1Prime(witness), true);
  assert.deepEqual(validateS1Prime(witness), []);
});

test("S1-prime is closed-world and rejects domain expansion", () => {
  assert.match(validateS1Prime({ ...witness, pineSource: "strategy('x')" }).join("\n"), /profile.pineSource: undeclared field/);
  assert.match(validateS1Prime({ ...witness, time: { ...witness.time, timezone: "UTC" } }).join("\n"), /profile.time.timezone: undeclared field/);
  assert.match(validateS1Prime({ ...witness, risk: { ...witness.risk, value: Number.NaN } }).join("\n"), /profile.risk.value/);
});

test("machine-readable S1-prime boundary names the executable predicate", () => {
  assert.equal(boundary.id, "S1-prime-phi01-v1");
  assert.equal(boundary.parent, "S1");
  assert.equal(boundary.closedWorld, true);
  assert.equal(boundary.membershipPredicate, "src/s1Prime.js#validateS1Prime");
  for (const key of ["requiredShape", "constants", "enums", "ranges", "booleans"]) {
    assert.deepEqual(boundary[key], S1_PRIME_BOUNDARY[key]);
  }
});

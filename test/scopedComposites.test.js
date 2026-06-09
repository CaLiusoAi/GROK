import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyzeSampledFixedPoint, composeC00, composeC11, iterateEndomorphism } from "../src/scopedComposites.js";

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const profile = await readJson("../architecture/witnesses/phi01-supported-strategy.json");
const config = await readJson("../architecture/witnesses/phi10-supported-config.json");
const claim = await readJson("../architecture/fixed-points/c11-sampled-analysis.json");

test("C11 and C00 are executable endomorphisms on witnessed subjects", () => {
  assert.deepEqual(composeC11(profile), profile);
  assert.deepEqual(composeC00(config), config);
});

test("sampled C11 orbit remains constant as supporting evidence", () => {
  const report = analyzeSampledFixedPoint(composeC11, profile, 4);
  assert.equal(report.fixedAtFirstApplication, true);
  assert.equal(report.orbitConstant, true);
  assert.equal(report.orbit.length, 5);
  assert.equal(claim.status, "sampled-fixed-points-no-counterexample-in-finite-basis");
  assert.ok(claim.nonClaims.includes("global convergence"));
});

test("endomorphism iteration validates its finite step count", () => {
  assert.throws(() => iterateEndomorphism(composeC11, profile, -1), /non-negative integer/);
});

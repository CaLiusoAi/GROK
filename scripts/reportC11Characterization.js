import { readFile } from "node:fs/promises";
import { characterizeC11FixedPoints, generateCharacterizationSubjects } from "../src/c11FixedPointCharacterization.js";

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const base = await readJson("../architecture/witnesses/phi01-supported-strategy.json");
const plan = await readJson("../architecture/fixed-points/c11-characterization-plan.json");
const report = characterizeC11FixedPoints(generateCharacterizationSubjects(base, plan.coverageBasis));
console.log(JSON.stringify({ classification: plan.classification, ...report, openDimensions: plan.openDimensions, nonClaims: plan.nonClaims }, null, 2));

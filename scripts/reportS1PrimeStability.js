import { readFile } from "node:fs/promises";
import { analyzeBoundarySensitivity, analyzeS1PrimeStability } from "../src/s1PrimeStability.js";

const readJson = async relativePath => JSON.parse(await readFile(new URL(relativePath, import.meta.url)));
const plan = await readJson("../architecture/stability/s1-prime-perturbations.json");
const subject = await readJson(`../${plan.subject}`);

console.log(JSON.stringify({
  classification: plan.classification,
  local: analyzeS1PrimeStability(subject, plan.perturbations),
  boundarySensitivity: analyzeBoundarySensitivity(subject),
  unmeasured: plan.unmeasured,
}, null, 2));

import { readFile } from "node:fs/promises";
import { analyzeMorphismIteration } from "../src/morphismIteration.js";

const registry = JSON.parse(await readFile(new URL("../architecture/cross-domain-identification.json", import.meta.url)));
console.log(JSON.stringify(analyzeMorphismIteration(registry, "phi_01"), null, 2));

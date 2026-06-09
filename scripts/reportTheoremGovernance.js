import { readFile } from "node:fs/promises";
import { reportTheoremGovernance } from "../src/theoremGovernance.js";

const governance = JSON.parse(await readFile(new URL("../architecture/governance/theorem-governance.json", import.meta.url)));
const registry = JSON.parse(await readFile(new URL("../architecture/cross-domain-identification.json", import.meta.url)));
console.log(JSON.stringify(reportTheoremGovernance(governance, registry.fixedPointClaims), null, 2));

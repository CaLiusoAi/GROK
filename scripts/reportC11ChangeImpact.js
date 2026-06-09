import { readFile } from "node:fs/promises";
import { analyzeC11ChangeImpact } from "../src/c11ChangeImpact.js";

const claim = JSON.parse(await readFile(new URL("../architecture/proofs/c11-change-impact.json", import.meta.url)));
console.log(JSON.stringify({ ...analyzeC11ChangeImpact(), classification: claim.classification, nonClaims: claim.nonClaims }, null, 2));

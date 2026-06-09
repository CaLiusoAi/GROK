import { readFile } from "node:fs/promises";
import { analyzeDeclaredEvolutions } from "../src/c11Evolution.js";

const claim = JSON.parse(await readFile(new URL("../architecture/evolution/c11-evolution-calculus.json", import.meta.url)));
console.log(JSON.stringify({ ...analyzeDeclaredEvolutions(), categories: claim.categories, nonClaims: claim.nonClaims }, null, 2));

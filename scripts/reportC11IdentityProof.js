import { readFile } from "node:fs/promises";
import { proveC11Identity } from "../src/c11IdentityProof.js";

const claim = JSON.parse(await readFile(new URL("../architecture/proofs/c11-identity.json", import.meta.url)));
console.log(JSON.stringify({ ...proveC11Identity(), scope: claim.scope, consequences: claim.consequences, nonClaims: claim.nonClaims }, null, 2));

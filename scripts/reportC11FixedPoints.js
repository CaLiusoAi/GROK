import { readFile } from "node:fs/promises";
import { analyzeSampledFixedPoint, composeC11 } from "../src/scopedComposites.js";

const claim = JSON.parse(await readFile(new URL("../architecture/fixed-points/c11-sampled-analysis.json", import.meta.url)));
const reports = [];
for (const path of claim.subjects) {
  const subject = JSON.parse(await readFile(new URL(`../${path}`, import.meta.url)));
  reports.push({ subject: path, ...analyzeSampledFixedPoint(composeC11, subject, 4) });
}
console.log(JSON.stringify({ status: claim.status, reports, nonClaims: claim.nonClaims }, null, 2));

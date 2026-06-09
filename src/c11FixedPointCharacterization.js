import { isDeepStrictEqual } from "node:util";
import { composeC11 } from "./scopedComposites.js";
import { validateS1Prime } from "./s1Prime.js";

function combinations(entries, index = 0, current = {}, output = []) {
  if (index === entries.length) return output.push(structuredClone(current)), output;
  const [path, values] = entries[index];
  for (const value of values) {
    current[path] = value;
    combinations(entries, index + 1, current, output);
  }
  return output;
}

function setAt(subject, path, value) {
  const keys = path.split(".");
  let cursor = subject;
  for (const key of keys.slice(0, -1)) cursor = cursor[key];
  cursor[keys.at(-1)] = value;
}

export function generateCharacterizationSubjects(baseSubject, coverageBasis) {
  return combinations(Object.entries(coverageBasis)).map(changes => {
    const subject = structuredClone(baseSubject);
    for (const [path, value] of Object.entries(changes)) setAt(subject, path, value);
    const findings = validateS1Prime(subject);
    if (findings.length > 0) throw new TypeError(`characterization generator produced invalid S1-prime: ${findings.join("; ")}`);
    return subject;
  });
}

export function characterizeC11FixedPoints(subjects) {
  const fixed = [];
  const nonFixed = [];
  for (const subject of subjects) {
    const image = composeC11(subject);
    (isDeepStrictEqual(image, subject) ? fixed : nonFixed).push({ subject, image });
  }
  return {
    tested: subjects.length,
    fixedCount: fixed.length,
    nonFixedCount: nonFixed.length,
    counterexamples: nonFixed,
    observedFixedCoverage: subjects.length > 0 && nonFixed.length === 0,
  };
}

import { isDeepStrictEqual } from "node:util";

export const THEOREM_EVOLUTION_CATEGORIES = Object.freeze([
  "theorem-preserving",
  "theorem-requiring-reproof",
  "theorem-breaking",
]);

/**
 * Classify evolution for one version-scoped theorem.
 * The caller must supply that theorem's complete proof-input states and proof
 * checker; this protocol does not discover proof inputs or prove the theorem.
 */
export function classifyTheoremEvolution({ before, after, prove }) {
  if (typeof prove !== "function") throw new TypeError("theorem evolution requires a proof checker");

  const proofInputsChanged = !isDeepStrictEqual(before, after);
  const proof = prove(after);
  if (typeof proof?.established !== "boolean" || !Array.isArray(proof?.errors)) {
    throw new TypeError("proof checker must return { established: boolean, errors: array }");
  }

  const category = !proof.established
    ? "theorem-breaking"
    : proofInputsChanged
      ? "theorem-requiring-reproof"
      : "theorem-preserving";

  return { category, proofInputsChanged, evolvedProofEstablished: proof.established, errors: proof.errors };
}

/** Validate the generic protocol and its explicit theorem registrations. */
export function validateTheoremGovernance(governance, theoremClaims = {}) {
  const errors = [];
  const categoryIds = Object.keys(governance?.categories ?? {});
  if (!THEOREM_EVOLUTION_CATEGORIES.every(category => categoryIds.includes(category))) {
    errors.push("theorem governance lacks required evolution categories");
  }
  if (!governance?.validator) errors.push("theorem governance lacks validator");
  if (!governance?.classifier) errors.push("theorem governance lacks classifier");
  if (!governance?.witness) errors.push("theorem governance lacks executable witness");
  if (!governance?.registrationRequirements?.length) errors.push("theorem governance lacks registration requirements");

  const registered = governance?.registeredTheorems ?? [];
  if (new Set(registered).size !== registered.length) errors.push("theorem governance contains duplicate registrations");
  for (const id of registered) {
    const claim = theoremClaims[id];
    if (!claim) {
      errors.push(`${id}: governed theorem is not declared`);
      continue;
    }
    if (!claim.proofChecker) errors.push(`${id}: governed theorem lacks theorem-specific proof checker`);
    if (!claim.proofState) errors.push(`${id}: governed theorem lacks theorem-specific proof-input constructor`);
    if (!claim.evolutionCalculus) errors.push(`${id}: governed theorem lacks evolution calculus`);
    if (!claim.governanceWitness) errors.push(`${id}: governed theorem lacks governance witness`);
  }

  const nonClaims = governance?.nonClaims ?? [];
  for (const required of [
    "generic governance proves registered theorems",
    "unregistered theorems are governed",
    "all possible repository changes are classified",
  ]) {
    if (!nonClaims.includes(required)) errors.push(`theorem governance must exclude: ${required}`);
  }
  return errors;
}

/** Produce a bounded status report; registration is not proof establishment. */
export function reportTheoremGovernance(governance, theoremClaims = {}) {
  const errors = validateTheoremGovernance(governance, theoremClaims);
  return {
    valid: errors.length === 0,
    errors,
    registeredTheorems: (governance?.registeredTheorems ?? []).map(id => ({
      id,
      status: theoremClaims[id]?.status ?? "missing",
      proofChecker: theoremClaims[id]?.proofChecker ?? null,
      proofState: theoremClaims[id]?.proofState ?? null,
    })),
    unregisteredDeclaredTheorems: Object.keys(theoremClaims).filter(id => !governance?.registeredTheorems?.includes(id)),
    nonClaims: governance?.nonClaims ?? [],
  };
}

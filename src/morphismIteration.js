function active(morphism) {
  return morphism?.status === "witnessed-partial" || morphism?.status === "implemented";
}

function findActivePath(morphisms, source, target) {
  const pending = [{ domain: source, path: [] }];
  const visited = new Set();
  while (pending.length > 0) {
    const current = pending.shift();
    if (current.domain === target) return current.path;
    if (visited.has(current.domain)) continue;
    visited.add(current.domain);
    for (const [id, morphism] of Object.entries(morphisms)) {
      if (active(morphism) && morphism.source === current.domain) {
        pending.push({ domain: morphism.target, path: [...current.path, id] });
      }
    }
  }
  return null;
}

/** Determine whether iteration is type-defined without inferring convergence. */
export function analyzeMorphismIteration(registry, morphismId) {
  const morphism = registry?.morphisms?.[morphismId];
  if (!morphism) return { morphism: morphismId, iterationTypeDefined: false, classification: "unknown-morphism" };
  if (!active(morphism)) return { morphism: morphismId, iterationTypeDefined: false, classification: "inactive-morphism" };
  if (morphism.source === morphism.target) {
    return {
      morphism: morphismId,
      iterationTypeDefined: true,
      classification: "typed-endomorphism",
      cycle: [morphismId],
      convergenceDefined: false,
    };
  }

  const returnPath = findActivePath(registry.morphisms, morphism.target, morphism.source);
  if (returnPath) {
    const cycle = [morphismId, ...returnPath];
    const composition = Object.entries(registry.compositionClaims ?? {}).find(([, claim]) =>
      (claim.status === "witnessed-round-trip" || claim.status === "machine-checked-identity-current-schema") && JSON.stringify(claim.path) === JSON.stringify(cycle)
    );
    return {
      morphism: morphismId,
      directIterationTypeDefined: false,
      cycleTypeDefined: true,
      classification: composition ? "direct-not-iterable-witnessed-return-cycle" : "typed-cycle-candidate",
      cycle,
      executableCycleProven: Boolean(composition),
      compositionClaim: composition?.[0],
      convergenceDefined: false,
    };
  }
  return {
    morphism: morphismId,
    iterationTypeDefined: false,
    classification: "not-iterable-domain-codomain-mismatch",
    source: morphism.source,
    target: morphism.target,
    missingReturn: `${morphism.target}->${morphism.source}`,
    limitOperatorDefined: false,
  };
}

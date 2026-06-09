import { validateTheoremGovernance } from "./theoremGovernance.js";

const MORPHISM_STATUSES = new Set(["unimplemented", "witnessed-partial", "implemented"]);

/**
 * Validate the repository's cross-domain identification registry.
 * An implemented morphism is admissible only when it names an adapter,
 * preservation obligations, and executable witnesses.
 */
export function validateIdentificationMap(map) {
  const errors = [];
  const domains = map?.domains ?? {};
  const subdomains = map?.subdomains ?? {};
  const domainIds = new Set([...Object.keys(domains), ...Object.keys(subdomains)]);
  const morphisms = map?.morphisms ?? {};

  for (const [id, subdomain] of Object.entries(subdomains)) {
    if (!domains[subdomain.parent]) errors.push(`${id}: unknown parent ${subdomain.parent}`);
    if (!subdomain.definition) errors.push(`${id}: missing definition`);
    if (!subdomain.membershipPredicate) errors.push(`${id}: missing membership predicate`);
    if (subdomain.stability) {
      if (!subdomain.stability.status) errors.push(`${id}: stability claim lacks status`);
      if (!subdomain.stability.plan) errors.push(`${id}: stability claim lacks plan`);
      if (!subdomain.stability.analyzer) errors.push(`${id}: stability claim lacks analyzer`);
      if (!subdomain.stability.witness) errors.push(`${id}: stability claim lacks witness`);
      if (!subdomain.stability.nonClaims?.length) errors.push(`${id}: stability claim lacks explicit non-claims`);
    }
  }

  for (const [id, morphism] of Object.entries(morphisms)) {
    if (!domainIds.has(morphism.source)) errors.push(`${id}: unknown source ${morphism.source}`);
    if (!domainIds.has(morphism.target)) errors.push(`${id}: unknown target ${morphism.target}`);
    if (morphism.source === morphism.target) errors.push(`${id}: source and target must differ`);
    if (!MORPHISM_STATUSES.has(morphism.status)) errors.push(`${id}: invalid status ${morphism.status}`);

    if (morphism.status === "witnessed-partial" || morphism.status === "implemented") {
      if (!morphism.adapter) errors.push(`${id}: ${morphism.status} morphism lacks an executable adapter`);
      if (!morphism.requiredPreservation?.length) errors.push(`${id}: ${morphism.status} morphism lacks preservation obligations`);
      if (!morphism.witnesses?.length) errors.push(`${id}: ${morphism.status} morphism lacks executable witnesses`);
    }
    if (morphism.status === "witnessed-partial") {
      if (!morphism.witnessedScope) errors.push(`${id}: witnessed-partial morphism lacks an explicit scope`);
      else {
        if (!morphism.witnessedScope.sourceSubject) errors.push(`${id}: witnessed-partial morphism lacks a scoped source subject`);
        if (!morphism.witnessedScope.targetOperation) errors.push(`${id}: witnessed-partial morphism lacks a scoped target operation`);
        if (!morphism.witnessedScope.limitations?.length) errors.push(`${id}: witnessed-partial morphism lacks explicit limitations`);
        if (!subdomains[morphism.source]) errors.push(`${id}: witnessed-partial source must be an explicit subdomain`);
        if (morphism.witnessedScope.sourceSubdomain !== morphism.source) errors.push(`${id}: witnessed scope does not match morphism source`);
        if (morphism.witnessedScope.sourceDefinition !== subdomains[morphism.source]?.definition) errors.push(`${id}: witnessed scope does not match subdomain definition`);
        if (morphism.witnessedScope.targetSubdomain && morphism.witnessedScope.targetSubdomain !== morphism.target) errors.push(`${id}: witnessed target scope does not match morphism target`);
        if (morphism.witnessedScope.targetDefinition && morphism.witnessedScope.targetDefinition !== subdomains[morphism.target]?.definition) errors.push(`${id}: witnessed target scope does not match subdomain definition`);
      }
    }
  }

  for (const [id, claim] of Object.entries(map?.iterationClaims ?? {})) {
    if (!morphisms[id]) errors.push(`${id}: iteration claim references unknown morphism`);
    if (!claim.status) errors.push(`${id}: iteration claim lacks status`);
    if (!claim.definition) errors.push(`${id}: iteration claim lacks definition`);
    if (!claim.analyzer) errors.push(`${id}: iteration claim lacks analyzer`);
    if (!claim.witness) errors.push(`${id}: iteration claim lacks witness`);
    if (claim.limitOperatorDefined === true && claim.status.includes("not-iterable")) errors.push(`${id}: direct non-iterability cannot define a limit operator`);
    if (claim.returnMorphism && !morphisms[claim.returnMorphism]) errors.push(`${id}: iteration claim references unknown return morphism`);
  }

  for (const [id, claim] of Object.entries(map?.compositionClaims ?? {})) {
    if (!claim.path?.length) errors.push(`${id}: composition claim lacks path`);
    const path = (claim.path ?? []).map(morphismId => morphisms[morphismId]);
    for (const [index, morphism] of path.entries()) {
      if (!morphism) errors.push(`${id}: unknown morphism ${claim.path[index]}`);
      if (index > 0 && path[index - 1]?.target !== morphism?.source) errors.push(`${id}: composition path is not type-compatible`);
    }
    if (path[0] && claim.source !== path[0].source) errors.push(`${id}: composition source does not match path`);
    if (path.at(-1) && claim.target !== path.at(-1).target) errors.push(`${id}: composition target does not match path`);
    if (!claim.witness) errors.push(`${id}: composition claim lacks witness`);
    if (!claim.nonClaims?.length) errors.push(`${id}: composition claim lacks explicit non-claims`);
  }

  for (const [id, claim] of Object.entries(map?.fixedPointClaims ?? {})) {
    if (!claim.status) errors.push(`${id}: fixed-point claim lacks status`);
    if (!claim.definition) errors.push(`${id}: fixed-point claim lacks definition`);
    if (!claim.operator) errors.push(`${id}: fixed-point claim lacks operator`);
    if (!claim.witness) errors.push(`${id}: fixed-point claim lacks witness`);
    if (!claim.nonClaims?.length) errors.push(`${id}: fixed-point claim lacks explicit non-claims`);
    if (claim.status.startsWith("sampled-fixed-points") && !claim.nonClaims?.includes("global convergence")) errors.push(`${id}: sampled fixed-point claim must exclude global convergence`);
    if (claim.status === "machine-checked-structural-identity-current-schema") {
      if (!claim.proofChecker) errors.push(`${id}: structural identity claim lacks proof checker`);
      if (!claim.consequences?.includes(`Fix(${id}) equals S1_prime under current schemas`)) errors.push(`${id}: structural identity claim lacks scoped fixed-point consequence`);
      if (!claim.nonClaims?.includes("identity after schema or adapter changes")) errors.push(`${id}: structural identity claim must exclude future schema identity`);
      if (claim.changeImpact) {
        if (!claim.changeImpact.definition) errors.push(`${id}: change-impact claim lacks definition`);
        if (!claim.changeImpact.analyzer) errors.push(`${id}: change-impact claim lacks analyzer`);
        if (!claim.changeImpact.witness) errors.push(`${id}: change-impact claim lacks witness`);
        if (!claim.changeImpact.nonClaims?.includes("all possible repository changes are enumerated")) errors.push(`${id}: change-impact claim must exclude exhaustive change coverage`);
      }
      if (claim.evolutionCalculus) {
        const required = ["theorem-preserving", "theorem-requiring-reproof", "theorem-breaking"];
        if (!claim.evolutionCalculus.definition) errors.push(`${id}: evolution calculus lacks definition`);
        if (!claim.evolutionCalculus.analyzer) errors.push(`${id}: evolution calculus lacks analyzer`);
        if (!claim.evolutionCalculus.witness) errors.push(`${id}: evolution calculus lacks witness`);
        if (!required.every(category => claim.evolutionCalculus.categories?.includes(category))) errors.push(`${id}: evolution calculus lacks required categories`);
        if (!claim.evolutionCalculus.nonClaims?.includes("all possible repository changes are classified")) errors.push(`${id}: evolution calculus must exclude exhaustive classification`);
      }
    }
  }

  if (map?.theoremGovernance) {
    const governance = map.theoremGovernance;
    if (!governance.definition) errors.push("theorem governance lacks definition");
    if (!governance.reporter) errors.push("theorem governance lacks reporter");
    errors.push(...validateTheoremGovernance(governance, map?.fixedPointClaims ?? {}));
  }

  for (const claim of map?.commutativityClaims ?? []) {
    for (const id of claim.paths?.flat() ?? []) {
      if (!morphisms[id]) errors.push(`${claim.id}: unknown morphism ${id}`);
      else if (morphisms[id].status !== "implemented") errors.push(`${claim.id}: ${id} is not implemented`);
    }
    if (!claim.witnesses?.length) errors.push(`${claim.id}: commutativity claim lacks executable witnesses`);
  }

  return errors;
}

/** Return true only when an implemented-morphism path connects two domains. */
export function hasImplementedPath(map, source, target) {
  const edges = Object.values(map?.morphisms ?? {}).filter(morphism => morphism.status === "implemented");
  const pending = [source];
  const visited = new Set();

  while (pending.length > 0) {
    const current = pending.shift();
    if (current === target) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const edge of edges) if (edge.source === current) pending.push(edge.target);
  }
  return false;
}

/** Return true when a witnessed partial or implemented edge directly connects two domains. */
export function hasWitnessedEdge(map, source, target) {
  return Object.values(map?.morphisms ?? {}).some(morphism =>
    (morphism.status === "witnessed-partial" || morphism.status === "implemented")
    && morphism.source === source
    && morphism.target === target
  );
}

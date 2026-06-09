import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { hasImplementedPath, hasWitnessedEdge, validateIdentificationMap } from "../src/crossDomainIdentification.js";

const registry = JSON.parse(await readFile(new URL("../architecture/cross-domain-identification.json", import.meta.url)));

test("cross-domain identification registry is structurally valid", () => {
  assert.deepEqual(validateIdentificationMap(registry), []);
});

test("phi_01 has a scoped witness but does not claim total implementation", () => {
  assert.equal(hasWitnessedEdge(registry, "S1_prime", "S0_prime"), true);
  assert.equal(hasImplementedPath(registry, "S1_prime", "S0_prime"), false);
  assert.equal(hasImplementedPath(registry, "S2", "S0"), false);
});

test("registry witness and adapter paths resolve", async () => {
  for (const morphism of Object.values(registry.morphisms)) {
    for (const path of [morphism.adapter, morphism.witnessedScope?.sourceSubject, morphism.witnessedScope?.sourceDefinition, morphism.witnessedScope?.targetDefinition, ...(morphism.witnesses ?? [])].filter(Boolean)) {
      await access(new URL(`../${path}`, import.meta.url));
    }
  }
  for (const subdomain of Object.values(registry.subdomains)) {
    for (const path of [subdomain.definition, subdomain.stability?.plan, subdomain.stability?.witness].filter(Boolean)) {
      await access(new URL(`../${path}`, import.meta.url));
    }
  }
  for (const claim of Object.values(registry.iterationClaims ?? {})) {
    for (const path of [claim.definition, claim.witness].filter(Boolean)) await access(new URL(`../${path}`, import.meta.url));
  }
  for (const claim of Object.values(registry.compositionClaims ?? {})) await access(new URL(`../${claim.witness}`, import.meta.url));
  for (const claim of Object.values(registry.fixedPointClaims ?? {})) {
    for (const path of [claim.definition, claim.witness, claim.governanceWitness, claim.changeImpact?.definition, claim.changeImpact?.witness, claim.evolutionCalculus?.definition, claim.evolutionCalculus?.witness, ...(claim.supportingEvidence ?? [])].filter(Boolean)) await access(new URL(`../${path}`, import.meta.url));
  }
  for (const path of [registry.theoremGovernance?.definition, registry.theoremGovernance?.witness].filter(Boolean)) await access(new URL(`../${path}`, import.meta.url));
});

test("iteration claims cannot reference an unknown return morphism", () => {
  const invalid = structuredClone(registry);
  invalid.iterationClaims.phi_01.returnMorphism = "missing";
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_01: iteration claim references unknown return morphism/);
});

test("composition claims require explicit non-claims", () => {
  const invalid = structuredClone(registry);
  delete invalid.compositionClaims.phi_10_after_phi_01.nonClaims;
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_10_after_phi_01: composition claim lacks explicit non-claims/);
});

test("composition claims must be type-compatible", () => {
  const invalid = structuredClone(registry);
  invalid.compositionClaims.phi_10_after_phi_01.path = ["phi_10", "phi_10"];
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_10_after_phi_01: composition path is not type-compatible/);
});

test("structural identity claims require a proof checker and schema-change limit", () => {
  const invalid = structuredClone(registry);
  delete invalid.fixedPointClaims.C11.proofChecker;
  invalid.fixedPointClaims.C11.nonClaims = invalid.fixedPointClaims.C11.nonClaims.filter(value => value !== "identity after schema or adapter changes");
  const errors = validateIdentificationMap(invalid).join("\n");
  assert.match(errors, /C11: structural identity claim lacks proof checker/);
  assert.match(errors, /C11: structural identity claim must exclude future schema identity/);
});

test("change-impact claims cannot imply exhaustive change coverage", () => {
  const invalid = structuredClone(registry);
  invalid.fixedPointClaims.C11.changeImpact.nonClaims = [];
  assert.match(validateIdentificationMap(invalid).join("\n"), /C11: change-impact claim must exclude exhaustive change coverage/);
});

test("evolution calculus requires all three categories and bounded coverage", () => {
  const invalid = structuredClone(registry);
  invalid.fixedPointClaims.C11.evolutionCalculus.categories = ["theorem-breaking"];
  invalid.fixedPointClaims.C11.evolutionCalculus.nonClaims = [];
  const errors = validateIdentificationMap(invalid).join("\n");
  assert.match(errors, /C11: evolution calculus lacks required categories/);
  assert.match(errors, /C11: evolution calculus must exclude exhaustive classification/);
});

test("subdomain stability claims require explicit limits", () => {
  const invalid = structuredClone(registry);
  delete invalid.subdomains.S1_prime.stability.nonClaims;
  assert.match(validateIdentificationMap(invalid).join("\n"), /S1_prime: stability claim lacks explicit non-claims/);
});

test("witnessed partial morphisms require explicit scope", () => {
  const invalid = structuredClone(registry);
  delete invalid.morphisms.phi_01.witnessedScope;
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_01: witnessed-partial morphism lacks an explicit scope/);
});

test("witnessed partial source must equal its explicit subdomain", () => {
  const invalid = structuredClone(registry);
  invalid.morphisms.phi_01.source = "S1";
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_01: witnessed-partial source must be an explicit subdomain/);
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_01: witnessed scope does not match morphism source/);
});

test("implemented morphisms require executable witnesses", () => {
  const invalid = structuredClone(registry);
  invalid.morphisms.phi_12.status = "implemented";
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_12: implemented morphism lacks an executable adapter/);
  assert.match(validateIdentificationMap(invalid).join("\n"), /phi_12: implemented morphism lacks executable witnesses/);
});

test("generic theorem governance refuses undeclared theorem registrations", () => {
  const invalid = structuredClone(registry);
  invalid.theoremGovernance.registeredTheorems.push("missing");
  assert.match(validateIdentificationMap(invalid).join("\n"), /missing: governed theorem is not declared/);
});

test("governed theorems require theorem-specific proof-input constructors", () => {
  const invalid = structuredClone(registry);
  delete invalid.fixedPointClaims.C11.proofState;
  assert.match(validateIdentificationMap(invalid).join("\n"), /C11: governed theorem lacks theorem-specific proof-input constructor/);
});

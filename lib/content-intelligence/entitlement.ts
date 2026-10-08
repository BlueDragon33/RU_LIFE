/**
 * Provider-independent access policy. Only pass grants verified by a separate trusted
 * authority. This module does NOT authenticate identities, parse tokens or manage billing.
 */
export type EntitlementResourceV1 = Readonly<{
  schemaVersion: 1;
  resourceId: string;
  access: "open" | "gated";
}>;

export type EntitlementGrantV1 = Readonly<{
  schemaVersion: 1;
  resourceId: string;
  subjectId: string;
  expiresAt: string;
  revoked: boolean;
}>;

export type EntitlementDecision = Readonly<{
  allowed: boolean;
  reason: "open" | "verified-grant" | "no-valid-grant";
}>;

/** Deterministic: time is provided by caller, not obtained implicitly. */
export function evaluateEntitlement(
  resource: EntitlementResourceV1,
  subjectId: string,
  verifiedGrants: readonly EntitlementGrantV1[],
  now: string,
): EntitlementDecision {
  if (resource.schemaVersion !== 1 || !resource.resourceId.trim()) {
    return { allowed: false, reason: "no-valid-grant" };
  }
  if (resource.access === "open") return { allowed: true, reason: "open" };
  if (resource.access !== "gated" || !subjectId.trim()) {
    return { allowed: false, reason: "no-valid-grant" };
  }
  const nowMs=Date.parse(now);
  if (!Number.isFinite(nowMs)) return { allowed: false, reason: "no-valid-grant" };

  const granted=verifiedGrants.some(grant =>
    grant.schemaVersion === 1 &&
    grant.resourceId === resource.resourceId &&
    grant.subjectId === subjectId &&
    !grant.revoked &&
    Number.isFinite(Date.parse(grant.expiresAt)) &&
    Date.parse(grant.expiresAt) > nowMs
  );
  if (granted) return { allowed: true, reason: "verified-grant" };
  return { allowed: false, reason: "no-valid-grant" };
}

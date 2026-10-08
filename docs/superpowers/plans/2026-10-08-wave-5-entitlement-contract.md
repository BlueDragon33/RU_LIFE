# RU_LIFE Wave 5 — Provider-independent Entitlement Contract

**Authority:** Universal Constitution v1.2.0 and Content Intelligence architecture.  
**Starting point:** Four open packs verified in Chromium.  
**Goal:** Model future access rights without a payment provider, paywall, account-specific personal-data mutation, or changing the four open packs.

## Non-negotiable rules
- All four existing packs remain `access: "open"` and publicly navigable under the existing RU_LIFE workspace boundary.
- Default deny for future gated resources when no verified grant is supplied; default allow for `open` resources.
- Canonical knowledge is never restricted, rewritten, or contradicted by entitlement evaluation.
- The entitlement engine is a **pure deterministic function**; no cookies, localStorage, network, token validation or auth logic.
- A grant is an evaluated/verified input from a separate future authority, **never** a claim that an arbitrary client JSON is trustworthy.
- No payment, billing provider, license issuer or server integration in Wave 5.
- UI is unchanged in Wave 5; never display fake paid or upgrade buttons.
- Do not mutate device/session/control-plane or personal progress data.

## Tasks
1. Add a contract test covering open access, missing-grant denial, scope mismatch, expiry, revocation, no canonical truth mutation.
2. Introduce `lib/content-intelligence/entitlement.ts`: versioned contract and deterministic evaluator. The evaluator accepts a caller-provided verified grant set and explicit timestamp; it never verifies a token or contacts a provider.
3. Run full lint/test/build/content validation and Constitution. Keep runtime dependency count unchanged.
4. Document the boundary and defer issuer/key rotation/commerce/free-premium policy, real auth integration, and deployment to separately reviewed future work.

## Invariants
- Future resource IDs are stable (`ru-life:pack:<slug>`).
- Grants are short-lived and time-bound; a revoked grant never authorizes.
- Fail closed for invalid/missing grants on gated resources.
- Open content remains open independent of grant state.
- No new external cost or vendor lock-in.

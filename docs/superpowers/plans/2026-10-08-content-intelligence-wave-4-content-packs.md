# RU_LIFE Wave 4 — Content Packs (Native execution)

**Authority:** approved 100-layer spec, Constitution v1.2.0 seven pillars, dependency budget.
**Starting HEAD:** `631f1c1d260a118e945fb57b18d0efd8a067e098`.
**Intent:** prove commercial-grade content **composition**, not commerce, using the existing twenty Knowledge Units.

## Architectural decision
- Pack = ordered, versioned, transparent set of canonical Knowledge Unit IDs; not a new copy of content.
- Four initial, **open/free to navigate** packs: Russia Starter; First 7 Days; International Student; Language Survival.
- Member titles, source/freshness and risk are always obtained from the canonical unit. No paywall, billing, entitlement, pricing, device identity, or payment provider is introduced.
- Keep all catalog module/topic routes and local state keys stable.
- Packages are navigation guidance, NOT a claim of complete legal/medical coverage.
- Catalog and pack views use the same topic routes; warnings and sources continue to appear on the topic pages.
- Reversible: remove pack routes/navigation/data without migrating canonical content or personal progress.

## Implementation tasks (RED → GREEN → gate)
1. Contract, four pack definitions and deterministic resolver (`lib/content-intelligence/packs.ts`, `content/packs/v1.json`). Preserve order, reject orphan IDs and duplicates. Write focused tests first.
2. Offline pack validator (`scripts/validate-content-packs.mjs`) and negative fixtures. Add to npm `gate` and Build/Site integrity CI path; no packages added.
3. Protected `/app/packs` index and `/app/packs/[slug]` view with source-derived topic name, module, freshness and priority, breadcrumbs, empty/not-found behavior, compact premium layout and visible statement that packs are free navigational guides.
4. Add discoverability via current workspace sidebar/dashboard, root-bundled CSS `app/packs.css`, accessibility + responsive tests.
5. Extend existing Chromium E2E and trigger paths to verify all four pack pages, internal topic navigation, 3 reading modes, desktop/phone overflow, original personal sidebar and static CSS/SW.
6. Document change in `CONTENT_ARCHITECTURE.md`; self-review diff/dependency/security/Constitution; final full CI and Chromium green.

## Invariants
- Every `pack.id` uniquely equals `ru-life:pack:<slug>`; `schemaVersion:1`, integer `version:1`; `access:"open"`.
- Every member matches an actual existing `ru-life:<module>:<topic>` canonical ID.
- No duplicates within a pack or repeated pack slug/ID.
- Featured unit must be a member; pack membership order is meaningful.
- No unsourced claim of legal obligation in pack description.
- Never hide `doNot/critical/cautions`, source metadata or source links on canonical topics.
- No external runtime dependency or unnecessary API for normal reading.
- Browser routing remains under existing `app/app/layout.tsx` standalone/managed boundary.
- Production remains separate; CI success alone does not authorize publish.

## Deferred
Wave 5 will define a provider-independent **entitlement** contract only after pack UX is verified. Choice of commercial price/payment/subscription and Production release remains separately gated. Do not create or select a billing provider in Wave 4.

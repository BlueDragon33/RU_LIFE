# RU_LIFE Content Intelligence Wave 3 — Context Lenses Implementation Plan

**Goal:** Add provider-free contextual lenses over the existing 20/20 canonical Knowledge Units without duplicating truth, mutating personal state, hiding high-risk guidance, or introducing commercial/product assumptions.

**Architecture:** Lenses are presentation/navigation hints over stable IDs. A lens may preselect a reading mode, decision option, or emphasis target, but it never edits canonical KnowledgeUnitV1 data and never suppresses risk/source context. Wave 3 proves the pattern on accommodation context for migration registration, using the existing data-driven decision tree.

**Constraints:**
- GitHub remains source of truth; no new SaaS/provider/database/runtime AI.
- Preserve all 20 topic routes and KnowledgeUnitV1 canonical JSON.
- Preserve progress/favorite/reminder/deadline/note namespaces.
- Lens state is UI context only in this wave; no new persisted sensitive profile.
- A lens may emphasize or preselect; it may not hide do-not/critical/caution evidence.
- Unknown lens values fail safe to the existing unpersonalized experience.
- Existing manual decision controls remain fully usable after lens preselection.
- Production remains protected by existing release policy.

### Task 1 — Lens contract and resolver
- RED test: stable context/result types, immutable resolution, unknown context fallback, no provider dependency.
- GREEN: add `lib/content-intelligence/lenses.ts` with generic lens context/result contracts and explicit stable-ID rule registry.
- Gate: focused test + full test + validator + build.

### Task 2 — Accommodation vertical slice
- RED test: migration-registration maps dormitory/rental/temporary accommodation lens values to existing decision option IDs without duplicating prose.
- GREEN: add accommodation rules referencing existing decision/option IDs only.
- Gate: focused test + validator.

### Task 3 — Topic UI integration
- RED test: contextual selector appears only when lens options exist; decision tree accepts external initial selection but remains user-overridable; action/learn/full remain available.
- GREEN: add reusable Context Lens selector and pass resolved decision selection into existing decision tree.
- Keep selector ephemeral/local component state only.
- Gate: full suite/build.

### Task 4 — Browser verification
- Extend existing Chromium script to verify:
  - lens selector on migration-registration;
  - selecting dorm/rental/temporary updates the matching decision result;
  - keyboard operation;
  - user can override the decision after lens preselection;
  - risk/source blocks remain reachable;
  - no mobile/tablet overflow.
- Gate: browser workflow + Build/Site Integrity CI + Constitution.

### Task 5 — Documentation and final review
- Update CONTENT_ARCHITECTURE.md with Wave 3 lens boundary.
- Whole-range self-review for canonical duplication, hidden risk, personal-state leakage, route regression, dependency creep.
- Stop before packs/entitlement because pack composition is a product decision, not a purely technical continuation.

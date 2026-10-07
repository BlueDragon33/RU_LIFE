# RU_LIFE Content Intelligence Wave 2 — Catalog Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the remaining 19 RU_LIFE topics incrementally to `KnowledgeUnitV1` while preserving all 20 route IDs, personal state, local-first operation, source provenance, and the Wave 1 progressive-disclosure UI.

**Architecture:** Keep the Wave 1 `KnowledgeUnitV1` contract and reusable renderer unchanged unless a real catalog-wide regression proves a gap. Add canonical JSON units and topic source registries by risk/content domain, register them through the existing resolver, and keep legacy `TopicContent` as a compatibility fallback until all groups pass. High-risk/time-sensitive groups migrate first; stable learning/personal-note topics migrate last.

**Tech Stack:** Node.js >=22.13.0, TypeScript 5.9, React 19.2, Next.js 16.2 / Vinext 0.0.50, Vite 8, repository JSON content, Node built-in test runner, existing CI-only Playwright/Chromium verification. No new runtime service/provider/database/CMS/AI dependency.

**Spec:** `docs/superpowers/specs/2026-10-06-ru-life-content-intelligence-100-layer-design.md`

## Global Constraints

- Universal Constitution `blueprint-os:universal-century-grade` v1.2.0 remains enforced.
- GitHub remains source of truth.
- Preserve `operational-sovereignty-dependency-minimization`: local-first, repository-owned contracts, no new mandatory provider.
- Preserve all five module slugs and all twenty topic slugs/routes exactly.
- Preserve existing progress, favorite/reminder, deadline, note, backup, migration, P-256/session and Application-Management boundaries.
- Keep `TopicContent` legacy resolver available during migration; do not bulk-delete it in Wave 2.
- One canonical Knowledge Unit drives action/learn/full/map/decision/source views.
- High-risk claims require source IDs; scope/qualifier and freshness/verification metadata must survive compression.
- Official/institutional requirements must remain distinguishable from RU_LIFE recommendations and personal/practical guidance.
- Visual map content must have outline/list fallback and keyboard operation.
- Search remains local; no network call is required to read/search migrated content.
- No billing, entitlement, graph database, CMS, analytics provider, or runtime AI work in Wave 2.
- Production publication remains a separate explicit gate. CI/public probe may validate the current Site but Wave 2 does not authorize a new Production release action.

## Review Focus

1. **Duplicate or broken stable IDs:** every migrated unit/source/map/action/warning reference must validate and resolve without collisions.
2. **High-risk compression:** action/quick views must not drop a condition that changes whether a legal, health, safety, or financial instruction applies.
3. **Legacy coexistence:** personal state and route navigation must work identically before/after a topic gains a Knowledge Unit.
4. **Catalog completeness:** exactly 20 topic routes must resolve to Knowledge Units at the end, with no silent fallback caused by a missing registry import.
5. **Mobile/browser resilience:** representative topic from each migrated risk group must switch all three modes, expose map/outline, remain keyboard-operable, and avoid horizontal overflow.

---

### Task 1: Catalog-Wide Migration Contract and Registry Scaling

**Files:**
- Create: `tests/content-intelligence-catalog-migration.test.mjs`
- Modify: `lib/content-intelligence/registry.ts`
- Modify only if test proves necessary: `scripts/validate-content-intelligence.mjs`

**Interfaces:**
- Consumes: `getKnowledgeUnit(moduleSlug, topicSlug): KnowledgeUnitV1 | null`, `getKnowledgeSources(unit): KnowledgeSourceV1[]`.
- Produces: catalog-wide registry behavior that can register multiple topic JSON/source files without changing route IDs.

- [ ] **Step 1: Write RED tests** proving registry exposes migrated units by stable `moduleSlug:topicSlug`, rejects duplicate unit IDs/topic keys/source IDs with conflicting content, and keeps unknown topics null.
- [ ] **Step 2: Run** `npm test -- tests/content-intelligence-catalog-migration.test.mjs`.
  **Expected:** FAIL because the registry only knows the Wave 1 topic and lacks catalog-wide duplicate guards.
- [ ] **Step 3: Implement minimal registry scaling** using explicit static imports/data lists compatible with Vinext/Vite; no runtime filesystem scan or provider.
- [ ] **Step 4: Run focused test, then** `npm test && npm run validate:content-intelligence && npm run build`.
  **Expected:** PASS.
- [ ] **Step 5: Commit** test then implementation as separate RED/GREEN commits.

### Task 2: Study Procedures — Migrate Remaining 3 Topics

**Files:**
- Create: `content/knowledge/study-procedures/enrollment.json`
- Create: `content/knowledge/study-procedures/study-plan.json`
- Create: `content/knowledge/study-procedures/important-contacts.json`
- Create corresponding `content/sources/study-procedures/*.sources.json`
- Modify: `lib/content-intelligence/registry.ts`
- Create: `tests/content-intelligence-study-wave2.test.mjs`

**Interfaces:**
- Consumes: legacy `lib/study-procedures-content.ts`, existing catalog/checklists, Wave 1 types/validator.
- Produces: four of four `study-procedures` topics resolving to Knowledge Units.

- [ ] **Step 1: RED tests** require all four study topic keys to resolve, preserve existing titles/slugs/checklist intent, carry evidence for institutional/legal claims, and keep RU_LIFE planning recommendations semantically separate from official requirements.
- [ ] **Step 2: Run focused test.**
  **Expected:** FAIL for the three missing units.
- [ ] **Step 3: Create canonical units/source registries** from verified legacy content. Do not invent institution-specific rules where legacy content only gives workflow guidance.
- [ ] **Step 4: Register the three units and run** focused test + validator + full suite/build.
- [ ] **Step 5: Commit RED and GREEN separately.

### Task 3: Health and Safety — Migrate 5 High-Risk Topics

**Files:**
- Create four `content/knowledge/health/*.json` + source registries.
- Create `content/knowledge/daily-life/safety.json` + source registry.
- Modify: `lib/content-intelligence/registry.ts`
- Create: `tests/content-intelligence-health-safety-wave2.test.mjs`

**Interfaces:**
- Consumes: `lib/health-content.ts`, `lib/daily-life-content.ts`, current official emergency/medical source URLs already tracked by RU_LIFE.
- Produces: all health topics plus daily-life/safety as evidence-aware Knowledge Units.

- [ ] **Step 1: RED tests** require source-backed emergency/care/insurance claims, explicit uncertainty/non-diagnosis boundaries for medicine reference, emergency next-action prominence, and source/freshness metadata.
- [ ] **Step 2: Run focused test.**
  **Expected:** FAIL for five missing units.
- [ ] **Step 3: Create units/source registries** preserving high-risk qualifiers. Recommendations without authoritative support must stay recommendations and may carry empty sourceIds only where validator policy allows low-risk guidance.
- [ ] **Step 4: Register and run** focused test + validator + full suite/build.
- [ ] **Step 5: Extend browser E2E** to visit `/app/health/emergency` and verify three modes, warning hierarchy, outline fallback, keyboard and mobile overflow.
- [ ] **Step 6: Commit RED, content GREEN, browser GREEN separately.

### Task 4: Prepare Module — Migrate 4 Topics

**Files:**
- Create four `content/knowledge/prepare/*.json` + source registries.
- Modify: `lib/content-intelligence/registry.ts`
- Create: `tests/content-intelligence-prepare-wave2.test.mjs`

**Interfaces:**
- Consumes: `lib/topic-content.ts`, existing provider/official links and stable guidance.
- Produces: all prepare topics as Knowledge Units without hard-coding volatile airline/payment/provider facts.

- [ ] **Step 1: RED tests** require all four prepare topics to resolve; volatile baggage/payment/connectivity guidance must point users to current provider checks rather than freeze limits/fees; documents/arrival keep source-backed official steps where present.
- [ ] **Step 2: Run focused test.**
- [ ] **Step 3: Create/register units and sources** with clear separation between provider-dependent checks and stable preparation workflow.
- [ ] **Step 4: Run** focused + validator + full suite/build.
- [ ] **Step 5: Commit RED/GREEN separately.

### Task 5: Daily Life — Migrate Housing, Transport, Shopping/Services

**Files:**
- Create three `content/knowledge/daily-life/*.json` + source registries.
- Modify: `lib/content-intelligence/registry.ts`
- Create: `tests/content-intelligence-daily-life-wave2.test.mjs`

**Interfaces:**
- Consumes: `lib/daily-life-content.ts`.
- Produces: four of four daily-life topics resolving to Knowledge Units.

- [ ] **Step 1: RED tests** require housing to distinguish dorm/lease operations from migration registration, transport to remain provider/map-app independent, and shopping/services to avoid pretending prices/opening hours are stable.
- [ ] **Step 2: Run focused test.**
- [ ] **Step 3: Create/register canonical units/sources.**
- [ ] **Step 4: Run** focused + validator + full suite/build.
- [ ] **Step 5: Commit RED/GREEN separately.

### Task 6: Integration + Catalog Completion + Final Browser Gate

**Files:**
- Create four `content/knowledge/integration/*.json` + source registries as needed.
- Modify: `lib/content-intelligence/registry.ts`
- Modify: `scripts/verify-content-intelligence-browser.mjs`
- Modify: `CONTENT_ARCHITECTURE.md`
- Create: `tests/content-intelligence-integration-wave2.test.mjs`
- Create: `tests/content-intelligence-catalog-complete.test.mjs`

**Interfaces:**
- Consumes: `lib/integration-content.ts`, all prior Wave 2 units.
- Produces: exactly 20/20 topic routes resolving to Knowledge Units; legacy content remains compatibility data but is no longer the primary renderer for catalog topics.

- [ ] **Step 1: RED integration tests** require the four stable-guidance topics to resolve while keeping cultural/personal experience explicitly non-authoritative and keeping personal-notes free of unnecessary sensitive-data capture.
- [ ] **Step 2: RED catalog-complete test** iterates the existing catalog and requires `getResolvedKnowledgeUnit` for exactly 20 topics, stable unique IDs, valid source resolution, and unchanged catalog count/routes.
- [ ] **Step 3: Run focused tests.**
  **Expected:** FAIL for the four integration topics and catalog total < 20.
- [ ] **Step 4: Create/register integration units.**
- [ ] **Step 5: Run** focused + `npm test && npm run validate:content-intelligence && npm run build`.
- [ ] **Step 6: Extend Chromium script** to representative routes from study, health/safety, prepare, daily-life, integration. Verify three modes, map/outline fallback, keyboard, source/provenance when applicable, sidebar personal state, desktop/tablet/phone overflow, CSS MIME, SW v2.
- [ ] **Step 7: Run browser workflow and Build + Site Integrity CI.**
  **Expected:** all repository-owned gates PASS; public Site probe is evidence only and does not authorize a new Production release.
- [ ] **Step 8: Update architecture docs** to record Wave 2 catalog completion and legacy compatibility boundary.
- [ ] **Step 9: Whole-range self-review** because no general-purpose reviewer subagent is available in this harness. Any Critical/Important finding gets one TDD fix pass; Minor findings are recorded, not silently expanded.
- [ ] **Step 10: Commit final verification/docs changes.

## Self-Review Result

- Spec coverage: Wave 2 intentionally covers catalog migration only; situation-first discovery, lenses, packs, entitlement and billing remain later waves.
- Type consistency: all tasks use the existing `KnowledgeUnitV1`, `KnowledgeSourceV1`, `getKnowledgeUnit`, `getKnowledgeSources`, and stable catalog slugs.
- Dependency boundary: no task adds a runtime service/provider/library.
- Compatibility: all tasks preserve existing topic routes and local personal-state keys.
- High-risk review: legal/health/safety groups precede low-risk integration topics and require evidence-aware tests.
- Browser coverage: representative route per risk group plus responsive/keyboard/static-asset checks is included in Task 6.

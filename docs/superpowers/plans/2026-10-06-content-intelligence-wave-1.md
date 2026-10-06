# RU_LIFE Content Intelligence Foundation + First Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the versioned Content Intelligence foundation and prove it end-to-end on `study-procedures/migration-registration` without breaking the other 19 existing topics, personal state, local-first behavior, or RU_LIFE security boundaries.

**Architecture:** Add a storage-agnostic Knowledge Unit v1 contract plus JSON-backed canonical content for one high-risk procedural topic. Resolve that unit beside the existing legacy `TopicContent` path, then render it through reusable progressive-disclosure components for action, learning, map/decision, full-context, and source views. Keep the existing route and topic slug so progress, reminders, deadlines, and user state continue to work unchanged; the remaining 19 topics stay on the legacy renderer until later migration plans.

**Tech Stack:** Node.js >=22.13.0, TypeScript 5.9, React 19.2, Next.js 16.2 / Vinext 0.0.50, Vite 8, existing CSS system, JSON modules via `resolveJsonModule`, Node built-in test runner. No new runtime service, UI framework, graph library, CMS, database, analytics provider, or billing provider.

**Spec:** `docs/superpowers/specs/2026-10-06-ru-life-content-intelligence-100-layer-design.md`

## Global Constraints

- Universal Constitution: `blueprint-os:universal-century-grade` v1.2.0, Blueprint B3, `enforced`, all seven inherited pillars mandatory.
- Preserve `operational-sovereignty-dependency-minimization`: use repository-owned, local-first contracts; add no external provider for this wave.
- GitHub remains source of truth.
- RU_LIFE remains independent; Application Management stays optional control-plane infrastructure and is not a content database.
- Preserve existing standalone/managed access behavior and P-256/session boundaries.
- Preserve the existing route `/app/study-procedures/migration-registration`.
- Preserve existing personal keys and topic slug so progress, favorites, reminders, deadlines, backup, and migration remain compatible.
- Do not change the current 20-topic catalog count in this wave.
- Do not delete or bulk-rewrite legacy `TopicContent`; this wave adds an intelligence path beside it.
- One canonical Knowledge Unit may drive many views; do not duplicate the same truth for each view.
- High-risk claims must carry source IDs, scope/qualifier where relevant, and verification metadata.
- Official/institutional requirements, RU_LIFE recommendations, and practical experience must be semantically distinguishable.
- Visual map must have an equivalent outline/list; no content may depend on hover, drag, animation, or color alone.
- No new mandatory cloud round-trip for reading locally available content.
- Production remains protected by a separate explicit release gate; this plan ends at a verified preview/release candidate, not Production publication.

## Scope Boundary

This is **Wave 1 only**. It includes contracts, validation, one canonical high-risk vertical slice, reusable rendering primitives, route integration, local search enrichment, responsive/accessibility verification, and architectural documentation.

It explicitly excludes bulk migration of the other 19 topics, global graph visualization, institution/persona lenses, content packs, entitlements, billing, runtime LLM features, multi-device user-data sync, and any Production publish. Those become separate plans after this vertical slice is proven.

## Stable IDs for Wave 1

Use these exact stable IDs unless an existing source review during implementation proves one source must be replaced:

- Knowledge Unit: `ru-life:study-procedures:migration-registration`
- Catalog relation targets use `ru-life:<moduleSlug>:<topicSlug>`
- Source IDs use the `source:ru:<short-name>` namespace and must remain stable after publication.

## Core Interfaces to Lock

Create the following production interfaces in `lib/content-intelligence/types.ts`:

```ts
export type KnowledgeViewMode = "action" | "learn" | "full";

export type KnowledgeFreshness =
  | "volatile"
  | "review-soon"
  | "verified"
  | "stable-guidance";

export type SourceAuthority =
  | "official-legal"
  | "official-government"
  | "institutional"
  | "commercial-provider"
  | "professional-reference"
  | "community"
  | "personal-experience";

export type EvidenceText = {
  id: string;
  text: string;
  sourceIds: string[];
  scope?: string;
};

export type KnowledgeSourceV1 = {
  id: string;
  schemaVersion: 1;
  title: string;
  publisher: string;
  authority: SourceAuthority;
  url: string;
  checkedAt: string;
  publishedAt?: string;
  effectiveAt?: string;
  note: string;
};

export type KnowledgeRelationType =
  | "prerequisite-of"
  | "follows"
  | "related-to"
  | "exception-to"
  | "updates"
  | "conflicts-with"
  | "example-of"
  | "requires"
  | "applies-to"
  | "source-for";

export type KnowledgeRelation = {
  type: KnowledgeRelationType;
  targetId: string;
  label?: string;
};

export type KnowledgeAction = EvidenceText & {
  statusLabel?: string;
};

export type KnowledgeDecisionOption = {
  id: string;
  label: string;
  summary: string;
  nextUnitIds: string[];
  actionIds: string[];
  warningIds: string[];
};

export type KnowledgeDecision = {
  id: string;
  question: string;
  options: KnowledgeDecisionOption[];
};

export type KnowledgeMapNode = {
  id: string;
  label: string;
  kind: "stage" | "idea" | "action" | "decision" | "document" | "warning" | "source";
  evidenceId?: string;
};

export type KnowledgeMapEdge = {
  from: string;
  to: string;
  label?: string;
};

export type KnowledgeUnitV1 = {
  id: string;
  schemaVersion: 1;
  moduleSlug: string;
  topicSlug: string;
  title: string;
  summary: string;
  provenance: {
    sourceIds: string[];
    verifiedAt: string;
    freshness: KnowledgeFreshness;
  };
  semantics: {
    mainIdea: EvidenceText;
    purpose: EvidenceText;
    rationale: EvidenceText[];
    logic: EvidenceText[];
    preconditions: EvidenceText[];
    scope: EvidenceText[];
    actions: KnowledgeAction[];
    outcomes: EvidenceText[];
    exceptions: EvidenceText[];
  };
  memory: {
    mustRemember: EvidenceText[];
    memoryAnchor?: EvidenceText;
    keyTerms: EvidenceText[];
    contrasts: EvidenceText[];
    myths: EvidenceText[];
    commonMistakes: EvidenceText[];
    examples: EvidenceText[];
    recallPrompts: string[];
  };
  journey: {
    stages: string[];
    triggers: EvidenceText[];
    nextAction?: EvidenceText;
    checklist: KnowledgeAction[];
    timeline: KnowledgeAction[];
    dependencies: string[];
    decisions: KnowledgeDecision[];
    requiredMaterials: EvidenceText[];
    completionEvidence: EvidenceText[];
    followUps: EvidenceText[];
    map: {
      nodes: KnowledgeMapNode[];
      edges: KnowledgeMapEdge[];
    };
  };
  risk: {
    categories: Array<"immigration" | "legal" | "safety" | "financial" | "health" | "academic" | "digital" | "reputational" | "document-loss">;
    severity: "low" | "moderate" | "high" | "critical";
    doNot: EvidenceText[];
    critical: EvidenceText[];
    cautions: EvidenceText[];
    recommended: EvidenceText[];
    goodToKnow: EvidenceText[];
    consequences: EvidenceText[];
    escalations: EvidenceText[];
    uncertaintyNotes: EvidenceText[];
  };
  language: {
    ruTerms: Array<{ term: string; meaningVi: string; sourceIds: string[] }>;
    enTerms: Array<{ term: string; meaningVi: string }>;
    usefulPhrases: Array<{ ru: string; vi: string; context: string }>;
    cultureNotes: EvidenceText[];
  };
  relations: KnowledgeRelation[];
  searchTerms: string[];
};
```

The executor may split helper types into nearby files if needed, but must preserve the exact externally consumed names above.

## Review Focus

These are the five highest-risk failure classes for Wave 1; each is pinned to a task below.

1. **High-risk statement loses evidence or qualifier:** validator must reject `risk.doNot` / `risk.critical` items with no `sourceIds`, and the renderer must show verification/source access.
2. **Broken or cyclic map/decision data:** validator must reject missing node/edge/action references; the visual renderer must not recurse indefinitely and the list fallback must still work.
3. **One migrated topic breaks legacy topics:** resolver must return the Knowledge Unit only for `migration-registration` and keep all other 19 topics on the existing `TopicContent` path.
4. **New renderer breaks personal state:** route/module/topic slugs and existing `TopicProgress`, `TopicTools`, and `TopicDeadlines` inputs must remain identical.
5. **Map works visually but fails mobile/keyboard/non-visual use:** controls must be buttons/links with focus states, no hover-only content, and the same data must render as an outline/list fallback.

---

### Task 1: Define the versioned Content Intelligence contract and offline validator

**Files:**
- Create: `lib/content-intelligence/types.ts`
- Create: `scripts/validate-content-intelligence.mjs`
- Create: `tests/content-intelligence-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: no new runtime dependency.
- Produces: all types in **Core Interfaces to Lock**; CLI `node scripts/validate-content-intelligence.mjs`; npm script `validate:content-intelligence`.

- [ ] **Step 1: Write the failing contract test**

Create `tests/content-intelligence-contract.test.mjs` asserting that:

```js
test("content intelligence v1 declares stable knowledge/source/risk/view contracts", async () => {
  const source = await readFile(new URL("../lib/content-intelligence/types.ts", import.meta.url), "utf8");
  assert.match(source, /KnowledgeUnitV1/);
  assert.match(source, /KnowledgeSourceV1/);
  assert.match(source, /KnowledgeViewMode = "action" \| "learn" \| "full"/);
  assert.match(source, /schemaVersion: 1/);
  assert.match(source, /sourceIds: string\[\]/);
  assert.match(source, /mustRemember: EvidenceText\[\]/);
  assert.match(source, /decisions: KnowledgeDecision\[\]/);
  assert.match(source, /nodes: KnowledgeMapNode\[\]/);
  assert.match(source, /edges: KnowledgeMapEdge\[\]/);
});
```

Also assert `package.json` does not add a new dependency and will expose `validate:content-intelligence`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test tests/content-intelligence-contract.test.mjs
```

Expected: FAIL because `lib/content-intelligence/types.ts` and the npm script do not exist.

- [ ] **Step 3: Implement `lib/content-intelligence/types.ts`**

Add the exact public interfaces in **Core Interfaces to Lock**. Keep this file type-only: no source data, no React, no storage calls, no control-plane imports.

- [ ] **Step 4: Implement `scripts/validate-content-intelligence.mjs`**

The validator must accept source/unit JSON paths or default to the Wave 1 content directories. It must return non-zero on:

- missing `schemaVersion: 1`;
- duplicate source or knowledge IDs;
- `memory.mustRemember.length > 3`;
- unknown `sourceIds`;
- any `risk.doNot` or `risk.critical` item with no source ID;
- malformed YYYY-MM-DD `checkedAt` / `verifiedAt`;
- map edge referencing a missing node;
- decision option referencing a missing action/warning ID inside the unit;
- duplicate map node IDs.

It must not require network access.

- [ ] **Step 5: Add validator tests for malformed input**

Extend `tests/content-intelligence-contract.test.mjs` with temporary JSON fixtures written under the test temp directory, then invoke the validator with `node:child_process`.

Pin Review Focus #1 and #2:

- high-risk item without evidence → non-zero;
- missing map edge node → non-zero;
- valid minimal fixture → zero.

- [ ] **Step 6: Add the npm script**

Modify `package.json`:

```json
"validate:content-intelligence": "node scripts/validate-content-intelligence.mjs"
```

Do **not** add an npm package.

Do not add it to the global `gate` yet because no canonical Wave 1 JSON exists until Task 2.

- [ ] **Step 7: Verify Task 1**

Run:

```bash
node --test tests/content-intelligence-contract.test.mjs
npm run lint
npm run build
```

Expected: focused tests PASS, lint PASS, build PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/content-intelligence/types.ts scripts/validate-content-intelligence.mjs tests/content-intelligence-contract.test.mjs package.json
git commit -m "feat: define content intelligence v1 contract"
```

---

### Task 2: Create evidence-backed canonical source records and the migration-registration vertical slice

**Files:**
- Create: `content/sources/study-procedures/migration-registration.sources.json`
- Create: `content/knowledge/study-procedures/migration-registration.json`
- Create: `tests/migration-registration-intelligence.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `KnowledgeSourceV1`, `KnowledgeUnitV1` shape; offline validator from Task 1; existing verified content in `lib/study-procedures-content.ts`.
- Produces: canonical source records and Knowledge Unit ID `ru-life:study-procedures:migration-registration`.

- [ ] **Step 1: Re-verify the high-risk source material before migration**

Before writing the JSON, use current authoritative sources to re-check every time-sensitive claim carried forward from the legacy topic, especially residence registration, fingerprint/photo requirements, medical examination timing, effective dates, and exceptions.

Rules:

- prefer official legal/government sources;
- keep existing sources only when still current and reachable;
- do not infer a deadline or exception from memory;
- record `checkedAt` as the actual implementation-date review date;
- if two authoritative sources conflict, preserve the conflict/uncertainty rather than silently choosing.

This step changes no code; its checkable result is a short evidence note in the commit/implementation report and source JSON matching the reviewed sources.

- [ ] **Step 2: Write the failing vertical-slice data test**

Create `tests/migration-registration-intelligence.test.mjs` that parses both JSON files and asserts:

```js
assert.equal(unit.id, "ru-life:study-procedures:migration-registration");
assert.equal(unit.schemaVersion, 1);
assert.equal(unit.moduleSlug, "study-procedures");
assert.equal(unit.topicSlug, "migration-registration");
assert.ok(unit.memory.mustRemember.length >= 1 && unit.memory.mustRemember.length <= 3);
assert.ok(unit.semantics.mainIdea.text.length > 0);
assert.ok(unit.semantics.purpose.text.length > 0);
assert.ok(unit.journey.nextAction?.text.length > 0);
assert.ok(unit.journey.decisions.length >= 1);
assert.ok(unit.journey.map.nodes.length >= 3);
assert.ok(unit.risk.severity === "high" || unit.risk.severity === "critical");
assert.ok(unit.risk.critical.length >= 1);
assert.ok(unit.provenance.sourceIds.length >= 1);
```

Also invoke `scripts/validate-content-intelligence.mjs` against these files and expect exit code 0.

- [ ] **Step 3: Run the test and verify it fails**

Run:

```bash
node --test tests/migration-registration-intelligence.test.mjs
```

Expected: FAIL because canonical JSON files do not exist.

- [ ] **Step 4: Create the source registry JSON**

`migration-registration.sources.json` must be an array of `KnowledgeSourceV1` records.

Each record must include:

- stable `source:ru:...` ID;
- `schemaVersion: 1`;
- title/publisher;
- authority;
- URL;
- `checkedAt`;
- note describing what claim family it supports.

Do not store fetched full legal texts in the repo unless licensing and project need justify it.

- [ ] **Step 5: Create the canonical Knowledge Unit JSON**

Populate all top-level sections of `KnowledgeUnitV1`.

Required Wave 1 quality:

- `memory.mustRemember`: 1–3 high-signal items;
- at least one useful memory anchor or contrast separating commonly confused procedures;
- explicit `semantics.scope` and `semantics.exceptions`;
- `journey.nextAction`;
- checklist/timeline;
- at least one decision tree branching by relevant stay/accommodation/process context when evidence supports it;
- map nodes/edges using only local IDs;
- `risk.critical`, `risk.cautions`, `risk.recommended`, and uncertainty notes as appropriate;
- Russian key terms where useful;
- relations to neighboring existing topic IDs rather than duplicated neighboring articles;
- search terms covering situation/action/document/Russian terminology.

Do not fabricate `doNot` items merely to fill a red section.

- [ ] **Step 6: Turn content validation into a repository gate**

Update `package.json` so `gate` includes:

```bash
npm run validate:content-intelligence
```

after tests/build in an order that produces readable failures.

- [ ] **Step 7: Verify Task 2**

Run:

```bash
node --test tests/content-intelligence-contract.test.mjs tests/migration-registration-intelligence.test.mjs
npm run validate:content-intelligence
npm run lint
npm run build
```

Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add content/sources/study-procedures/migration-registration.sources.json content/knowledge/study-procedures/migration-registration.json tests/migration-registration-intelligence.test.mjs package.json
git commit -m "feat: add migration registration knowledge unit"
```

---

### Task 3: Add a gradual resolver that coexists with all legacy TopicContent

**Files:**
- Create: `lib/content-intelligence/registry.ts`
- Modify: `lib/content-resolver.ts`
- Create: `tests/content-intelligence-resolver.test.mjs`

**Interfaces:**
- Consumes: canonical JSON from Task 2; `KnowledgeUnitV1`.
- Produces:
  - `getResolvedKnowledgeUnit(moduleSlug: string, topicSlug: string): KnowledgeUnitV1 | null`
  - existing `getResolvedTopicContent(moduleSlug, topicSlug)` remains backward-compatible.

- [ ] **Step 1: Write the failing resolver test**

Assert the source contract includes:

```ts
getResolvedKnowledgeUnit("study-procedures", "migration-registration")
```

and that the registry imports only the new canonical unit in Wave 1.

The test must also pin Review Focus #3 by asserting the existing legacy resolver branches for all five modules remain present and the 20-topic catalog test remains untouched.

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/content-intelligence-resolver.test.mjs
```

Expected: FAIL because registry/API do not exist.

- [ ] **Step 3: Implement `registry.ts`**

Import the JSON module and type-check it with:

```ts
const migrationRegistration = migrationRegistrationJson as KnowledgeUnitV1;
```

Expose a map keyed by:

```text
<moduleSlug>:<topicSlug>
```

and:

```ts
export function getKnowledgeUnit(moduleSlug: string, topicSlug: string): KnowledgeUnitV1 | null
```

Do not add a database or dynamic network loader.

- [ ] **Step 4: Extend `content-resolver.ts`**

Add:

```ts
export function getResolvedKnowledgeUnit(moduleSlug: string, topicSlug: string): KnowledgeUnitV1 | null
```

delegating to the registry.

Do not alter the existing legacy resolver's behavior.

- [ ] **Step 5: Verify legacy coexistence**

Run:

```bash
node --test tests/content-intelligence-resolver.test.mjs tests/content-coverage.test.mjs tests/study-procedures-content.test.mjs
npm run build
```

Expected: PASS; all 20 legacy entries still exist; only one topic has a Knowledge Unit.

- [ ] **Step 6: Commit**

```bash
git add lib/content-intelligence/registry.ts lib/content-resolver.ts tests/content-intelligence-resolver.test.mjs
git commit -m "feat: resolve knowledge units beside legacy content"
```

---

### Task 4: Build reusable progressive-disclosure reading primitives

**Files:**
- Create: `components/knowledge/knowledge-experience.tsx`
- Create: `components/knowledge/knowledge-quick-view.tsx`
- Create: `components/knowledge/knowledge-risk-panel.tsx`
- Create: `components/knowledge/knowledge-action-view.tsx`
- Create: `components/knowledge/knowledge-learning-view.tsx`
- Create: `components/knowledge/knowledge-full-view.tsx`
- Create: `components/knowledge/knowledge-source-list.tsx`
- Create: `tests/content-intelligence-reading-modes.test.mjs`

**Interfaces:**
- Consumes: `KnowledgeUnitV1`, `KnowledgeSourceV1[]`.
- Produces:
  - `KnowledgeExperience({ unit, sources }: { unit: KnowledgeUnitV1; sources: KnowledgeSourceV1[] })`
  - three visible user intents: `action`, `learn`, `full`.

- [ ] **Step 1: Write the failing reading-mode test**

The test must assert source contains the exact user-facing mode labels:

- `Tôi cần làm gì?`
- `Tôi muốn hiểu`
- `Cho tôi xem toàn bộ`

It must also assert:

- `mustRemember` is shown before deep prose;
- risk panel has textual labels in addition to classes/icons;
- full mode renders provenance/source access;
- controls are real `button` elements with `aria-pressed` or equivalent state semantics;
- no fetch/API call is introduced.

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/content-intelligence-reading-modes.test.mjs
```

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement `KnowledgeQuickView`**

Render in this order:

1. `Ba điều phải nhớ` from `memory.mustRemember`;
2. `Việc nên làm ngay` from `journey.nextAction` when present;
3. strongest risk summary without duplicating entire deep content.

If only one or two `mustRemember` items exist, render only those; never synthesize filler.

- [ ] **Step 4: Implement `KnowledgeRiskPanel`**

Render separate textual sections only when arrays are non-empty:

- `CẤM / KHÔNG ĐƯỢC LÀM`
- `RẤT QUAN TRỌNG`
- `CẦN LƯU Ý`
- `NÊN LÀM`
- `BIẾT THÊM`

Color is supplementary. Preserve `scope` text when present.

- [ ] **Step 5: Implement action, learning, full, and source views**

`KnowledgeActionView` renders next action, checklist, timeline, materials, completion evidence, follow-up.

`KnowledgeLearningView` renders purpose, rationale/logic, memory anchor, terms, contrasts, myth/reality, mistakes, examples, exceptions.

`KnowledgeFullView` renders the complete structured semantic/action/risk content and embeds `KnowledgeSourceList`.

`KnowledgeSourceList` matches unit `sourceIds` to the source array and shows authority, checked date, note, and external source link.

- [ ] **Step 6: Implement `KnowledgeExperience` mode orchestration**

Make only this orchestrator client-side if interactivity requires it. Keep child renderers deterministic/presentational where possible.

Default mode: `action`.

Changing modes must not write personal state or require network access.

- [ ] **Step 7: Verify Task 4**

Run:

```bash
node --test tests/content-intelligence-reading-modes.test.mjs
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/knowledge tests/content-intelligence-reading-modes.test.mjs
git commit -m "feat: add progressive knowledge reading modes"
```

---

### Task 5: Add the interactive journey map, outline fallback, and decision tree without a graph dependency

**Files:**
- Create: `components/knowledge/knowledge-map.tsx`
- Create: `components/knowledge/knowledge-outline.tsx`
- Create: `components/knowledge/knowledge-decision-tree.tsx`
- Modify: `components/knowledge/knowledge-action-view.tsx`
- Create: `tests/content-intelligence-map.test.mjs`

**Interfaces:**
- Consumes: `unit.journey.map`, `unit.journey.decisions`, evidence IDs already inside the unit.
- Produces:
  - `KnowledgeMap({ unit }: { unit: KnowledgeUnitV1 })`
  - `KnowledgeOutline({ unit }: { unit: KnowledgeUnitV1 })`
  - `KnowledgeDecisionTree({ decisions, unit }: ...)`

- [ ] **Step 1: Write the failing map/accessibility test**

Pin Review Focus #2 and #5.

Assert:

- map nodes are rendered as buttons or links, not clickable divs;
- selected node state is represented semantically;
- `KnowledgeOutline` reads the same map data;
- decision options are buttons;
- there is no imported graph/chart package;
- source does not use recursive rendering for decision options;
- an empty map/decision array returns a meaningful no-map state rather than throwing.

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/content-intelligence-map.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Implement `KnowledgeMap`**

Use existing React/CSS only.

Behavior:

1. show a compact node neighborhood;
2. selecting a node shows its label and linked evidence/detail;
3. never require drag;
4. never render a global graph;
5. preserve a clear reset/back-to-overview control.

No external graph library.

- [ ] **Step 4: Implement `KnowledgeOutline`**

Render the same nodes/edges as a linear accessible representation.

This is not a separate content source.

- [ ] **Step 5: Implement `KnowledgeDecisionTree`**

Render one question and its options at a time using IDs, without recursion.

Selecting an option reveals:

- option summary;
- linked actions;
- linked warnings;
- links to `nextUnitIds` when they correspond to existing RU_LIFE routes.

Do not duplicate the linked evidence text into the decision model.

- [ ] **Step 6: Integrate map/outline/decision into action view**

The action view should offer the visual map and accessible outline in the same feature area, with an obvious switch or fallback.

- [ ] **Step 7: Verify Task 5**

Run:

```bash
node --test tests/content-intelligence-map.test.mjs tests/content-intelligence-contract.test.mjs
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/knowledge tests/content-intelligence-map.test.mjs
git commit -m "feat: add journey map and decision tree"
```

---

### Task 6: Integrate the vertical slice into the existing topic route without breaking personal tools

**Files:**
- Modify: `app/app/[module]/[topic]/page.tsx`
- Modify: `lib/content-intelligence/registry.ts` only if a source resolver export is required
- Create: `tests/content-intelligence-route-integration.test.mjs`

**Interfaces:**
- Consumes: `getResolvedKnowledgeUnit`, `KnowledgeExperience`, existing legacy `getResolvedTopicContent`, `TopicProgress`, `TopicTools`, `TopicDeadlines`.
- Produces: same topic route, selecting intelligence renderer when a Knowledge Unit exists and legacy renderer otherwise.

- [ ] **Step 1: Write the failing route integration test**

Pin Review Focus #3 and #4.

Assert the page:

- calls both `getResolvedKnowledgeUnit` and existing `getResolvedTopicContent`;
- renders `KnowledgeExperience` when the intelligence unit exists;
- preserves the current legacy content branch for other topics;
- still passes exactly `moduleData.slug`, `topic.slug`, `topic.title`, and `topic.checklist` into personal tools;
- does not change the route structure;
- does not import Application Management/control tables.

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/content-intelligence-route-integration.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Integrate the intelligence renderer**

At route resolution:

```ts
const intelligence = getResolvedKnowledgeUnit(moduleData.slug, topic.slug);
```

If present, render `KnowledgeExperience` in the main content region.

If absent, render the current `TopicContent` flow unchanged.

Do not fork the sidebar tools.

- [ ] **Step 4: Preserve source-review semantics**

The intelligence view must show its own `provenance.verifiedAt` and freshness metadata.

Do not remove `getSourceReviewMeta` behavior from legacy topics.

- [ ] **Step 5: Verify personal-state compatibility**

Run:

```bash
node --test tests/content-intelligence-route-integration.test.mjs tests/workspace-v1-operations.test.mjs tests/personal-tools-v1-1.test.mjs tests/deadline-control-v1-2.test.mjs tests/data-resilience-v1-3.test.mjs
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/app/[module]/[topic]/page.tsx lib/content-intelligence/registry.ts tests/content-intelligence-route-integration.test.mjs
git commit -m "feat: render migration registration intelligence"
```

---

### Task 7: Add premium, accessible, responsive styles while preserving the root CSS delivery fix

**Files:**
- Create: `app/knowledge.css`
- Modify: `app/layout.tsx`
- Modify: `tests/service-worker-css-integrity.test.mjs`
- Create: `tests/content-intelligence-responsive.test.mjs`

**Interfaces:**
- Consumes: class names emitted by Tasks 4–5.
- Produces: `app/knowledge.css` as a root-bundled stylesheet, preserving the current single reliable CSS asset delivery pattern.

- [ ] **Step 1: Write the failing responsive/style contract test**

Assert `knowledge.css` defines classes for:

- mode selector;
- must-remember cards;
- risk blocks;
- action/timeline;
- map;
- outline;
- decision options;
- source/provenance.

Assert breakpoints cover at least:

- <=980 px for single-column behavior;
- <=760 px for compact controls/map;
- <=560/620 px for phone layout.

Assert `prefers-reduced-motion: reduce` exists if transitions are added.

- [ ] **Step 2: Update the root CSS integrity test before implementation**

Extend `tests/service-worker-css-integrity.test.mjs` to require `knowledge.css` in the root layout and to keep protected layout free of nested stylesheet imports.

Run the tests; expected FAIL because `knowledge.css` is not imported yet.

- [ ] **Step 3: Implement `app/knowledge.css`**

Visual rules:

- premium but restrained;
- risk types use icon/text/heading plus color;
- action mode gets strongest hierarchy;
- map nodes are large enough for touch;
- focus-visible states are explicit;
- no horizontal scroll required for normal phone reading;
- outline fallback remains readable without map styling;
- no CSS framework.

- [ ] **Step 4: Import `knowledge.css` from `app/layout.tsx`**

Follow the established root-bundle strategy that fixed production CSS loss. Do not import this stylesheet from the nested topic route.

- [ ] **Step 5: Verify CSS/static regression**

Run:

```bash
node --test tests/content-intelligence-responsive.test.mjs tests/service-worker-css-integrity.test.mjs
npm run build
```

Expected: PASS, with generated stylesheet still served by the build as CSS.

- [ ] **Step 6: Commit**

```bash
git add app/knowledge.css app/layout.tsx tests/service-worker-css-integrity.test.mjs tests/content-intelligence-responsive.test.mjs
git commit -m "feat: style content intelligence experience"
```

---

### Task 8: Enrich local search with situations, actions, warnings, and Russian terms

**Files:**
- Create: `lib/content-intelligence/search.ts`
- Modify: `app/app/page.tsx`
- Modify: `components/workspace-dashboard.tsx` only if the current item shape must gain explicit search fields
- Create: `tests/content-intelligence-search.test.mjs`

**Interfaces:**
- Consumes: `KnowledgeUnitV1`; existing catalog/search item shape.
- Produces:
  - `buildKnowledgeSearchTerms(unit: KnowledgeUnitV1): string[]`
  - search text for the migrated topic derived locally, with no API.

- [ ] **Step 1: Write the failing search test**

Assert search data for the migrated topic includes:

- title/summary;
- `unit.searchTerms`;
- action text;
- key Russian terms;
- at least critical/caution labels or text useful for situation search.

Assert `workspace-dashboard.tsx` remains fetch/API-free.

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/content-intelligence-search.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Implement `buildKnowledgeSearchTerms`**

Return a de-duplicated local string array from:

- explicit `searchTerms`;
- `semantics.mainIdea`;
- `semantics.actions`;
- `journey.triggers`;
- `journey.requiredMaterials`;
- `risk.critical` / `risk.cautions`;
- Russian terms.

Do not include full source notes or every deep paragraph; keep the dashboard index compact.

- [ ] **Step 4: Integrate with dashboard data construction**

When a Knowledge Unit exists for a topic, augment its search payload. Otherwise keep current legacy search behavior.

Do not change the existing 20-topic navigation count.

- [ ] **Step 5: Verify Task 8**

Run:

```bash
node --test tests/content-intelligence-search.test.mjs tests/workspace-v1-operations.test.mjs tests/content-coverage.test.mjs
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/content-intelligence/search.ts app/app/page.tsx components/workspace-dashboard.tsx tests/content-intelligence-search.test.mjs
git commit -m "feat: index knowledge situations for local search"
```

---

### Task 9: Add whole-vertical-slice integrity, failure-state, and constitutional regression coverage

**Files:**
- Create: `tests/content-intelligence-vertical-slice.test.mjs`
- Modify: `CONTENT_ARCHITECTURE.md`
- Modify: `package.json` only if final gate ordering needs correction

**Interfaces:**
- Consumes: all Wave 1 contracts and renderers.
- Produces: one test that locks the end-to-end architectural story and updated architecture documentation.

- [ ] **Step 1: Write vertical-slice regression tests**

Cover the Review Focus items not already fully exercised:

1. missing/corrupt intelligence JSON causes validation failure before release;
2. renderer path exists only when resolver returns a valid unit;
3. legacy topic path remains available;
4. no canonical knowledge file contains strings matching control/session/private-key secret concepts;
5. no content-intelligence production file imports network/database/provider SDKs;
6. one canonical unit drives all three reading modes;
7. source IDs referenced by high-risk fields resolve;
8. all map edges and decision refs resolve;
9. route retains personal tools;
10. content count remains 20.

- [ ] **Step 2: Run the new test and verify any missing guarantees fail**

```bash
node --test tests/content-intelligence-vertical-slice.test.mjs
```

Expected: any uncovered contract should FAIL before documentation/final fixes.

- [ ] **Step 3: Fix only the uncovered Wave 1 gaps**

Do not broaden scope into catalog migration, packs, entitlements, or external services.

- [ ] **Step 4: Update `CONTENT_ARCHITECTURE.md`**

Add a new section documenting:

- legacy `TopicContent` remains supported;
- Knowledge Unit v1 is opt-in per topic;
- Wave 1 migrated topic ID;
- canonical JSON/source directories;
- three reading modes;
- map/outline equivalence;
- risk/provenance rules;
- personal-state isolation;
- no external runtime dependency;
- future migration path.

Do not rewrite unrelated historical sections.

- [ ] **Step 5: Run the complete repository gate**

Run:

```bash
npm run lint
npm test
npm run build
npm run validate:content-intelligence
```

If `npm run gate` is valid in the available environment, run it too. If Cloudflare preview validation requires unavailable secrets/config, record that constraint rather than weakening the gate.

Expected: all local/repository-owned checks PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/content-intelligence-vertical-slice.test.mjs CONTENT_ARCHITECTURE.md package.json
git commit -m "test: lock content intelligence vertical slice"
```

---

### Task 10: Browser verification and release-candidate evidence

**Files:**
- Modify only if verification finds a real defect.
- No Production deployment file change is required by default.

**Interfaces:**
- Consumes: built app and existing local runtime.
- Produces: evidence that the vertical slice works as designed on desktop/tablet/phone and does not regress static assets.

- [ ] **Step 1: Start a production-like local build**

Run:

```bash
npm run build
npm run start -- --host 127.0.0.1 --port 3000
```

Expected: server starts successfully.

- [ ] **Step 2: Verify the migrated route structurally**

Check:

```text
/app/study-procedures/migration-registration
```

Verify:

- premium layout loads;
- three reading modes are visible;
- default action mode contains next action and strongest warning;
- switching modes does not navigate away or lose sidebar personal tools;
- full mode exposes source/freshness information.

- [ ] **Step 3: Verify map and decision interaction**

On desktop and keyboard-only:

- focus every map node;
- select a node;
- open linked detail;
- return to overview;
- use outline fallback;
- select each decision option;
- confirm there is no dead end or invisible-only content.

- [ ] **Step 4: Verify phone/tablet layouts**

At representative desktop, tablet, and phone widths verify:

- no horizontal content overflow;
- risk headings remain readable;
- mode controls wrap/stack cleanly;
- map becomes understandable when narrow;
- outline remains available;
- sidebar tools stack without covering knowledge content.

- [ ] **Step 5: Verify static asset/service-worker safety**

Check built/local responses:

- `/app/study-procedures/migration-registration` returns the intelligence markup;
- stylesheet response is HTTP 200 `text/css`;
- `/sw.js` remains v2 behavior;
- no stale service worker intercepts CSS/JS.

- [ ] **Step 6: Record constitutional review**

In the implementation report explicitly state evidence for all seven pillars:

- structural capacity;
- architectural longevity;
- product elegance;
- premium usability;
- long-term durability;
- fortress security/disaster resilience;
- operational sovereignty/dependency minimization.

Any failed pillar blocks release candidacy.

- [ ] **Step 7: Mark release state**

The only allowed completion state for this plan without a separate explicit owner instruction is:

```text
Preview candidate / Production NOT authorized
```

Do not publish Production automatically.

- [ ] **Step 8: Commit verification-only fixes if needed**

If browser verification found a defect, fix it with a focused failing test first, rerun the relevant gate, then commit:

```bash
git commit -m "fix: harden content intelligence vertical slice"
```

If no source change is needed, do not create an empty commit.

---

## Post-Wave-1 Roadmap — Separate Plans, Not Part of This Execution

After Task 10 passes and the vertical slice is accepted, create separate implementation plans in this order:

### Wave 2 — Catalog Migration

Migrate the remaining 19 topics incrementally to `KnowledgeUnitV1`, preserving route IDs and user state. Group by content/risk domain; do not mass-convert blindly.

### Wave 3 — Situation-First Discovery

Expand dashboard/search into “Tôi đang gặp việc gì?” entry points, journey-stage navigation, relation neighborhoods, and cross-topic next-action routing.

### Wave 4 — Lenses and Context

Add persona/location/accommodation/institution lenses that reference canonical units rather than cloning content.

### Wave 5 — Content Packs

Add versioned pack composition and market packaging using stable Knowledge Unit IDs. No billing yet.

### Wave 6 — Provider-Independent Entitlement

Define free/premium/pack entitlement contracts and offline/failure behavior without binding the knowledge model to a billing vendor.

### Wave 7 — Commercial Provider

Only after entitlement is stable, select and integrate a replaceable billing/payment provider under the Constitution's operational-sovereignty gate.

---

## Plan Self-Review Results

### Spec coverage

Wave 1 covers the architecture foundation requirements that must be proven before expansion: versioned Knowledge Unit, provenance, freshness, risk, relations, three reading modes, memory, journey/action, decisions, map/list equivalence, search discovery, accessibility, responsive behavior, local-first operation, legacy coexistence, personal-state isolation, quality gates, and constitutional review.

Commercial packs, lenses, entitlement, full-catalog migration, and global graph are intentionally deferred into separate plans because they are independent subsystems and the approved spec explicitly requires a vertical slice before horizontal expansion.

### Step scan

Each implementation step creates one checkable artifact or verification result. No task requires “implement all 100 layers.” No task introduces an external provider.

### Type consistency

The plan uses one public `KnowledgeUnitV1`, one `KnowledgeSourceV1`, one `KnowledgeViewMode`, and one resolver name `getResolvedKnowledgeUnit` throughout. Stable IDs remain unchanged across data, resolver, renderer, search, and tests.

### Review Focus coverage

- Evidence loss → Tasks 1, 2, 9.
- Broken map/decision references → Tasks 1, 5, 9.
- Legacy regression → Tasks 3, 6, 8, 9.
- Personal-state regression → Task 6 and full regression in Task 9.
- Mobile/keyboard/non-visual map use → Tasks 5, 7, 10.

### Proportion

This plan deliberately specifies interfaces, tests, exact files, and gates while leaving component bodies and styling details to implementation. It is narrower than the full 100-layer spec and produces one independently testable product increment.

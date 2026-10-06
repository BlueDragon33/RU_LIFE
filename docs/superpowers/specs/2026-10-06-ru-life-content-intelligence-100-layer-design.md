# RU_LIFE Content Intelligence 100-Layer Architecture — Design Specification

**Status:** Approved architecture baseline  
**Date:** 2026-10-06  
**Repository:** `BlueDragon33/RU_LIFE`  
**Constitution:** `blueprint-os:universal-century-grade` v1.2.0 · Blueprint B3 · enforcement `enforced`  
**Production authority:** separate explicit release gate  
**Primary companion prompt:** `prompts/RU_LIFE_CONTENT_INTELLIGENCE_100_LAYER_MASTER.md`

---

## 1. Purpose

RU_LIFE must evolve from a content website into a **content-intelligence and life-guidance system** for people preparing for, arriving in, studying in, and living in Russia.

The system must make long, difficult, time-sensitive material easier to understand without destroying nuance. It must support both a first-time user who needs an answer in seconds and an advanced user who wants the complete source and reasoning.

The architecture is designed for long-term commercial scale. It must be possible to serve many users, personas, cities, universities, languages, and purchasable content packs from one knowledge core without duplicating the entire content tree per user.

The core product promise is:

> **Find what matters quickly, understand why it matters, know what to do next, see what must never be done, and retain access to the full original context.**

---

## 2. Constitutional alignment

Every implementation decision under this specification MUST explicitly preserve all seven inherited constitutional pillars.

### 2.1 Structural capacity

The information model must scale from the current catalog to thousands of knowledge units without requiring a rewrite of navigation, rendering, or storage contracts.

### 2.2 Architectural longevity

Knowledge, presentation, user state, commercial packaging, and control-plane concerns must remain independently evolvable. Schemas are versioned. Migrations are explicit. Compatibility is tested.

### 2.3 Product elegance

Complexity belongs in the architecture, not in the user's face. The user should not have to learn the system before receiving value.

### 2.4 Premium usability

The interface should answer the user's likely question at the correct depth with minimal friction. Important, forbidden, risky, and urgent information must be visually distinct and accessible.

### 2.5 Long-term durability

Source provenance, freshness, migration, auditability, rollback, export, and resilience are first-class requirements rather than later cleanup tasks.

### 2.6 Fortress security and disaster resilience

Knowledge content, personal state, device identity, session state, entitlements, and management control must remain separate security domains. No content feature may weaken RU_LIFE's existing device/session or backup boundaries.

### 2.7 Operational sovereignty and dependency minimization

RU_LIFE must preserve the ability to operate without unnecessary dependence on external vendors. Prefer local-first and repository-owned contracts, use replaceable providers, avoid introducing services that merely duplicate existing capability, and ensure loss of an optional provider does not collapse ordinary knowledge access. External dependencies require a documented need, exit path, and boundary.

No constitutional waiver is assumed by this design.

---

## 3. Architectural thesis: 100 layers are logical capabilities, not 100 UI screens

The phrase **100 layers** means a century-grade capability model composed of **10 domains × 10 layers each**.

It MUST NOT mean:

- 100 nested menus;
- 100 route depths;
- 100 accordions;
- 100 sequential clicks;
- 100 database tables merely to match the number;
- a visible hierarchy that forces the user to understand the internal architecture.

The design follows the rule:

> **Deep system, shallow experience.**

A normal reading path should expose approximately 3–5 levels at one time:

1. What do I need now?
2. What are the essential points?
3. What should I do?
4. What is dangerous / forbidden / easy to get wrong?
5. Do I want the map, deeper explanation, or full source?

---

## 4. The 100-layer capability model

### Domain A — Source & Truth Foundation (L01–L10)

**L01 Source Identity** — canonical source ID, source type, owner/issuer.  
**L02 Original Capture** — preserve original wording or faithful reference without destructive rewriting.  
**L03 Source Location** — URL, document location, section/page/paragraph anchors where available.  
**L04 Source Authority** — official, institutional, commercial, community, personal-experience classification.  
**L05 Source Date** — publication/effective/observed dates where known.  
**L06 Verification Date** — when RU_LIFE last reviewed the material.  
**L07 Freshness Class** — volatile, review-soon, verified, stable-guidance or equivalent versioned policy.  
**L08 Provenance Chain** — which extracted knowledge unit came from which evidence.  
**L09 Version History** — content revisions and supersession relationships.  
**L10 Full-Context Preservation** — user can always reach the complete supported context or authoritative source.

### Domain B — Semantic Intelligence (L11–L20)

**L11 Main Idea** — the smallest accurate statement of what the material means.  
**L12 Purpose** — why this content exists and what problem it solves.  
**L13 Rationale** — why the rule/action/advice matters.  
**L14 Logic** — cause/effect or procedural reasoning.  
**L15 Preconditions** — what must already be true.  
**L16 Scope** — who, when, where, and under what situation it applies.  
**L17 Required Actions** — explicit actions a user must take.  
**L18 Expected Outcomes** — what successful completion looks like.  
**L19 Exceptions & Branches** — cases in which the normal path differs.  
**L20 Semantic Relations** — prerequisite, follows, conflicts-with, updates, related-to, example-of, exception-to.

### Domain C — Memory & Learning (L21–L30)

**L21 Three Things to Remember** — maximum-signal micro summary.  
**L22 Memory Anchor** — one phrase that separates easily confused concepts.  
**L23 Key Terms** — terminology that must be recognized.  
**L24 Contrast Pair** — “A is not B” distinctions.  
**L25 Myth vs Reality** — correct common false mental models.  
**L26 Common Mistakes** — predictable errors by newcomers.  
**L27 Example** — concrete real-world scenario.  
**L28 Recall Prompt** — lightweight self-check or flash recall.  
**L29 End-of-Topic Checkpoint** — what the learner should now be able to answer.  
**L30 Recap Compression** — regenerate a short revision view without losing critical warnings.

### Domain D — Journey & Action (L31–L40)

**L31 Journey Position** — before departure, arrival, first days, routine life, emergency, etc.  
**L32 Trigger** — event or condition that makes this knowledge relevant.  
**L33 Next Action** — the most useful immediate step.  
**L34 Checklist** — atomic tasks with clear completion states.  
**L35 Timeline** — before/during/after or date-relative sequence.  
**L36 Dependency Graph** — what must happen first.  
**L37 Decision Tree** — if/then branches for user-specific situations.  
**L38 Required Materials** — documents, money, contacts, tools, evidence.  
**L39 Completion Evidence** — how a user knows the task is truly complete.  
**L40 Follow-up / Renewal** — what can become relevant again later.

### Domain E — Risk & Critical Guidance (L41–L50)

**L41 Risk Classification** — legal, immigration, safety, financial, health, academic, digital, reputational.  
**L42 Risk Severity** — low, moderate, high, critical.  
**L43 🔴 Do Not / Prohibited** — explicit forbidden or dangerous actions.  
**L44 🟠 Critical** — information with serious consequences if missed.  
**L45 🟡 Caution** — likely mistakes or conditions requiring attention.  
**L46 🟢 Recommended** — safe/best-practice behavior.  
**L47 🔵 Good to Know** — useful but non-urgent context.  
**L48 Consequence** — what may happen if guidance is ignored.  
**L49 Escalation** — when to contact official authorities, institution, emergency service, qualified professional, etc.  
**L50 Uncertainty Guard** — explicit boundary when facts are incomplete, jurisdiction-dependent, or need current verification.

### Domain F — Progressive Disclosure UX (L51–L60)

**L51 10-Second View** — three things to remember + strongest warning/action.  
**L52 1-Minute View** — concise purpose, logic, action, warning.  
**L53 Action View** — checklist/timeline/decision tree first.  
**L54 Map View** — interactive journey/knowledge graph.  
**L55 Main-Idea View** — expandable semantic outline.  
**L56 Deep View** — reasoning, exceptions, examples.  
**L57 Full-Text View** — complete supported context.  
**L58 Source View** — authoritative references and provenance.  
**L59 Contextual Navigation** — breadcrumbs, related topics, prior/next steps.  
**L60 Return-to-Summary** — every deep route must make it easy to return to the essential view.

### Domain G — Context & Personalization (L61–L70)

**L61 Persona Lens** — student, worker, family, traveler, etc.  
**L62 Journey Stage Lens** — before flight, arrival, first week, settled.  
**L63 Location Lens** — Russia-wide, city, institution, local service.  
**L64 Accommodation Lens** — dormitory, rental, hotel/temporary stay where relevant.  
**L65 Institution Lens** — university/employer/organization-specific overlay.  
**L66 User Priority Lens** — urgent, essential, recommended, reference.  
**L67 Progress Lens** — new, in-progress, complete, review-needed.  
**L68 Saved/Favorite Lens** — personal organization without altering source truth.  
**L69 Accessibility/Reading Lens** — simplified reading, standard, deep-reference.  
**L70 Personal State Isolation** — personalization selects/views knowledge; it does not rewrite canonical knowledge.

### Domain H — Language & Culture (L71–L80)

**L71 Vietnamese Explanation** — canonical user-facing Vietnamese where applicable.  
**L72 Russian Term** — original Russian terminology.  
**L73 English Bridge** — optional English equivalent.  
**L74 Bilingual Pairing** — side-by-side terms when beneficial.  
**L75 Pronunciation Hook** — future-compatible pronunciation field, not mandatory for all units.  
**L76 Real-Life Phrase** — useful sentence to say in a real situation.  
**L77 Formal vs Informal** — register distinction where relevant.  
**L78 Cultural Etiquette** — behavior expectations separated from legal requirements.  
**L79 Translation Warning** — terms whose direct translation can mislead.  
**L80 Cultural Scenario** — example showing how wording/behavior changes by context.

### Domain I — Product & Commercial Scale (L81–L90)

**L81 Knowledge Core** — shared canonical facts and relations.  
**L82 Content Pack** — purchasable/assignable collection of knowledge references, not duplicated knowledge.  
**L83 Market Lens** — audience packaging such as Russia Starter, Student, Moscow, Family, University.  
**L84 Entitlement Model** — future-compatible rights to packs/features; must not mix with source content.  
**L85 Free/Premium Boundary** — presentation/feature entitlement boundary, not truth distortion.  
**L86 Pack Composition** — packs reference units and lenses through stable IDs.  
**L87 Tenant/Institution Overlay** — institution-specific material remains namespaced and override-safe.  
**L88 Analytics Contract** — future aggregate product analytics without leaking personal notes or protected user state.  
**L89 Upgrade Path** — user may gain more views/packs without content migration chaos.  
**L90 Commerce Independence** — billing provider and payment implementation remain replaceable; knowledge architecture must not depend on one vendor.

### Domain J — Governance & Century-Grade Evolution (L91–L100)

**L91 Schema Version** — every durable structure carries an explicit version.  
**L92 Migration Contract** — forwards migration with testable rollback/compatibility strategy.  
**L93 Quality Gate** — schema, content, risk, provenance, UI, accessibility, responsive and regression checks.  
**L94 Constitutional Gate** — explicit six-pillar review.  
**L95 Security Boundary Gate** — no content work may merge identity/session/control/user-data domains.  
**L96 Freshness Review Gate** — risk-weighted review schedule.  
**L97 Release Gate** — preview and verification before Production.  
**L98 Rollback & Recovery** — known-good revision, export/backup, migration recovery.  
**L99 Auditability** — meaningful content/schema changes are attributable and inspectable.  
**L100 Evolution Rule** — new capabilities extend contracts; they do not bypass or silently rewrite constitutional guarantees.

---

## 5. Core information model

The architecture centers on a stable **Knowledge Unit**.

A Knowledge Unit is not “a page.” It is a reusable semantic object that can be rendered many ways.

Conceptual schema:

```text
KnowledgeUnit
  id
  schemaVersion
  slug
  title

  provenance
    sourceIds[]
    sourceAuthority
    publishedAt?
    verifiedAt
    freshnessClass

  semantics
    mainIdea
    purpose
    rationale
    logic
    preconditions[]
    scope[]
    actions[]
    outcomes[]
    exceptions[]

  memory
    mustRemember[<=3]
    memoryAnchor?
    keyTerms[]
    contrasts[]
    myths[]
    commonMistakes[]
    examples[]
    recallPrompts[]

  journey
    stages[]
    triggers[]
    nextAction?
    checklist[]
    timeline[]
    dependencies[]
    decisions[]
    requiredMaterials[]
    completionEvidence[]
    followUps[]

  risk
    categories[]
    severity
    doNot[]
    critical[]
    cautions[]
    recommended[]
    goodToKnow[]
    consequences[]
    escalations[]
    uncertaintyNotes[]

  language
    vi
    ruTerms[]
    enTerms[]
    usefulPhrases[]
    cultureNotes[]

  relations[]
  tags[]
```

Exact TypeScript types are implementation-plan decisions, but the semantic separation above is normative.

---

## 6. One source, many views

A single Knowledge Unit may appear in multiple product surfaces without duplicate canonical content.

Required primary modes:

### Mode A — “Tôi cần làm gì?”

Action-first. Shows trigger, next action, checklist, decision tree, materials, deadline and risk.

### Mode B — “Tôi muốn hiểu”

Learning-first. Shows purpose, logic, memory anchor, contrasts, myth-vs-reality, mistakes and examples.

### Mode C — “Cho tôi xem toàn bộ”

Reference-first. Shows deep explanation, original context, provenance, freshness, authoritative sources and related material.

These modes are views over one knowledge model, not separate articles.

---

## 7. Interactive map / graph behavior

RU_LIFE should support a map-like overview that is useful rather than decorative.

A map node may represent:

- journey stage;
- topic;
- main idea;
- action;
- required document/material;
- decision;
- risk;
- source.

Interaction model:

1. user selects a situation or topic;
2. system shows a compact graph/journey;
3. click a node → main idea panel;
4. click an item in that panel → deeper explanation;
5. user can always choose **Xem toàn bộ nội dung**;
6. backtracking never loses the user's place.

The graph MUST use progressive disclosure. It MUST NOT render the entire global knowledge graph at once.

---

## 8. Risk presentation rules

Risk is part of the data model, not styling added later.

Canonical user-facing categories:

- 🔴 **CẤM / KHÔNG ĐƯỢC LÀM**
- 🟠 **RẤT QUAN TRỌNG**
- 🟡 **CẦN LƯU Ý**
- 🟢 **NÊN LÀM**
- 🔵 **BIẾT THÊM**

Requirements:

- color alone must never be the only distinction;
- critical warnings must remain understandable to screen readers;
- high-risk advice must include source/freshness/uncertainty context;
- official requirement and personal experience must be visually and semantically separated;
- a summary must never omit a condition that changes whether a critical rule applies.

---

## 9. Content ingestion pipeline

The future ingestion pipeline follows this sequence:

```text
Source
→ preserve provenance
→ segment
→ classify authority/freshness/risk
→ extract semantic units
→ extract actions/decisions
→ create memory aids
→ build relations
→ human/quality validation
→ publish views
→ monitor freshness
```

No stage may destroy access to the source context needed to verify downstream claims.

AI may assist extraction and structuring, but high-risk or time-sensitive content requires evidence-aware review rather than blind generation.

---

## 10. Knowledge graph rules

Relations use stable IDs rather than duplicated prose.

Minimum relation vocabulary should support:

- `prerequisite-of`
- `follows`
- `related-to`
- `exception-to`
- `updates`
- `conflicts-with`
- `example-of`
- `requires`
- `applies-to`
- `source-for`

The system may later move to a dedicated graph store, but the first implementation must not require one. The semantic contract must be storage-agnostic.

---

## 11. Personalization without content duplication

Canonical knowledge MUST remain shared.

Personalization is applied through lenses and state:

```text
Knowledge Core
  + Content Pack
  + Persona/Location/Institution Lens
  + User Progress & Preferences
  = Rendered Experience
```

Do not create copies such as:

- “migration-registration-for-student-A”;
- “migration-registration-for-student-B”;
- “migration-registration-moscow-copy”;

unless the underlying rule/content is genuinely different and independently sourced.

---

## 12. Commercial architecture

The design must be ready for commercialization without implementing billing prematurely.

Potential product packaging:

- Russia Starter Pack;
- First 7 Days Pack;
- International Student Pack;
- Moscow Pack;
- University-specific packs;
- Family Pack;
- Language Survival Pack;
- Premium procedural/reference pack.

Rules:

1. a pack references Knowledge Unit IDs;
2. pack metadata may define ordering, recommended journeys and lens defaults;
3. payment/entitlement metadata never becomes canonical knowledge;
4. free and premium users must not receive contradictory “truth”;
5. premium may unlock depth, tools, packs, workflows or convenience — not falsify free content;
6. billing provider must be replaceable;
7. personal data must not become a commercial content asset.

---

## 13. Existing RU_LIFE boundaries that remain authoritative

This design must preserve the current project boundaries.

- RU_LIFE remains an independent application.
- GitHub remains source of truth.
- Application Management is an optional control plane, not the owner of RU_LIFE personal knowledge/progress.
- Standalone/local-first behavior remains possible where currently supported.
- Managed access may enforce the existing device/session path when enabled.
- P-256 device identity/private key is never content data.
- Content intelligence must not use control-plane tables as a personal-content store.
- Existing local backup/migration contracts remain isolated from device identity and entitlement concerns.
- Secrets are never committed to the repository.
- Production authority remains a separate explicit release gate.

---

## 14. Accessibility and cognitive-load rules

A premium learning product must be usable under stress.

Mandatory principles:

- plain-language headings before jargon;
- one dominant action per panel;
- readable line lengths;
- keyboard navigation;
- screen-reader semantics;
- reduced-motion support where motion exists;
- warnings use text/icon/structure, not color only;
- diagrams have a non-visual equivalent;
- user can switch from map to list/outline;
- avoid accordion-within-accordion-within-accordion;
- important information must not depend on hover;
- mobile layouts preserve the same information hierarchy.

---

## 15. Performance rules

The knowledge architecture must not force the client to load the entire catalog.

Expected behavior:

- load only the current journey/topic and small relation neighborhood;
- lazy-load deep/full-source content when appropriate;
- indexes/search metadata may be compact and separate from full content;
- no global 100-layer graph payload on first load;
- content packs must not duplicate identical large bodies.

---

## 16. Freshness and evidence strategy

Freshness is risk-weighted.

Examples:

- immigration/legal/administrative deadlines → high volatility, frequent review;
- provider pricing/requirements → high or medium volatility;
- university-specific process → medium/high and institution-dependent;
- cultural etiquette → lower volatility but still attributable;
- basic language explanation → typically stable.

“Verified at” is not the same as “legally valid until.”

When uncertainty exists, the UI should say so and direct the user to the correct authoritative source or escalation path.

---

## 17. Anti-patterns explicitly forbidden

Implementations under this design MUST NOT:

1. dump full documents as the default reading experience;
2. flatten every source into one undifferentiated summary;
3. create 100 visible navigation depths;
4. duplicate canonical knowledge for every persona/customer;
5. mix official requirements with personal tips without labels;
6. remove important exceptions to make a summary look simpler;
7. hide source provenance;
8. treat stale information as current because it exists in the database;
9. hard-code one city/university/persona into the core schema;
10. bind the knowledge model to one payment vendor;
11. bind the knowledge model to one database technology;
12. put personal notes/progress into canonical source content;
13. put device/session/control secrets into content structures;
14. use Application Management as a content database;
15. introduce a new external service without a justified architectural need;
16. require cloud connectivity for ordinary local-first reading when content is locally available;
17. ship a “smart” AI transformation that cannot explain which source supports a high-risk claim;
18. auto-publish Production merely because tests pass.

---

## 18. Delivery strategy: vertical slice before horizontal expansion

The system MUST NOT attempt to “implement all 100 layers” in one release.

Recommended progression:

### Phase 0 — Contracts

Define versioned Knowledge Unit, provenance, risk, view-mode and relation contracts.

### Phase 1 — One complete vertical slice

Choose one high-value topic, preferably a procedural topic with real branching and risk, and implement:

- quick view;
- main idea;
- action view;
- risk blocks;
- memory anchor;
- decision tree;
- map/outline;
- deep view;
- full source/provenance;
- responsive/accessibility behavior.

### Phase 2 — Validate usability

Test whether a new user can answer:

- What is this?
- Why does it matter?
- What must I do?
- What must I not do?
- What do I need?
- What happens next?
- Where did this information come from?

### Phase 3 — Expand across current catalog

Migrate existing topics through the same contracts without rewriting the UI per topic.

### Phase 4 — Packs/lenses

Add contextual packaging only after canonical content and rendering contracts are stable.

### Phase 5 — Commercial capabilities

Entitlements/pack access may be added once knowledge boundaries are proven.

---

## 19. Test strategy

At minimum, future implementation should include tests for:

### Schema

- version presence;
- required IDs;
- relation validity;
- no orphan source IDs;
- no malformed risk classification.

### Content integrity

- critical rules retain qualifying conditions;
- source/provenance exists for evidence-sensitive material;
- full-source route remains reachable;
- official vs experience/tip is labeled.

### Rendering

- quick view;
- action view;
- deep view;
- full view;
- map/list fallback;
- mobile/desktop;
- keyboard/screen-reader semantics.

### Personalization

- lens changes presentation/order but does not mutate canonical knowledge;
- progress/favorite/reminder state remains personal.

### Commercial packaging

- packs reference stable IDs;
- no duplicated truth between free/premium packs;
- entitlement loss never corrupts personal data.

### Regression

- existing standalone/managed security boundaries;
- backup/migration namespaces;
- service-worker/static-asset safety;
- source review rules.

---

## 20. Quality gates

A content-intelligence feature is not complete until it passes:

1. **Truth gate** — provenance and uncertainty are valid.
2. **Semantic gate** — purpose, logic, actions and exceptions are coherent.
3. **Risk gate** — critical/caution/do-not classifications are reviewed.
4. **Memory gate** — essential recall is concise without falsification.
5. **Journey gate** — next action and dependencies make sense.
6. **UX gate** — progressive disclosure avoids overload.
7. **Accessibility gate** — equivalent non-color/non-visual access exists.
8. **Architecture gate** — no domain boundary is broken.
9. **Constitution gate** — all seven inherited pillars are satisfied.
10. **Release gate** — preview/E2E verification precedes explicit Production authority.

---

## 21. Definition of Done for the architecture foundation

The foundation is considered implemented only when:

- a versioned Knowledge Unit contract exists;
- provenance and freshness are first-class;
- risk classifications are first-class;
- at least one real topic proves quick/action/map/deep/full views;
- a decision tree can be represented without hard-coded component logic;
- a source may feed multiple views without duplicated canonical prose;
- list/outline fallback exists for the visual map;
- existing personal-data and security boundaries remain intact;
- automated tests protect the above;
- no Production release is implied by implementation completion.

---

## 22. Architectural success criteria

The design succeeds if RU_LIFE can eventually grow from tens to thousands of content units and multiple sellable packs while a new user can still open one topic and understand the most important action and warning within seconds.

The deepest architecture should become more capable over time while the surface experience becomes simpler.

> **Complexity scales downward into the system, not upward into the user's cognitive load.**

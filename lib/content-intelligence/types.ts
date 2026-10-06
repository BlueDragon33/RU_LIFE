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

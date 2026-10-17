export interface KnowledgeEntity {
  id: string;
  name: string;
  category: 'technology' | 'science' | 'geopolitics' | 'economy' | 'environment' | 'general';
  summary: string;
  confidence: number; // 0 to 100
  firstLearnedAt: string;
  lastUpdatedAt: string;
  sourcesCount: number;
  importance: 'critical' | 'high' | 'medium' | 'emerging';
  tags: string[];
  media?: {
    imageUrl?: string;
    videoUrl?: string;
    imageSize?: '1K' | '2K' | '4K';
    aspectRatio?: '16:9' | '9:16';
    prompt?: string;
  };
}

export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number; // 0.1 to 1.0
  description?: string;
}

export interface EpistemicLogEntry {
  id: string;
  timestamp: string;
  topic: string;
  headline: string;
  insightSummary: string;
  confidenceDelta: number; // e.g. +12
  contradictionsResolved: string[];
  sources: { title: string; uri: string }[];
  affectedEntityIds: string[];
  media?: {
    imageUrl?: string;
    videoUrl?: string;
    imageSize?: '1K' | '2K' | '4K';
    aspectRatio?: '16:9' | '9:16';
    prompt?: string;
    isGeneratingVideo?: boolean;
    operationName?: string;
  };
}

export interface LearningState {
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
  history: EpistemicLogEntry[];
  totalCycles: number;
  lastCycleAt: string | null;
  overallConfidence: number;
}

export function calculateConfidenceDelta(
  currentConfidence: number,
  corroboratingSources: number,
  hasContradictions: boolean
): number {
  let delta = Math.min(25, corroboratingSources * 4);
  if (hasContradictions) {
    delta -= 8;
  }
  // Cap result so updated confidence stays between 10 and 99
  const updated = Math.min(99, Math.max(10, currentConfidence + delta));
  return updated - currentConfidence;
}

export function mergeLearnedEntities(
  existingEntities: KnowledgeEntity[],
  newEntities: Array<Partial<KnowledgeEntity> & { name: string; category?: KnowledgeEntity['category'] }>
): KnowledgeEntity[] {
  const result = [...existingEntities];

  for (const item of newEntities) {
    const normalizedName = item.name.trim().toLowerCase();
    const existingIndex = result.findIndex(
      (e) => e.name.trim().toLowerCase() === normalizedName
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = result[existingIndex];
      const addedSources = (item.sourcesCount || 1);
      const delta = calculateConfidenceDelta(existing.confidence, addedSources, false);
      result[existingIndex] = {
        ...existing,
        summary: item.summary || existing.summary,
        confidence: Math.min(99, existing.confidence + Math.max(1, delta)),
        lastUpdatedAt: now,
        sourcesCount: existing.sourcesCount + addedSources,
        tags: Array.from(new Set([...existing.tags, ...(item.tags || [])])),
        importance: item.importance || existing.importance,
      };
    } else {
      const id = 'ent_' + Math.random().toString(36).substring(2, 9);
      result.push({
        id,
        name: item.name.trim(),
        category: item.category || 'general',
        summary: item.summary || `Synthesized concept learned from real-time analysis.`,
        confidence: Math.min(95, Math.max(50, item.confidence || 70)),
        firstLearnedAt: now,
        lastUpdatedAt: now,
        sourcesCount: item.sourcesCount || 1,
        importance: item.importance || 'emerging',
        tags: item.tags || [item.category || 'knowledge'],
      });
    }
  }

  return result;
}

export function createRelationIfMissing(
  relations: KnowledgeRelation[],
  sourceId: string,
  targetId: string,
  relationship: string,
  weight: number = 0.7,
  description?: string
): KnowledgeRelation[] {
  if (sourceId === targetId) return relations;

  const exists = relations.some(
    (r) =>
      (r.sourceId === sourceId && r.targetId === targetId) ||
      (r.sourceId === targetId && r.targetId === sourceId)
  );

  if (exists) {
    return relations.map((r) =>
      (r.sourceId === sourceId && r.targetId === targetId) ||
      (r.sourceId === targetId && r.targetId === sourceId)
        ? { ...r, weight: Math.min(1.0, r.weight + 0.1) }
        : r
    );
  }

  const newRelation: KnowledgeRelation = {
    id: `rel_${Math.random().toString(36).substring(2, 9)}`,
    sourceId,
    targetId,
    relationship,
    weight,
    description,
  };

  return [...relations, newRelation];
}

export function computeOverallConfidence(entities: KnowledgeEntity[]): number {
  if (entities.length === 0) return 0;
  const sum = entities.reduce((acc, curr) => acc + curr.confidence, 0);
  return Math.round(sum / entities.length);
}

export function attachMediaToLogEntry(
  history: EpistemicLogEntry[],
  logId: string,
  mediaUpdate: Partial<NonNullable<EpistemicLogEntry['media']>>
): EpistemicLogEntry[] {
  return history.map((entry) => {
    if (entry.id !== logId) return entry;
    return {
      ...entry,
      media: {
        ...(entry.media || {}),
        ...mediaUpdate,
      },
    };
  });
}


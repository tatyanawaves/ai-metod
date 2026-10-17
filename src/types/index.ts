export type CategoryType =
  | 'technology'
  | 'science'
  | 'geopolitics'
  | 'economy'
  | 'environment'
  | 'general';

export interface KnowledgeEntity {
  id: string;
  name: string;
  category: CategoryType;
  summary: string;
  confidence: number;
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
  weight: number;
  description?: string;
}

export interface EpistemicLogEntry {
  id: string;
  timestamp: string;
  topic: string;
  headline: string;
  insightSummary: string;
  confidenceDelta: number;
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

export interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  size: '1K' | '2K' | '4K';
  aspectRatio: string;
  timestamp: string;
  entityName?: string;
}

export interface GeneratedVideoItem {
  id: string;
  videoUrl: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  sourceImagePreview?: string;
  timestamp: string;
}

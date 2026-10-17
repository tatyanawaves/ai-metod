import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateConfidenceDelta,
  mergeLearnedEntities,
  createRelationIfMissing,
  computeOverallConfidence,
  attachMediaToLogEntry,
} from './knowledge.ts';
import type {
  KnowledgeEntity,
  KnowledgeRelation,
  EpistemicLogEntry,
} from './knowledge.ts';

test('calculateConfidenceDelta properly scales with corroborating sources', () => {
  const delta = calculateConfidenceDelta(60, 3, false);
  assert.equal(delta, 12);

  const deltaWithContradiction = calculateConfidenceDelta(60, 3, true);
  assert.equal(deltaWithContradiction, 4);

  // Ceiling check: should not exceed 99
  const highDelta = calculateConfidenceDelta(95, 5, false);
  assert.equal(highDelta, 4); // 95 + 4 = 99
});

test('mergeLearnedEntities updates existing entity confidence and adds new entities', () => {
  const initial: KnowledgeEntity[] = [
    {
      id: 'ent_1',
      name: 'Artificial General Intelligence',
      category: 'technology',
      summary: 'Initial baseline understanding',
      confidence: 70,
      firstLearnedAt: '2026-01-01T00:00:00.000Z',
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      sourcesCount: 2,
      importance: 'high',
      tags: ['ai', 'future'],
    },
  ];

  const updates = [
    {
      name: 'artificial general intelligence', // casing test
      summary: 'Updated with latest multimodal agent breakthroughs',
      sourcesCount: 3,
      tags: ['reasoning'],
    },
    {
      name: 'Quantum Topological Qubits',
      category: 'science' as const,
      summary: 'Fault-tolerant quantum error correction advance',
      confidence: 75,
      importance: 'critical' as const,
      tags: ['quantum', 'physics'],
    },
  ];

  const merged = mergeLearnedEntities(initial, updates);

  assert.equal(merged.length, 2);
  const updatedAgi = merged.find((e) => e.name.toLowerCase().includes('artificial general'));
  assert.ok(updatedAgi);
  assert.equal(updatedAgi?.sourcesCount, 5);
  assert.ok(updatedAgi!.confidence > 70);
  assert.ok(updatedAgi!.tags.includes('reasoning'));

  const newQuantum = merged.find((e) => e.name.includes('Topological'));
  assert.ok(newQuantum);
  assert.equal(newQuantum?.category, 'science');
});

test('createRelationIfMissing adds new relation or boosts weight of existing', () => {
  const initialRelations: KnowledgeRelation[] = [];
  const res1 = createRelationIfMissing(initialRelations, 'ent_1', 'ent_2', 'powers', 0.6);
  assert.equal(res1.length, 1);
  assert.equal(res1[0].weight, 0.6);

  // Repeated call should increase weight
  const res2 = createRelationIfMissing(res1, 'ent_1', 'ent_2', 'powers', 0.6);
  assert.equal(res2.length, 1);
  assert.equal(Math.round(res2[0].weight * 10) / 10, 0.7);

  // Self relation should be ignored
  const res3 = createRelationIfMissing(res2, 'ent_1', 'ent_1', 'self');
  assert.equal(res3.length, 1);
});

test('computeOverallConfidence returns average confidence', () => {
  const entities: KnowledgeEntity[] = [
    { id: '1', name: 'A', category: 'general', summary: '', confidence: 80, firstLearnedAt: '', lastUpdatedAt: '', sourcesCount: 1, importance: 'medium', tags: [] },
    { id: '2', name: 'B', category: 'general', summary: '', confidence: 90, firstLearnedAt: '', lastUpdatedAt: '', sourcesCount: 1, importance: 'medium', tags: [] },
  ];
  assert.equal(computeOverallConfidence(entities), 85);
});

test('attachMediaToLogEntry correctly embeds generated image and video metadata', () => {
  const history: EpistemicLogEntry[] = [
    {
      id: 'log_1',
      timestamp: '2026-10-16T00:00:00.000Z',
      topic: 'AI Robotics',
      headline: 'Autonomous Humanoid Breakthrough',
      insightSummary: 'Multi-joint spatial precision advance',
      confidenceDelta: 6,
      contradictionsResolved: [],
      sources: [],
      affectedEntityIds: [],
    },
  ];

  const updated = attachMediaToLogEntry(history, 'log_1', {
    imageUrl: 'data:image/png;base64,sample',
    imageSize: '4K',
    aspectRatio: '16:9',
    prompt: 'Humanoid robot in cleanroom',
  });

  assert.equal(updated[0].media?.imageSize, '4K');
  assert.equal(updated[0].media?.aspectRatio, '16:9');
  assert.equal(updated[0].media?.imageUrl, 'data:image/png;base64,sample');
});


import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCognitiveEvolution,
  generateAutonomousQuery,
  LEARNING_METHODS,
} from './learningMethods.ts';
import type { LearningState } from '../types/index.ts';

test('calculateCognitiveEvolution calculates XP and level progression properly', () => {
  const dummyState: LearningState = {
    totalCycles: 5,
    lastCycleAt: new Date().toISOString(),
    overallConfidence: 85,
    entities: [
      {
        id: '1',
        name: 'Quantum Dot',
        category: 'technology',
        summary: 'Summary',
        confidence: 90,
        firstLearnedAt: '',
        lastUpdatedAt: '',
        sourcesCount: 3,
        importance: 'high',
        tags: [],
      },
      {
        id: '2',
        name: 'Topological Insulator',
        category: 'science',
        summary: 'Summary',
        confidence: 80,
        firstLearnedAt: '',
        lastUpdatedAt: '',
        sourcesCount: 2,
        importance: 'medium',
        tags: [],
      },
    ],
    relations: [{ id: 'rel_1', sourceId: '1', targetId: '2', relationship: 'connects', weight: 0.8 }],
    history: [
      {
        id: 'log1',
        timestamp: '',
        topic: 'Quantum Physics',
        headline: 'Discovery in topological qubits',
        insightSummary: '',
        confidenceDelta: 5,
        contradictionsResolved: ['Resolved phase coherence conflict'],
        sources: [],
        affectedEntityIds: ['1', '2'],
      },
    ],
  };

  const evolution = calculateCognitiveEvolution(dummyState);
  assert.equal(typeof evolution.level, 'number');
  assert.ok(evolution.level >= 1);
  assert.ok(evolution.currentXp > 0);
  assert.ok(evolution.progressPercent >= 0 && evolution.progressPercent <= 100);
  assert.ok(evolution.levelTitleRu.length > 0);
  assert.ok(evolution.levelTitleEn.length > 0);
  assert.ok(evolution.activeGoalRu.length > 0);
});

test('generateAutonomousQuery produces non-empty queries for all methods in Russian and English', () => {
  const state: LearningState = {
    totalCycles: 10,
    lastCycleAt: new Date().toISOString(),
    overallConfidence: 88,
    entities: [
      {
        id: 'e1',
        name: 'Нейроморфные процессоры',
        category: 'technology',
        summary: 'Имитация синаптических сетей',
        confidence: 78,
        firstLearnedAt: '',
        lastUpdatedAt: '',
        sourcesCount: 2,
        importance: 'high',
        tags: ['computing'],
      },
      {
        id: 'e2',
        name: 'Квантовая криптография',
        category: 'science',
        summary: 'Квантовое распределение ключей',
        confidence: 92,
        firstLearnedAt: '',
        lastUpdatedAt: '',
        sourcesCount: 4,
        importance: 'critical',
        tags: ['security'],
      },
    ],
    relations: [],
    history: [],
  };

  const methods = ['empirical', 'dialectic', 'cross_domain', 'predictive', 'adversarial', 'adaptive'] as const;

  for (const m of methods) {
    const qRu = generateAutonomousQuery(m, state, 'ru');
    assert.ok(qRu.query.length > 5, `Expected non-empty query for method ${m} in Russian`);
    assert.ok(qRu.methodUsed, `Expected methodUsed to be defined for ${m}`);

    const qEn = generateAutonomousQuery(m, state, 'en');
    assert.ok(qEn.query.length > 5, `Expected non-empty query for method ${m} in English`);
    assert.ok(qEn.methodUsed, `Expected methodUsed to be defined for ${m}`);
  }
});

test('LEARNING_METHODS contains all 6 learning modes with Russian and English descriptions', () => {
  assert.equal(LEARNING_METHODS.length, 6);
  const ids = LEARNING_METHODS.map((m) => m.id);
  assert.deepEqual(ids, ['adaptive', 'empirical', 'dialectic', 'cross_domain', 'predictive', 'adversarial']);

  for (const method of LEARNING_METHODS) {
    assert.ok(method.titleRu.length > 0);
    assert.ok(method.titleEn.length > 0);
    assert.ok(method.shortDescRu.length > 0);
    assert.ok(method.detailRu.length > 0);
  }
});

import type { LearningState, KnowledgeEntity } from '../types/index.ts';

export type LearningMethodType =
  | 'empirical'      // Broad breaking news collection
  | 'dialectic'      // Contradiction resolution & low-confidence auditing
  | 'cross_domain'   // Multidisciplinary synthesis between distant concepts
  | 'predictive'     // Hypothesis generation & trend validation
  | 'adversarial'    // Stress-testing assumptions against counter-evidence
  | 'adaptive';      // AI automatically chooses based on developmental stage

export interface CognitiveEvolution {
  level: number;
  levelTitleRu: string;
  levelTitleEn: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  synapticDensity: number;
  activeGoalRu: string;
  activeGoalEn: string;
}

export interface LearningMethodMeta {
  id: LearningMethodType;
  titleRu: string;
  titleEn: string;
  shortDescRu: string;
  shortDescEn: string;
  detailRu: string;
  detailEn: string;
  iconName: string;
  color: string;
}

export const LEARNING_METHODS: LearningMethodMeta[] = [
  {
    id: 'adaptive',
    titleRu: 'Адаптивный эволюционный режим',
    titleEn: 'Adaptive Evolutionary Mode',
    shortDescRu: 'ИИ сам определяет метод в зависимости от пробелов в знаниях',
    shortDescEn: 'AI automatically selects method based on knowledge gaps',
    detailRu: 'Система оценивает слабые места в графе знаний и динамически переключается между поиском новостей, проверкой гипотез и разрешением противоречий.',
    detailEn: 'System assesses knowledge graph vulnerabilities and switches between empirical scanning and dialectic resolution.',
    iconName: 'Sparkles',
    color: 'from-cyan-500 to-indigo-500',
  },
  {
    id: 'empirical',
    titleRu: 'Эмпирический сбор новостей',
    titleEn: 'Empirical News Scouring',
    shortDescRu: 'Широкий мониторинг актуальных мировых событий и публикаций',
    shortDescEn: 'Broad real-time monitoring of breaking global events',
    detailRu: 'Сканирование свежих новостей по ключевым дисциплинам для обнаружения новых сущностей и первичного накопления фактов.',
    detailEn: 'Broad ingestion of breaking news across science and tech for initial entity gathering.',
    iconName: 'Globe',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'dialectic',
    titleRu: 'Разрешение противоречий',
    titleEn: 'Dialectic Contradiction Resolution',
    shortDescRu: 'Фокус на спорных фактах и сущностях с низкой уверенностью',
    shortDescEn: 'Targeted focus on disputed facts and low-confidence entities',
    detailRu: 'ИИ находит в своей базе понятия с уверенностью ниже 85% или нестыковки в отчётах и целенаправленно ищет опровержения или подтверждения.',
    detailEn: 'Targets entities with confidence <85% or disputed reports to resolve ambiguities.',
    iconName: 'ShieldAlert',
    color: 'from-amber-500 to-rose-500',
  },
  {
    id: 'cross_domain',
    titleRu: 'Межотраслевой синтез',
    titleEn: 'Cross-Domain Relational Synthesis',
    shortDescRu: 'Поиск скрытых связей между несвязанными областями науки',
    shortDescEn: 'Discovery of hidden links between disparate disciplines',
    detailRu: 'Анализ пересечений между далёкими узлами графа (например, биотехнологии + кремниевая фотоника) для выявления междисциплинарных прорывов.',
    detailEn: 'Synthesizes connections between distant graph nodes to discover interdisciplinary breakthroughs.',
    iconName: 'Network',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'predictive',
    titleRu: 'Прогностическая валидация',
    titleEn: 'Predictive Hypothesis Testing',
    shortDescRu: 'Формулирование гипотез и поиск ранних сигналов трендов',
    shortDescEn: 'Hypothesis formulation and early trend signal detection',
    detailRu: 'ИИ экстраполирует существующие тренды, выдвигает гипотезу о следующем шаге развития и сканирует интернет на наличие первых свидетельств.',
    detailEn: 'Extrapolates trends into forward-looking hypotheses and scours the web for corroborating signals.',
    iconName: 'TrendingUp',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'adversarial',
    titleRu: 'Критический аудит и стресс-тест',
    titleEn: 'Adversarial Verification & Stress-Test',
    shortDescRu: 'Проверка устоявшихся фактов на опровержения и критику',
    shortDescEn: 'Rigorous testing of high-confidence facts against counter-evidence',
    detailRu: 'Попытка опровергнуть собственные предположения с целью отсеивания хайпа, недостоверных новостей и эффекта эхо-камеры.',
    detailEn: 'Actively searches for debunking analyses and criticisms of established high-confidence nodes.',
    iconName: 'Scale',
    color: 'from-rose-500 to-amber-600',
  },
];

const COGNITIVE_LEVELS = [
  {
    level: 1,
    titleRu: 'Уровень 1: Сенсорная инкубация',
    titleEn: 'Level 1: Sensory Incubation',
    threshold: 0,
    goalRu: 'Накопление базового понятийного аппарата и первичных источников',
    goalEn: 'Accumulating baseline concept vocabulary and primary sources',
  },
  {
    level: 2,
    titleRu: 'Уровень 2: Семантическая ассоциация',
    titleEn: 'Level 2: Semantic Association',
    threshold: 50,
    goalRu: 'Построение перекрёстных связей и корреляций между дисциплинами',
    goalEn: 'Forming cross-disciplinary links and relational correlations',
  },
  {
    level: 3,
    titleRu: 'Уровень 3: Эпистемический синтез',
    titleEn: 'Level 3: Epistemic Synthesis',
    threshold: 130,
    goalRu: 'Активное разрешение противоречий и фильтрация дезинформации',
    goalEn: 'Active contradiction resolution and misinformation filtering',
  },
  {
    level: 4,
    titleRu: 'Уровень 4: Прогностическое моделирование',
    titleEn: 'Level 4: Predictive Modeling',
    threshold: 250,
    goalRu: 'Выдвижение самостоятельных гипотез и валидация долгосрочных трендов',
    goalEn: 'Independent hypothesis formulation and long-term trend validation',
  },
  {
    level: 5,
    titleRu: 'Уровень 5: Автономный мета-разум',
    titleEn: 'Level 5: Autonomous Meta-Intelligence',
    threshold: 420,
    goalRu: 'Саморефлексия, аудит архитектуры знаний и междисциплинарные инсайты',
    goalEn: 'Self-reflection, architectural audit, and systemic breakthroughs',
  },
];

export function calculateCognitiveEvolution(state: LearningState): CognitiveEvolution {
  // Score based on cycles, entities, relations and resolved contradictions
  const contradictionsCount = state.history.reduce(
    (acc, curr) => acc + (curr.contradictionsResolved?.length || 0),
    0
  );

  const xp =
    state.totalCycles * 10 +
    state.entities.length * 5 +
    state.relations.length * 8 +
    contradictionsCount * 12;

  let currentLevel = COGNITIVE_LEVELS[0];
  let nextLevel = COGNITIVE_LEVELS[1];

  for (let i = COGNITIVE_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= COGNITIVE_LEVELS[i].threshold) {
      currentLevel = COGNITIVE_LEVELS[i];
      nextLevel = COGNITIVE_LEVELS[i + 1] || {
        level: currentLevel.level + 1,
        titleRu: 'Трансцендентный когнитивный синтез',
        titleEn: 'Transcendent Cognitive Synthesis',
        threshold: currentLevel.threshold + 200,
        goalRu: 'Глобальная системная когерентность',
        goalEn: 'Global systemic coherence',
      };
      break;
    }
  }

  const range = nextLevel.threshold - currentLevel.threshold;
  const progressInLevel = Math.max(0, xp - currentLevel.threshold);
  const progressPercent = Math.min(100, Math.round((progressInLevel / (range || 1)) * 100));

  const synapticDensity = Math.round(
    ((state.relations.length * 2) / Math.max(1, state.entities.length)) * 100
  ) / 100;

  return {
    level: currentLevel.level,
    levelTitleRu: currentLevel.titleRu,
    levelTitleEn: currentLevel.titleEn,
    currentXp: xp,
    nextLevelXp: nextLevel.threshold,
    progressPercent,
    synapticDensity,
    activeGoalRu: currentLevel.goalRu,
    activeGoalEn: currentLevel.goalEn,
  };
}

export function generateAutonomousQuery(
  method: LearningMethodType,
  state: LearningState,
  language: 'ru' | 'en' = 'ru'
): { query: string; rationale: string; methodUsed: LearningMethodType } {
  const isRu = language === 'ru';
  let effectiveMethod = method;

  if (method === 'adaptive') {
    // Determine the most needed method based on state:
    // If we have low-confidence entities (<85), run dialectic
    const lowConf = state.entities.filter((e) => e.confidence < 86);
    if (lowConf.length > 0 && Math.random() < 0.4) {
      effectiveMethod = 'dialectic';
    } else if (state.entities.length >= 4 && state.relations.length < state.entities.length * 1.2) {
      effectiveMethod = 'cross_domain';
    } else if (state.totalCycles % 3 === 0) {
      effectiveMethod = 'predictive';
    } else {
      effectiveMethod = 'empirical';
    }
  }

  if (effectiveMethod === 'dialectic') {
    // Pick entity with lowest confidence or random entity to clarify
    const sorted = [...state.entities].sort((a, b) => a.confidence - b.confidence);
    const target = sorted[0];
    if (target) {
      return {
        query: isRu
          ? `Противоречия, нерешённые проблемы и последние тесты: ${target.name}`
          : `Contradictions, unresolved challenges and latest replication: ${target.name}`,
        rationale: isRu
          ? `Углублённое исследование спорных аспектов концепции "${target.name}" для повышения точности базы знаний.`
          : `Targeted investigation of ambiguities in "${target.name}" to strengthen knowledge certainty.`,
        methodUsed: 'dialectic',
      };
    }
  }

  if (effectiveMethod === 'cross_domain' && state.entities.length >= 2) {
    // Pick two entities from different categories
    const e1 = state.entities[Math.floor(Math.random() * state.entities.length)];
    const otherCandidates = state.entities.filter((e) => e.category !== e1.category);
    const e2 = otherCandidates.length > 0
      ? otherCandidates[Math.floor(Math.random() * otherCandidates.length)]
      : state.entities[(state.entities.indexOf(e1) + 1) % state.entities.length];

    return {
      query: isRu
        ? `Взаимосвязь и совместное применение: ${e1.name} и ${e2.name}`
        : `Interdisciplinary convergence between ${e1.name} and ${e2.name}`,
      rationale: isRu
        ? `Синтез скрытых связей между сферами "${e1.category}" и "${e2.category}".`
        : `Synthesizing emergent links between ${e1.category} and ${e2.category}.`,
      methodUsed: 'cross_domain',
    };
  }

  if (effectiveMethod === 'predictive') {
    const randomEntity = state.entities[Math.floor(Math.random() * state.entities.length)];
    const topic = randomEntity ? randomEntity.name : (isRu ? 'Искусственный интеллект и робототехника' : 'Artificial Intelligence');
    return {
      query: isRu
        ? `Прогнозы развития, дорожная карта и будущие вехи: ${topic}`
        : `Future technological roadmap and emerging milestones: ${topic}`,
      rationale: isRu
        ? `Проверка опережающих индикаторов и прогнозных трендов по направлению "${topic}".`
        : `Testing leading indicators and future trends for "${topic}".`,
      methodUsed: 'predictive',
    };
  }

  if (effectiveMethod === 'adversarial') {
    const highestConf = [...state.entities].sort((a, b) => b.confidence - a.confidence)[0];
    const topic = highestConf ? highestConf.name : (isRu ? 'Квантовые вычисления' : 'Quantum Computing');
    return {
      query: isRu
        ? `Критика, ограничения, скептические статьи и опровержения: ${topic}`
        : `Criticism, practical limitations, skeptical review and failure modes: ${topic}`,
      rationale: isRu
        ? `Стресс-тестирование высокодостоверной концепции "${topic}" на наличие скрытых уязвимостей.`
        : `Stress-testing high-confidence assumption "${topic}" against counter-arguments.`,
      methodUsed: 'adversarial',
    };
  }

  // Empirical fallback
  const fallbackTopicsRu = [
    'Квантовые сенсоры и новые физические платформы 2026',
    'Автономные мультиагентные системы в космических миссиях',
    'Твердотельные электролиты и сверхбыстрая зарядка аккумуляторов',
    'Белковый дизайн через генеративные модели в синтетической биологии',
    'Фотонные интерферометрические вычисления в суперкомпьютерах',
  ];
  const fallbackTopicsEn = [
    'Quantum sensors and novel physics experimental breakthroughs',
    'Autonomous multi-agent swarms in space exploration',
    'Solid-state electrolytes and ultra-fast battery charging',
    'Generative de novo protein design in synthetic biology',
    'Photonic interferometric computing architectures',
  ];
  const list = isRu ? fallbackTopicsRu : fallbackTopicsEn;
  const chosen = list[state.totalCycles % list.length];

  return {
    query: chosen,
    rationale: isRu
      ? `Широкий эмпирический поиск свежих мировых публикаций по направлению "${chosen}".`
      : `Broad empirical intake of fresh global reports regarding "${chosen}".`,
    methodUsed: 'empirical',
  };
}

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  Clock,
  BookOpen,
  Clapperboard,
  Film,
  Play,
  Download,
} from 'lucide-react';
import type { LearningState, KnowledgeEntity, EpistemicLogEntry } from '../types/index.ts';
import { DICTIONARY, type Language } from '../utils/i18n.ts';
import { CognitiveEvolutionBar } from './CognitiveEvolutionBar.tsx';
import type { CognitiveEvolution, LearningMethodType } from '../utils/learningMethods.ts';

interface LearningCoreProps {
  language: Language;
  learningState: LearningState;
  isLearning: boolean;
  learningStage: string;
  evolution: CognitiveEvolution;
  learningMethod: LearningMethodType;
  onSelectMethod: (method: LearningMethodType) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  countdownSeconds: number;
  intervalSeconds: number;
  onChangeInterval: (sec: number) => void;
  onStepOnce: () => void;
  activeAutonomousTopic?: string;
  onExecuteLearn: (topic: string) => Promise<void>;
  onSelectEntity: (entity: KnowledgeEntity) => void;
  onNavigateToStudio: (prompt: string) => void;
  onNavigateToVideo: (prompt: string, imageUrl?: string) => void;
  onAutoGenerateMedia: (entry: EpistemicLogEntry) => void;
  onResetKnowledge: () => void;
}

const PRESET_TOPICS_RU = [
  'Архитектуры мультимодальных агентов ИИ и пространственный интеллект',
  'Коммерческий термоядерный синтез и высокотемпературные магниты',
  'Квантовая коррекция ошибок и неабелевы топологические кубиты',
  'Спектроскопический поиск биомаркеров в экзоатмосферах планет',
  'Твердотельные аккумуляторы и декарбонизация распределённых сетей',
  'Инженерная синтетическая биология и прямое связывание углерода',
];

const PRESET_TOPICS_EN = [
  'Global AI Agent Architectures & Spatial Intelligence',
  'Commercial Nuclear Fusion & High-Field Superconductors',
  'Quantum Computing Error Correction & Topological Qubits',
  'Deep Space Biosignatures & Exoplanet Discoveries',
  'Next-Gen Solid-State Battery & Grid Decarbonization',
  'Engineered Synthetic Biology & Carbon Sequestration',
];

export const LearningCore: React.FC<LearningCoreProps> = ({
  language,
  learningState,
  isLearning,
  learningStage,
  evolution,
  learningMethod,
  onSelectMethod,
  isRunning,
  onToggleRunning,
  countdownSeconds,
  intervalSeconds,
  onChangeInterval,
  onStepOnce,
  activeAutonomousTopic,
  onExecuteLearn,
  onSelectEntity,
  onNavigateToStudio,
  onNavigateToVideo,
  onAutoGenerateMedia,
  onResetKnowledge,
}) => {
  const t = DICTIONARY[language];
  const presets = language === 'ru' ? PRESET_TOPICS_RU : PRESET_TOPICS_EN;

  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(presets[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topicToRun = customTopic.trim() || selectedTopic;
    if (topicToRun && !isLearning) {
      onExecuteLearn(topicToRun);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Cognitive Evolution & Start/Pause Control Console */}
      <CognitiveEvolutionBar
        language={language}
        evolution={evolution}
        currentMethod={learningMethod}
        onSelectMethod={onSelectMethod}
        isRunning={isRunning}
        onToggleRunning={onToggleRunning}
        countdownSeconds={countdownSeconds}
        intervalSeconds={intervalSeconds}
        onChangeInterval={onChangeInterval}
        onStepOnce={onStepOnce}
        isLearning={isLearning}
        activeAutonomousTopic={activeAutonomousTopic}
      />
      {/* Hero / Autonomous Scanner Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300 border border-cyan-500/30">
                  <Zap className="h-3 w-3 text-cyan-400" /> {t.groundingActive}
                </span>
                <span className="text-xs text-zinc-400">
                  {t.updatedAt}: {learningState.lastCycleAt ? new Date(learningState.lastCycleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                {t.heroTitle}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-zinc-400 leading-relaxed">
                {t.heroDesc}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">{t.learnedConcepts}</div>
                <div className="text-lg font-bold text-white font-mono">{learningState.entities.length}</div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">{t.semanticLinks}</div>
                <div className="text-lg font-bold text-cyan-400 font-mono">{learningState.relations.length}</div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">{t.avgConfidence}</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{learningState.overallConfidence}%</div>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center">
                <div className="text-xs text-zinc-400">{t.learningCycles}</div>
                <div className="text-lg font-bold text-indigo-400 font-mono">{learningState.totalCycles}</div>
              </div>
            </div>
          </div>

          {/* Trigger Box Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLearning}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/25 hover:from-cyan-500 hover:to-indigo-500 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLearning ? 'animate-spin' : ''}`} />
                <span>{isLearning ? t.analyzingNews : t.scourButton}</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-zinc-400 mr-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-cyan-400" /> {t.trendingTopics}
              </span>
              {presets.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setCustomTopic(topic);
                    setSelectedTopic(topic);
                  }}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                    customTopic === topic || (!customTopic && selectedTopic === topic)
                      ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {topic.length > 34 ? topic.slice(0, 32) + '...' : topic}
                </button>
              ))}
            </div>
          </form>

          {/* Real-Time Learning In-Progress Progress Banner */}
          {isLearning && (
            <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-5 w-5 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cyan-300">{t.learningInProgress}</span>
                    <span className="font-mono text-cyan-400 animate-pulse">{learningStage || t.analyzingNews}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid: Epistemic History & Knowledge Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Epistemic History Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">{t.epistemicLog}</h3>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 font-mono">
                {learningState.history.length} {t.cyclesRecorded}
              </span>
            </div>
            <button
              type="button"
              onClick={onResetKnowledge}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
              title="Reset knowledge base to default seeds"
            >
              {t.resetToSeeds}
            </button>
          </div>

          <div className="space-y-4">
            {learningState.history.map((entry) => (
              <article
                key={entry.id}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/90 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                    {entry.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                      <TrendingUp className="h-3 w-3" /> +{entry.confidenceDelta}% {t.confidenceBoost}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <h4 className="mt-2 text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {entry.headline}
                </h4>
                <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                  {entry.insightSummary}
                </p>

                {/* Contradictions & Revisions */}
                {entry.contradictionsResolved && entry.contradictionsResolved.length > 0 && (
                  <div className="mt-3 rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{t.contradictionsResolved}</span>
                    </div>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-xs text-indigo-200/90">
                      {entry.contradictionsResolved.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Autonomously Generated Media Block if present */}
                {entry.media && (
                  <div className="mt-4 rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-3 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Clapperboard className="h-3.5 w-3.5" />
                        <span>{t.attachedMedia}</span>
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {entry.media.imageSize || '4K'} • {entry.media.aspectRatio || '16:9'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Image preview */}
                      {entry.media.imageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                          <img
                            src={entry.media.imageUrl}
                            alt={entry.media.prompt || entry.headline}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300">
                            {entry.media.imageSize || '4K'} AI Image
                          </span>
                        </div>
                      )}

                      {/* Video Player or Polling */}
                      {entry.media.videoUrl ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                          <video
                            src={entry.media.videoUrl}
                            controls
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : entry.media.isGeneratingVideo ? (
                        <div className="aspect-video rounded-lg border border-dashed border-emerald-500/50 bg-emerald-950/20 flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                          <Film className="h-5 w-5 text-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-medium text-emerald-300">
                            Veo генерирует видео в фоне...
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">
                            veo-3.1-fast-generate-preview
                          </span>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center p-3 text-center">
                          <button
                            type="button"
                            onClick={() => onNavigateToVideo(`Cinematic dynamic movement of ${entry.headline}`, entry.media?.imageUrl)}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md"
                          >
                            <Play className="h-3 w-3" />
                            <span>Анимировать с Veo</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grounded Sources */}
                {entry.sources && entry.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/80">
                    <div className="text-xs text-zinc-400 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                      <span>{t.groundedSources}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded bg-zinc-800/90 hover:bg-zinc-700/80 px-2 py-1 text-xs text-cyan-300 transition-colors border border-zinc-700/60"
                        >
                          <span className="max-w-[200px] truncate">{src.title}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autonomous Media Generation & Visual CTAs */}
                <div className="mt-4 pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
                  {/* Autonomous AI Media generation button */}
                  <button
                    type="button"
                    onClick={() => onAutoGenerateMedia(entry)}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t.autoGenerateMediaNow}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToStudio(`Visual editorial representation of: ${entry.headline}`)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>{t.generateVisualForInsight}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Newly Learned Entities / Concepts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">{t.activeKnowledgeCore}</h3>
            </div>
            <span className="text-xs text-zinc-400">
              {learningState.entities.length} {t.conceptsCount}
            </span>
          </div>

          <div className="space-y-3">
            {learningState.entities.slice(0, 8).map((entity) => (
              <div
                key={entity.id}
                onClick={() => onSelectEntity(entity)}
                className="cursor-pointer rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-4 transition-all hover:border-cyan-500/50 hover:bg-zinc-900 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white hover:text-cyan-300 transition-colors">
                    {entity.name}
                  </h4>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 uppercase">
                    {t[entity.category as keyof typeof t] || entity.category}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                  {entity.summary}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                    <span>{entity.confidence}%</span>
                    <span className="text-zinc-500 text-[10px]">{t.confidenceLevel}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {entity.sourcesCount} {t.corroboratedSources}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {entity.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

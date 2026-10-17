import React from 'react';
import {
  X,
  TrendingUp,
  Link2,
  Sparkles,
  Clapperboard,
  MessageSquareText,
  CheckCircle2,
} from 'lucide-react';
import type { KnowledgeEntity, LearningState } from '../types/index.ts';
import { DICTIONARY, type Language } from '../utils/i18n.ts';

interface EntityDetailModalProps {
  language: Language;
  entity: KnowledgeEntity | null;
  learningState: LearningState;
  onClose: () => void;
  onNavigateToStudio: (prompt: string) => void;
  onNavigateToVideo: (prompt: string) => void;
  onAskAboutEntity: (question: string) => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  language,
  entity,
  learningState,
  onClose,
  onNavigateToStudio,
  onNavigateToVideo,
  onAskAboutEntity,
}) => {
  if (!entity) return null;
  const t = DICTIONARY[language];

  const connectedRelations = learningState.relations.filter(
    (r) => r.sourceId === entity.id || r.targetId === entity.id
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl text-zinc-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label={t.closeModal}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono text-cyan-300 uppercase">
              {t[entity.category as keyof typeof t] || entity.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" /> {entity.confidence}% {t.confidenceLevel}
            </span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-white tracking-tight">
            {entity.name}
          </h3>
        </div>

        {/* Confidence Gauge */}
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>{t.corroborationConfidence}</span>
            <span className="font-mono text-white">{entity.confidence} / 100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
              style={{ width: `${entity.confidence}%` }}
            />
          </div>
        </div>

        {/* Synthesized Summary */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
          <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.synthesizedStatus}</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">
            {entity.summary}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
            <div className="text-[10px] text-zinc-400">{t.corroboratedSources}</div>
            <div className="font-mono font-bold text-white text-sm mt-0.5">{entity.sourcesCount}</div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
            <div className="text-[10px] text-zinc-400">{t.strategicPriority}</div>
            <div className="font-mono font-bold text-cyan-300 text-sm mt-0.5 capitalize">{entity.importance}</div>
          </div>
        </div>

        {/* Connected Semantic Relations */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.semanticConnections}</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {connectedRelations.length > 0 ? (
              connectedRelations.map((rel) => {
                const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
                const otherEntity = learningState.entities.find((e) => e.id === otherId);
                return (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-1.5 text-xs border border-zinc-800"
                  >
                    <span className="text-white font-medium">{otherEntity?.name || 'Related Node'}</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{rel.relationship} ({Math.round(rel.weight * 100)}%)</span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-zinc-500 italic">{t.noConnections}</div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToStudio(
                language === 'ru'
                  ? `Научная редакционная визуализация: ${entity.name}. ${entity.summary}`
                  : `Scientific editorial render of ${entity.name}: ${entity.summary}`
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white transition-all shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.generateImageBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToVideo(
                language === 'ru'
                  ? `Динамическое кинематографичное движение: ${entity.name}`
                  : `Dynamic cinematic motion of ${entity.name}`
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-semibold text-white transition-all shadow-md"
          >
            <Clapperboard className="h-3.5 w-3.5" />
            <span>{t.animateWithVeoBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAboutEntity(
                language === 'ru'
                  ? `Какие ключевые недавние открытия и перспективы связаны с темой: ${entity.name}?`
                  : `What are the key recent developments and future outlook for ${entity.name}?`
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-semibold text-white transition-all"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            <span>{t.queryMemoryBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

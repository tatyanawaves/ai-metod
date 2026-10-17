import React, { useState, useMemo } from 'react';
import {
  Network,
  Search,
  Sparkles,
  Clapperboard,
  MessageSquareText,
  TrendingUp,
  Link2,
  Info,
} from 'lucide-react';
import type { LearningState, KnowledgeEntity, CategoryType } from '../types/index.ts';
import { DICTIONARY, type Language } from '../utils/i18n.ts';

interface KnowledgeGraphViewProps {
  language: Language;
  learningState: LearningState;
  onSelectEntity: (entity: KnowledgeEntity) => void;
  onNavigateToStudio: (prompt: string) => void;
  onNavigateToVideo: (imagePrompt: string) => void;
  onAskAboutEntity: (question: string) => void;
}

const CATEGORY_COLORS: Record<CategoryType, { bg: string; border: string; text: string; dot: string }> = {
  technology: { bg: 'bg-cyan-950/60', border: 'border-cyan-500/50', text: 'text-cyan-300', dot: '#06b6d4' },
  science: { bg: 'bg-indigo-950/60', border: 'border-indigo-500/50', text: 'text-indigo-300', dot: '#6366f1' },
  economy: { bg: 'bg-amber-950/60', border: 'border-amber-500/50', text: 'text-amber-300', dot: '#f59e0b' },
  geopolitics: { bg: 'bg-rose-950/60', border: 'border-rose-500/50', text: 'text-rose-300', dot: '#f43f5e' },
  environment: { bg: 'bg-emerald-950/60', border: 'border-emerald-500/50', text: 'text-emerald-300', dot: '#10b981' },
  general: { bg: 'bg-zinc-900', border: 'border-zinc-600', text: 'text-zinc-300', dot: '#a1a1aa' },
};

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  language,
  learningState,
  onSelectEntity,
  onNavigateToStudio,
  onNavigateToVideo,
  onAskAboutEntity,
}) => {
  const t = DICTIONARY[language];
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    learningState.entities[0]?.id || null
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntities = useMemo(() => {
    return learningState.entities.filter((e) => {
      const matchCat = filterCategory === 'all' || e.category === filterCategory;
      const matchQuery =
        !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [learningState.entities, filterCategory, searchQuery]);

  const selectedEntity = useMemo(() => {
    return learningState.entities.find((e) => e.id === selectedEntityId) || learningState.entities[0] || null;
  }, [learningState.entities, selectedEntityId]);

  // Connected relations for the selected entity
  const connectedRelations = useMemo(() => {
    if (!selectedEntity) return [];
    return learningState.relations.filter(
      (r) => r.sourceId === selectedEntity.id || r.targetId === selectedEntity.id
    );
  }, [learningState.relations, selectedEntity]);

  // Pre-calculate circular node layout coordinates for SVG visualization
  const graphNodesWithPos = useMemo(() => {
    const nodes = filteredEntities;
    const count = nodes.length;
    const centerX = 400;
    const centerY = 280;
    const radius = Math.min(230, Math.max(160, count * 22));

    return nodes.map((node, i) => {
      const angle = (i / (count || 1)) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...node, x, y };
    });
  }, [filteredEntities]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-400" />
            <span>{t.interactiveGraphTitle}</span>
          </h2>
          <p className="text-xs text-zinc-400">
            {t.interactiveGraphDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchGraphPlaceholder}
              className="rounded-lg border border-zinc-700 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">{t.allDomains}</option>
            <option value="technology">{t.technology}</option>
            <option value="science">{t.science}</option>
            <option value="economy">{t.economy}</option>
            <option value="geopolitics">{t.geopolitics}</option>
            <option value="environment">{t.environment}</option>
          </select>
        </div>
      </div>

      {/* Main Visualizer Area & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Graph Canvas (2 Cols) */}
        <div className="lg:col-span-2 relative rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[480px]">
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <svg
            viewBox="0 0 800 560"
            className="w-full h-auto max-h-[520px] select-none"
          >
            {/* Render lines for relations */}
            {learningState.relations.map((rel) => {
              const src = graphNodesWithPos.find((n) => n.id === rel.sourceId);
              const tgt = graphNodesWithPos.find((n) => n.id === rel.targetId);
              if (!src || !tgt) return null;

              const isConnectedToSelected =
                selectedEntity && (rel.sourceId === selectedEntity.id || rel.targetId === selectedEntity.id);

              return (
                <g key={rel.id} className="transition-all">
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isConnectedToSelected ? '#06b6d4' : '#3f3f46'}
                    strokeWidth={isConnectedToSelected ? 2.5 : 1}
                    strokeDasharray={isConnectedToSelected ? 'none' : '4 4'}
                    opacity={isConnectedToSelected ? 0.9 : 0.4}
                  />
                  {isConnectedToSelected && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 6}
                      fill="#67e8f9"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-mono font-semibold"
                    >
                      {rel.relationship} ({Math.round(rel.weight * 100)}%)
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {graphNodesWithPos.map((node) => {
              const isSelected = selectedEntity?.id === node.id;
              const colorInfo = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.general;

              return (
                <g
                  key={node.id}
                  onClick={() => {
                    setSelectedEntityId(node.id);
                    onSelectEntity(node);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Halo pulse when selected */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={30}
                      fill={colorInfo.dot}
                      opacity={0.2}
                      className="animate-ping"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 22 : 16}
                    fill="#18181b"
                    stroke={isSelected ? '#22d3ee' : colorInfo.dot}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-300 group-hover:scale-110"
                  />

                  {/* Inner Confidence Dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 6 : 4}
                    fill={colorInfo.dot}
                  />

                  {/* Node Label */}
                  <text
                    x={node.x}
                    y={node.y + (isSelected ? 34 : 28)}
                    fill={isSelected ? '#ffffff' : '#d4d4d8'}
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-md select-none"
                  >
                    {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick instructions indicator */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[11px] text-zinc-500">
            <Info className="h-3.5 w-3.5" />
            <span>{t.clickNodeHint}</span>
          </div>
        </div>

        {/* Selected Entity Inspector (1 Col) */}
        <div className="space-y-4">
          {selectedEntity ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-cyan-300 uppercase">
                    {t[selectedEntity.category as keyof typeof t] || selectedEntity.category}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {selectedEntity.confidence}% {t.confidenceLevel}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {selectedEntity.name}
                </h3>
              </div>

              {/* Confidence Bar */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{t.corroborationConfidence}</span>
                  <span className="font-mono text-white">{selectedEntity.confidence} / 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${selectedEntity.confidence}%` }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <div className="text-xs font-semibold text-zinc-400 mb-1">{t.synthesizedStatus}</div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                  {selectedEntity.summary}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-zinc-950/50 p-2 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-500">{t.corroboratedSources}</div>
                  <div className="font-mono font-semibold text-zinc-200">{selectedEntity.sourcesCount}</div>
                </div>
                <div className="rounded-lg bg-zinc-950/50 p-2 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-500">{t.strategicPriority}</div>
                  <div className="font-mono font-semibold text-cyan-300 capitalize">{selectedEntity.importance}</div>
                </div>
              </div>

              {/* Connected relations */}
              <div>
                <div className="text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t.semanticConnections} ({connectedRelations.length})</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                  {connectedRelations.length > 0 ? (
                    connectedRelations.map((rel) => {
                      const otherId = rel.sourceId === selectedEntity.id ? rel.targetId : rel.sourceId;
                      const otherEntity = learningState.entities.find((e) => e.id === otherId);
                      return (
                        <div
                          key={rel.id}
                          onClick={() => otherEntity && setSelectedEntityId(otherEntity.id)}
                          className="cursor-pointer rounded-lg bg-zinc-950/60 p-2 text-xs border border-zinc-800 hover:border-cyan-500/40 transition-colors"
                        >
                          <div className="font-medium text-white flex items-center justify-between">
                            <span>{otherEntity?.name || 'Related Concept'}</span>
                            <span className="text-[10px] font-mono text-cyan-400">{rel.relationship}</span>
                          </div>
                          {rel.description && (
                            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{rel.description}</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-zinc-500 italic p-2">{t.noConnections}</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    onNavigateToStudio(
                      language === 'ru'
                        ? `Научная редакционная визуализация: ${selectedEntity.name}. ${selectedEntity.summary}`
                        : `Futuristic scientific visualization of ${selectedEntity.name}: ${selectedEntity.summary}`
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.generateImageBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigateToVideo(
                      language === 'ru'
                        ? `Плавное кинематографичное движение концепции: ${selectedEntity.name}`
                        : `Cinematic dynamic motion of ${selectedEntity.name}`
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all"
                >
                  <Clapperboard className="h-3.5 w-3.5" />
                  <span>{t.animateWithVeoBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAskAboutEntity(
                      language === 'ru'
                        ? `Какие самые актуальные подтверждённые факты и выводы известны по теме: ${selectedEntity.name}?`
                        : `What are the most recent verified news facts and implications of ${selectedEntity.name}?`
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all"
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  <span>{t.queryMemoryBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-400 text-xs">
              {t.clickNodeHint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

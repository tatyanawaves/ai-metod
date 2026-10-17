import React from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Globe,
  ShieldAlert,
  Network,
  TrendingUp,
  Scale,
  Brain,
  Clock,
  Compass,
  Zap,
} from 'lucide-react';
import {
  LEARNING_METHODS,
  type LearningMethodType,
  type CognitiveEvolution,
} from '../utils/learningMethods.ts';
import { DICTIONARY, type Language } from '../utils/i18n.ts';

interface CognitiveEvolutionBarProps {
  language: Language;
  evolution: CognitiveEvolution;
  currentMethod: LearningMethodType;
  onSelectMethod: (method: LearningMethodType) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  countdownSeconds: number;
  intervalSeconds: number;
  onChangeInterval: (sec: number) => void;
  onStepOnce: () => void;
  isLearning: boolean;
  activeAutonomousTopic?: string;
}

export const CognitiveEvolutionBar: React.FC<CognitiveEvolutionBarProps> = ({
  language,
  evolution,
  currentMethod,
  onSelectMethod,
  isRunning,
  onToggleRunning,
  countdownSeconds,
  intervalSeconds,
  onChangeInterval,
  onStepOnce,
  isLearning,
  activeAutonomousTopic,
}) => {
  const t = DICTIONARY[language];
  const isRu = language === 'ru';

  const methodIcons: Record<string, React.ReactNode> = {
    Sparkles: <Sparkles className="h-4 w-4" />,
    Globe: <Globe className="h-4 w-4" />,
    ShieldAlert: <ShieldAlert className="h-4 w-4" />,
    Network: <Network className="h-4 w-4" />,
    TrendingUp: <TrendingUp className="h-4 w-4" />,
    Scale: <Scale className="h-4 w-4" />,
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-xl space-y-5">
      {/* Top Row: AI Cognitive Maturity & XP Progress */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono text-xs font-bold">
              {evolution.level}
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isRu ? evolution.levelTitleRu : evolution.levelTitleEn}</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {evolution.currentXp} {t.xp}
              </span>
            </h3>
          </div>
          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>
              {isRu ? 'Текущий вектор развития:' : 'Active developmental focus:'}{' '}
              <span className="text-zinc-200">{isRu ? evolution.activeGoalRu : evolution.activeGoalEn}</span>
            </span>
          </p>
        </div>

        {/* Progress Bar & Synaptic Density */}
        <div className="w-full lg:w-72 space-y-1.5">
          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>Прогресс уровня</span>
            <span>{evolution.progressPercent}% ({evolution.currentXp}/{evolution.nextLevelXp})</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${evolution.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono pt-0.5">
            <span>{t.synapticDensity}: {evolution.synapticDensity}</span>
            <span>{isRu ? 'Самоадаптация активна' : 'Self-adaptation active'}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Play/Pause Autonomous Button & Live Countdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          {/* Main Play / Pause Button requested by user */}
          <button
            type="button"
            onClick={onToggleRunning}
            className={`flex items-center justify-center gap-2.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                <span>{t.pauseAutonomous}</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{t.startAutonomous}</span>
              </>
            )}
          </button>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono font-semibold border ${
                isRunning
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-950/40 text-amber-300'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isRunning ? t.activeBadge : t.pausedBadge}
            </span>

            {isRunning && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 font-mono">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>{t.nextSearchIn}</span>
                <span className="font-bold text-white">{countdownSeconds} {t.sec}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side controls: Step Once & Interval Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Interval dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="hidden md:inline">{t.cycleInterval}</span>
            <select
              value={intervalSeconds}
              onChange={(e) => onChangeInterval(Number(e.target.value))}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={15}>15 {t.sec}</option>
              <option value={30}>30 {t.sec}</option>
              <option value={60}>60 {t.sec}</option>
              <option value={120}>120 {t.sec}</option>
            </select>
          </div>

          {/* Step Once button */}
          <button
            type="button"
            onClick={onStepOnce}
            disabled={isLearning}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors disabled:opacity-50"
            title={isRu ? 'Выполнить один шаг автономного поиска прямо сейчас' : 'Trigger one autonomous cycle immediately'}
          >
            <Zap className={`h-3.5 w-3.5 text-cyan-400 ${isLearning ? 'animate-spin' : ''}`} />
            <span>{isRu ? '1 шаг сейчас' : 'Step Once'}</span>
          </button>
        </div>
      </div>

      {/* Autonomous live direction notice if active */}
      {isRunning && activeAutonomousTopic && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-zinc-400">{isRu ? 'ИИ готовит следующий поисковый запрос:' : 'AI preparing next inquiry:'}</span>
            <span className="font-medium text-cyan-300">"{activeAutonomousTopic}"</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{isRu ? 'на основе развития базы' : 'derived from knowledge state'}</span>
        </div>
      )}

      {/* Bottom Section: Multiple Learning Methods Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t.learningMethod}</span>
          </span>
          <span className="text-[11px] text-zinc-500">
            {isRu ? 'Выберите парадигму или оставьте адаптивный режим' : 'Select paradigm or keep adaptive'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {LEARNING_METHODS.map((method) => {
            const isSelected = currentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectMethod(method.id)}
                className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-500/40'
                    : 'border-zinc-800/90 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className={`p-1.5 rounded-lg bg-zinc-800 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`}>
                    {methodIcons[method.iconName] || <Brain className="h-4 w-4" />}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                  )}
                </div>

                <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                  {isRu ? method.titleRu : method.titleEn}
                </div>
                <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                  {isRu ? method.shortDescRu : method.shortDescEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected method detail description */}
        {(() => {
          const selectedMeta = LEARNING_METHODS.find((m) => m.id === currentMethod);
          if (!selectedMeta) return null;
          return (
            <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-[11px] text-zinc-300 border border-zinc-800 flex items-center gap-2">
              <span className="font-semibold text-cyan-300 font-mono shrink-0">
                [{isRu ? selectedMeta.titleRu : selectedMeta.titleEn}]:
              </span>
              <span>{isRu ? selectedMeta.detailRu : selectedMeta.detailEn}</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

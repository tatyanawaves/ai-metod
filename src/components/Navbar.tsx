import React from 'react';
import {
  Brain,
  Network,
  MessageSquareText,
  Sparkles,
  Clapperboard,
  RotateCw,
  Globe,
  Radio,
  Languages,
} from 'lucide-react';
import { DICTIONARY, type Language } from '../utils/i18n.ts';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  activeTab: 'learning' | 'graph' | 'qa' | 'image' | 'video';
  setActiveTab: (tab: 'learning' | 'graph' | 'qa' | 'image' | 'video') => void;
  totalCycles: number;
  overallConfidence: number;
  isLearning: boolean;
  onQuickLearn: () => void;
  autoSyncActive: boolean;
  onToggleAutoSync: () => void;
  autoMediaEnabled: boolean;
  onToggleAutoMedia: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  activeTab,
  setActiveTab,
  totalCycles,
  overallConfidence,
  isLearning,
  onQuickLearn,
  autoSyncActive,
  onToggleAutoSync,
  autoMediaEnabled,
  onToggleAutoMedia,
}) => {
  const t = DICTIONARY[language];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 shadow-md shadow-cyan-500/20">
            <Brain className="h-5 w-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                {t.appTitle} <span className="text-cyan-400 font-mono text-xs font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">{t.appSubtitle}</span>
              </h1>
            </div>
            <p className="hidden text-xs text-zinc-400 sm:block">
              {t.appDescription}
            </p>
          </div>
        </div>

        {/* Global Telemetry & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Epistemic Confidence Meter */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>{t.confidence}:</span>
            <span className="font-mono font-bold text-emerald-400">{overallConfidence}%</span>
          </div>

          {/* Cycles Count */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.cycles}:</span>
            <span className="font-mono font-semibold text-white">{totalCycles}</span>
          </div>

          {/* Auto Media Toggle */}
          <button
            type="button"
            onClick={onToggleAutoMedia}
            className={`hidden xl:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              autoMediaEnabled
                ? 'border-indigo-500/50 bg-indigo-950/50 text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
            }`}
            title={t.autoMediaDesc}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Авто-медиа (4K+Veo): {autoMediaEnabled ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>

          {/* Auto-Sync Toggle */}
          <button
            type="button"
            onClick={onToggleAutoSync}
            className={`hidden lg:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              autoSyncActive
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle autonomous background news synthesis"
          >
            <span className={`h-2 w-2 rounded-full ${autoSyncActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
            {t.autoSync}: {autoSyncActive ? t.autoSyncOn : t.autoSyncOff}
          </button>

          {/* Language Switcher (RU / EN) */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-mono font-semibold text-zinc-200 hover:border-cyan-500/60 transition-all"
            aria-label="Switch interface language"
          >
            <Languages className="h-3.5 w-3.5 text-cyan-400" />
            <span>{language === 'ru' ? 'RU' : 'EN'}</span>
          </button>

          {/* Quick Learn Trigger */}
          <button
            type="button"
            onClick={onQuickLearn}
            disabled={isLearning}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 transition-all hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50"
            aria-label={t.scourAndLearn}
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLearning ? 'animate-spin' : ''}`} />
            <span>{isLearning ? t.analyzingNews : t.scourAndLearn}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 scrollbar-none">
        <nav className="flex space-x-1 border-t border-zinc-900 py-1" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => setActiveTab('learning')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'learning'
                ? 'bg-zinc-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>{t.learningCoreTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'graph'
                ? 'bg-zinc-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Network className="h-4 w-4" />
            <span>{t.graphTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'qa'
                ? 'bg-zinc-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <MessageSquareText className="h-4 w-4" />
            <span>{t.qaTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'image'
                ? 'bg-zinc-800 text-indigo-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>{t.imageTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'video'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <Clapperboard className="h-4 w-4 text-emerald-400" />
            <span>{t.videoTab}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

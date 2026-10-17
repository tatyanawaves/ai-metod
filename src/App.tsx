/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LearningCore } from './components/LearningCore.tsx';
import { KnowledgeGraphView } from './components/KnowledgeGraphView.tsx';
import { CognitiveQA } from './components/CognitiveQA.tsx';
import { VisualStudio } from './components/VisualStudio.tsx';
import { VeoVideoLab } from './components/VeoVideoLab.tsx';
import { EntityDetailModal } from './components/EntityDetailModal.tsx';
import { INITIAL_LEARNING_STATE } from './utils/initialKnowledge.ts';
import { attachMediaToLogEntry } from './utils/knowledge.ts';
import {
  calculateCognitiveEvolution,
  generateAutonomousQuery,
  type LearningMethodType,
} from './utils/learningMethods.ts';
import type { LearningState, KnowledgeEntity, EpistemicLogEntry } from './types/index.ts';
import type { Language } from './utils/i18n.ts';

export default function App() {
  const [language, setLanguage] = useState<Language>('ru');
  const [learningState, setLearningState] = useState<LearningState>(INITIAL_LEARNING_STATE);
  const [activeTab, setActiveTab] = useState<'learning' | 'graph' | 'qa' | 'image' | 'video'>('learning');
  const [isLearning, setIsLearning] = useState(false);
  const [learningStage, setLearningStage] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<KnowledgeEntity | null>(null);

  // Autonomous Self-Learning & Pause Engine States
  const [isRunningAutonomous, setIsRunningAutonomous] = useState<boolean>(false);
  const [learningMethod, setLearningMethod] = useState<LearningMethodType>('adaptive');
  const [intervalSeconds, setIntervalSeconds] = useState<number>(30);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(30);
  const [activeAutonomousTopic, setActiveAutonomousTopic] = useState<string>('');

  // Cross-module states
  const [studioPrompt, setStudioPrompt] = useState<string>('');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [qaQuestion, setQaQuestion] = useState<string>('');
  const [autoMediaEnabled, setAutoMediaEnabled] = useState<boolean>(true);

  // Calculate Cognitive Evolution level & XP
  const evolution = calculateCognitiveEvolution(learningState);

  // Update next anticipated autonomous topic whenever method or state changes
  useEffect(() => {
    const nextInquiry = generateAutonomousQuery(learningMethod, learningState, language);
    setActiveAutonomousTopic(nextInquiry.query);
  }, [learningMethod, learningState.totalCycles, language]);

  // Load language preference from localStorage if available
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('cognisynapse_lang') as Language;
      if (savedLang === 'ru' || savedLang === 'en') {
        setLanguage(savedLang);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next: Language = prev === 'ru' ? 'en' : 'ru';
      try {
        localStorage.setItem('cognisynapse_lang', next);
      } catch (e) {
        // Ignore
      }
      return next;
    });
  };

  // Fetch initial knowledge state from backend
  useEffect(() => {
    fetch('/api/knowledge')
      .then((res) => res.json())
      .then((data) => {
        if (data.state && Array.isArray(data.state.entities)) {
          setLearningState(data.state);
        }
      })
      .catch((err) => {
        console.log('Using baseline client knowledge state:', err);
      });
  }, []);

  // Autonomous auto-multimedia pipeline: AI generates image and video itself
  const handleAutoGenerateMedia = async (entry: EpistemicLogEntry) => {
    try {
      // Optimistically flag log entry as generating media
      setLearningState((prev) => ({
        ...prev,
        history: attachMediaToLogEntry(prev.history, entry.id, {
          isGeneratingVideo: true,
          prompt: entry.headline,
        }),
      }));

      const res = await fetch('/api/auto-multimedia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: entry.id,
          topic: entry.topic,
          headline: entry.headline,
          insightSummary: entry.insightSummary,
          imageSize: '2K',
          aspectRatio: '16:9',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to auto-generate media');

      if (data.updatedState) {
        setLearningState(data.updatedState);
      }

      // If an operation was started, poll for completion
      if (data.operationName) {
        const pollVideo = async () => {
          try {
            const statusRes = await fetch('/api/video-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: data.operationName }),
            });
            const statusData = await statusRes.json();
            if (statusData.done) {
              const downloadRes = await fetch('/api/video-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationName: data.operationName }),
              });
              if (downloadRes.ok) {
                const blob = await downloadRes.blob();
                const videoUrl = URL.createObjectURL(blob);
                setLearningState((prev) => ({
                  ...prev,
                  history: attachMediaToLogEntry(prev.history, entry.id, {
                    videoUrl,
                    isGeneratingVideo: false,
                  }),
                }));
              }
            } else {
              setTimeout(pollVideo, 6000);
            }
          } catch (pollErr) {
            console.log('Video polling notice:', pollErr);
          }
        };
        setTimeout(pollVideo, 5000);
      }
    } catch (err: any) {
      console.log('Notice auto-generating media:', err?.message || err);
    }
  };

  // Execute self-learning scan
  const handleExecuteLearn = async (topic: string, methodOverride?: LearningMethodType) => {
    if (isLearning) return;
    setIsLearning(true);
    const chosenMethod = methodOverride || learningMethod;
    setLearningStage(
      language === 'ru'
        ? `Поиск новостей (${chosenMethod}): ${topic.slice(0, 35)}...`
        : `Scouring news (${chosenMethod}): ${topic.slice(0, 35)}...`
    );

    const timer1 = setTimeout(() => {
      setLearningStage(
        language === 'ru'
          ? 'Верификация источников и обновление понятий...'
          : 'Corroborating multi-source consensus & extracting entities...'
      );
    }, 1800);

    const timer2 = setTimeout(() => {
      setLearningStage(
        language === 'ru'
          ? 'Разрешение противоречий и расчёт эпистемической дельты...'
          : 'Resolving contradictions & computing epistemic delta...'
      );
    }, 3800);

    try {
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language, method: chosenMethod }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Learning cycle failed');

      if (data.updatedState) {
        setLearningState(data.updatedState);
      }

      // If auto-media generation is enabled, automatically trigger multimedia synthesis for the newly learned entry
      if (autoMediaEnabled && data.epistemicLog) {
        handleAutoGenerateMedia(data.epistemicLog);
      }
    } catch (err: any) {
      console.log('Notice during learning cycle:', err?.message || err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLearning(false);
      setLearningStage('');
    }
  };

  // Step function for autonomous inquiry
  const triggerAutonomousStep = () => {
    const inquiry = generateAutonomousQuery(learningMethod, learningState, language);
    setActiveAutonomousTopic(inquiry.query);
    handleExecuteLearn(inquiry.query, inquiry.methodUsed);
  };

  // Quick learn from Navbar
  const handleQuickLearn = () => {
    triggerAutonomousStep();
  };

  // Autonomous continuous learning timer with pause functionality
  useEffect(() => {
    if (!isRunningAutonomous) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          triggerAutonomousStep();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunningAutonomous, intervalSeconds, learningMethod, learningState.totalCycles, language]);

  // Reset to seeds
  const handleResetKnowledge = async () => {
    try {
      const res = await fetch('/api/knowledge/reset', { method: 'POST' });
      const data = await res.json();
      if (data.state) {
        setLearningState(data.state);
      }
    } catch (e) {
      setLearningState(INITIAL_LEARNING_STATE);
    }
  };

  // Navigation helpers
  const handleNavigateToStudio = (prompt: string) => {
    setStudioPrompt(prompt);
    setActiveTab('image');
  };

  const handleSendToVeo = (imageUrl: string, prompt: string) => {
    setVideoSourceImage(imageUrl);
    setVideoPrompt(prompt);
    setActiveTab('video');
  };

  const handleNavigateToVideo = (prompt: string, imageUrl?: string) => {
    if (imageUrl) {
      setVideoSourceImage(imageUrl);
    }
    setVideoPrompt(prompt);
    setActiveTab('video');
  };

  const handleAskAboutEntity = (question: string) => {
    setQaQuestion(question);
    setActiveTab('qa');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCycles={learningState.totalCycles}
        overallConfidence={learningState.overallConfidence}
        isLearning={isLearning}
        onQuickLearn={handleQuickLearn}
        autoSyncActive={isRunningAutonomous}
        onToggleAutoSync={() => setIsRunningAutonomous((prev) => !prev)}
        autoMediaEnabled={autoMediaEnabled}
        onToggleAutoMedia={() => setAutoMediaEnabled((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'learning' && (
          <LearningCore
            language={language}
            learningState={learningState}
            isLearning={isLearning}
            learningStage={learningStage}
            evolution={evolution}
            learningMethod={learningMethod}
            onSelectMethod={(m) => {
              setLearningMethod(m);
              const nextInquiry = generateAutonomousQuery(m, learningState, language);
              setActiveAutonomousTopic(nextInquiry.query);
            }}
            isRunning={isRunningAutonomous}
            onToggleRunning={() => setIsRunningAutonomous((prev) => !prev)}
            countdownSeconds={countdownSeconds}
            intervalSeconds={intervalSeconds}
            onChangeInterval={(sec) => {
              setIntervalSeconds(sec);
              setCountdownSeconds(sec);
            }}
            onStepOnce={triggerAutonomousStep}
            activeAutonomousTopic={activeAutonomousTopic}
            onExecuteLearn={(topic) => handleExecuteLearn(topic, learningMethod)}
            onSelectEntity={(ent) => setSelectedEntity(ent)}
            onNavigateToStudio={handleNavigateToStudio}
            onNavigateToVideo={handleNavigateToVideo}
            onAutoGenerateMedia={handleAutoGenerateMedia}
            onResetKnowledge={handleResetKnowledge}
          />
        )}

        {activeTab === 'graph' && (
          <KnowledgeGraphView
            language={language}
            learningState={learningState}
            onSelectEntity={(ent) => setSelectedEntity(ent)}
            onNavigateToStudio={handleNavigateToStudio}
            onNavigateToVideo={handleNavigateToVideo}
            onAskAboutEntity={handleAskAboutEntity}
          />
        )}

        {activeTab === 'qa' && (
          <CognitiveQA
            language={language}
            learningState={learningState}
            onNavigateToStudio={handleNavigateToStudio}
            presetQuestion={qaQuestion}
          />
        )}

        {activeTab === 'image' && (
          <VisualStudio
            language={language}
            learningState={learningState}
            initialPrompt={studioPrompt}
            onSendToVeo={handleSendToVeo}
          />
        )}

        {activeTab === 'video' && (
          <VeoVideoLab
            language={language}
            initialImage={videoSourceImage}
            initialPrompt={videoPrompt}
            onClearInitialImage={() => setVideoSourceImage(null)}
          />
        )}
      </main>

      {/* Entity Details Modal */}
      {selectedEntity && (
        <EntityDetailModal
          language={language}
          entity={selectedEntity}
          learningState={learningState}
          onClose={() => setSelectedEntity(null)}
          onNavigateToStudio={handleNavigateToStudio}
          onNavigateToVideo={handleNavigateToVideo}
          onAskAboutEntity={handleAskAboutEntity}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CogniSynapse • Самообучающаяся когнитивная архитектура</span>
          <span className="font-mono text-[11px] text-zinc-400">
            Google Search Grounding • gemini-3-pro-image-preview • veo-3.1-fast-generate-preview
          </span>
        </div>
      </footer>
    </div>
  );
}

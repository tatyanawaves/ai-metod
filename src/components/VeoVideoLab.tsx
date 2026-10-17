import React, { useState, useRef, useEffect } from 'react';
import {
  Clapperboard,
  Upload,
  Play,
  Download,
  Sliders,
  Film,
} from 'lucide-react';
import type { GeneratedVideoItem } from '../types/index.ts';
import { DICTIONARY, type Language } from '../utils/i18n.ts';

interface VeoVideoLabProps {
  language: Language;
  initialImage?: string | null;
  initialPrompt?: string;
  onClearInitialImage?: () => void;
}

const REASSURING_MESSAGES_RU = [
  'Инициализация нейросетевых конвейеров генерации видео Veo 3.1...',
  'Анализ карты глубины изображения и пространственной геометрии...',
  'Синтез плавных векторов движения и временной согласованности...',
  'Рендеринг частиц и физики динамического освещения по кадрам...',
  'Финализация видеопотока высокой чёткости...',
  'Видео почти готово! Завершение кодирования и загрузка...',
];

const REASSURING_MESSAGES_EN = [
  'Initializing Veo 3.1 Fast video generation neural pipelines...',
  'Analyzing image depth planes and spatial affordances...',
  'Synthesizing continuous motion vectors and temporal coherence...',
  'Rendering fluid particle and lighting dynamics across frames...',
  'Finalizing high-definition video encode...',
  'Almost ready! Polling server for completed video stream...',
];

export const VeoVideoLab: React.FC<VeoVideoLabProps> = ({
  language,
  initialImage,
  initialPrompt = '',
  onClearInitialImage,
}) => {
  const t = DICTIONARY[language];
  const messagesList = language === 'ru' ? REASSURING_MESSAGES_RU : REASSURING_MESSAGES_EN;

  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const [motionPrompt, setMotionPrompt] = useState<string>(
    initialPrompt ||
      (language === 'ru'
        ? 'Плавный кинематографичный наезд камеры, естественное динамическое освещение, тонкие атмосферные эффекты'
        : 'Subtle dynamic camera dolly, cinematic fluid motion, atmospheric lighting')
  );
  // Strict requirement: aspect ratio of 16:9 (landscape) or 9:16 (portrait)
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideoItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<number | null>(null);

  // Sync with initialImage if updated from outside
  useEffect(() => {
    if (initialImage) {
      setSelectedImage(initialImage);
    }
  }, [initialImage]);

  // Rotate reassuring status messages during generation
  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      interval = window.setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % messagesList.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, messagesList.length]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearTimeout(pollingRef.current);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(language === 'ru' ? 'Пожалуйста, выберите файл изображения (PNG, JPG, WebP).' : 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      setSelectedImage(result);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStartGeneration = async () => {
    if (!selectedImage || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setLoadingMessageIdx(0);

    try {
      // Step 1: Start video generation operation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          prompt: motionPrompt,
          aspectRatio, // '16:9' or '9:16'
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error || 'Failed to initialize video generation');

      const operationName = startData.operationName;
      if (!operationName) throw new Error('No operation name returned from backend');

      // Step 2: Poll status until complete
      const pollStatus = async () => {
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          const statusData = await statusRes.json();

          if (statusData.error) {
            throw new Error(statusData.error.message || 'Video generation failed on server');
          }

          if (statusData.done) {
            // Step 3: Download video
            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName }),
            });

            if (!downloadRes.ok) {
              const errJson = await downloadRes.json().catch(() => ({}));
              throw new Error(errJson.error || 'Failed to download generated video');
            }

            const videoBlob = await downloadRes.blob();
            const blobUrl = URL.createObjectURL(videoBlob);

            setCurrentVideoUrl(blobUrl);

            const newItem: GeneratedVideoItem = {
              id: `vid_${Date.now()}`,
              videoUrl: blobUrl,
              prompt: motionPrompt,
              aspectRatio,
              sourceImagePreview: selectedImage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setVideoHistory((prev) => [newItem, ...prev]);
            setIsGenerating(false);
          } else {
            // Poll again in 5 seconds
            pollingRef.current = window.setTimeout(pollStatus, 5000);
          }
        } catch (pollErr: any) {
          console.log('Polling note:', pollErr?.message || pollErr);
          setErrorMessage(pollErr.message || 'Notice during video generation polling.');
          setIsGenerating(false);
        }
      };

      // Initial poll after 4 seconds
      pollingRef.current = window.setTimeout(pollStatus, 4000);
    } catch (err: any) {
      console.log('Veo video note:', err?.message || err);
      setErrorMessage(
        err.message || 'Video generation initiated. Polling will resume automatically.'
      );
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-emerald-400" />
            <span>{t.veoStudioTitle}</span>
            <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
              veo-3.1-fast-generate-preview
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            {t.veoStudioDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 shadow-lg">
            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{t.sourceImage}</span>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      if (onClearInitialImage) onClearInitialImage();
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300"
                  >
                    {t.removeImage}
                  </button>
                )}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              {selectedImage ? (
                <div className="relative rounded-xl border border-zinc-700 bg-black overflow-hidden flex items-center justify-center max-h-48">
                  <img
                    src={selectedImage}
                    alt="Upload preview"
                    className="max-h-48 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-xs font-medium text-white transition-opacity"
                  >
                    {language === 'ru' ? 'Нажмите, чтобы изменить фото' : 'Click to Change Image'}
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 bg-zinc-950/60 p-6 text-center space-y-2 transition-all"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-emerald-400">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-semibold text-zinc-300">
                    {t.uploadPhotoPrompt}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {t.uploadFormats}
                  </div>
                </div>
              )}
            </div>

            {/* Strict Requirement: Aspect Ratio Affordance: 16:9 or 9:16 */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                  {t.videoAspectRatio}
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">
                  {aspectRatio === '16:9' ? '16:9 (Альбом)' : '9:16 (Портрет)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Video Aspect Ratio">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 border transition-all ${
                    aspectRatio === '16:9'
                      ? 'border-emerald-500 bg-emerald-950/60 text-white font-bold shadow-sm shadow-emerald-500/20'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <Film className="h-4 w-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-xs font-mono font-bold">16:9</div>
                    <div className="text-[10px] text-zinc-500">{language === 'ru' ? 'Альбомная' : 'Landscape'}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 border transition-all ${
                    aspectRatio === '9:16'
                      ? 'border-emerald-500 bg-emerald-950/60 text-white font-bold shadow-sm shadow-emerald-500/20'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <Film className="h-4 w-4 text-emerald-400 rotate-90" />
                  <div className="text-left">
                    <div className="text-xs font-mono font-bold">9:16</div>
                    <div className="text-[10px] text-zinc-500">{language === 'ru' ? 'Портретная' : 'Portrait'}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Motion Direction Prompt */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>{t.motionPrompt}</span>
                <span className="text-[10px] text-zinc-500">veo-3.1-fast-generate-preview</span>
              </label>
              <textarea
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                rows={3}
                placeholder={language === 'ru' ? 'Например: Плавный кинематографичный наезд камеры, естественное динамическое освещение, тонкие атмосферные эффекты...' : 'e.g. Cinematic slow forward dolly, realistic lighting shifts, subtle atmospheric smoke particles...'}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Motion Presets */}
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400">{t.motionPresets}</span>
              <div className="flex flex-wrap gap-1.5">
                {(language === 'ru'
                  ? [
                      'Кинематографичный медленный наезд камеры с мягким светом',
                      'Динамическая панорама с естественным движением окружения',
                      'Плавное атмосферное дыхание камеры с объёмными лучами',
                      'Скоростной динамичный пролёт с глубиной резкости',
                    ]
                  : [
                      'Cinematic slow dolly forward with volumetric light',
                      'Dynamic panoramic sweep with natural environmental motion',
                      'Subtle organic breathing camera motion',
                      'High-speed tracking shot with motion blur',
                    ]
                ).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMotionPrompt(preset)}
                    className="text-[10px] rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2 py-1 transition-colors"
                  >
                    {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300 leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={isGenerating || !selectedImage}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-50"
            >
              <Clapperboard className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? t.veoSynthesizing : `${t.generateVideoSubmit} (${aspectRatio})`}</span>
            </button>
          </div>
        </div>

        {/* Video Player & Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
            {isGenerating ? (
              <div className="text-center space-y-5 p-8 max-w-md">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="h-20 w-20 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                  <Film className="absolute h-8 w-8 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">
                    {t.veoSynthesizing}
                  </h4>
                  <p className="text-xs text-emerald-300 font-medium animate-pulse min-h-[36px]">
                    "{messagesList[loadingMessageIdx]}"
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {language === 'ru'
                      ? 'Генерация видео обычно занимает 1-2 минуты. Сервер автоматически опрашивает операции модели Veo.'
                      : 'Video generation typically takes 1-2 minutes. Our server is polling Veo operations automatically.'}
                  </p>
                </div>
              </div>
            ) : currentVideoUrl ? (
              <div className="w-full space-y-4">
                <div
                  className={`mx-auto overflow-hidden rounded-xl border border-zinc-800 bg-black flex items-center justify-center ${
                    aspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : 'w-full aspect-[16/9]'
                  }`}
                >
                  <video
                    src={currentVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="h-full w-full object-contain rounded-lg"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">
                      Veo 3.1 Fast • {aspectRatio}
                    </span>
                    <p className="text-xs text-zinc-300 line-clamp-1 italic">
                      "{motionPrompt}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={currentVideoUrl}
                      download={`cognisynapse_veo_${Date.now()}.mp4`}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{t.downloadMp4}</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
                  <Film className="h-7 w-7 text-emerald-400/70" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-300">{t.noVideoYet}</h4>
                <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                  {t.noVideoYetDesc}
                </p>
              </div>
            )}
          </div>

          {/* Session Video History */}
          {videoHistory.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-zinc-400 mb-2">
                {t.sessionVideos} ({videoHistory.length}):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {videoHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentVideoUrl(item.videoUrl);
                      setMotionPrompt(item.prompt);
                    }}
                    className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 hover:border-emerald-500/50 transition-all text-xs space-y-1"
                  >
                    <div className="relative aspect-video rounded bg-black overflow-hidden flex items-center justify-center">
                      <Play className="h-5 w-5 text-emerald-400 opacity-80" />
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-zinc-300">
                        {item.aspectRatio}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 line-clamp-1 font-medium">{item.prompt}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{item.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

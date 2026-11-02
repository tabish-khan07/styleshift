'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider, useToast } from '@/components/Toast';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { SampleSelector } from '@/components/SampleSelector';
import { StylePicker } from '@/components/StylePicker';
import { RewriteCard } from '@/components/RewriteCard';
import { VoiceProfileModal } from '@/components/VoiceProfileModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { Footer } from '@/components/Footer';
import {
  StyleId,
  IntensityLevel,
  VoiceProfile,
  RewriteResultItem,
  ScoreResultItem,
  HistoryItem,
  RewriteResponse,
  ScoreResponse,
} from '@/types';
import { STYLES } from '@/lib/styles';
import { APP_CONFIG } from '@/lib/config';
import {
  Sparkles,
  ClipboardPaste,
  Trash2,
  Wand2,
  AlertTriangle,
  X,
} from 'lucide-react';

const MAX_CHARS = APP_CONFIG.limits.maxTextLength;
const DEFAULT_STYLES: StyleId[] = ['formal', 'casual', 'gen-z'];

function MainApp() {
  const { showToast } = useToast();

  // State
  const [inputText, setInputText] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<StyleId[]>(DEFAULT_STYLES);
  const [intensity, setIntensity] = useState<IntensityLevel>('moderate');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);

  // Results & Loading
  const [isRewriting, setIsRewriting] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [singleLoadingStyle, setSingleLoadingStyle] = useState<StyleId | null>(null);
  const [resultsMap, setResultsMap] = useState<Record<string, RewriteResultItem>>({});
  const [scoresMap, setScoresMap] = useState<Record<string, ScoreResultItem>>({});
  const [lastOriginalText, setLastOriginalText] = useState('');

  // Modals & Drawers
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [showApiKeyBanner, setShowApiKeyBanner] = useState(true);

  // Hydrate local storage & check API key on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHasApiKey(d.hasApiKey))
      .catch(() => setHasApiKey(false));

    try {
      const storedVoice = localStorage.getItem('styleshift-voice-profile');
      if (storedVoice) {
        setVoiceProfile(JSON.parse(storedVoice));
      }

      const storedHistory = localStorage.getItem('styleshift-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.warn('Failed to load local storage items:', err);
    }
  }, []);

  // Save history helper (capped at 10)
  const saveToHistory = useCallback(
    (
      text: string,
      styles: StyleId[],
      intens: IntensityLevel,
      results: RewriteResultItem[],
      scores?: Record<string, ScoreResultItem>
    ) => {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        inputText: text,
        selectedStyles: styles,
        intensity: intens,
        results,
        scores,
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev.filter((h) => h.inputText !== text)].slice(0, 10);
        try {
          localStorage.setItem('styleshift-history', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage history write failed:', e);
        }
        return updated;
      });
    },
    []
  );

  // Toggle style
  const handleToggleStyle = (id: StyleId) => {
    if (selectedStyles.includes(id)) {
      setSelectedStyles((prev) => prev.filter((s) => s !== id));
    } else {
      if (selectedStyles.length >= APP_CONFIG.limits.maxStylesPerRequest) {
        showToast(
          `Maximum of ${APP_CONFIG.limits.maxStylesPerRequest} styles can be selected simultaneously.`,
          'info'
        );
        return;
      }
      setSelectedStyles((prev) => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    const subset = STYLES.slice(0, APP_CONFIG.limits.maxStylesPerRequest).map((s) => s.id);
    setSelectedStyles(subset);
  };

  const handleClearStyles = () => {
    setSelectedStyles([]);
  };

  // Clipboard paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text.slice(0, MAX_CHARS));
        showToast('Pasted text from clipboard', 'info');
      }
    } catch {
      showToast('Clipboard access was blocked by your browser.', 'error');
    }
  };

  // Save Voice Profile
  const handleSaveVoiceProfile = (profile: VoiceProfile) => {
    setVoiceProfile(profile);
    try {
      localStorage.setItem('styleshift-voice-profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  };

  // History restoration
  const handleRestoreHistory = (item: HistoryItem) => {
    setInputText(item.inputText);
    setSelectedStyles(item.selectedStyles);
    setIntensity(item.intensity);
    setLastOriginalText(item.inputText);

    const rMap: Record<string, RewriteResultItem> = {};
    for (const res of item.results) {
      rMap[res.styleId] = res;
    }
    setResultsMap(rMap);

    if (item.scores) {
      setScoresMap(item.scores);
    } else {
      setScoresMap({});
    }

    showToast('Restored previous run from history.', 'info');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('styleshift-history');
    } catch (e) {
      console.warn('Failed to clear history in localStorage:', e);
    }
    showToast('History cleared.', 'info');
  };

  // Main Rewrite Trigger
  const handleRewrite = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      showToast('Please enter text to rewrite.', 'error');
      return;
    }
    if (selectedStyles.length === 0) {
      showToast('Please select at least one style.', 'error');
      return;
    }

    setIsRewriting(true);
    setLastOriginalText(trimmed);
    setScoresMap({});

    // Reset results for selected styles to show skeletons
    const initialMap = { ...resultsMap };
    for (const styleId of selectedStyles) {
      delete initialMap[styleId];
    }
    setResultsMap(initialMap);

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          styles: selectedStyles,
          intensity,
          voiceProfile: voiceProfile || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to rewrite text.');
      }

      const payload = data as RewriteResponse;
      const newResultsMap: Record<string, RewriteResultItem> = { ...resultsMap };
      for (const item of payload.results) {
        newResultsMap[item.styleId] = item;
      }
      setResultsMap(newResultsMap);
      setIsRewriting(false);

      // Trigger automatic background scoring
      const validResultsForScoring = payload.results.filter(
        (r) => r.text && r.text.length > 0 && !r.error
      );

      if (validResultsForScoring.length > 0) {
        setIsScoring(true);
        fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original: trimmed,
            results: validResultsForScoring.map((r) => ({
              styleId: r.styleId,
              text: r.text,
            })),
            voiceCentroid: voiceProfile?.centroid,
          }),
        })
          .then((scoreRes) => scoreRes.json())
          .then((scoreData: ScoreResponse) => {
            if (scoreData?.scores) {
              const newScoresMap: Record<string, ScoreResultItem> = {};
              for (const s of scoreData.scores) {
                newScoresMap[s.styleId] = s;
              }
              setScoresMap(newScoresMap);
              saveToHistory(
                trimmed,
                selectedStyles,
                intensity,
                payload.results,
                newScoresMap
              );
            }
          })
          .catch((scoreErr) => {
            console.warn('Scoring request failed:', scoreErr);
          })
          .finally(() => {
            setIsScoring(false);
          });
      } else {
        saveToHistory(trimmed, selectedStyles, intensity, payload.results);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rewrite request failed.';
      showToast(msg, 'error');
      setIsRewriting(false);
    }
  };

  // Single card regenerate / retry
  const handleRegenerateSingle = async (styleId: StyleId) => {
    const trimmed = (lastOriginalText || inputText).trim();
    if (!trimmed) {
      showToast('Original text is missing.', 'error');
      return;
    }

    setSingleLoadingStyle(styleId);

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          styles: [styleId],
          intensity,
          voiceProfile: voiceProfile || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to regenerate.');
      }

      const payload = data as RewriteResponse;
      const resultItem = payload.results[0];

      if (resultItem) {
        setResultsMap((prev) => ({
          ...prev,
          [styleId]: resultItem,
        }));

        // Re-score this card if valid
        if (resultItem.text && !resultItem.error) {
          const scoreRes = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              original: trimmed,
              results: [{ styleId: resultItem.styleId, text: resultItem.text }],
              voiceCentroid: voiceProfile?.centroid,
            }),
          });
          const scoreData: ScoreResponse = await scoreRes.json();
          if (scoreData?.scores && scoreData.scores[0]) {
            setScoresMap((prev) => ({
              ...prev,
              [styleId]: scoreData.scores[0],
            }));
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Regeneration failed.';
      showToast(msg, 'error');
    } finally {
      setSingleLoadingStyle(null);
    }
  };

  const isFormValid =
    inputText.trim().length > 0 &&
    inputText.length <= MAX_CHARS &&
    selectedStyles.length > 0;

  const charCount = inputText.length;
  const isOverCharLimit = charCount > MAX_CHARS;

  return (
    <div className="min-h-screen flex flex-col bg-mesh-dark">
      {/* Sticky Glass Header */}
      <Header
        onOpenMyVoice={() => setIsVoiceModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        hasVoiceProfile={!!voiceProfile}
        historyCount={history.length}
      />

      {/* Main Container - max 1200px */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <Hero />

        {/* Demo Mode / Missing API Key Notice */}
        {hasApiKey === false && showApiKeyBanner && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">
                  Running in Demo Mode (Simulated AI Engine)
                </p>
                <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                  To enable live Google Gemini 2.5 Flash, get your free key at{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold text-amber-300 hover:text-white"
                  >
                    Google AI Studio
                  </a>{' '}
                  and add it as <code className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono text-white">GEMINI_API_KEY</code> in your <code className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono text-white">.env.local</code> file.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowApiKeyBanner(false)}
              className="p-1 rounded-lg text-amber-400 hover:text-white hover:bg-amber-500/20 transition-colors shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Workspace Card - Rounded 2xl Glass Card */}
        <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
          {/* Toolbar above Textarea */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
            <SampleSelector onSelectSample={(text) => setInputText(text)} />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden xs:inline">Paste</span>
              </button>

              {inputText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xs:inline">Clear</span>
                </button>
              )}

              {/* Character Counter */}
              <div
                className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border ${
                  isOverCharLimit
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900/80 text-slate-400 border-white/10'
                }`}
              >
                {charCount} / {MAX_CHARS}
              </div>
            </div>
          </div>

          {/* Primary Textarea: min-h 220px */}
          <div className="relative">
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or write any text here (email, article excerpt, memo, social post) and select your target styles below..."
              className="w-full rounded-xl bg-slate-950/80 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 outline-none resize-y min-h-[220px] leading-relaxed transition-all font-normal"
            />
          </div>

          {/* Style Picker & Intensity Segmented Control */}
          <StylePicker
            selectedStyles={selectedStyles}
            onToggleStyle={handleToggleStyle}
            onSelectAll={handleSelectAll}
            onClearStyles={handleClearStyles}
            intensity={intensity}
            onChangeIntensity={setIntensity}
            voiceProfile={voiceProfile}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />

          {/* Action Row: Full width button on mobile */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Parallel generation • Up to 6 styles</span>
            </div>

            <button
              type="button"
              disabled={!isFormValid || isRewriting}
              onClick={handleRewrite}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white shadow-xl transition-all cursor-pointer ${
                !isFormValid || isRewriting
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isRewriting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-200 shrink-0" />
                  <span>Transforming Styles...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-indigo-200 shrink-0" />
                  <span>Rewrite in {selectedStyles.length} {selectedStyles.length === 1 ? 'Style' : 'Styles'}</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Workspace Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Style Transformations
              </h2>
              {selectedStyles.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  {selectedStyles.length} active
                </span>
              )}
            </div>

            {isScoring && (
              <span className="text-xs text-indigo-400 flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
                Calculating meaning preservation & adherence...
              </span>
            )}
          </div>

          {/* Empty State when no styles selected */}
          {selectedStyles.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400/80 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No target styles selected.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select one or more style chips above to generate rewrites.
              </p>
            </div>
          ) : Object.keys(resultsMap).length === 0 && !isRewriting ? (
            <div className="glass-panel rounded-2xl p-14 text-center border border-white/10 space-y-3">
              <Wand2 className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-base font-bold text-slate-300">
                Ready to transform your text
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Enter your text above and click &quot;Rewrite&quot; to see side-by-side variations with live semantic meaning scores and word-level diffs.
              </p>
            </div>
          ) : (
            /* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedStyles.map((styleId, idx) => {
                const isSingleLoading = singleLoadingStyle === styleId;
                const isCardLoading = isRewriting || isSingleLoading;
                const result = resultsMap[styleId];
                const score = scoresMap[styleId];

                return (
                  <RewriteCard
                    key={styleId}
                    index={idx}
                    originalText={lastOriginalText || inputText}
                    styleId={styleId}
                    result={result}
                    score={score}
                    isLoading={isCardLoading}
                    isScoringLoading={isScoring && !score}
                    onRegenerate={handleRegenerateSingle}
                    onRetry={handleRegenerateSingle}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Voice Profile Modal */}
      <VoiceProfileModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voiceProfile={voiceProfile}
        onSaveProfile={handleSaveVoiceProfile}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onRestore={handleRestoreHistory}
        onClearHistory={handleClearHistory}
      />

      {/* Slim Centered Footer */}
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}

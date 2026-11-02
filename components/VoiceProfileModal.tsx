'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceProfile, ProfileResponse } from '@/types';
import { useToast } from './Toast';
import {
  X,
  Mic,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface VoiceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceProfile: VoiceProfile | null;
  onSaveProfile: (profile: VoiceProfile) => void;
}

const DEFAULT_SAMPLES = [
  'In my experience, engineering velocity is rarely bottlenecked by typing speed; it is almost always constrained by ambiguity in requirements and brittle communication loops across teams. We must eliminate friction at the root.',
  'Let us be brutally honest about this architecture: adding three more microservices before we even have stable integration tests is asking for an incident at 2 AM. Simplify first, then scale.',
  'The fundamental trade-off here comes down to cognitive load versus raw throughput. Whenever possible, I prefer ergonomic APIs that make doing the right thing effortless.',
];

export function VoiceProfileModal({
  isOpen,
  onClose,
  voiceProfile,
  onSaveProfile,
}: VoiceProfileModalProps) {
  const { showToast } = useToast();
  const [samples, setSamples] = useState<string[]>(['', '', '']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<VoiceProfile | null>(
    voiceProfile
  );

  const handleSampleChange = (index: number, value: string) => {
    const updated = [...samples];
    updated[index] = value;
    setSamples(updated);
  };

  const addSampleField = () => {
    if (samples.length < 5) {
      setSamples((prev) => [...prev, '']);
    }
  };

  const removeSampleField = (index: number) => {
    if (samples.length > 3) {
      setSamples((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handlePrepopulate = () => {
    setSamples([...DEFAULT_SAMPLES]);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    const validSamples = samples.map((s) => s.trim()).filter((s) => s.length >= 10);
    if (validSamples.length < 3) {
      setErrorMsg('Please provide at least 3 distinct writing samples (minimum 10 characters each).');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples: validSamples }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to extract voice profile.');
      }

      const payload = data as ProfileResponse;
      setExtractedProfile(payload.profile);
      onSaveProfile(payload.profile);
      showToast('Voice DNA profile created successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Voice profiling failed.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-700/70 p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  My Voice Profile
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    AI Persona Clone
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste 3 to 5 samples of your own writing to extract your personal voice DNA.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5 shrink-0" />
            </button>
          </div>

          {/* Quick Fill Action */}
          <div className="flex items-center justify-between text-xs bg-violet-500/10 border border-violet-500/20 p-3 rounded-xl">
            <span className="text-violet-300 font-medium">Want to test quickly with sample writing?</span>
            <button
              type="button"
              onClick={handlePrepopulate}
              className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors cursor-pointer text-xs"
            >
              Load Example Samples
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sample Input List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Writing Samples ({samples.length}/5)
              </span>
              {samples.length < 5 && (
                <button
                  type="button"
                  onClick={addSampleField}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sample
                </button>
              )}
            </div>

            {samples.map((sample, idx) => (
              <div key={idx} className="relative">
                <textarea
                  rows={2}
                  value={sample}
                  onChange={(e) => handleSampleChange(idx, e.target.value)}
                  placeholder={`Writing Sample #${idx + 1} (e.g. an email, blog excerpt, or message you wrote)...`}
                  className="w-full rounded-xl bg-slate-900/80 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 p-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-none"
                />
                {samples.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeSampleField(idx)}
                    className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove sample"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Analyze / Train CTA */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Extracting Voice DNA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Build Voice</span>
                </>
              )}
            </button>
          </div>

          {/* Extracted Profile Traits Display */}
          {extractedProfile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-slate-900/80 border border-violet-500/30 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Active Voice DNA Extracted
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic border-l-2 border-violet-500 pl-3">
                &ldquo;{extractedProfile.summary}&rdquo;
              </p>

              {/* Trait Tags Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Tone</span>
                  <span className="font-semibold text-slate-200">{extractedProfile.tone}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Formality</span>
                  <span className="font-semibold text-slate-200">{extractedProfile.formality}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Vocabulary</span>
                  <span className="font-semibold text-slate-200">{extractedProfile.vocabularyLevel}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 sm:col-span-2">
                  <span className="text-slate-500 block">Sentence Length</span>
                  <span className="font-semibold text-slate-200">{extractedProfile.avgSentenceLength}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Punctuation</span>
                  <span className="font-semibold text-slate-200">{extractedProfile.punctuationHabits}</span>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    ✓ Stylistic Rules (DO)
                  </span>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                    {extractedProfile.doRules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    ✗ Pitfalls to Avoid (DON&apos;T)
                  </span>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                    {extractedProfile.dontRules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

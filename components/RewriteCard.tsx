'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getStyleById, MY_VOICE_STYLE_ID } from '@/lib/styles';
import { StyleId, RewriteResultItem, ScoreResultItem } from '@/types';
import { ScoreRing } from './ScoreRing';
import { DiffViewer } from './DiffViewer';
import { useToast } from './Toast';
import {
  Copy,
  Check,
  RotateCw,
  GitCompare,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface RewriteCardProps {
  originalText: string;
  styleId: StyleId;
  result?: RewriteResultItem;
  score?: ScoreResultItem;
  isLoading: boolean;
  isScoringLoading: boolean;
  onRegenerate: (styleId: StyleId) => void;
  onRetry: (styleId: StyleId) => void;
  index: number;
}

export function RewriteCard({
  originalText,
  styleId,
  result,
  score,
  isLoading,
  isScoringLoading,
  onRegenerate,
  onRetry,
  index,
}: RewriteCardProps) {
  const { showToast } = useToast();
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  const styleDef = getStyleById(styleId);
  const isMyVoice = styleId === MY_VOICE_STYLE_ID;
  const label = isMyVoice ? 'My Voice' : styleDef?.label || styleId;
  const emoji = isMyVoice ? '🎙️' : styleDef?.emoji || '✨';
  const description = isMyVoice
    ? 'Custom cloned voice profile'
    : styleDef?.description || '';

  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      showToast(`Copied ${label} rewrite to clipboard!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy to clipboard.', 'error');
    }
  };

  // Skeleton Loader State
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-4 animate-pulse min-h-[300px]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 shrink-0" />
            <div className="space-y-1.5">
              <div className="w-24 h-4 bg-slate-800/80 rounded" />
              <div className="w-36 h-2.5 bg-slate-800/40 rounded" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-800/60" />
        </div>

        <div className="space-y-2.5 py-4">
          <div className="w-full h-3.5 bg-slate-800/70 rounded" />
          <div className="w-11/12 h-3.5 bg-slate-800/60 rounded" />
          <div className="w-4/5 h-3.5 bg-slate-800/50 rounded" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800/80" />
            <div className="w-12 h-12 rounded-full bg-slate-800/80" />
          </div>
          <div className="w-20 h-6 bg-slate-800/60 rounded-lg" />
        </div>
      </motion.div>
    );
  }

  // Error State
  if (result?.error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-panel rounded-2xl p-6 border border-rose-500/30 flex flex-col justify-between min-h-[260px] space-y-4 bg-rose-950/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span className="font-bold text-sm text-slate-100">{label}</span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Generation Error
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-3 space-y-2">
          <AlertCircle className="w-7 h-7 text-rose-400 shrink-0" />
          <p className="text-xs text-slate-300 max-w-xs">{result.error}</p>
        </div>

        <div className="pt-3 border-t border-rose-500/20 flex justify-end">
          <button
            onClick={() => onRetry(styleId)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md shadow-rose-600/20"
          >
            <RotateCw className="w-3.5 h-3.5 shrink-0" />
            <span>Retry Card</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // Normal Success Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`glass-panel rounded-2xl p-6 border flex flex-col justify-between transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 ${
        isMyVoice ? 'border-violet-500/40 ring-1 ring-violet-500/20' : 'border-white/10'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-xl bg-slate-900/80 border border-white/10 shrink-0">
              {emoji}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-100 tracking-tight">{label}</h3>
                {isMyVoice && (
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-[210px]">
                {description}
              </p>
            </div>
          </div>

          {/* Card Top Actions: Copy & Regenerate */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={!result?.text}
              title="Copy rewrite"
              aria-label={`Copy ${label} rewrite`}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-center"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 shrink-0" />
              )}
            </button>
            <button
              onClick={() => onRegenerate(styleId)}
              title="Regenerate this style"
              aria-label={`Regenerate ${label} style`}
              className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-center"
            >
              <RotateCw className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Rewritten Text Body */}
        <div className="py-2 text-sm sm:text-base leading-relaxed text-slate-200 font-normal whitespace-pre-wrap select-text">
          {result?.text || (
            <span className="text-slate-500 italic">No output text available.</span>
          )}
        </div>
      </div>

      {/* Word-level diff section (toggled) */}
      {showDiff && result?.text && (
        <DiffViewer original={originalText} rewritten={result.text} />
      )}

      {/* Footer: Quality Scores & Diff Toggle */}
      <div className="pt-4 mt-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          {/* Quality Rings */}
          <div className="flex items-center gap-3">
            {isScoringLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                <span>Evaluating quality...</span>
              </div>
            ) : score ? (
              <>
                <ScoreRing score={score.meaning} label="Meaning" type="meaning" />
                <ScoreRing score={score.style} label="Style" type="style" />
                {score.voiceMatch !== undefined && (
                  <ScoreRing score={score.voiceMatch} label="Voice" type="voice" />
                )}
              </>
            ) : (
              <span className="text-[11px] text-slate-500 italic">Scores pending...</span>
            )}
          </div>

          {/* Show Changes Toggle */}
          <button
            onClick={() => setShowDiff((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              showDiff
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 shrink-0" />
            <span>{showDiff ? 'Hide diff' : 'Show changes'}</span>
          </button>
        </div>

        {/* Reason / Evaluation footnote */}
        {score?.reason && (
          <div className="flex items-start gap-1.5 text-[11px] text-slate-400 leading-snug bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{score.reason}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

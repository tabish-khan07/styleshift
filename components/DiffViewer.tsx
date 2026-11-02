'use client';

import React, { useMemo } from 'react';
import * as Diff from 'diff';

interface DiffViewerProps {
  original: string;
  rewritten: string;
}

export function DiffViewer({ original, rewritten }: DiffViewerProps) {
  const diffParts = useMemo(() => {
    try {
      return Diff.diffWordsWithSpace(original, rewritten);
    } catch {
      return Diff.diffWords(original, rewritten);
    }
  }, [original, rewritten]);

  const stats = useMemo(() => {
    let addedWords = 0;
    let removedWords = 0;

    for (const part of diffParts) {
      const words = part.value.trim().split(/\s+/).filter(Boolean).length;
      if (part.added) addedWords += words;
      if (part.removed) removedWords += words;
    }

    return { addedWords, removedWords };
  }, [diffParts]);

  return (
    <div className="space-y-3 pt-3 border-t border-white/10">
      {/* Diff stats bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="font-semibold text-slate-300">Word-Level Differential</span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-medium">+{stats.addedWords} added</span>
          <span className="text-rose-400 font-medium">-{stats.removedWords} removed</span>
        </div>
      </div>

      {/* Inline Diff Container */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs sm:text-sm leading-relaxed max-h-60 overflow-y-auto font-sans select-text whitespace-pre-wrap">
        {diffParts.map((part, index) => {
          if (part.added) {
            return (
              <span
                key={index}
                className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/30 font-medium"
              >
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            return (
              <span
                key={index}
                className="bg-rose-500/20 text-rose-300 line-through px-1 py-0.5 rounded border border-rose-500/30 opacity-70"
              >
                {part.value}
              </span>
            );
          }
          return <span key={index} className="text-slate-300">{part.value}</span>;
        })}
      </div>
    </div>
  );
}

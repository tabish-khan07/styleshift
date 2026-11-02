'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative pt-6 pb-2 sm:pt-8 sm:pb-4 text-center max-w-3xl mx-auto px-4">
      {/* Top feature badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 backdrop-blur-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Next-Gen Semantic Style Engine</span>
        <span className="text-slate-600 dark:text-slate-500">•</span>
        <span className="text-slate-400">Gemini 2.5 Flash</span>
      </motion.div>

      {/* Main Bold Headline with Animated Gradient */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]"
      >
        Rewrite your words in{' '}
        <span className="animate-gradient-text inline-block">any voice</span>, instantly.
      </motion.h1>

      {/* Short Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal leading-relaxed"
      >
        Simultaneous multi-style rewrites with deep semantic preservation scoring and word-level diffs.
      </motion.p>

      {/* Three Small Feature Pills in One Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-300"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Meaning-preservation scoring
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          Parallel generation
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          Adaptive Voice Profiling
        </span>
      </motion.div>
    </div>
  );
}

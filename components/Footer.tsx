'use client';

import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/60 backdrop-blur-md py-4">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-400 text-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-semibold text-slate-300">StyleShift AI</span>
          <span>— Precision AI Text Style Rewriter</span>
        </div>
        <span className="hidden sm:inline text-slate-600">•</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Server-side Gemini 2.5 Flash SDK • No client key exposure</span>
        </div>
      </div>
    </footer>
  );
}

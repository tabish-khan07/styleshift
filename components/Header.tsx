'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, History, Mic, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenMyVoice: () => void;
  onOpenHistory: () => void;
  hasVoiceProfile: boolean;
  historyCount: number;
}

export function Header({
  onOpenMyVoice,
  onOpenHistory,
  hasVoiceProfile,
  historyCount,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('styleshift-theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('styleshift-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('styleshift-theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo Left */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold ring-1 ring-white/20 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-100 shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              StyleShift
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AI Studio
            </span>
          </div>
        </div>

        {/* Controls Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* My Voice Trigger */}
          <button
            onClick={onOpenMyVoice}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
              hasVoiceProfile
                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-300 border-violet-500/40 hover:border-violet-500/70 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
            aria-label="Configure My Voice profile"
          >
            <Mic className={`w-5 h-5 shrink-0 ${hasVoiceProfile ? 'text-violet-400' : 'text-slate-400'}`} />
            <span className="hidden xs:inline">My Voice</span>
            {hasVoiceProfile ? (
              <span className="w-2 h-2 rounded-full bg-violet-400 ring-2 ring-violet-400/20" />
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                Set up
              </span>
            )}
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900/80 text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition-all cursor-pointer"
            aria-label="Open generation history"
          >
            <History className="w-5 h-5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
          </button>

          {/* GitHub Icon */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center justify-center"
            aria-label="View source code on GitHub"
          >
            <svg className="w-5 h-5 fill-currentColor shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

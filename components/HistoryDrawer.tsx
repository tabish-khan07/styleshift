'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem, StyleId } from '@/types';
import { getStyleById, MY_VOICE_STYLE_ID } from '@/lib/styles';
import { X, Trash2, Clock, ArrowRight } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onRestore,
  onClearHistory,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="w-screen max-w-md bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Rewrite History ({history.length}/10)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={onClearHistory}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-center"
                      title="Clear history"
                      aria-label="Clear all history"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Close history drawer"
                  >
                    <X className="w-5 h-5 shrink-0" />
                  </button>
                </div>
              </div>

              {/* History Items List */}
              <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Clock className="w-10 h-10 text-slate-700 mx-auto" />
                    <p className="text-sm text-slate-400">No past rewrite runs found.</p>
                    <p className="text-xs text-slate-600">
                      Completed rewrites are automatically saved here for one-click restoration.
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onRestore(item);
                        onClose();
                      }}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-[11px] text-indigo-400">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        <span className="capitalize text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 font-semibold text-slate-300">
                          {item.intensity}
                        </span>
                      </div>

                      {/* Text Snippet */}
                      <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                        &ldquo;{item.inputText}&rdquo;
                      </p>

                      {/* Style Badges */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-1">
                          {item.selectedStyles.map((styleId: StyleId) => {
                            const def = getStyleById(styleId);
                            const emoji = styleId === MY_VOICE_STYLE_ID ? '🎙️' : def?.emoji || '✨';
                            return (
                              <span
                                key={styleId}
                                className="text-xs p-1 rounded bg-slate-800 border border-slate-700/60 text-slate-300"
                                title={styleId}
                              >
                                {emoji}
                              </span>
                            );
                          })}
                        </div>

                        <span className="text-[11px] font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Restore <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
              Stored locally on your browser. Never synced to third-party databases.
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

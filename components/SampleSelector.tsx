'use client';

import React, { useState } from 'react';
import { Sparkles, Check, ChevronDown } from 'lucide-react';

export interface SampleItem {
  id: string;
  title: string;
  category: string;
  text: string;
}

export const SAMPLE_PARAGRAPHS: SampleItem[] = [
  {
    id: 'incident',
    title: 'Incident Post-Mortem',
    category: 'Engineering',
    text: 'Our database cluster suffered a cascading outage at 14:32 UTC yesterday due to a memory leak in the connection pool. Over 14,200 checkout sessions were disrupted for 38 minutes. Our engineering squad reverted commit #8f2d9 and restored traffic by 15:10 UTC.',
  },
  {
    id: 'launch',
    title: 'Product 3.0 Launch',
    category: 'Product & Growth',
    text: 'Today we are releasing Version 3.0 of our developer analytics dashboard. We rebuilt the query engine from scratch, which slashed latency by 64% while reducing cloud compute costs by $12,000 every month. All paid workspaces can upgrade immediately.',
  },
  {
    id: 'pitch',
    title: 'Executive Pitch Email',
    category: 'Sales & BD',
    text: 'I noticed your recent article on optimizing cloud spend for mid-market fintechs. We recently helped Apex Financial cut their AWS billing by 35% in under 90 days without refactoring core services. Would you be open to a 10-minute intro call next Tuesday at 2 PM?',
  },
];

interface SampleSelectorProps {
  onSelectSample: (text: string) => void;
}

export function SampleSelector({ onSelectSample }: SampleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSelect = (sample: SampleItem) => {
    setActiveId(sample.id);
    onSelectSample(sample.text);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Try an example</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-xl glass-panel shadow-2xl border border-slate-700/60 p-2 z-30 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Select Sample Text
            </div>
            {SAMPLE_PARAGRAPHS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                  activeId === item.id
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-100 flex items-center gap-2">
                    {item.title}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.text}
                  </p>
                </div>
                {activeId === item.id && (
                  <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

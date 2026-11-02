'use client';

import React from 'react';
import { STYLES, MY_VOICE_STYLE_ID } from '@/lib/styles';
import { StyleId, IntensityLevel, VoiceProfile } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { Sparkles, Check, Mic } from 'lucide-react';

interface StylePickerProps {
  selectedStyles: StyleId[];
  onToggleStyle: (id: StyleId) => void;
  onSelectAll: () => void;
  onClearStyles: () => void;
  intensity: IntensityLevel;
  onChangeIntensity: (level: IntensityLevel) => void;
  voiceProfile: VoiceProfile | null;
  onOpenVoiceModal: () => void;
}

const INTENSITY_OPTIONS: Array<{ level: IntensityLevel; label: string }> = [
  { level: 'subtle', label: 'Subtle' },
  { level: 'moderate', label: 'Moderate' },
  { level: 'heavy', label: 'Heavy' },
];

export function StylePicker({
  selectedStyles,
  onToggleStyle,
  onSelectAll,
  onClearStyles,
  intensity,
  onChangeIntensity,
  voiceProfile,
  onOpenVoiceModal,
}: StylePickerProps) {
  const maxLimit = APP_CONFIG.limits.maxStylesPerRequest;
  const isAtLimit = selectedStyles.length >= maxLimit;

  return (
    <div className="space-y-4">
      {/* Header bar: Section title + quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Target Writing Styles
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              isAtLimit
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-900/90 text-slate-400 border border-white/10'
            }`}
          >
            {selectedStyles.length} / {maxLimit} selected
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
          >
            Select first {maxLimit}
          </button>
          <span className="text-slate-600 dark:text-slate-500">•</span>
          <button
            type="button"
            onClick={onClearStyles}
            className="text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Style Chips Grid: 2 columns mobile, 3 tablet, 4 desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Dynamic 'My Voice' chip */}
        <button
          type="button"
          onClick={() => {
            if (!voiceProfile) {
              onOpenVoiceModal();
            } else {
              onToggleStyle(MY_VOICE_STYLE_ID);
            }
          }}
          className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[90px] ${
            selectedStyles.includes(MY_VOICE_STYLE_ID)
              ? 'bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border-violet-500 ring-2 ring-violet-500 shadow-md shadow-violet-500/10 text-white cursor-pointer'
              : voiceProfile
              ? 'bg-slate-900/70 border-white/10 hover:border-violet-500/50 text-slate-300 cursor-pointer'
              : 'bg-slate-900/40 border-dashed border-white/10 text-slate-400 hover:border-violet-500/40 cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xl">🎙️</span>
            {selectedStyles.includes(MY_VOICE_STYLE_ID) ? (
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : !voiceProfile ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                Set up
              </span>
            ) : null}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>My Voice</span>
              <Mic className="w-3 h-3 text-violet-400 shrink-0" />
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {voiceProfile ? 'Personal clone ready' : 'Configure your voice DNA'}
            </div>
          </div>
        </button>

        {/* Standard Styles */}
        {STYLES.map((style) => {
          const isSelected = selectedStyles.includes(style.id);
          const isDisabled = !isSelected && isAtLimit;

          return (
            <button
              key={style.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggleStyle(style.id)}
              className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[90px] ${
                isDisabled
                  ? 'opacity-40 cursor-not-allowed bg-slate-900/30 border-white/5 text-slate-500'
                  : 'cursor-pointer hover:border-indigo-500/40'
              } ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-600/30 to-slate-900/90 border-indigo-500 ring-2 ring-indigo-500 shadow-md shadow-indigo-500/10 text-white'
                  : 'bg-slate-900/70 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xl">{style.emoji}</span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {style.label}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {style.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Intensity Segmented Control */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300">Transformation Intensity</span>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-white/10">
          {INTENSITY_OPTIONS.map((item) => (
            <button
              key={item.level}
              type="button"
              onClick={() => onChangeIntensity(item.level)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                intensity === item.level
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

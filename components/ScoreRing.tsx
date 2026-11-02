'use client';

import React from 'react';

interface ScoreRingProps {
  score: number; // 0 - 100
  label: string;
  type?: 'meaning' | 'style' | 'voice';
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({
  score,
  label,
  type = 'meaning',
  size = 50,
  strokeWidth = 4.5,
}: ScoreRingProps) {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (boundedScore / 100) * circumference;

  let strokeColor = '#10b981'; // emerald
  let textColor = 'text-emerald-400';

  if (type === 'style') {
    strokeColor = '#8b5cf6'; // violet
    textColor = 'text-violet-400';
  } else if (type === 'voice') {
    strokeColor = '#06b6d4'; // cyan
    textColor = 'text-cyan-400';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Center Percentage Value */}
        <span className={`absolute text-[11px] font-extrabold ${textColor} tracking-tighter`}>
          {boundedScore}%
        </span>
      </div>

      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

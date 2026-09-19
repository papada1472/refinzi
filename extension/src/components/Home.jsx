import React, { useState } from 'react';

/**
 * Dynamic metrics dictionary reflecting period-aware calculations:
 * - Time Saved: ~2.5m avg per refinement × volume
 * - AI Cost Saved: Reduced re-prompt iterations & token overhead
 * - Quality Score: Synthesized across specificity, structure, and prompt length improvements
 */
const PERIOD_DATA = {
  Today: {
    timeSaved: '2h 15m',
    timeSavedSubtitle: 'saved today',
    timeProgressPercent: 75,
    totalPrompts: '156',
    promptsSubtitle: '12 today · 156 lifetime',
    promptsTrend: '+23%',
    qualityScore: '8.5',
    stars: '★★★★☆',
    qualitySubtitle: 'Top 5% prompt caliber',
    costSaved: '$47',
    costSubtitle: 'Fewer token iterations',
    streak: '5 days in a row',
    wordsEnhanced: '2,340 words',
    successRate: '94% no-edit apply',
    avgLatency: '350ms',
  },
  Week: {
    timeSaved: '12h 30m',
    timeSavedSubtitle: 'saved this week',
    timeProgressPercent: 88,
    totalPrompts: '482',
    promptsSubtitle: '84 this week · 482 total',
    promptsTrend: '+31%',
    qualityScore: '8.7',
    stars: '★★★★☆',
    qualitySubtitle: 'Consistently high depth',
    costSaved: '$186',
    costSubtitle: 'Zero-iteration completions',
    streak: '5 days in a row',
    wordsEnhanced: '14.8k words',
    successRate: '96% no-edit apply',
    avgLatency: '340ms',
  },
  Month: {
    timeSaved: '54h 10m',
    timeSavedSubtitle: 'saved this month',
    timeProgressPercent: 94,
    totalPrompts: '1,940',
    promptsSubtitle: '390 this month · 1.9k total',
    promptsTrend: '+42%',
    qualityScore: '8.9',
    stars: '★★★★★',
    qualitySubtitle: 'Elite practitioner level',
    costSaved: '$740',
    costSubtitle: 'Enterprise BYOK efficiency',
    streak: '19 days peak streak',
    wordsEnhanced: '62.4k words',
    successRate: '97% no-edit apply',
    avgLatency: '335ms',
  },
};

const RECENT_CALIBRATIONS = [
  {
    id: 'cal-1',
    mode: 'expert',
    site: 'ChatGPT',
    originalPrompt: 'GTM to enter in US market with B2B SaaS focus',
    timeSaved: 'Saved 3.5m',
    timestamp: '4m ago',
  },
  {
    id: 'cal-2',
    mode: 'better',
    site: 'Claude',
    originalPrompt: 'create landing page for AI accounting SaaS',
    timeSaved: 'Saved 2m',
    timestamp: '22m ago',
  },
  {
    id: 'cal-3',
    mode: 'expert',
    site: 'Perplexity',
    originalPrompt: 'research competitors of Notion in India',
    timeSaved: 'Saved 4m',
    timestamp: '1h ago',
  },
  {
    id: 'cal-4',
    mode: 'better',
    site: 'ChatGPT',
    originalPrompt: 'fix this React login bug with session cookies',
    timeSaved: 'Saved 2m',
    timestamp: '3h ago',
  },
  {
    id: 'cal-5',
    mode: 'better',
    site: 'Gemini',
    originalPrompt: 'write an apology email to a customer regarding outage',
    timeSaved: 'Saved 1.5m',
    timestamp: '5h ago',
  },
];

export default function Home({ onNavigateHistory }) {
  const [activePeriod, setActivePeriod] = useState('Today');
  const data = PERIOD_DATA[activePeriod] || PERIOD_DATA.Today;

  // Cloud Sync & Update State
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'receiving' | 'pushing' | 'received' | 'pushed'
  const [syncFeedback, setSyncFeedback] = useState('Synced · Engine v2.1.0');

  // Circular progress math (r = 13, circumference = 2 * PI * 13 = ~81.68)
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (data.timeProgressPercent / 100) * circumference;

  // 1. Receive Updates Handler (Press Icon)
  const handleReceiveUpdates = () => {
    if (syncStatus !== 'idle') return;
    setSyncStatus('receiving');
    setSyncFeedback('Checking & receiving latest rules…');

    setTimeout(() => {
      setSyncStatus('received');
      setSyncFeedback('✓ Calibration rules up to date (v2.1.0)');
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncFeedback('Synced · Engine v2.1.0');
      }, 4000);
    }, 700);
  };

  // 2. Push Updates Handler (Press Icon)
  const handlePushUpdates = () => {
    if (syncStatus !== 'idle') return;
    setSyncStatus('pushing');
    setSyncFeedback('Pushing local calibrations & rules…');

    setTimeout(() => {
      setSyncStatus('pushed');
      setSyncFeedback('✓ 12 local calibrations pushed');
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncFeedback('Synced · Engine v2.1.0');
      }, 4000);
    }, 700);
  };

  return (
    <div className="w-[380px] max-h-[550px] overflow-y-auto bg-[#0a0a0a] text-zinc-100 p-3.5 space-y-3 select-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      {/* =========================================================
          1. TIME PERIOD TOGGLE (Segmented Control)
          ========================================================= */}
      <div className="flex items-center p-1 bg-zinc-900/90 border border-zinc-800/90 rounded-xl shadow-inner">
        {['Today', 'Week', 'Month'].map((period) => {
          const isActive = activePeriod === period;
          return (
            <button
              key={period}
              type="button"
              onClick={() => setActivePeriod(period)}
              className={`flex-1 py-1 px-2 text-xs font-medium rounded-lg transition-all duration-150 text-center ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
              }`}
            >
              {period}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          2. ESSENTIAL METRICS (Top 4 Grid)
          ========================================================= */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Time Saved */}
        <div className="bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Time Saved</span>
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-7 h-7 transform -rotate-90">
                <circle
                  cx="14"
                  cy="14"
                  r={radius}
                  stroke="#27272a"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="14"
                  cy="14"
                  r={radius}
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute text-[8px] font-mono text-zinc-400">
                ⏱️
              </span>
            </div>
          </div>
          <div className="mt-0.5">
            <div className="text-lg font-bold text-zinc-100 tracking-tight">
              {data.timeSaved}
            </div>
            <div className="text-[10.5px] font-medium text-emerald-400 mt-0.5 flex items-center gap-1">
              <span>{data.timeSavedSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Prompts Enhanced */}
        <div className="bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Prompts Enhanced</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9.5px] font-semibold text-emerald-400">
              <span>↑</span> {data.promptsTrend}
            </span>
          </div>
          <div className="mt-0.5">
            <div className="text-lg font-bold text-zinc-100 tracking-tight">
              {data.totalPrompts}
            </div>
            <div className="text-[10.5px] text-zinc-400 truncate mt-0.5">
              {data.promptsSubtitle}
            </div>
          </div>
        </div>

        {/* Metric 3: Quality Score */}
        <div className="bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Quality Score</span>
            <span className="text-[11px] text-yellow-500 font-mono tracking-wider">
              {data.stars}
            </span>
          </div>
          <div className="mt-0.5">
            <div className="text-lg font-bold text-zinc-100 tracking-tight flex items-baseline gap-1">
              <span>{data.qualityScore}</span>
              <span className="text-xs font-normal text-zinc-500">/10</span>
            </div>
            <div className="text-[10.5px] text-yellow-500 font-medium truncate mt-0.5">
              {data.qualitySubtitle}
            </div>
          </div>
        </div>

        {/* Metric 4: AI Cost Saved */}
        <div className="bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors border border-zinc-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">AI Cost Saved</span>
            <span className="text-xs">💰</span>
          </div>
          <div className="mt-0.5">
            <div className="text-lg font-bold text-zinc-100 tracking-tight">
              {data.costSaved}
            </div>
            <div className="text-[10.5px] font-medium text-emerald-400 truncate mt-0.5">
              {data.costSubtitle}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. SECONDARY METRICS (Micro-Ribbon)
          ========================================================= */}
      <div className="grid grid-cols-4 gap-1 p-1.5 bg-zinc-900/40 border border-zinc-800/70 rounded-xl text-center">
        <div className="flex flex-col items-center px-0.5">
          <span className="text-xs">🔥</span>
          <span className="text-[10.5px] font-bold text-zinc-200 mt-0.5">5d</span>
          <span className="text-[8.5px] text-zinc-500 uppercase tracking-tight">Streak</span>
        </div>

        <div className="flex flex-col items-center px-0.5 border-l border-zinc-800/80">
          <span className="text-xs">📊</span>
          <span className="text-[10.5px] font-bold text-zinc-200 mt-0.5">2.3k</span>
          <span className="text-[8.5px] text-zinc-500 uppercase tracking-tight">Words+</span>
        </div>

        <div className="flex flex-col items-center px-0.5 border-l border-zinc-800/80">
          <span className="text-xs">🎯</span>
          <span className="text-[10.5px] font-bold text-emerald-400 mt-0.5">94%</span>
          <span className="text-[8.5px] text-zinc-500 uppercase tracking-tight">Accepted</span>
        </div>

        <div className="flex flex-col items-center px-0.5 border-l border-zinc-800/80">
          <span className="text-xs">⚡</span>
          <span className="text-[10.5px] font-bold text-yellow-400 mt-0.5">{data.avgLatency}</span>
          <span className="text-[8.5px] text-zinc-500 uppercase tracking-tight">Latency</span>
        </div>
      </div>

      {/* =========================================================
          4. SYNC & UPDATES CONTROLLER (RECEIVE & PUSH ICONS)
          ========================================================= */}
      <div className="flex items-center justify-between p-2 bg-zinc-900/60 hover:bg-zinc-900/80 transition-all border border-zinc-800/80 rounded-xl">
        <div className="flex items-center gap-2">
          {/* Pulsing Live Status Dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-zinc-200">Refinzi Cloud Sync</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-zinc-800 text-zinc-400 rounded border border-zinc-700/50">
                v2.1.0
              </span>
            </div>
            <span
              className={`text-[10px] transition-colors ${
                syncStatus === 'received'
                  ? 'text-emerald-400 font-medium'
                  : syncStatus === 'pushed'
                  ? 'text-blue-400 font-medium'
                  : 'text-zinc-500'
              }`}
            >
              {syncFeedback}
            </span>
          </div>
        </div>

        {/* Icon Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Receive Updates Button (Press Icon) */}
          <button
            type="button"
            onClick={handleReceiveUpdates}
            disabled={syncStatus !== 'idle'}
            title="Receive Updates: Check for and pull latest prompt rules & calibration models"
            className={`p-1.5 rounded-lg border transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
              syncStatus === 'receiving'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : syncStatus === 'received'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300 hover:text-emerald-400'
            }`}
          >
            {/* Download / Receive Icon */}
            <svg
              className={`w-3.5 h-3.5 ${syncStatus === 'receiving' ? 'animate-bounce text-emerald-400' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-[10px] font-medium hidden sm:inline">Receive</span>
          </button>

          {/* Push Updates Button (Press Icon) */}
          <button
            type="button"
            onClick={handlePushUpdates}
            disabled={syncStatus !== 'idle'}
            title="Push Updates: Sync local calibrations & custom prompt templates to cloud"
            className={`p-1.5 rounded-lg border transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
              syncStatus === 'pushing'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : syncStatus === 'pushed'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300 hover:text-blue-400'
            }`}
          >
            {/* Upload / Push Icon */}
            <svg
              className={`w-3.5 h-3.5 ${syncStatus === 'pushing' ? 'animate-pulse text-blue-400' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-[10px] font-medium hidden sm:inline">Push</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          5. ENHANCED RECENT CALIBRATIONS LIST
          ========================================================= */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Recent Calibrations
          </span>
          <button
            type="button"
            onClick={onNavigateHistory}
            className="text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors cursor-pointer"
          >
            View all →
          </button>
        </div>

        <div className="space-y-2">
          {RECENT_CALIBRATIONS.map((item) => {
            const isExpert = item.mode === 'expert';

            return (
              <div
                key={item.id}
                className="group bg-zinc-900/40 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-2.5 transition-all flex flex-col gap-1.5 cursor-pointer"
              >
                {/* Top Row: Mode badge + Site pill + Time saved + Timestamp */}
                <div className="flex items-center gap-1.5">
                  {/* Mode Badge with Glowing Dot */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isExpert
                          ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]'
                          : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isExpert ? 'text-purple-300' : 'text-yellow-300'
                      }`}
                    >
                      {isExpert ? 'Expert' : 'Better'}
                    </span>
                  </div>

                  {/* AI Site Pill Badge */}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    {item.site}
                  </span>

                  {/* Time Saved & Timestamp */}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[11px] font-medium text-emerald-400">
                      {item.timeSaved}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Truncated Prompt Preview */}
                <p className="text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors truncate font-normal">
                  {item.originalPrompt}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

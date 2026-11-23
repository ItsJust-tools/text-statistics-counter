'use client';

import React from 'react';
import { computeStatistics } from '../tool-definition';
import { DEFAULT_READING_WPM, DEFAULT_SPEAKING_WPM, type ToolState } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

function WpmField({
  label,
  value,
  min,
  max,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  testId: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <input
        type="number"
        data-testid={testId}
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => {
          const n = Math.round(Number(e.target.value));
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
        }}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
    </label>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  const update = (patch: Partial<ToolState>) => onChange({ ...state, ...patch });
  const stats = React.useMemo(() => computeStatistics(state.text), [state.text]);

  return (
    <div className="space-y-5 overflow-y-auto h-full p-4 text-sm" data-testid="text-stats-sidebar">
      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Quick word count</h3>
        <p
          className="text-3xl font-semibold text-gray-900 dark:text-gray-100"
          data-testid="sidebar-word-count"
        >
          {stats.wordCount.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {stats.charCount.toLocaleString()} characters · {stats.sentenceCount.toLocaleString()}{' '}
          sentences
        </p>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Reading speed</h3>
        <div className="space-y-3">
          <WpmField
            label="Reading speed (words per minute)"
            value={state.readingWpm}
            min={10}
            max={2000}
            testId="reading-wpm"
            onChange={(readingWpm) => update({ readingWpm })}
          />
          <WpmField
            label="Speaking speed (words per minute)"
            value={state.speakingWpm}
            min={10}
            max={2000}
            testId="speaking-wpm"
            onChange={(speakingWpm) => update({ speakingWpm })}
          />
          <button
            type="button"
            onClick={() =>
              update({ readingWpm: DEFAULT_READING_WPM, speakingWpm: DEFAULT_SPEAKING_WPM })
            }
            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Reset to defaults ({DEFAULT_READING_WPM}/{DEFAULT_SPEAKING_WPM})
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Appearance</h3>
        <label className="flex items-center justify-between gap-2" htmlFor="dark-mode-toggle">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark mode</span>
          <input
            id="dark-mode-toggle"
            type="checkbox"
            data-testid="dark-mode-toggle"
            checked={state.darkMode}
            onChange={(e) => update({ darkMode: e.target.checked })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>
      </div>
    </div>
  );
};

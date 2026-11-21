'use client';

import React from 'react';
import type { ToolState } from '../types';

interface ToolbarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ state, onChange }) => {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
      data-testid="text-stats-toolbar"
    >
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Text Statistics Counter
      </h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...state, darkMode: !state.darkMode })}
          data-testid="toolbar-dark-toggle"
          aria-pressed={state.darkMode}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {state.darkMode ? '☀️ Light mode' : '🌙 Dark mode'}
        </button>
      </div>
    </div>
  );
};

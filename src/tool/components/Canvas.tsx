'use client';

import React from 'react';
import {
  computeFormatting,
  computeKeywords,
  computeStatistics,
  tokenizeWords,
} from '../tool-definition';
import type { ToolState } from '../types';

export const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. The dog barks, and the fox runs away!

Programming is the art of telling a computer what to do. Good code reads like well-written prose: clear, concise, and easy to follow.

Practice makes perfect. Write code every day, read code written by others, and refactor relentlessly.`;

interface CanvasProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
  onClear: () => void;
}

function buildHighlightedParts(
  text: string,
  keyword: string | null
): { part: string; highlighted: boolean }[] {
  if (!keyword) return [{ part: text, highlighted: false }];
  const parts: { part: string; highlighted: boolean }[] = [];
  const pattern = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ part: text.slice(last, index), highlighted: false });
    parts.push({ part: match[0], highlighted: true });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ part: text.slice(last), highlighted: false });
  return parts;
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange, onClear }) => {
  const [confirmClear, setConfirmClear] = React.useState(false);
  const stats = React.useMemo(() => computeStatistics(state.text), [state.text]);
  const keywords = React.useMemo(() => computeKeywords(state.text), [state.text]);
  const formatting = React.useMemo(
    () => computeFormatting(state.text, state.readingWpm, state.speakingWpm),
    [state.text, state.readingWpm, state.speakingWpm]
  );

  React.useEffect(() => {
    if (!confirmClear) return;
    const t = window.setTimeout(() => setConfirmClear(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmClear]);

  const highlightedParts = React.useMemo(
    () => buildHighlightedParts(state.text, state.highlightedKeyword),
    [state.text, state.highlightedKeyword]
  );

  const handleClearClick = () => {
    if (!state.text.trim()) {
      onClear();
      return;
    }
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const statCards: { label: string; value: string | number }[] = [
    { label: 'Characters', value: stats.charCount.toLocaleString() },
    { label: 'Characters (no spaces)', value: stats.charCountNoSpaces.toLocaleString() },
    { label: 'Words', value: stats.wordCount.toLocaleString() },
    { label: 'Sentences', value: stats.sentenceCount.toLocaleString() },
    { label: 'Paragraphs', value: stats.paragraphCount.toLocaleString() },
    { label: 'Lines', value: stats.lineCount.toLocaleString() },
    { label: `Reading time (${state.readingWpm} wpm)`, value: formatting.readingTime },
    { label: `Speaking time (${state.speakingWpm} wpm)`, value: formatting.speakingTime },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-4" data-testid="text-stats-canvas">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="stat-card rounded-md border border-gray-200 bg-white px-3 py-2 text-center dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {card.value}
            </div>
            <div className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-1">
        <textarea
          aria-label="Text to analyze"
          placeholder="Paste or type your text here…"
          value={state.text}
          onChange={(e) => onChange({ ...state, text: e.target.value })}
          spellCheck={false}
          className="h-full min-h-[220px] w-full resize-none rounded-md border border-gray-300 bg-white p-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        {state.highlightedKeyword ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-3 font-mono text-sm text-transparent"
          >
            {highlightedParts.map((p, i) =>
              p.highlighted ? (
                <mark key={i} className="rounded bg-yellow-300 text-transparent dark:bg-yellow-600">
                  {p.part}
                </mark>
              ) : (
                <span key={i}>{p.part}</span>
              )
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2" data-testid="canvas-actions">
        <button
          type="button"
          onClick={() => onChange({ ...state, text: SAMPLE_TEXT })}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Sample text
        </button>
        {confirmClear ? (
          <button
            type="button"
            onClick={handleClearClick}
            data-testid="confirm-clear"
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Really clear everything?
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClearClick}
            data-testid="clear-button"
            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear text
          </button>
        )}
        {state.highlightedKeyword ? (
          <button
            type="button"
            onClick={() => onChange({ ...state, highlightedKeyword: null })}
            className="rounded-md bg-yellow-200 px-3 py-1.5 text-xs font-medium text-yellow-900 hover:bg-yellow-300 dark:bg-yellow-700 dark:text-yellow-100"
          >
            Clear highlight: “{state.highlightedKeyword}”
          </button>
        ) : null}
      </div>

      {keywords.length > 0 ? (
        <div
          data-testid="keyword-table"
          className="rounded-md border border-gray-200 dark:border-gray-800"
        >
          <h3 className="border-b border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Top keywords (stop words excluded) — click to highlight
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="px-3 py-1.5 font-medium">Keyword</th>
                <th className="px-3 py-1.5 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw) => (
                <tr
                  key={kw.word}
                  className={`cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                    state.highlightedKeyword?.toLowerCase() === kw.word
                      ? 'bg-yellow-100 dark:bg-yellow-900/40'
                      : ''
                  }`}
                  onClick={() =>
                    onChange({
                      ...state,
                      highlightedKeyword:
                        state.highlightedKeyword?.toLowerCase() === kw.word ? null : kw.word,
                    })
                  }
                >
                  <td className="px-3 py-1.5 font-medium text-gray-900 dark:text-gray-100">
                    {kw.word}
                  </td>
                  <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">{kw.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export { tokenizeWords };

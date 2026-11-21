import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import {
  DEFAULT_READING_WPM,
  DEFAULT_SPEAKING_WPM,
  DEFAULT_STATE,
  type Formatting,
  type KeywordFrequency,
  type TextStatistics,
  type ToolState,
} from './types';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'had', 'has', 'have',
  'he', 'her', 'here', 'his', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'me', 'my',
  'no', 'not', 'of', 'on', 'or', 'our', 'she', 'so', 'some', 'that', 'the', 'their', 'them',
  'then', 'there', 'these', 'they', 'this', 'to', 'up', 'was', 'we', 'were', 'what', 'when',
  'which', 'who', 'will', 'with', 'would', 'you', 'your',
]);

function normalizeWpm(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const wpm = Math.round(value);
  if (wpm < 10) return 10;
  if (wpm > 2000) return 2000;
  return wpm;
}

/** Format a duration in seconds as a human-readable string. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} sec`;
  if (rest === 0) return `${minutes} min`;
  return `${minutes} min ${rest} sec`;
}

/** Whitespace-separated word tokens. */
export function tokenizeWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/** Sentence count: segments terminated by ., !, or ?, plus a trailing unterminated one. */
export function countSentences(text: string): number {
  const matches = text.match(/[^.!?\s][^.!?]*[.!?]+(\s|$)|[^.!?\s][^.!?]*$/g);
  return matches ? matches.length : 0;
}

/** Non-empty paragraph count; paragraphs split on blank lines or single newlines. */
export function countParagraphs(text: string): number {
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;
}

/** All statistics for a text; empty/whitespace-only input yields zeros safely. */
export function computeStatistics(text: string): TextStatistics {
  const words = tokenizeWords(text);
  return {
    charCount: text.length,
    charCountNoSpaces: countNonSpaceChars(text),
    wordCount: words.length,
    sentenceCount: words.length === 0 ? 0 : countSentences(text),
    paragraphCount: words.length === 0 ? 0 : countParagraphs(text),
    lineCount: text.length === 0 ? 0 : text.split('\n').length,
  };
}

function countNonSpaceChars(text: string): number {
  return Array.from(text).filter((c) => /\S/.test(c)).length;
}

/** Top keyword frequencies, excluding stop words. Lowercase-normalized. */
export function computeKeywords(text: string, limit = 15): KeywordFrequency[] {
  const words = text
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}

/** Reading and speaking time for the state's word count and wpm settings. */
export function computeFormatting(text: string, readingWpm: number, speakingWpm: number): Formatting {
  const words = tokenizeWords(text).length;
  const wpmR = normalizeWpm(readingWpm, DEFAULT_READING_WPM);
  const wpmS = normalizeWpm(speakingWpm, DEFAULT_SPEAKING_WPM);
  const readingSeconds = wpmR > 0 ? (words / wpmR) * 60 : 0;
  const speakingSeconds = wpmS > 0 ? (words / wpmS) * 60 : 0;
  return {
    readingTime: formatDuration(readingSeconds),
    speakingTime: formatDuration(speakingSeconds),
  };
}

export const textStatisticsTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: { ...DEFAULT_STATE },
  serialize: (state) => JSON.stringify(state),
  deserialize: (data): DeserializeResult<ToolState> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid data format: expected text statistics state object' };
    }
    const v = data as Partial<ToolState>;
    if (typeof v.text !== 'string') {
      return { success: false, error: 'Invalid data format: expected { text: string, ... }' };
    }
    return {
      success: true,
      data: {
        text: v.text,
        readingWpm: normalizeWpm(v.readingWpm, DEFAULT_READING_WPM),
        speakingWpm: normalizeWpm(v.speakingWpm, DEFAULT_SPEAKING_WPM),
        highlightedKeyword: typeof v.highlightedKeyword === 'string' && v.highlightedKeyword.trim() ? v.highlightedKeyword : null,
        darkMode: typeof v.darkMode === 'boolean' ? v.darkMode : DEFAULT_STATE.darkMode,
      },
    };
  },
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};

export { STOP_WORDS };

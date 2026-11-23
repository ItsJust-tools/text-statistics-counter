import { describe, it, expect } from 'vitest';
import {
  textStatisticsTool,
  computeStatistics,
  computeKeywords,
  computeFormatting,
  formatDuration,
  tokenizeWords,
  countSentences,
  countParagraphs,
} from '../../src/tool/tool-definition';
import { DEFAULT_STATE, DEFAULT_READING_WPM, DEFAULT_SPEAKING_WPM } from '../../src/tool/types';
import type { ToolState } from '../../src/tool/types';

const SAMPLE = `The quick brown fox jumps over the lazy dog. The dog barks, and the fox runs away!

Programming is the art of telling a computer what to do. Good code reads like prose.

Practice makes perfect. Write code every day.`;

const state = (patch: Partial<ToolState> = {}): ToolState => ({ ...DEFAULT_STATE, ...patch });

describe('computeStatistics', () => {
  it('counts characters with and without spaces', () => {
    const stats = computeStatistics('Hello world');
    expect(stats.charCount).toBe(11);
    expect(stats.charCountNoSpaces).toBe(10);
  });

  it('counts a multi-paragraph sample correctly', () => {
    const stats = computeStatistics(SAMPLE);
    expect(stats.wordCount).toBe(tokenizeWords(SAMPLE).length);
    expect(stats.paragraphCount).toBe(3);
    expect(stats.sentenceCount).toBe(6);
    expect(stats.lineCount).toBe(5);
    expect(stats.charCount).toBe(SAMPLE.length);
  });

  it('handles empty and whitespace-only input without errors', () => {
    for (const text of ['', '   ', '\n\n\t  \n']) {
      const stats = computeStatistics(text);
      expect(stats.wordCount).toBe(0);
      expect(stats.sentenceCount).toBe(0);
      expect(stats.paragraphCount).toBe(0);
      expect(stats.lineCount).toBe(text.length === 0 ? 0 : text.split('\n').length);
      expect(stats.charCountNoSpaces).toBe(0);
    }
  });

  it('counts lines including blank lines', () => {
    expect(computeStatistics('a\n\nb').lineCount).toBe(3);
  });

  it('counts sentences terminated mixedly, including a trailing unterminated one', () => {
    expect(countSentences('One. Two! Three? Four')).toBe(4);
    expect(countSentences('One. Two! Three?')).toBe(3);
    expect(countSentences('No terminator here')).toBe(1);
    expect(countSentences('...')).toBe(0);
    expect(countSentences('Dr. Smith went home.')).toBe(2);
  });

  it('counts paragraphs on blank-line and newline boundaries', () => {
    expect(countParagraphs('a\n\nb\nc')).toBe(3);
    expect(countParagraphs('  \n\n  ')).toBe(0);
  });
});

describe('computeFormatting / reading + speaking time', () => {
  it('respects configurable wpm', () => {
    // 100 words
    const text = Array.from({ length: 100 }, (_, i) => `w${i % 10}`).join(' ');
    expect(computeFormatting(text, 200, 200).readingTime).toBe('30 sec');
    expect(computeFormatting(text, 100, 100).readingTime).toBe('1 min');
    expect(computeFormatting(text, 50, 50).readingTime).toBe('2 min');
  });

  it('uses independent speaking wpm', () => {
    const text = Array.from({ length: 130 }, (_, i) => `w${i % 10}`).join(' ');
    expect(computeFormatting(text, 200, 130).speakingTime).toBe('1 min');
    expect(computeFormatting(text, 200, 65).speakingTime).toBe('2 min');
  });

  it('defaults are 200 reading / 130 speaking', () => {
    expect(DEFAULT_READING_WPM).toBe(200);
    expect(DEFAULT_SPEAKING_WPM).toBe(130);
  });

  it('formats durations', () => {
    expect(formatDuration(0)).toBe('0 sec');
    expect(formatDuration(45)).toBe('45 sec');
    expect(formatDuration(60)).toBe('1 min');
    expect(formatDuration(138)).toBe('2 min 18 sec');
  });

  it('zero words yields zero time', () => {
    expect(computeFormatting('', 200, 130).readingTime).toBe('0 sec');
    expect(computeFormatting('   ', 200, 130).speakingTime).toBe('0 sec');
  });
});

describe('computeKeywords', () => {
  it('excludes stop words and ranks by frequency', () => {
    const keywords = computeKeywords(SAMPLE);
    const words = keywords.map((k) => k.word);
    expect(words).not.toContain('the');
    expect(words).not.toContain('a');
    expect(words).not.toContain('is');
    expect(words).not.toContain('and');
    const fox = keywords.find((k) => k.word === 'fox');
    expect(fox?.count).toBe(2);
    const counts = keywords.map((k) => k.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    const top = keywords[0]!;
    expect(keywords.filter((k) => k.count > top.count)).toHaveLength(0);
  });

  it('is case-insensitive and strips punctuation', () => {
    const keywords = computeKeywords('Fox! fox? FOX the fox.');
    expect(keywords[0]).toEqual({ word: 'fox', count: 4 });
  });

  it('returns empty for empty/whitespace input', () => {
    expect(computeKeywords('')).toEqual([]);
    expect(computeKeywords('the and of')).toEqual([]);
  });
});

describe('serialize/deserialize URL state', () => {
  it('round-trips full state', () => {
    const s = state({
      text: 'Hello world. Hello again!',
      readingWpm: 350,
      speakingWpm: 90,
      highlightedKeyword: 'hello',
      darkMode: true,
    });
    const json = textStatisticsTool.serialize(s);
    const result = textStatisticsTool.deserialize(JSON.parse(json));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(s);
  });

  it('rejects invalid payloads', () => {
    expect(textStatisticsTool.deserialize(null).success).toBe(false);
    expect(textStatisticsTool.deserialize('string').success).toBe(false);
    expect(textStatisticsTool.deserialize({ readingWpm: 200 }).success).toBe(false);
    expect(textStatisticsTool.deserialize({ text: 42 }).success).toBe(false);
  });

  it('normalizes optional fields with defaults', () => {
    const result = textStatisticsTool.deserialize({ text: 'hi' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe('hi');
      expect(result.data.readingWpm).toBe(DEFAULT_READING_WPM);
      expect(result.data.speakingWpm).toBe(DEFAULT_SPEAKING_WPM);
      expect(result.data.highlightedKeyword).toBeNull();
      expect(result.data.darkMode).toBe(false);
    }
  });

  it('clamps out-of-range wpm values safely', () => {
    const result = textStatisticsTool.deserialize({
      text: 'hi',
      readingWpm: -50,
      speakingWpm: 99999,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.readingWpm).toBe(10);
      expect(result.data.speakingWpm).toBe(2000);
    }
  });

  it('treats empty highlightedKeyword as null', () => {
    const result = textStatisticsTool.deserialize({ text: 'hi', highlightedKeyword: '  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.highlightedKeyword).toBeNull();
  });
});

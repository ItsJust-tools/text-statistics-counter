export interface ToolState {
  /** The user's text content. */
  text: string;
  /** Reading time words-per-minute (default 200). */
  readingWpm: number;
  /** Speaking time words-per-minute (default 130). */
  speakingWpm: number;
  /** Keyword currently highlighted in the text, or null. */
  highlightedKeyword: string | null;
  /** Dark mode toggle. */
  darkMode: boolean;
}

export const DEFAULT_READING_WPM = 200;
export const DEFAULT_SPEAKING_WPM = 130;

export const DEFAULT_STATE: ToolState = {
  text: '',
  readingWpm: DEFAULT_READING_WPM,
  speakingWpm: DEFAULT_SPEAKING_WPM,
  highlightedKeyword: null,
  darkMode: false,
};

export interface TextStatistics {
  /** Characters including spaces. */
  charCount: number;
  /** Characters excluding whitespace. */
  charCountNoSpaces: number;
  /** Whitespace-separated words. */
  wordCount: number;
  /** Sentences split on ., !, or ? terminators. */
  sentenceCount: number;
  /** Non-empty paragraphs (blank-line separated). */
  paragraphCount: number;
  /** Lines including blank lines. */
  lineCount: number;
}

export interface KeywordFrequency {
  word: string;
  count: number;
}

export interface Formatting {
  /** Human-readable reading time, e.g. "2 min 18 sec". */
  readingTime: string;
  /** Human-readable speaking time. */
  speakingTime: string;
}

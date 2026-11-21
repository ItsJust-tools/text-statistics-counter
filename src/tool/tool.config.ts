import type { ToolConfig, ToolTheme } from '@itsjust/core';

const toolTheme: ToolTheme = {
  brand: 'Text Statistics Counter',
  accent: '#0ea5e9',
};

export const toolConfig: ToolConfig = {
  id: 'tool-1795233873',
  name: 'Text Statistics Counter',
  description:
    'Analyzes pasted text and shows live character, word, sentence, paragraph, and reading-time statistics with keyword frequency highlights.',
  version: '1.0.0',
  exportFormats: ['png', 'jpeg', 'webp', 'pdf'],
  features: {
    export: true,
    autoSave: true,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: toolTheme,
};

export default toolConfig;

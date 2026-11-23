import type { ToolConfig } from '@itsjust/core';

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
  theme: {
    accent: '#0ea5e9',
    accentHover: '#0284c7',
    accentSubtle: 'rgba(14, 165, 233, 0.12)',
    brand: 'Text Statistics Counter',
    icon: '\u{1F4CA}',
  },
};

export default toolConfig;

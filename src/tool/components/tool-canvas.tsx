'use client';

import React from 'react';
import { Canvas } from './Canvas';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import type { ToolState } from '../types';

interface ToolCanvasProps {
  state: ToolState;
  readOnly?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onStateChange?: (updater: (prev: ToolState) => ToolState) => void;
  onClear?: () => void;
}

function apply(next: ToolState, onStateChange?: ToolCanvasProps['onStateChange']) {
  onStateChange?.(() => next);
}

export function ToolCanvas({
  state,
  readOnly = false,
  canvasRef,
  onStateChange,
  onClear,
}: ToolCanvasProps) {
  return (
    <div
      ref={canvasRef}
      className="converter-canvas"
      role="application"
      aria-label="Text statistics canvas"
      data-theme={state.darkMode ? 'dark' : 'light'}
    >
      <Toolbar state={state} onChange={(next) => apply(next, onStateChange)} />
      <Canvas
        state={state}
        onChange={(next) => apply(next, onStateChange)}
        onClear={onClear ?? (() => {})}
      />
      {readOnly ? null : null}
    </div>
  );
}

export function ToolSidebar({
  state,
  onStateChange,
}: {
  state: ToolState;
  onStateChange?: (updater: (prev: ToolState) => ToolState) => void;
}) {
  return <Sidebar state={state} onChange={(next) => apply(next, onStateChange)} />;
}

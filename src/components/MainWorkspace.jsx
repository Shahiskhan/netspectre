import React from 'react'
import useStore from '@/store/useStore'
import ControlPanel  from './ControlPanel'
import TerminalView  from './TerminalView'
import ResizeHandle  from './ResizeHandle'

/**
 * MainWorkspace is the right-hand content area.
 * It contains:
 *  - ControlPanel (tool header + target input + tool controls + preview strip)
 *  - ResizeHandle (drag separator)
 *  - TerminalView (output panel)
 */
export default function MainWorkspace() {
  const terminalHeight = useStore((s) => s.terminalHeight)

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-vscode-bg">
      {/* Upper area: ControlPanel (takes remaining vertical space) */}
      <div className="flex flex-col" style={{ flex: '1 1 auto', overflow: 'hidden', minHeight: 0 }}>
        <ControlPanel />

        {/* Placeholder / welcome content in the editor area */}
        <EditorArea />
      </div>

      {/* Drag handle */}
      <ResizeHandle />

      {/* Terminal panel: fixed height, scrollable internally */}
      <TerminalView height={terminalHeight} />
    </div>
  )
}

// ── Editor area placeholder ────────────────────────────────────────────────────
function EditorArea() {
  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden">
      <div className="text-center opacity-20 select-none">
        <svg
          className="w-20 h-20 mx-auto mb-4"
          viewBox="0 0 80 80"
          fill="none"
        >
          {/* Shield outline */}
          <path
            d="M40 8 L68 20 L68 42 C68 58 54 70 40 74 C26 70 12 58 12 42 L12 20 Z"
            stroke="#007acc"
            strokeWidth="2"
            fill="none"
          />
          {/* Network nodes */}
          <circle cx="40" cy="38" r="4" fill="#007acc" />
          <circle cx="24" cy="30" r="3" fill="#4ec9b0" />
          <circle cx="56" cy="30" r="3" fill="#4ec9b0" />
          <circle cx="32" cy="52" r="3" fill="#4ec9b0" />
          <circle cx="48" cy="52" r="3" fill="#4ec9b0" />
          <line x1="40" y1="38" x2="24" y2="30" stroke="#4ec9b0" strokeWidth="1" />
          <line x1="40" y1="38" x2="56" y2="30" stroke="#4ec9b0" strokeWidth="1" />
          <line x1="40" y1="38" x2="32" y2="52" stroke="#4ec9b0" strokeWidth="1" />
          <line x1="40" y1="38" x2="48" y2="52" stroke="#4ec9b0" strokeWidth="1" />
        </svg>
        <p className="text-vscode-textDim text-sm font-medium">NetSpectre</p>
        <p className="text-vscode-textDim text-xs mt-1">
          Select a tool, enter a target, and press Run
        </p>
      </div>
    </div>
  )
}

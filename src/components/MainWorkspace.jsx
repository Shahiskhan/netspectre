import React from 'react'
import useStore, { TOOLS } from '@/store/useStore'
import ControlPanel  from './ControlPanel'
import TerminalView  from './TerminalView'
import ResizeHandle  from './ResizeHandle'
import SideNotesPanel from './SideNotesPanel'

/**
 * MainWorkspace contains the workspace tabs, diagnostics area, and notes column.
 */
export default function MainWorkspace() {
  const terminalHeight = useStore((s) => s.terminalHeight)
  const tabs = useStore((s) => s.workspaceTabs)
  const activeWorkspaceId = useStore((s) => s.activeWorkspaceId)

  return (
    <div className="flex flex-1 min-w-0 flex-col overflow-hidden bg-vscode-bg">
      <div className="flex h-9 shrink-0 items-stretch border-b border-vscode-border bg-vscode-titlebar">
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          {tabs.map((tab, index) => {
            const isActive = activeWorkspaceId === tab.id
            const title = tab.title || TOOLS.find((item) => item.id === tab.activeTool)?.label || 'Workspace'

            return (
              <div
                key={tab.id}
                className={`group relative flex min-w-0 max-w-64 shrink-0 items-center border-r border-vscode-border
                  ${isActive ? 'bg-vscode-bg text-vscode-textActive' : 'text-vscode-textDim hover:bg-vscode-hover'}`}
              >
                {tab.isRunning && (
                  <span
                    className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-vscode-green"
                    title="Command running in this workspace"
                  />
                )}
                <button
                  type="button"
                  onClick={() => useStore.getState().setActiveWorkspace(tab.id)}
                  title={title}
                  className="min-w-0 flex-1 truncate px-3 text-left text-xs"
                >
                  {title}
                </button>
                <button
                  type="button"
                  onClick={() => useStore.getState().closeWorkspace(tab.id)}
                  disabled={tab.isRunning || tabs.length === 1}
                  title={tab.isRunning ? 'Stop the running command before closing this tab' : 'Close workspace'}
                  aria-label={`Close ${title}`}
                  className="mr-1 rounded px-1 text-xs text-vscode-textDim
                             hover:bg-vscode-border hover:text-vscode-textActive
                             disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ×
                </button>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vscode-active" />
                )}
                <span className="sr-only">Tab {index + 1}</span>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => useStore.getState().createWorkspace()}
          title="Create workspace tab"
          aria-label="Create workspace tab"
          className="w-9 shrink-0 text-lg text-vscode-textDim hover:bg-vscode-hover
                     hover:text-vscode-textActive"
        >
          +
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-col" style={{ flex: '1 1 auto', overflow: 'hidden', minHeight: 0 }}>
            <ControlPanel />
            <EditorArea />
          </div>

          <ResizeHandle />
          <TerminalView height={terminalHeight} />
        </section>
        <SideNotesPanel />
      </div>
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

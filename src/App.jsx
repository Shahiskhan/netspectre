import React from 'react'
import TitleBar      from '@/components/TitleBar'
import Sidebar       from '@/components/Sidebar'
import MainWorkspace from '@/components/MainWorkspace'
import StatusBar     from '@/components/StatusBar'

/**
 * Root layout — VS Code-inspired chrome:
 *
 *  ┌─────────────────────────────────────────────┐
 *  │  TitleBar (drag region + window controls)   │
 *  ├──────┬──────────────────────────────────────┤
 *  │      │  ControlPanel (target + tool opts)   │
 *  │ Side │──────────────────────────────────────│
 *  │ bar  │  EditorArea (placeholder)            │
 *  │      │──────────────────────────────────────│
 *  │      │  ResizeHandle                        │
 *  │      │──────────────────────────────────────│
 *  │      │  TerminalView                        │
 *  ├──────┴──────────────────────────────────────┤
 *  │  StatusBar                                  │
 *  └─────────────────────────────────────────────┘
 */
export default function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-vscode-bg text-vscode-text">
      {/* Custom title bar */}
      <TitleBar />

      {/* Main body: sidebar + workspace */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainWorkspace />
      </div>

      {/* VS Code-style status bar */}
      <StatusBar />
    </div>
  )
}

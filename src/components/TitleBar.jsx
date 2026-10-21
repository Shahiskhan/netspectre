import React from 'react'
import useStore, { TOOLS, selectActiveWorkspace } from '@/store/useStore'
import DockerStatus from '@/components/DockerStatus'
import logo from '@/assets/logo.png'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export default function TitleBar() {
  const activeToolId = useStore((s) => selectActiveWorkspace(s).activeTool)
  const tool = TOOLS.find((t) => t.id === activeToolId)

  const minimize = () => isElectron && window.electronAPI.window.minimize()
  const maximize = () => isElectron && window.electronAPI.window.maximize()
  const close    = () => isElectron && window.electronAPI.window.close()

  return (
    <div
      className="drag-region flex items-center justify-between h-9 bg-vscode-titlebar
                 border-b border-vscode-border select-none shrink-0"
    >
      {/* Left: App branding */}
      <div className="no-drag flex items-center h-full">
        <div className="flex items-center gap-2 px-4">
          <img src={logo} alt="" className="h-7 w-7 object-contain" />
          <span className="text-xs font-semibold text-vscode-textActive tracking-wide">
            NETSPECTRE
          </span>
          <span className="text-vscode-border">|</span>
          <span className="text-xs text-vscode-textDim hidden sm:block">
            {tool?.description ?? 'Desktop Security & Networking Diagnostics'}
          </span>
        </div>

        {/* Docker status pill — sits right after branding */}
        <DockerStatus />
      </div>

      {/* Center: active tool name */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-xs text-vscode-textDim">{tool?.label ?? 'NetSpectre'}</span>
      </div>

      {/* Right: Window controls */}
      <div className="no-drag flex items-center h-full">
        <button
          onClick={minimize}
          title="Minimize"
          className="h-full px-4 hover:bg-vscode-hover text-vscode-textDim
                     hover:text-vscode-textActive transition-colors duration-100"
        >
          <svg width="10" height="10" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={maximize}
          title="Maximize"
          className="h-full px-4 hover:bg-vscode-hover text-vscode-textDim
                     hover:text-vscode-textActive transition-colors duration-100"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="0.5" y="0.5" width="9" height="9" fill="none"
                  stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          onClick={close}
          title="Close"
          className="h-full px-4 hover:bg-red-600 text-vscode-textDim
                     hover:text-white transition-colors duration-100"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M0 0 L10 10 M10 0 L0 10"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

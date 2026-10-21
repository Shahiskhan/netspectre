import React, { useEffect } from 'react'
import useStore, { TOOLS, selectActiveWorkspace } from '@/store/useStore'
import { buildCommand } from '@/utils/commandBuilder'
import { ToolIcon, IconRun, IconStop } from '@/components/icons/Icons'
import { useCommandRunner } from '@/hooks/useCommandRunner'
import NmapControls     from './controls/NmapControls'
import NslookupControls from './controls/NslookupControls'
import DigControls      from './controls/DigControls'
import CurlControls     from './controls/CurlControls'
import ExtraControls    from './controls/ExtraControls'

// Map toolId → specific controls component
const CONTROLS_MAP = {
  nmap:      NmapControls,
  nslookup:  NslookupControls,
  dig:       DigControls,
  curl:      CurlControls,
  extra:     ExtraControls,
}

export default function ControlPanel() {
  const activeToolId      = useStore((s) => selectActiveWorkspace(s).activeTool)
  const target            = useStore((s) => selectActiveWorkspace(s).targetInput)
  const setTarget         = useStore((s) => s.setTarget)
  const toolOptions       = useStore((s) => selectActiveWorkspace(s).options)
  const commandPreview    = useStore((s) => selectActiveWorkspace(s).commandPreview)
  const setCommandPreview = useStore((s) => s.setCommandPreview)
  const isRunning         = useStore((s) => selectActiveWorkspace(s).isRunning)

  const tool         = TOOLS.find((t) => t.id === activeToolId)
  const ToolControls = CONTROLS_MAP[activeToolId] ?? null

  // Hook handles Docker IPC subscription + run/stop logic
  const { run, stop } = useCommandRunner()

  // Rebuild command preview whenever target/tool/options change
  useEffect(() => {
    const { preview } = buildCommand(activeToolId, target, toolOptions)
    setCommandPreview(preview)
  }, [activeToolId, target, toolOptions, setCommandPreview])

  // Enter key in target field triggers run
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isRunning) run()
  }

  return (
    <div className="flex flex-col gap-0 border-b border-vscode-border shrink-0">

      {/* ── Tool header + target input + run button ────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-vscode-border">

        {/* Tool label */}
        <div className="flex items-center gap-2 shrink-0">
          <span style={{ color: tool?.color }}>
            <ToolIcon id={activeToolId} size={18} />
          </span>
          <span className="text-sm font-semibold tracking-wide" style={{ color: tool?.color }}>
            {tool?.label}
          </span>
        </div>

        {/* Target input */}
        <div className="flex-1 flex items-center gap-2 max-w-xl">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vscode-textDim text-xs select-none">
              ❯
            </span>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tool?.placeholder ?? 'Enter target...'}
              disabled={isRunning}
              className="w-full h-9 pl-7 pr-3 rounded bg-vscode-inputBg
                         text-vscode-textActive text-sm font-mono
                         border border-vscode-border
                         focus:outline-none focus:border-vscode-active
                         placeholder-vscode-textDim
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-100"
            />
          </div>
        </div>

        {/* Run / Stop button */}
        <button
          onClick={isRunning ? stop : run}
          disabled={!target.trim() && !isRunning}
          className={`
            flex items-center gap-2 px-4 h-9 rounded text-sm font-semibold
            transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
            ${isRunning
              ? 'bg-vscode-red hover:brightness-110 text-white'
              : 'bg-vscode-active hover:brightness-110 text-white'
            }
          `}
        >
          {isRunning ? (
            <><IconStop size={14} /><span>Stop</span></>
          ) : (
            <><IconRun size={14} /><span>Run</span></>
          )}
        </button>

        {/* Live indicator */}
        {isRunning && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="pulse-dot w-2 h-2 rounded-full bg-vscode-green" />
            <span className="text-xs text-vscode-green">Running…</span>
          </div>
        )}
      </div>

      {/* ── Tool-specific option controls ─────────────────────────────── */}
      {ToolControls && (
        <div className="px-4 py-2.5 bg-vscode-sidebar border-b border-vscode-border">
          <ToolControls />
        </div>
      )}

      {/* ── Command preview strip ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-vscode-terminal/50 border-b border-vscode-border min-h-[32px]">
        <span className="text-[10px] text-vscode-textDim uppercase tracking-widest shrink-0">
          Docker exec:
        </span>
        <code
          className="text-xs font-mono flex-1 overflow-x-auto whitespace-nowrap"
          dangerouslySetInnerHTML={{
            __html: commandPreview
              ? `<span class="text-vscode-textDim">docker exec netspectre-runner </span>${commandPreview}`
              : '<span class="text-vscode-textDim">—</span>',
          }}
        />
      </div>
    </div>
  )
}

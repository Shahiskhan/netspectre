import React from 'react'
import useStore, { TOOLS, selectActiveWorkspace } from '@/store/useStore'

export default function StatusBar() {
  const activeToolId = useStore((s) => selectActiveWorkspace(s).activeTool)
  const target       = useStore((s) => selectActiveWorkspace(s).targetInput)
  const isRunning    = useStore((s) => selectActiveWorkspace(s).isRunning)
  const lines        = useStore((s) => selectActiveWorkspace(s).terminalOutput)

  const tool = TOOLS.find((t) => t.id === activeToolId)

  return (
    <div
      className="flex items-center justify-between h-6 px-3
                 text-[11px] shrink-0 select-none"
      style={{ backgroundColor: tool?.color ?? '#007acc' }}
    >
      {/* Left: active tool + status */}
      <div className="flex items-center gap-3 text-black/70 font-medium">
        <span>{tool?.label}</span>
        {target && (
          <>
            <span>›</span>
            <span className="font-mono">{target}</span>
          </>
        )}
        {isRunning && <span className="text-black/80">● Running</span>}
      </div>

      {/* Right: line count + platform */}
      <div className="flex items-center gap-3 text-black/60">
        {lines.length > 0 && <span>{lines.length} lines</span>}
        <span>Windows</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}

import React from 'react'
import useStore, { TOOLS } from '@/store/useStore'

export default function StatusBar() {
  const activeToolId = useStore((s) => s.activeToolId)
  const target       = useStore((s) => s.target)
  const isRunning    = useStore((s) => s.isRunning)
  const lines        = useStore((s) => s.terminalLines)

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

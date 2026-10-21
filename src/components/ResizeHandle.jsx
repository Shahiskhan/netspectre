import React, { useRef, useCallback } from 'react'
import useStore from '@/store/useStore'

/**
 * Drag-to-resize handle between the editor area and the terminal.
 * Adjusts `terminalHeight` in the Zustand store.
 */
export default function ResizeHandle() {
  const setTerminalHeight = useStore((s) => s.setTerminalHeight)
  const isDragging = useRef(false)
  const startY     = useRef(0)
  const startH     = useRef(0)

  const onMouseDown = useCallback(
    (e) => {
      e.preventDefault()
      isDragging.current = true
      startY.current = e.clientY
      startH.current = useStore.getState().terminalHeight

      const onMove = (ev) => {
        if (!isDragging.current) return
        const delta = startY.current - ev.clientY   // drag up → terminal grows
        setTerminalHeight(startH.current + delta)
      }

      const onUp = () => {
        isDragging.current = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [setTerminalHeight]
  )

  return (
    <div
      onMouseDown={onMouseDown}
      className="resize-handle h-1 w-full bg-vscode-border hover:bg-vscode-active
                 transition-colors duration-150 shrink-0 group"
      title="Drag to resize terminal"
    >
      {/* Visual drag indicator */}
      <div className="w-12 h-0.5 bg-vscode-textDim/30 group-hover:bg-vscode-active
                      mx-auto rounded transition-colors duration-150" />
    </div>
  )
}

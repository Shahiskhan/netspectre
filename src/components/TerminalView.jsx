import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import useStore, { selectActiveWorkspace } from '@/store/useStore'
import { IconTerminal, IconCopy } from '@/components/icons/Icons'

/**
 * TerminalView renders output as styled monospace lines.
 * Uses a virtual scrolling approach via a div + auto-scroll.
 * xterm.js integration is kept optional — the styled-div approach
 * gives us full React control and CSS theming without canvas complexity.
 */
export default function TerminalView({ height }) {
  const lines       = useStore((s) => selectActiveWorkspace(s).terminalOutput)
  const clearLines  = useStore((s) => s.clearTerminal)
  const isRunning   = useStore((s) => selectActiveWorkspace(s).isRunning)
  const [copyStatus, setCopyStatus] = useState('')
  const [filter, setFilter] = useState('')
  const bodyRef     = useRef(null)
  const shouldScroll = useRef(true)
  const visibleLines = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase()
    if (!query) return lines
    return lines.filter((line) => (
      `${line.type} ${line.data}`.toLocaleLowerCase().includes(query)
    ))
  }, [filter, lines])

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    if (shouldScroll.current && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [lines])

  // Detect manual scroll-up to pause auto-scroll
  const handleScroll = () => {
    const el = bodyRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    shouldScroll.current = nearBottom
  }

  const handleCopy = useCallback(() => {
    const text = lines.map((l) => l.data).join('')
    if (!navigator.clipboard?.writeText) {
      setCopyStatus('Clipboard access is unavailable. Use Export TXT instead.')
      return
    }
    navigator.clipboard.writeText(text)
      .then(() => setCopyStatus('Copied'))
      .catch((error) => {
        setCopyStatus(`Copy failed: ${error.message}`)
      })
  }, [lines])

  const handleExport = useCallback(() => {
    const text = lines.map((line) => line.data).join('')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    link.href = url
    link.download = `netspectre-output-${timestamp}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [lines])

  return (
    <div
      className="flex flex-col bg-vscode-terminal"
      style={{ height }}
    >
      {/* ── Terminal header bar ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-1.5
                   bg-vscode-sidebar border-b border-vscode-border shrink-0"
      >
        <div className="flex items-center gap-2">
          <IconTerminal size={14} className="text-vscode-textDim" />
          <span className="text-xs font-medium text-vscode-textDim uppercase tracking-widest">
            Terminal Output
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 ml-2">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-vscode-green inline-block" />
              <span className="text-[10px] text-vscode-green">Live</span>
            </span>
          )}
          {filter && lines.length > 0 && (
            <span className="text-[10px] text-vscode-textDim">
              ({visibleLines.length} matches)
            </span>
          )}
          {!filter && lines.length > 0 && (
            <span className="text-[10px] text-vscode-textDim">
              ({lines.length} lines)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter output..."
            aria-label="Filter terminal output"
            className="w-32 h-7 px-2 rounded text-xs
                       bg-vscode-inputBg text-vscode-textActive border border-vscode-border
                       focus:outline-none focus:border-vscode-active placeholder-vscode-textDim"
          />

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={lines.length === 0}
            title="Copy all output"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs
                       text-vscode-textDim hover:text-vscode-textActive hover:bg-vscode-hover
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <IconCopy size={12} />
            <span>Copy</span>
          </button>

          <button
            onClick={handleExport}
            disabled={lines.length === 0}
            title="Export output to TXT"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs
                       text-vscode-textDim hover:text-vscode-textActive hover:bg-vscode-hover
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span>Export TXT</span>
          </button>

          {/* Clear button */}
          <button
            onClick={clearLines}
            disabled={lines.length === 0}
            title="Clear terminal"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs
                       text-vscode-textDim hover:text-vscode-red hover:bg-vscode-hover
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-xs">🗑</span>
            <span>Clear</span>
          </button>
        </div>
      </div>
      {copyStatus && (
        <div role="status" className="px-3 py-1 text-[10px] text-vscode-textDim bg-vscode-sidebar">
          {copyStatus}
        </div>
      )}

      {/* ── Output body ─────────────────────────────────────────────────── */}
      <div
        ref={bodyRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed select-text"
        style={{ backgroundColor: '#0c0c0c' }}
      >
        {lines.length === 0 ? (
          <EmptyState />
        ) : (
          visibleLines.map((line) => (
            <TerminalLine key={line.id} line={line} />
          ))
        )}
        {lines.length > 0 && visibleLines.length === 0 && (
          <p className="text-vscode-textDim text-xs">No output matches this filter.</p>
        )}

        {/* Blinking cursor at end */}
        {isRunning && (
          <span className="inline-block w-2 h-4 bg-vscode-textActive ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  )
}

// ── Empty state placeholder ────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30 select-none">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2"
              stroke="#858585" strokeWidth="1" />
        <path d="M7 9 L10 12 L7 15" stroke="#858585" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15 L17 15" stroke="#858585" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <p className="text-vscode-textDim text-xs">No output yet</p>
        <p className="text-vscode-textDim text-[10px] mt-1">
          Enter a target above and press Run
        </p>
      </div>
    </div>
  )
}

// ── Individual terminal line ───────────────────────────────────────────────────
const LINE_STYLES = {
  cmd:    { color: '#4ec9b0', prefix: '$ ' },
  info:   { color: '#858585', prefix: '  ' },
  stdout: { color: '#cccccc', prefix: '  ' },
  stderr: { color: '#f44747', prefix: '⚠ ' },
  error:  { color: '#f44747', prefix: '✕ ' },
  success:{ color: '#4ec9b0', prefix: '  ' },
  exit:   { color: '#858585', prefix: '  ' },
}

function TerminalLine({ line }) {
  const style = LINE_STYLES[line.type] ?? LINE_STYLES.stdout
  const ts    = new Date(line.ts).toLocaleTimeString('en-US', { hour12: false })

  return (
    <div className="flex gap-2 group hover:bg-white/[0.03] rounded px-1 -mx-1">
      {/* Timestamp */}
      <span className="shrink-0 text-[10px] text-vscode-textDim/50 group-hover:text-vscode-textDim/70
                       transition-colors pt-px select-none w-16 text-right">
        {ts}
      </span>

      {/* Prefix glyph */}
      <span
        className="shrink-0 select-none w-4"
        style={{ color: style.color }}
      >
        {style.prefix}
      </span>

      {/* Content */}
      <span
        className="flex-1 break-all whitespace-pre-wrap select-text"
        style={{ color: style.color }}
      >
        {line.data}
      </span>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

/**
 * Polls Docker status every 10 s and shows a compact indicator in the title bar.
 * Clicking it triggers a manual refresh.
 */
export default function DockerStatus() {
  const [status, setStatus] = useState({
    dockerRunning: null,  // null = unknown/loading
    imageBuilt:    false,
    containerUp:   false,
  })
  const [checking, setChecking] = useState(false)

  const refresh = useCallback(async () => {
    if (!isElectron) return
    setChecking(true)
    try {
      const s = await window.electronAPI.getDockerStatus()
      setStatus(s)
    } catch {
      setStatus({ dockerRunning: false, imageBuilt: false, containerUp: false })
    } finally {
      setChecking(false)
    }
  }, [])

  // Initial check + 10-second polling
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 10_000)
    return () => clearInterval(id)
  }, [refresh])

  // ── Derive display state ────────────────────────────────────────────────
  let dot   = 'bg-gray-500'
  let label = 'Docker unknown'
  let title = 'Click to refresh Docker status'

  if (checking || status.dockerRunning === null) {
    dot   = 'bg-yellow-400 animate-pulse'
    label = 'Checking…'
  } else if (!status.dockerRunning) {
    dot   = 'bg-red-500'
    label = 'Docker offline'
    title = 'Docker Desktop is not running'
  } else if (!status.imageBuilt) {
    dot   = 'bg-yellow-400'
    label = 'Image needed'
    title = 'Image will be built on first Run'
  } else if (!status.containerUp) {
    dot   = 'bg-yellow-400'
    label = 'Container stopped'
    title = 'Container will auto-start on first Run'
  } else {
    dot   = 'bg-green-400'
    label = 'Container ready'
    title = `${status.containerName} is running`
  }

  if (!isElectron) return null   // hide in browser dev mode

  return (
    <button
      onClick={refresh}
      title={title}
      className="no-drag flex items-center gap-1.5 px-3 h-full
                 hover:bg-vscode-hover transition-colors duration-100"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-[10px] text-vscode-textDim whitespace-nowrap">
        {label}
      </span>
    </button>
  )
}

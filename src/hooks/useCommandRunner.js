import { useEffect, useCallback, useRef } from 'react'
import useStore, { selectActiveWorkspace } from '@/store/useStore'
import { buildCommand } from '@/utils/commandBuilder'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

/**
 * useCommandRunner
 *
 * Encapsulates all logic for:
 *  - Subscribing to IPC terminal-output events
 *  - Running a command (Docker or simulated in browser)
 *  - Stopping a running command
 *
 * Returns { run, stop }
 */
export function useCommandRunner() {
  const workspaceId   = useStore((s) => s.activeWorkspaceId)
  const workspace     = useStore(selectActiveWorkspace)
  const activeToolId  = workspace.activeTool
  const target        = workspace.targetInput
  const toolOptions   = workspace.options
  const isRunning     = workspace.isRunning
  const setIsRunning  = useStore((s) => s.setIsRunning)
  const appendLine    = useStore((s) => s.appendTerminalLine)

  // Keep ref to the IPC unsubscribe function
  const unsubRef = useRef(null)

  // ── Subscribe to IPC terminal-output events (Electron only) ─────────────
  useEffect(() => {
    if (!isElectron) return

    const unsub = window.electronAPI.onTerminalData((entry) => {
      if (!entry.workspaceId) return

      appendLine(
        { type: entry.type, data: entry.data },
        entry.workspaceId
      )

      // Auto-clear running flag on exit events
      if (entry.type === 'exit' || entry.type === 'error') {
        setIsRunning(false, entry.workspaceId)
      }
    })

    unsubRef.current = unsub
    return () => {
      if (unsubRef.current) {
        unsubRef.current()
        unsubRef.current = null
      }
    }
  }, [appendLine, setIsRunning])

  // ── run() ────────────────────────────────────────────────────────────────
  const run = useCallback(async () => {
    if (isRunning) return

    const appendForWorkspace = (entry) => appendLine(entry, workspaceId)
    const trimmedTarget = target.trim()
    if (!trimmedTarget) {
      appendForWorkspace({
        type: 'error',
        data: '⚠  No target specified. Please enter an IP address or domain.\n',
      })
      return
    }

    const { command, args, error } = buildCommand(activeToolId, trimmedTarget, toolOptions)
    if (error) {
      appendForWorkspace({ type: 'error', data: `⚠ ${error}\n` })
      return
    }
    if (!command) return

    const fullCommand = [command, ...args].join(' ')

    setIsRunning(true, workspaceId)

    if (isElectron) {
      // ── Real Docker execution ──────────────────────────────────────────
      try {
        const result = await window.electronAPI.runCommand(command, args, workspaceId)
        if (!result.success) {
          appendForWorkspace({ type: 'error', data: `\r\nUnable to run command: ${result.reason}\n` })
          setIsRunning(false, workspaceId)
        }
      } catch (error) {
        appendForWorkspace({ type: 'error', data: `\r\nDocker command failed: ${error.message}\n` })
        setIsRunning(false, workspaceId)
      }
      // isRunning is cleared by the onTerminalData 'exit' listener above
    } else {
      // ── Browser simulation mode ────────────────────────────────────────
      appendForWorkspace({ type: 'cmd',  data: `$ ${fullCommand}\n` })
      appendForWorkspace({ type: 'info', data: `[Browser mode] Simulating Docker output...\n` })
      await simulateBrowserOutput(activeToolId, fullCommand, appendForWorkspace)
      setIsRunning(false, workspaceId)
    }
  }, [activeToolId, target, toolOptions, isRunning, workspaceId, appendLine, setIsRunning])

  // ── stop() ───────────────────────────────────────────────────────────────
  const stop = useCallback(async () => {
    if (!isRunning) return
    const appendForWorkspace = (entry) => appendLine(entry, workspaceId)

    try {
      if (isElectron) {
        const result = await window.electronAPI.stopCommand(workspaceId)
        if (!result.success) {
          appendForWorkspace({ type: 'error', data: `\r\nUnable to stop command: ${result.reason}\n` })
        }
      }
    } catch (error) {
      appendForWorkspace({ type: 'error', data: `\r\nUnable to stop command: ${error.message}\n` })
    } finally {
      setIsRunning(false, workspaceId)
    }
  }, [isRunning, workspaceId, appendLine, setIsRunning])

  return { run, stop }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Browser simulation (no Electron / no Docker)
// ═══════════════════════════════════════════════════════════════════════════
async function simulateBrowserOutput(toolId, command, appendLine) {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  const SAMPLES = {
    nmap: [
      'Starting Nmap 7.94 ( https://nmap.org )\n',
      'Nmap scan report for target\n',
      'Host is up (0.0043s latency).\n',
      'PORT     STATE SERVICE  VERSION\n',
      '22/tcp   open  ssh      OpenSSH 8.9p1 Ubuntu\n',
      '80/tcp   open  http     Apache httpd 2.4.52\n',
      '443/tcp  open  ssl/http Apache httpd 2.4.52\n',
      'Nmap done: 1 IP address (1 host up) scanned in 3.24 seconds\n',
    ],
    nslookup: [
      'Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\n',
      'Non-authoritative answer:\n',
      'Name:\ttarget\nAddress: 142.250.80.46\n',
    ],
    dig: [
      '; <<>> DiG 9.18.12 <<>> target\n',
      ';; Got answer:\n',
      ';; ANSWER SECTION:\n',
      'target.\t\t300\tIN\tA\t93.184.216.34\n',
      ';; Query time: 34 msec\n;; SERVER: 8.8.8.8#53\n',
    ],
    curl: [
      `> ${command}\n`,
      '< HTTP/2 200\n',
      '< content-type: application/json\n',
      '<\n{\n  "status": "ok",\n  "message": "Hello from Docker"\n}\n',
    ],
    extra: [
      'Pinging target with 32 bytes of data:\n',
      'Reply from 8.8.8.8: bytes=32 time=12ms TTL=118\n',
      'Reply from 8.8.8.8: bytes=32 time=11ms TTL=118\n',
      'Reply from 8.8.8.8: bytes=32 time=13ms TTL=118\n',
      'Reply from 8.8.8.8: bytes=32 time=11ms TTL=118\n',
      '\nPing statistics for 8.8.8.8:\n',
      '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)\n',
    ],
  }

  const lines = SAMPLES[toolId] ?? ['Command executed.\n']
  for (const line of lines) {
    await delay(150 + Math.random() * 200)
    appendLine({ type: 'stdout', data: line })
  }
  await delay(100)
  appendLine({
    type: 'exit',
    data: '\n─────────────────────────────────────────\nProcess exited with code 0\n',
  })
}

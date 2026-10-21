const { contextBridge, ipcRenderer } = require('electron')

/**
 * Expose a safe, typed API surface to the renderer process.
 * Nothing from Node/Electron leaks unless explicitly bridged here.
 */
contextBridge.exposeInMainWorld('electronAPI', {

  // ── Window controls ────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
  },

  // ── Docker command execution ───────────────────────────────────────────

  /**
   * Run an allowed executable inside the Docker container.
   * Main process handles: Docker health-check → image build (if needed)
   *                       → container start (if needed) → docker exec.
   *
   * @param {string} command - Allowed executable name
   * @param {string[]} args - Literal arguments passed to the executable
   * @returns {Promise<{ success: boolean, reason?: string }>}
   */
  runCommand: (command, args) =>
    ipcRenderer.invoke('run-docker-command', { command, args }),

  /**
   * Kill the currently running docker exec process.
   * @returns {Promise<{ success: boolean, reason?: string }>}
   */
  stopCommand: () =>
    ipcRenderer.invoke('stop-docker-command'),

  /**
   * Subscribe to streamed terminal output from the main process.
   *
   * @param {(entry: { type: string, data: string }) => void} callback
   * @returns {() => void} unsubscribe function
   */
  onTerminalData: (callback) => {
    if (typeof callback !== 'function') {
      throw new TypeError('Terminal output callback must be a function')
    }
    const handler = (_, entry) => callback(entry)
    ipcRenderer.on('terminal-output', handler)
    // Return cleanup function so React can removeListener on unmount
    return () => ipcRenderer.removeListener('terminal-output', handler)
  },

  // ── Docker status & management ─────────────────────────────────────────

  /**
   * Get current Docker / image / container status.
   * @returns {Promise<{
   *   dockerRunning: boolean,
   *   imageBuilt:    boolean,
   *   containerUp:   boolean,
   *   containerName: string,
   *   imageName:     string
   * }>}
   */
  getDockerStatus: () =>
    ipcRenderer.invoke('docker:status'),

  /**
   * Force a Docker image rebuild (useful after Dockerfile changes).
   * @returns {Promise<{ success: boolean, reason?: string }>}
   */
  rebuildImage: () =>
    ipcRenderer.invoke('docker:build-image'),

  /**
   * Stop the background container.
   * @returns {Promise<{ success: boolean, reason?: string }>}
   */
  stopContainer: () =>
    ipcRenderer.invoke('docker:stop-container'),

  // ── Utilities ──────────────────────────────────────────────────────────
  openExternal: (url) => ipcRenderer.send('open:external', url),
  platform:     process.platform,
})

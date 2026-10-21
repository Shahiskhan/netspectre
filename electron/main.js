const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const { spawn, execFile } = require('child_process')
const { promisify } = require('util')

const execFileAsync = promisify(execFile)
const isDev = process.env.NODE_ENV === 'development'

// ── Docker configuration ───────────────────────────────────────────────────
const DOCKER = {
  IMAGE_NAME:     'netspectre-runner',
  CONTAINER_NAME: 'netspectre-runner',
  DOCKERFILE_DIR: app.isPackaged
    ? path.join(process.resourcesPath, 'docker-context')
    : path.join(__dirname, '..'),
}
const ALLOWED_COMMANDS = new Set([
  'nmap', 'nslookup', 'dig', 'curl', 'ping', 'traceroute',
  'whois', 'nc', 'netstat', 'ifconfig',
])

// Track the active spawned process so we can kill it on stop
let activeProcess = null
let commandInProgress = false
let stopRequested = false
let activeCommandWorkspaceId = null
let imageBuildPromise = null
let dockerInitializationPromise = null
let mainWindow    = null

// ── Window creation ────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'NetSpectre',
    width:  1280,
    height: 800,
    minWidth:  900,
    minHeight: 600,
    icon: path.join(__dirname, '../assets/icon.ico'),
    frame: false,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  createWindow()
  ensureDockerReady().catch((err) => {
    console.error('Docker initialization failed:', err)
    sendOutput('error', `\r\n❌ Docker initialization failed: ${err.message}\r\n`)
  })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// ── Window controls (custom title bar) ────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())
ipcMain.on('open:external',  (_, url) => shell.openExternal(url))

// ═══════════════════════════════════════════════════════════════════════════
//  DOCKER BRIDGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send a structured status event to the renderer.
 * @param {'info'|'success'|'error'|'stdout'|'stderr'|'exit'|'cmd'} type
 * @param {string} data
 */
function sendOutput(type, data, workspaceId = activeCommandWorkspaceId) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('terminal-output', { type, data, workspaceId })
  }
}

function isTrustedSender(event) {
  return mainWindow && !mainWindow.isDestroyed() && event.sender === mainWindow.webContents
}

function assertTrustedSender(event) {
  if (!isTrustedSender(event)) throw new Error('Untrusted IPC sender')
}

function isValidCommandRequest(payload) {
  return payload &&
    typeof payload.command === 'string' &&
    ALLOWED_COMMANDS.has(payload.command) &&
    typeof payload.workspaceId === 'string' &&
    payload.workspaceId.length > 0 &&
    Array.isArray(payload.args) &&
    payload.args.length <= 128 &&
    payload.args.every((arg) => typeof arg === 'string' && arg.length <= 4096)
}

function runDocker(args) {
  return execFileAsync('docker', args, { windowsHide: true, maxBuffer: 1024 * 1024 })
}

function stopActiveProcess() {
  if (!activeProcess) return
  const processToStop = activeProcess
  activeProcess = null
  processToStop.kill('SIGTERM')
}

// ── 1. Check if Docker daemon is reachable ─────────────────────────────────
async function isDockerRunning() {
  try {
    await runDocker(['info', '--format', '{{.ServerVersion}}'])
    return true
  } catch {
    return false
  }
}

// ── 2. Check if our image exists locally ──────────────────────────────────
async function imageExists() {
  try {
    const { stdout } = await runDocker(['images', '-q', DOCKER.IMAGE_NAME])
    return stdout.trim().length > 0
  } catch {
    return false
  }
}

// ── 3. Build the Docker image from our Dockerfile ─────────────────────────
function buildImage() {
  if (imageBuildPromise) return imageBuildPromise

  const buildPromise = new Promise((resolve, reject) => {
    let settled = false
    sendOutput('info', `🔨 Building Docker image '${DOCKER.IMAGE_NAME}'...\r\n`)
    sendOutput('info', `   This only happens once — subsequent runs are instant.\r\n\r\n`)

    const proc = spawn(
      'docker',
      ['build', '-t', DOCKER.IMAGE_NAME, DOCKER.DOCKERFILE_DIR],
      { windowsHide: true }
    )
    activeProcess = proc

    const finish = (error) => {
      if (settled) return
      settled = true
      if (activeProcess === proc) activeProcess = null
      if (error) reject(error)
      else resolve()
    }

    proc.stdout.setEncoding('utf8')
    proc.stderr.setEncoding('utf8')
    proc.stdout.on('data', (data) => sendOutput('stdout', data))
    proc.stderr.on('data', (data) => sendOutput('stderr', data))

    proc.on('close', (code) => {
      if (code === 0) {
        sendOutput('success', `\r\n✅ Image '${DOCKER.IMAGE_NAME}' built successfully.\r\n`)
        finish()
      } else {
        finish(new Error(`docker build exited with code ${code}`))
      }
    })

    proc.on('error', (error) => finish(error))
  })
  imageBuildPromise = buildPromise
  const clearBuildPromise = () => {
    if (imageBuildPromise === buildPromise) imageBuildPromise = null
  }
  buildPromise.then(clearBuildPromise, clearBuildPromise)
  return buildPromise
}

// ── 4. Check if our container is already running ──────────────────────────
async function containerIsRunning() {
  try {
    const { stdout } = await runDocker([
      'ps', '-q', '-f', `name=${DOCKER.CONTAINER_NAME}`,
    ])
    return stdout.trim().length > 0
  } catch {
    return false
  }
}

// ── 5. Remove a stopped/exited container if it exists ─────────────────────
async function removeStaleContainer() {
  const { stdout } = await runDocker([
    'ps', '-aq', '-f', `name=^/${DOCKER.CONTAINER_NAME}$`,
  ])
  const containerId = stdout.trim()
  if (containerId) await runDocker(['rm', containerId])
}

// ── 6. Start the background container ─────────────────────────────────────
async function startContainer() {
  await removeStaleContainer()
  sendOutput('info', `🐳 Starting container '${DOCKER.CONTAINER_NAME}'...\r\n`)
  await runDocker([
    'run', '-d', '--name', DOCKER.CONTAINER_NAME, DOCKER.IMAGE_NAME,
    'tail', '-f', '/dev/null',
  ])

  sendOutput('success', `✅ Container '${DOCKER.CONTAINER_NAME}' is running.\r\n\r\n`)
}

function throwIfStopRequested() {
  if (stopRequested) throw new Error('Command stopped by user')
}

// ── 7. Full bootstrap: ensure Docker → image → container are all ready ─────
async function initializeDocker() {
  // a) Docker daemon
  const dockerOk = await isDockerRunning()
  if (!dockerOk) {
    throw new Error(
      'Docker is not running.\n' +
      'Please start Docker Desktop and try again.'
    )
  }
  throwIfStopRequested()

  // b) Image
  if (imageBuildPromise) await imageBuildPromise
  throwIfStopRequested()
  const hasImage = await imageExists()
  if (!hasImage) {
    await buildImage()
  }
  throwIfStopRequested()

  // c) Container
  const running = await containerIsRunning()
  if (!running) {
    await startContainer()
  } else {
    sendOutput('info', `♻️  Reusing running container '${DOCKER.CONTAINER_NAME}'.\r\n\r\n`)
  }
  throwIfStopRequested()
}

function ensureDockerReady() {
  if (dockerInitializationPromise) return dockerInitializationPromise

  const initialization = initializeDocker()
  dockerInitializationPromise = initialization
  const clearInitialization = () => {
    if (dockerInitializationPromise === initialization) {
      dockerInitializationPromise = null
    }
  }
  initialization.then(clearInitialization, clearInitialization)
  return initialization
}

// ── IPC: 'docker:status' — renderer can ask for current Docker state ───────
ipcMain.handle('docker:status', async (event) => {
  assertTrustedSender(event)
  const dockerOk   = await isDockerRunning()
  const hasImage   = dockerOk && await imageExists()
  const hasContainer = hasImage && await containerIsRunning()

  return {
    dockerRunning: dockerOk,
    imageBuilt:    hasImage,
    containerUp:   hasContainer,
    containerName: DOCKER.CONTAINER_NAME,
    imageName:     DOCKER.IMAGE_NAME,
  }
})

// ── IPC: 'run-docker-command' — main execution entry point ────────────────
ipcMain.handle('run-docker-command', async (event, payload) => {
  assertTrustedSender(event)
  if (!isValidCommandRequest(payload)) {
    return { success: false, reason: 'Invalid command request' }
  }
  const { command, args, workspaceId } = payload
  // Guard: reject if already running
  if (commandInProgress) {
    return { success: false, reason: 'busy' }
  }

  commandInProgress = true
  stopRequested = false
  activeCommandWorkspaceId = workspaceId
  try {
    // Ensure Docker + image + container are ready (builds if needed)
    await ensureDockerReady()
    throwIfStopRequested()

    const displayCommand = [command, ...args].map((part) => JSON.stringify(part)).join(' ')
    sendOutput('cmd', `$ ${displayCommand}\r\n`, workspaceId)
    sendOutput('info', `─────────────────────────────────────────\r\n`, workspaceId)

    // Execute the command inside the running container
    activeProcess = spawn(
      'docker',
      ['exec', DOCKER.CONTAINER_NAME, command, ...args],
      { windowsHide: true }
    )
    const commandProcess = activeProcess
    commandProcess.stdout.setEncoding('utf8')
    commandProcess.stderr.setEncoding('utf8')
    let processFinished = false
    const finishCommand = () => {
      if (processFinished) return
      processFinished = true
      if (activeProcess === commandProcess) activeProcess = null
      commandInProgress = false
      stopRequested = false
      activeCommandWorkspaceId = null
    }

    commandProcess.stdout.on('data', (data) => {
      sendOutput('stdout', data, workspaceId)
    })

    commandProcess.stderr.on('data', (data) => {
      sendOutput('stderr', data, workspaceId)
    })

    commandProcess.on('error', (err) => {
      sendOutput('error', `\r\nProcess error: ${err.message}\r\n`, workspaceId)
      finishCommand()
    })

    commandProcess.on('close', (code, signal) => {
      const msg = signal
        ? `\r\n⚡ Process killed (signal: ${signal})\r\n`
        : `\r\n─────────────────────────────────────────\r\nProcess exited with code ${code}\r\n`
      sendOutput('exit', msg, workspaceId)
      finishCommand()
    })

    return { success: true }
  } catch (err) {
    sendOutput('error', `\r\n❌ ${err.message}\r\n`, workspaceId)
    if (activeProcess && stopRequested) stopActiveProcess()
    commandInProgress = false
    stopRequested = false
    activeCommandWorkspaceId = null
    return { success: false, reason: err.message }
  }
})

// ── IPC: 'stop-docker-command' — kill the active process ──────────────────
ipcMain.handle('stop-docker-command', async (event, payload) => {
  assertTrustedSender(event)
  if (!commandInProgress) {
    return { success: false, reason: 'No process running' }
  }
  if (!payload || payload.workspaceId !== activeCommandWorkspaceId) {
    return { success: false, reason: 'No process running for this workspace' }
  }

  try {
    stopRequested = true
    stopActiveProcess()
    sendOutput('info', '\r\n⏹  Command stopped by user.\r\n')
    return { success: true }
  } catch (err) {
    return { success: false, reason: err.message }
  }
})

// ── IPC: 'docker:build-image' — force rebuild ─────────────────────────────
ipcMain.handle('docker:build-image', async (event) => {
  assertTrustedSender(event)
  if (commandInProgress) return { success: false, reason: 'busy' }
  try {
    if (!(await isDockerRunning())) throw new Error('Docker is not running. Please start Docker Desktop and try again.')
    await buildImage()
    return { success: true }
  } catch (err) {
    return { success: false, reason: err.message }
  }
})

// ── IPC: 'docker:stop-container' — stop the background container ──────────
ipcMain.handle('docker:stop-container', async (event) => {
  assertTrustedSender(event)
  try {
    await runDocker(['stop', DOCKER.CONTAINER_NAME])
    sendOutput('info', `\r\n🛑 Container '${DOCKER.CONTAINER_NAME}' stopped.\r\n`)
    return { success: true }
  } catch (err) {
    return { success: false, reason: err.message }
  }
})

// ── Cleanup on app quit ────────────────────────────────────────────────────
app.on('before-quit', async () => {
  if (activeProcess) {
    try { stopActiveProcess() } catch {}
  }
})

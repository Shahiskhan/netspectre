/**
 * Quick smoke test — verifies all expected source files exist.
 * Run with: node scripts/verify.js
 */
const fs   = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

const REQUIRED_FILES = [
  'README.md',
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'index.html',
  'electron/main.js',
  'electron/preload.js',
  'src/main.jsx',
  'src/App.jsx',
  'src/index.css',
  'src/store/useStore.js',
  'src/utils/commandBuilder.js',
  'src/components/icons/Icons.jsx',
  'src/components/TitleBar.jsx',
  'src/components/Sidebar.jsx',
  'src/components/ControlPanel.jsx',
  'src/components/MainWorkspace.jsx',
  'src/components/TerminalView.jsx',
  'src/components/ResizeHandle.jsx',
  'src/components/StatusBar.jsx',
  'src/components/controls/NmapControls.jsx',
  'src/components/controls/NslookupControls.jsx',
  'src/components/controls/DigControls.jsx',
  'src/components/controls/CurlControls.jsx',
  'src/components/controls/ExtraControls.jsx',
]

let allOk = true
REQUIRED_FILES.forEach((f) => {
  const full = path.join(ROOT, f)
  const ok   = fs.existsSync(full)
  console.log(`${ok ? '✅' : '❌'} ${f}`)
  if (!ok) allOk = false
})

console.log(allOk ? '\n✅ All files present.' : '\n❌ Some files are missing.')
process.exit(allOk ? 0 : 1)

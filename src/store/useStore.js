import { create } from 'zustand'

// ── Tool definitions ──────────────────────────────────────────────────────────
export const TOOLS = [
  {
    id: 'nmap',
    label: 'Nmap',
    description: 'Network exploration and security auditing',
    icon: 'nmap',
    color: '#4ec9b0',
    placeholder: 'e.g. 192.168.1.1 or scanme.nmap.org',
  },
  {
    id: 'nslookup',
    label: 'NSLookup',
    description: 'DNS querying utility',
    icon: 'nslookup',
    color: '#4fc1ff',
    placeholder: 'e.g. google.com',
  },
  {
    id: 'dig',
    label: 'Dig',
    description: 'DNS lookup with detailed output',
    icon: 'dig',
    color: '#c678dd',
    placeholder: 'e.g. example.com',
  },
  {
    id: 'curl',
    label: 'Curl',
    description: 'HTTP/HTTPS request tool',
    icon: 'curl',
    color: '#dcdcaa',
    placeholder: 'e.g. https://api.example.com/endpoint',
  },
  {
    id: 'extra',
    label: 'Extra Tools',
    description: 'Ping, Traceroute, Whois & more',
    icon: 'extra',
    color: '#ce9178',
    placeholder: 'e.g. 8.8.8.8 or example.com',
  },
]

// ── Terminal log entry shape ──────────────────────────────────────────────────
// { id: string, type: 'stdout'|'stderr'|'info'|'error'|'exit'|'cmd', data: string, ts: number }

// ── Store ─────────────────────────────────────────────────────────────────────
const useStore = create((set, get) => ({
  // ── Active tool tab ──────────────────────────────────────────────────────
  activeToolId: 'nmap',
  setActiveToolId: (id) => set({ activeToolId: id }),
  getActiveTool: () => TOOLS.find((t) => t.id === get().activeToolId),

  // ── Target input ─────────────────────────────────────────────────────────
  target: '',
  setTarget: (target) => set({ target }),

  // ── Per-tool option flags (keyed by toolId) ───────────────────────────────
  toolOptions: {
    nmap: {
      scanTypes: ['-sV'],
      portMode: 'default',
      ports: '',
      topPorts: '100',
      timing: '',
      skipHostDiscovery: false,
      osDetect: false,
      verbose: false,
    },
    nslookup:  { type: 'A', server: '' },
    dig:       { type: 'A', short: false, trace: false, noallAnswer: false },
    curl: {
      method: 'GET',
      headers: [],
      body: '',
      includeHeaders: false,
      followRedirects: true,
      insecure: false,
      verbose: false,
    },
    extra:     { subTool: 'ping', count: '4', ttl: '', ncPort: '' },
  },
  setToolOption: (toolId, key, value) =>
    set((state) => ({
      toolOptions: {
        ...state.toolOptions,
        [toolId]: { ...state.toolOptions[toolId], [key]: value },
      },
    })),

  // ── Command preview ───────────────────────────────────────────────────────
  commandPreview: '',
  setCommandPreview: (cmd) => set({ commandPreview: cmd }),

  // ── Running state ─────────────────────────────────────────────────────────
  isRunning: false,
  setIsRunning: (v) => set({ isRunning: v }),

  // ── Terminal output log ───────────────────────────────────────────────────
  terminalLines: [],
  appendTerminalLine: (entry) =>
    set((state) => ({
      terminalLines: [
        ...state.terminalLines,
        { id: crypto.randomUUID(), ts: Date.now(), ...entry },
      ],
    })),
  clearTerminal: () => set({ terminalLines: [] }),

  // ── Terminal split height (px from bottom) ────────────────────────────────
  terminalHeight: 280,
  setTerminalHeight: (h) => set({ terminalHeight: Math.max(120, Math.min(h, 700)) }),
}))

export default useStore

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

function createDefaultOptions() {
  return {
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
    nslookup: { type: 'A', server: '' },
    dig: { type: 'A', short: false, trace: false, noallAnswer: false },
    curl: {
      method: 'GET',
      headers: [],
      body: '',
      includeHeaders: false,
      followRedirects: true,
      insecure: false,
      verbose: false,
    },
    extra: { subTool: 'ping', count: '4', ttl: '', ncPort: '' },
  }
}

function createWorkspace() {
  return {
    id: crypto.randomUUID(),
    title: 'Nmap',
    activeTool: 'nmap',
    targetInput: '',
    options: createDefaultOptions(),
    commandPreview: '',
    terminalOutput: [],
    isRunning: false,
  }
}

export function selectActiveWorkspace(state) {
  return state.workspaceTabs.find((tab) => tab.id === state.activeWorkspaceId)
}

function updateWorkspace(set, get, workspaceId, update) {
  const targetId = workspaceId ?? get().activeWorkspaceId
  set((state) => ({
    workspaceTabs: state.workspaceTabs.map((tab) => (
      tab.id === targetId ? update(tab) : tab
    )),
  }))
}

const initialWorkspace = createWorkspace()

const useStore = create((set, get) => ({
  workspaceTabs: [initialWorkspace],
  activeWorkspaceId: initialWorkspace.id,

  getActiveWorkspace: () => selectActiveWorkspace(get()),
  setActiveWorkspace: (id) => {
    if (get().workspaceTabs.some((tab) => tab.id === id)) {
      set({ activeWorkspaceId: id })
    }
  },
  createWorkspace: () => {
    const workspace = createWorkspace()
    set((state) => ({
      workspaceTabs: [...state.workspaceTabs, workspace],
      activeWorkspaceId: workspace.id,
    }))
    return workspace.id
  },
  closeWorkspace: (id) => {
    const state = get()
    const workspace = state.workspaceTabs.find((tab) => tab.id === id)
    if (!workspace || workspace.isRunning || state.workspaceTabs.length <= 1) return false

    const remaining = state.workspaceTabs.filter((tab) => tab.id !== id)
    const nextActiveId = state.activeWorkspaceId === id
      ? remaining[Math.min(state.workspaceTabs.indexOf(workspace), remaining.length - 1)].id
      : state.activeWorkspaceId
    set({ workspaceTabs: remaining, activeWorkspaceId: nextActiveId })
    return true
  },

  setActiveToolId: (activeTool) =>
    updateWorkspace(set, get, null, (tab) => {
      const tool = TOOLS.find((item) => item.id === activeTool)
      return {
        ...tab,
        activeTool,
        title: `${tool?.label ?? 'Workspace'}${tab.targetInput ? ` - ${tab.targetInput}` : ''}`,
      }
    }),
  setTarget: (targetInput) =>
    updateWorkspace(set, get, null, (tab) => {
      const tool = TOOLS.find((item) => item.id === tab.activeTool)
      return {
        ...tab,
        targetInput,
        title: `${tool?.label ?? 'Workspace'}${targetInput ? ` - ${targetInput}` : ''}`,
      }
    }),
  setToolOption: (toolId, key, value) =>
    updateWorkspace(set, get, null, (tab) => ({
      ...tab,
      options: {
        ...tab.options,
        [toolId]: { ...tab.options[toolId], [key]: value },
      },
    })),
  setCommandPreview: (commandPreview) =>
    updateWorkspace(set, get, null, (tab) => ({ ...tab, commandPreview })),
  setIsRunning: (isRunning, workspaceId) =>
    updateWorkspace(set, get, workspaceId, (tab) => ({ ...tab, isRunning })),
  appendTerminalLine: (entry, workspaceId) =>
    updateWorkspace(set, get, workspaceId, (tab) => ({
      ...tab,
      terminalOutput: [
        ...tab.terminalOutput,
        { id: crypto.randomUUID(), ts: Date.now(), ...entry },
      ],
    })),
  clearTerminal: (workspaceId) =>
    updateWorkspace(set, get, workspaceId, (tab) => ({ ...tab, terminalOutput: [] })),

  // ── Terminal split height (px from bottom) ───────────────────────────────
  terminalHeight: 280,
  setTerminalHeight: (height) =>
    set({ terminalHeight: Math.max(120, Math.min(height, 700)) }),
}))

export default useStore

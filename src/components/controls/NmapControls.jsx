import React from 'react'
import useStore, { selectActiveWorkspace } from '@/store/useStore'

const SCAN_TYPES = [
  { value: '-sS', title: 'SYN scan' },
  { value: '-sT', title: 'Connect scan' },
  { value: '-sV', title: 'Version detection' },
  { value: '-A', title: 'Aggressive detection' },
]

const TIMING_TEMPLATES = ['-T1', '-T2', '-T3', '-T4', '-T5']
const TOP_PORT_OPTIONS = ['100', '1000']

export default function NmapControls() {
  const opts = useStore((s) => selectActiveWorkspace(s).options.nmap)
  const setOpt = useStore((s) => s.setToolOption)
  const scanTypes = Array.isArray(opts.scanTypes)
    ? opts.scanTypes
    : (opts.flag ? [opts.flag] : [])

  const set = (key, value) => setOpt('nmap', key, value)
  const toggleScanType = (type) => {
    set('scanTypes', scanTypes.includes(type)
      ? scanTypes.filter((selected) => selected !== type)
      : [...scanTypes, type])
  }

  const buttonClass = (selected) => `px-2 py-1 rounded text-xs font-mono transition-all duration-100
    ${selected
      ? 'bg-vscode-active text-white shadow-sm'
      : 'bg-vscode-inputBg text-vscode-textDim hover:bg-vscode-hover hover:text-vscode-textActive'
    }`

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <span className="text-xs text-vscode-textDim mr-1">Scan:</span>
        {SCAN_TYPES.map(({ value, title }) => (
          <button
            key={value}
            type="button"
            title={title}
            aria-pressed={scanTypes.includes(value)}
            onClick={() => toggleScanType(value)}
            className={buttonClass(scanTypes.includes(value))}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs text-vscode-textDim mr-1">Ports:</span>
        <button
          type="button"
          aria-pressed={opts.portMode === 'all'}
          onClick={() => set('portMode', opts.portMode === 'all' ? 'default' : 'all')}
          className={buttonClass(opts.portMode === 'all')}
        >
          -p-
        </button>
        <button
          type="button"
          aria-pressed={opts.portMode === 'top'}
          onClick={() => set('portMode', opts.portMode === 'top' ? 'default' : 'top')}
          className={buttonClass(opts.portMode === 'top')}
        >
          --top-ports
        </button>
        {opts.portMode === 'top' && (
          <select
            aria-label="Number of top ports"
            value={opts.topPorts}
            onChange={(event) => set('topPorts', event.target.value)}
            className="h-7 px-2 rounded text-xs font-mono bg-vscode-inputBg text-vscode-textActive border border-vscode-border"
          >
            {TOP_PORT_OPTIONS.map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        )}
        <button
          type="button"
          aria-pressed={opts.portMode === 'custom'}
          onClick={() => set('portMode', opts.portMode === 'custom' ? 'default' : 'custom')}
          className={buttonClass(opts.portMode === 'custom')}
        >
          Custom
        </button>
        {opts.portMode === 'custom' && (
          <input
            type="text"
            aria-label="Custom ports"
            value={opts.ports}
            onChange={(event) => set('ports', event.target.value)}
            placeholder="e.g. 22,80,443"
            className="w-32 h-7 px-2 rounded text-xs font-mono bg-vscode-inputBg text-vscode-textActive border border-vscode-border focus:outline-none focus:border-vscode-active placeholder-vscode-textDim"
          />
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-vscode-textDim mr-1">Timing:</span>
        {TIMING_TEMPLATES.map((timing) => (
          <button
            key={timing}
            type="button"
            aria-pressed={opts.timing === timing}
            onClick={() => set('timing', opts.timing === timing ? '' : timing)}
            className={buttonClass(opts.timing === timing)}
          >
            {timing}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-pressed={Boolean(opts.skipHostDiscovery)}
        onClick={() => set('skipHostDiscovery', !opts.skipHostDiscovery)}
        className={buttonClass(Boolean(opts.skipHostDiscovery))}
      >
        -Pn
      </button>

      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(opts.osDetect)}
          onChange={(event) => set('osDetect', event.target.checked)}
          className="accent-vscode-active"
        />
        <span className="text-xs text-vscode-textDim">-O</span>
      </label>

      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(opts.verbose)}
          onChange={(event) => set('verbose', event.target.checked)}
          className="accent-vscode-active"
        />
        <span className="text-xs text-vscode-textDim">-v</span>
      </label>
    </div>
  )
}

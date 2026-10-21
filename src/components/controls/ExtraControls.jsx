import React from 'react'
import useStore from '@/store/useStore'

const SUB_TOOLS = [
  { id: 'ping',       label: 'Ping',       description: 'ICMP echo test' },
  { id: 'traceroute', label: 'Traceroute', description: 'Path tracing' },
  { id: 'whois',      label: 'Whois',      description: 'Domain registration info' },
  { id: 'nc',         label: 'Netcat',      description: 'Test one TCP port' },
  { id: 'netstat',    label: 'Netstat',    description: 'Network statistics' },
  { id: 'ipconfig',   label: 'Ipconfig',   description: 'Network interface info' },
]

export default function ExtraControls() {
  const opts   = useStore((s) => s.toolOptions.extra)
  const setOpt = useStore((s) => s.setToolOption)

  const set = (key, val) => setOpt('extra', key, val)

  const showCount   = opts.subTool === 'ping'
  const showTtl     = opts.subTool === 'ping'
  const showPort    = opts.subTool === 'nc'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sub-tool selector */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-vscode-textDim mr-1">Tool:</span>
        {SUB_TOOLS.map((st) => (
          <button
            key={st.id}
            type="button"
            title={st.description}
            onClick={() => set('subTool', st.id)}
            aria-pressed={opts.subTool === st.id}
            className={`px-2 py-1 rounded text-xs font-mono transition-all duration-100
              ${opts.subTool === st.id
                ? 'bg-[#ce9178] text-vscode-bg font-semibold shadow-sm'
                : 'bg-vscode-inputBg text-vscode-textDim hover:bg-vscode-hover hover:text-vscode-textActive'
              }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Count (ping only) */}
      {showCount && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-vscode-textDim">Count:</span>
          <input
            type="number"
            value={opts.count}
            onChange={(e) => set('count', e.target.value)}
            min="1"
            max="100"
            className="w-16 h-7 px-2 rounded text-xs font-mono
                       bg-vscode-inputBg text-vscode-textActive border border-vscode-border
                       focus:outline-none focus:border-[#ce9178] placeholder-vscode-textDim"
          />
        </div>
      )}

      {/* TTL (ping only) */}
      {showTtl && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-vscode-textDim">TTL:</span>
          <input
            type="number"
            value={opts.ttl}
            onChange={(e) => set('ttl', e.target.value)}
            placeholder="128"
            className="w-16 h-7 px-2 rounded text-xs font-mono
                       bg-vscode-inputBg text-vscode-textActive border border-vscode-border
                       focus:outline-none focus:border-[#ce9178] placeholder-vscode-textDim"
          />
        </div>
      )}

      {showPort && (
        <label className="flex items-center gap-1.5">
          <span className="text-xs text-vscode-textDim">TCP port:</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="65535"
            step="1"
            value={opts.ncPort ?? ''}
            onChange={(e) => set('ncPort', e.target.value)}
            placeholder="443"
            aria-label="Netcat TCP port"
            className="w-24 h-7 px-2 rounded text-xs font-mono
                       bg-vscode-inputBg text-vscode-textActive border border-vscode-border
                       focus:outline-none focus:border-[#ce9178] placeholder-vscode-textDim"
          />
        </label>
      )}
    </div>
  )
}

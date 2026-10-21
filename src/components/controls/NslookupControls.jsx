import React from 'react'
import useStore from '@/store/useStore'

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'ANY']

export default function NslookupControls() {
  const opts   = useStore((s) => s.toolOptions.nslookup)
  const setOpt = useStore((s) => s.setToolOption)

  const set = (key, val) => setOpt('nslookup', key, val)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Record type selector */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-vscode-textDim mr-1">Type:</span>
        {RECORD_TYPES.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => set('type', t)}
            aria-pressed={opts.type === t}
            className={`px-2 py-1 rounded text-xs font-mono transition-all duration-100
              ${opts.type === t
                ? 'bg-[#4fc1ff] text-vscode-bg font-semibold shadow-sm'
                : 'bg-vscode-inputBg text-vscode-textDim hover:bg-vscode-hover hover:text-vscode-textActive'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Custom DNS server */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-vscode-textDim">Server:</span>
        <input
          type="text"
          value={opts.server ?? ''}
          onChange={(e) => set('server', e.target.value)}
          aria-label="DNS server"
          placeholder="e.g. 8.8.8.8"
          className="w-28 h-7 px-2 rounded text-xs font-mono
                     bg-vscode-inputBg text-vscode-textActive border border-vscode-border
                     focus:outline-none focus:border-[#4fc1ff] placeholder-vscode-textDim"
        />
      </div>
    </div>
  )
}

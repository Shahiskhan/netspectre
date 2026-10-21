import React from 'react'
import useStore from '@/store/useStore'

const RECORD_TYPES = ['A', 'MX', 'TXT', 'NS']

export default function DigControls() {
  const opts   = useStore((s) => s.toolOptions.dig)
  const setOpt = useStore((s) => s.setToolOption)

  const set = (key, val) => setOpt('dig', key, val)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Record type pills */}
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
                ? 'bg-[#c678dd] text-white font-semibold shadow-sm'
                : 'bg-vscode-inputBg text-vscode-textDim hover:bg-vscode-hover hover:text-vscode-textActive'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {[
        { key: 'short', label: '+short' },
        { key: 'trace', label: '+trace' },
        { key: 'noallAnswer', label: '+noall +answer' },
      ].map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => set(key, !opts[key])}
          aria-pressed={Boolean(opts[key])}
          className={`px-2 py-1 rounded text-xs font-mono transition-all duration-100
            ${opts[key]
              ? 'bg-[#c678dd] text-white font-semibold shadow-sm'
              : 'bg-vscode-inputBg text-vscode-textDim hover:bg-vscode-hover hover:text-vscode-textActive'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

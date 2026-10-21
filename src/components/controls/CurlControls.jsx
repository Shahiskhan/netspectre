import React from 'react'
import useStore, { selectActiveWorkspace } from '@/store/useStore'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH'])

export default function CurlControls() {
  const opts = useStore((s) => selectActiveWorkspace(s).options.curl)
  const setOpt = useStore((s) => s.setToolOption)

  const set = (key, value) => setOpt('curl', key, value)
  const headers = Array.isArray(opts.headers) ? opts.headers : []

  const updateHeader = (index, key, value) => {
    set('headers', headers.map((header, i) => (
      i === index ? { ...header, [key]: value } : header
    )))
  }

  const addHeader = () => {
    set('headers', [...headers, { key: '', value: '' }])
  }

  const removeHeader = (index) => {
    set('headers', headers.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-vscode-textDim">
          Method:
          <select
            aria-label="HTTP method"
            value={opts.method}
            onChange={(event) => set('method', event.target.value)}
            className="h-7 px-2 rounded text-xs font-mono bg-vscode-inputBg text-vscode-textActive border border-vscode-border focus:outline-none focus:border-[#dcdcaa]"
          >
            {HTTP_METHODS.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(opts.includeHeaders)}
            onChange={(event) => set('includeHeaders', event.target.checked)}
            className="accent-[#dcdcaa]"
          />
          <span className="text-xs text-vscode-textDim">-i (include response headers)</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(opts.followRedirects)}
            onChange={(event) => set('followRedirects', event.target.checked)}
            className="accent-[#dcdcaa]"
          />
          <span className="text-xs text-vscode-textDim">-L (follow redirects)</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(opts.insecure)}
            onChange={(event) => set('insecure', event.target.checked)}
            className="accent-[#dcdcaa]"
          />
          <span className="text-xs text-vscode-textDim">-k (skip SSL verification)</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(opts.verbose)}
            onChange={(event) => set('verbose', event.target.checked)}
            className="accent-[#dcdcaa]"
          />
          <span className="text-xs text-vscode-textDim">-v (verbose)</span>
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-vscode-textDim">Headers:</span>
          <button
            type="button"
            onClick={addHeader}
            className="px-2 py-0.5 rounded text-xs font-mono bg-vscode-inputBg text-vscode-textDim hover:bg-vscode-hover hover:text-vscode-textActive"
            aria-label="Add header"
            title="Add header"
          >
            +
          </button>
        </div>
        {headers.map((header, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              aria-label={`Header ${index + 1} name`}
              value={header.key}
              onChange={(event) => updateHeader(index, 'key', event.target.value)}
              placeholder="Header name"
              className="w-40 h-7 px-2 rounded text-xs font-mono bg-vscode-inputBg text-vscode-textActive border border-vscode-border focus:outline-none focus:border-[#dcdcaa] placeholder-vscode-textDim"
            />
            <input
              type="text"
              aria-label={`Header ${index + 1} value`}
              value={header.value}
              onChange={(event) => updateHeader(index, 'value', event.target.value)}
              placeholder="Header value"
              className="flex-1 min-w-40 h-7 px-2 rounded text-xs font-mono bg-vscode-inputBg text-vscode-textActive border border-vscode-border focus:outline-none focus:border-[#dcdcaa] placeholder-vscode-textDim"
            />
            <button
              type="button"
              onClick={() => removeHeader(index)}
              className="px-2 py-0.5 rounded text-xs font-mono bg-vscode-inputBg text-vscode-textDim hover:bg-vscode-hover hover:text-vscode-red"
              aria-label={`Remove header ${index + 1}`}
              title="Remove header"
            >
              −
            </button>
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-xs text-vscode-textDim">
        Request body
        <textarea
          value={opts.body ?? ''}
          onChange={(event) => set('body', event.target.value)}
          disabled={!BODY_METHODS.has(opts.method)}
          placeholder="JSON, form-data, or raw request payload"
          rows={3}
          className="w-full max-w-2xl px-2 py-1 rounded resize-y text-xs font-mono bg-vscode-inputBg text-vscode-textActive border border-vscode-border focus:outline-none focus:border-[#dcdcaa] placeholder-vscode-textDim disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>
    </div>
  )
}

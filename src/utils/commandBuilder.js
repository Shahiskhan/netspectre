/**
 * Builds the shell command array for each tool based on current state.
 * Returns { command, args, preview } where preview is a highlighted HTML string.
 */

export function buildCommand(toolId, target, opts) {
  switch (toolId) {
    case 'nmap':    return buildNmap(target, opts.nmap)
    case 'nslookup': return buildNslookup(target, opts.nslookup)
    case 'dig':     return buildDig(target, opts.dig)
    case 'curl':    return buildCurl(target, opts.curl)
    case 'extra':   return buildExtra(target, opts.extra)
    default:        return { command: '', args: [], preview: '' }
  }
}

// ── Nmap ──────────────────────────────────────────────────────────────────────
function buildNmap(target, opts) {
  const args = ['nmap']
  const allowedScanTypes = ['-sS', '-sT', '-sV', '-A']
  const scanTypes = Array.isArray(opts.scanTypes)
    ? opts.scanTypes
    : (opts.flag ? [opts.flag] : [])
  for (const scanType of allowedScanTypes) {
    if (scanTypes.includes(scanType)) args.push(scanType)
  }

  if (['-T1', '-T2', '-T3', '-T4', '-T5'].includes(opts.timing)) {
    args.push(opts.timing)
  }
  if (opts.skipHostDiscovery) args.push('-Pn')

  if (opts.portMode === 'all') {
    args.push('-p-')
  } else if (opts.portMode === 'top') {
    const topPorts = String(opts.topPorts ?? '')
    if (/^[1-9]\d{0,4}$/.test(topPorts) && Number(topPorts) <= 65535) {
      args.push('--top-ports', topPorts)
    }
  } else if (opts.portMode === 'custom') {
    const ports = typeof opts.ports === 'string' ? opts.ports.trim() : ''
    if (isValidPortList(ports)) {
      args.push('-p', ports)
    }
  }

  if (opts.osDetect) args.push('-O')
  if (opts.verbose) args.push('-v')
  args.push('--', typeof target === 'string' ? target.trim() || '<target>' : '<target>')

  return {
    command: 'nmap',
    args: args.slice(1),
    preview: buildPreview(args),
  }
}

function isValidPortList(ports) {
  if (!/^\d{1,5}(?:-\d{1,5})?(?:,\d{1,5}(?:-\d{1,5})?)*$/.test(ports)) return false
  return ports.split(',').every((entry) => {
    const [start, end = start] = entry.split('-').map(Number)
    return start >= 1 && end <= 65535 && start <= end
  })
}

// ── NSLookup ──────────────────────────────────────────────────────────────────
function buildNslookup(target, opts) {
  const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'ANY']
  const type = recordTypes.includes(opts.type) ? opts.type : 'A'
  const server = typeof opts.server === 'string' ? opts.server.trim() : ''
  const args = ['nslookup']
  if (type !== 'A') args.push(`-type=${type}`)
  args.push(target.trim() || '<domain>')
  if (server) args.push(server)

  return {
    command: 'nslookup',
    args: args.slice(1),
    preview: buildPreview(args),
  }
}

// ── Dig ───────────────────────────────────────────────────────────────────────
function buildDig(target, opts) {
  const recordTypes = ['A', 'MX', 'TXT', 'NS']
  const type = recordTypes.includes(opts.type) ? opts.type : 'A'
  const args = ['dig']
  args.push(target.trim() || '<domain>')
  args.push(type)
  if (opts.short) args.push('+short')
  if (opts.trace) args.push('+trace')
  if (opts.noallAnswer) args.push('+noall', '+answer')

  return {
    command: 'dig',
    args: args.slice(1),
    preview: buildPreview(args),
  }
}

// ── Curl ──────────────────────────────────────────────────────────────────────
function buildCurl(target, opts) {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
  const method = methods.includes(opts.method) ? opts.method : 'GET'
  const args = ['curl']
  args.push('-X', method)
  if (opts.includeHeaders) args.push('-i')
  if (opts.followRedirects) args.push('-L')
  if (opts.insecure) args.push('-k')
  if (opts.verbose) args.push('-v')

  const headers = Array.isArray(opts.headers)
    ? opts.headers
    : (typeof opts.headers === 'string' && opts.headers.trim()
      ? [{ key: opts.headers.split(':', 1)[0], value: opts.headers.slice(opts.headers.indexOf(':') + 1).trim() }]
      : [])
  for (const header of headers) {
    if (!header || typeof header.key !== 'string' || typeof header.value !== 'string') continue
    const key = header.key.trim()
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(key) || /[\r\n]/.test(header.value)) continue
    args.push('-H', `${key}: ${header.value}`)
  }

  if (['POST', 'PUT', 'PATCH'].includes(method) && typeof opts.body === 'string' && opts.body.length > 0) {
    args.push('-d', opts.body)
  }
  args.push('--', typeof target === 'string' ? target.trim() || '<url>' : '<url>')

  const quotedArgs = new Set([args.length - 1])
  for (let i = 0; i < args.length - 1; i += 1) {
    if (args[i] === '-H' || args[i] === '-d') quotedArgs.add(i + 1)
  }

  return {
    command: 'curl',
    args: args.slice(1),
    preview: buildPreview(args, quotedArgs),
  }
}

// ── Extra ─────────────────────────────────────────────────────────────────────
function buildExtra(target, opts) {
  const t = typeof target === 'string' ? target.trim() : ''
  if (!isSafeNetworkTarget(t)) {
    return { command: '', args: [], preview: '', error: 'Enter a valid hostname or IP address.' }
  }

  switch (opts.subTool) {
    case 'ping': {
      const args = ['ping']
      if (opts.count) args.push('-c', opts.count)
      if (opts.ttl)   args.push('-t', opts.ttl)
      args.push(t)
      return { command: 'ping', args: args.slice(1), preview: buildPreview(args) }
    }
    case 'traceroute': {
      const args = ['traceroute', t]
      return { command: 'traceroute', args: [t], preview: buildPreview(args) }
    }
    case 'whois': {
      const args = ['whois', t]
      return { command: 'whois', args: [t], preview: buildPreview(args) }
    }
    case 'nc': {
      const port = String(opts.ncPort ?? '').trim()
      if (!/^[1-9]\d{0,4}$/.test(port) || Number(port) > 65535) {
        return { command: '', args: [], preview: '', error: 'Enter a TCP port between 1 and 65535.' }
      }
      const args = ['nc', '-zv', t, port]
      return { command: 'nc', args: args.slice(1), preview: buildPreview(args) }
    }
    case 'netstat': {
      const args = ['netstat', '-an']
      return { command: 'netstat', args: ['-an'], preview: buildPreview(args) }
    }
    case 'ipconfig': {
      const args = ['ifconfig', '-a']
      return { command: 'ifconfig', args: ['-a'], preview: buildPreview(args) }
    }
    default:
      return { command: '', args: [], preview: '' }
  }
}

function isSafeNetworkTarget(target) {
  if (!target || target.length > 253 || target.startsWith('-') || /[\s/\\]/.test(target)) return false
  if (target.includes(':')) return /^[0-9A-Fa-f:]+$/.test(target)

  const hostname = target.endsWith('.') ? target.slice(0, -1) : target
  return hostname.split('.').every((label) => (
    label.length > 0 &&
    label.length <= 63 &&
    /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label)
  ))
}

// ── Preview HTML builder ───────────────────────────────────────────────────────
function buildPreview(parts, quotedIndexes = new Set()) {
  return parts
    .map((part, i) => {
      const previewPart = quotedIndexes.has(i)
        ? `"${part.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')}"`
        : part
      if (i === 0) return `<span class="cmd-command">${esc(previewPart)}</span>`
      if (part.startsWith('-') || part.startsWith('+'))
        return `<span class="cmd-flag">${esc(previewPart)}</span>`
      if (part.includes('://') || part.match(/\d+\.\d+\.\d+\.\d+/) || part.includes('.'))
        return `<span class="cmd-domain">${esc(previewPart)}</span>`
      return `<span class="cmd-value">${esc(previewPart)}</span>`
    })
    .join(' ')
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

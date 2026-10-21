/**
 * Centralised SVG icon set.
 * All icons are 24×24 viewBox by default.
 */

export function IconNmap({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3"  fill="currentColor" />
      <path d="M12 2 L12 8 M12 16 L12 22 M2 12 L8 12 M16 12 L22 12"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 5.5 L8.5 8.5 M15.5 15.5 L18.5 18.5
               M18.5 5.5 L15.5 8.5 M8.5 15.5 L5.5 18.5"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconNslookup({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2 C7 2 3 6 3 12 C3 18 7 22 12 22 C17 22 21 18 21 12 C21 6 17 2 12 2Z"
            stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2 C9 6 8 9 8 12 C8 15 9 18 12 22"
            stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2 C15 6 16 9 16 12 C16 15 15 18 12 22"
            stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12 L21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 7.5 L19.5 7.5 M4.5 16.5 L19.5 16.5"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconDig({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6 L3 18 L7 18 L7 6 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 6 L9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 6 L11 18 C11 18 15 18 17 15 C19 12 17 9 15 8 C13.5 7 11 6 11 6Z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCurl({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 12 C3 7 7 3 12 3 C15 3 17.5 4.5 19 7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 12 C21 17 17 21 12 21 C9 21 6.5 19.5 5 17"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 7 L20 3 L23 6" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17 L4 21 L1 18" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12 L16 12 M12 8 L12 16" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" />
    </svg>
  )
}

export function IconExtra({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="5"  cy="5"  r="2" fill="currentColor" />
      <circle cx="12" cy="5"  r="2" fill="currentColor" />
      <circle cx="19" cy="5"  r="2" fill="currentColor" />
      <circle cx="5"  cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
      <circle cx="5"  cy="19" r="2" fill="currentColor" />
      <circle cx="12" cy="19" r="2" fill="currentColor" />
      <circle cx="19" cy="19" r="2" fill="currentColor" />
    </svg>
  )
}

export function IconTerminal({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9 L10 12 L7 15" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15 L17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconClear({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6 L21 6 M8 6 L8 4 L16 4 L16 6 M19 6 L19 20 C19 21.1 18.1 22 17 22
               L7 22 C5.9 22 5 21.1 5 20 L5 6 Z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconRun({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5 L19 12 L8 19 Z" />
    </svg>
  )
}

export function IconStop({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  )
}

export function IconCopy({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 15 L4 15 C2.9 15 2 14.1 2 13 L2 4 C2 2.9 2.9 2 4 2
               L13 2 C14.1 2 15 2.9 15 4 L15 5"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconSettings({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 15 C13.66 15 15 13.66 15 12 C15 10.34 13.66 9 12 9
               C10.34 9 9 10.34 9 12 C9 13.66 10.34 15 12 15Z"
            stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.4 15 C19.2 15.5 19.3 16.1 19.7 16.5 L19.8 16.6
               C20.1 16.9 20.3 17.3 20.3 17.7 C20.3 18.1 20.1 18.5 19.8 18.8
               C19.5 19.1 19.1 19.3 18.7 19.3 C18.3 19.3 17.9 19.1 17.6 18.8
               L17.5 18.7 C17.1 18.3 16.5 18.2 16 18.4 C15.5 18.6 15.2 19.1 15.2 19.7
               L15.2 19.9 C15.2 20.7 14.5 21.4 13.7 21.4 L12.3 21.4
               C11.5 21.4 10.8 20.7 10.8 19.9 L10.8 19.7
               C10.8 19.1 10.5 18.6 10 18.4 C9.5 18.2 8.9 18.3 8.5 18.7
               L8.4 18.8 C8.1 19.1 7.7 19.3 7.3 19.3 C6.9 19.3 6.5 19.1 6.2 18.8
               C5.9 18.5 5.7 18.1 5.7 17.7 C5.7 17.3 5.9 16.9 6.2 16.6
               L6.3 16.5 C6.7 16.1 6.8 15.5 6.6 15 C6.4 14.5 5.9 14.2 5.3 14.2
               L5.1 14.2 C4.3 14.2 3.6 13.5 3.6 12.7 L3.6 11.3
               C3.6 10.5 4.3 9.8 5.1 9.8 L5.3 9.8 C5.9 9.8 6.4 9.5 6.6 9
               C6.8 8.5 6.7 7.9 6.3 7.5 L6.2 7.4 C5.9 7.1 5.7 6.7 5.7 6.3
               C5.7 5.9 5.9 5.5 6.2 5.2 C6.5 4.9 6.9 4.7 7.3 4.7
               C7.7 4.7 8.1 4.9 8.4 5.2 L8.5 5.3 C8.9 5.7 9.5 5.8 10 5.6
               C10.5 5.4 10.8 4.9 10.8 4.3 L10.8 4.1 C10.8 3.3 11.5 2.6 12.3 2.6
               L13.7 2.6 C14.5 2.6 15.2 3.3 15.2 4.1 L15.2 4.3
               C15.2 4.9 15.5 5.4 16 5.6 C16.5 5.8 17.1 5.7 17.5 5.3
               L17.6 5.2 C17.9 4.9 18.3 4.7 18.7 4.7 C19.1 4.7 19.5 4.9 19.8 5.2
               C20.1 5.5 20.3 5.9 20.3 6.3 C20.3 6.7 20.1 7.1 19.8 7.4
               L19.7 7.5 C19.3 7.9 19.2 8.5 19.4 9 C19.6 9.5 20.1 9.8 20.7 9.8
               L20.9 9.8 C21.7 9.8 22.4 10.5 22.4 11.3 L22.4 12.7
               C22.4 13.5 21.7 14.2 20.9 14.2 L20.7 14.2
               C20.1 14.2 19.6 14.5 19.4 15Z"
            stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

// ── Utility: resolve icon by tool id ──────────────────────────────────────────
export function ToolIcon({ id, size, className }) {
  const map = { nmap: IconNmap, nslookup: IconNslookup, dig: IconDig, curl: IconCurl, extra: IconExtra }
  const Icon = map[id] ?? IconExtra
  return <Icon size={size} className={className} />
}

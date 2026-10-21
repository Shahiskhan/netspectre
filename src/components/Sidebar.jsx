import React from 'react'
import useStore, { TOOLS, selectActiveWorkspace } from '@/store/useStore'
import { ToolIcon, IconSettings } from '@/components/icons/Icons'

export default function Sidebar() {
  const activeToolId = useStore((s) => selectActiveWorkspace(s).activeTool)
  const setActiveToolId = useStore((s) => s.setActiveToolId)

  return (
    <aside
      className="flex flex-col items-center justify-between
                 w-14 bg-vscode-titlebar border-r border-vscode-border
                 py-2 shrink-0"
    >
      {/* Tool navigation icons */}
      <nav className="flex flex-col items-center gap-1 w-full">
        {TOOLS.map((tool) => {
          const isActive = activeToolId === tool.id
          return (
            <SidebarButton
              key={tool.id}
              tool={tool}
              isActive={isActive}
              onClick={() => setActiveToolId(tool.id)}
            />
          )
        })}
      </nav>

      {/* Bottom: Settings */}
      <button
        title="Settings"
        className="w-full flex items-center justify-center p-3
                   text-vscode-textDim hover:text-vscode-textActive
                   hover:bg-vscode-hover transition-colors duration-150"
      >
        <IconSettings size={20} />
      </button>
    </aside>
  )
}

function SidebarButton({ tool, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      title={tool.label}
      className={`
        relative w-full flex flex-col items-center justify-center gap-1 py-3 px-1
        transition-all duration-150 group
        ${isActive
          ? 'text-vscode-textActive bg-vscode-bg border-l-2'
          : 'text-vscode-textDim hover:text-vscode-textActive hover:bg-vscode-hover border-l-2 border-transparent'
        }
      `}
      style={isActive ? { borderColor: tool.color } : {}}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
          style={{ backgroundColor: tool.color }}
        />
      )}

      {/* Icon */}
      <span
        className={`transition-all duration-150 ${isActive ? 'icon-glow' : ''}`}
        style={isActive ? { color: tool.color } : {}}
      >
        <ToolIcon id={tool.id} size={20} />
      </span>

      {/* Label */}
      <span className="text-[9px] font-medium tracking-wide uppercase leading-none">
        {tool.label}
      </span>

      {/* Tooltip */}
      <span
        className="absolute left-full ml-2 z-50 px-2 py-1 rounded text-xs
                   bg-vscode-border text-vscode-textActive whitespace-nowrap
                   opacity-0 group-hover:opacity-100 pointer-events-none
                   transition-opacity duration-150 shadow-lg"
      >
        {tool.description}
      </span>
    </button>
  )
}

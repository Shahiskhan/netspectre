import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'netspectre-project-notes'
const LEGACY_STORAGE_KEY = 'netspectre-side-notes'

function createNote(title = 'Untitled Note', content = '') {
  return { id: crypto.randomUUID(), title, content }
}

function readNotesState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (
        parsed &&
        Array.isArray(parsed.notes) &&
        parsed.notes.every((note) =>
          note &&
          typeof note.id === 'string' &&
          typeof note.title === 'string' &&
          typeof note.content === 'string'
        )
      ) {
        const notes = parsed.notes.length > 0
          ? parsed.notes
          : [createNote()]
        const activeId = notes.some((note) => note.id === parsed.activeId)
          ? parsed.activeId
          : notes[0].id
        return { notes, activeId, error: '', dirty: false }
      }
      throw new Error('Saved notes have an invalid format')
    }

    const legacyContent = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    const firstNote = createNote('Untitled Note', legacyContent ?? '')
    return {
      notes: [firstNote],
      activeId: firstNote.id,
      error: '',
      dirty: legacyContent !== null,
    }
  } catch (error) {
    console.error('Unable to load saved project notes:', error)
    const firstNote = createNote()
    return {
      notes: [firstNote],
      activeId: firstNote.id,
      error: `Unable to load saved notes: ${error.message}`,
      dirty: false,
    }
  }
}

export default function SideNotesPanel() {
  const [notesState, setNotesState] = useState(readNotesState)
  const { notes, activeId, error: storageError, dirty } = notesState
  const activeNote = notes.find((note) => note.id === activeId) ?? notes[0]

  useEffect(() => {
    if (!dirty) return

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ activeId, notes })
      )
      setNotesState((current) => ({
        ...current,
        dirty: false,
        error: '',
      }))
    } catch (error) {
      console.error('Unable to save project notes:', error)
      setNotesState((current) => ({
        ...current,
        error: `Unable to save notes: ${error.message}`,
      }))
    }
  }, [activeId, dirty, notes])

  const updateActiveNote = (changes) => {
    setNotesState((current) => ({
      ...current,
      error: '',
      dirty: true,
      notes: current.notes.map((note) => (
        note.id === current.activeId ? { ...note, ...changes } : note
      )),
    }))
  }

  const handleCreateNote = () => {
    const note = createNote(`New Note ${notes.length + 1}`)
    setNotesState((current) => ({
      ...current,
      notes: [...current.notes, note],
      activeId: note.id,
      error: '',
      dirty: true,
    }))
  }

  const handleDeleteNote = () => {
    if (notes.length <= 1) {
      updateActiveNote({ title: 'Untitled Note', content: '' })
      return
    }
    const remainingNotes = notes.filter((note) => note.id !== activeId)
    setNotesState({
      notes: remainingNotes,
      activeId: remainingNotes[0].id,
      error: '',
      dirty: true,
    })
  }

  return (
    <aside
      className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-vscode-border
                 bg-vscode-bg sm:w-80"
    >
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-vscode-border
                         bg-vscode-sidebar px-3">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-vscode-textDim">
          Side Notes
        </h2>
        <button
          type="button"
          onClick={handleCreateNote}
          className="rounded border border-vscode-border bg-vscode-inputBg px-2 py-1
                     font-mono text-[10px] text-vscode-textActive
                     hover:bg-vscode-hover"
        >
          + New Note
        </button>
      </header>

      <div className="flex shrink-0 flex-col gap-2 border-b border-vscode-border
                      bg-vscode-sidebar p-3">
        <select
          value={activeId}
          onChange={(event) => setNotesState((current) => ({
            ...current,
            activeId: event.target.value,
            error: '',
            dirty: true,
          }))}
          aria-label="Select saved note"
          className="w-full rounded border border-vscode-border bg-vscode-inputBg px-2 py-1.5
                     font-mono text-[11px] text-vscode-textActive focus:outline-none
                     focus:border-vscode-active"
        >
          {notes.map((note) => (
            <option key={note.id} value={note.id}>
              {note.title.trim() || 'Untitled Note'}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label htmlFor="side-note-title" className="shrink-0 font-mono text-[10px] text-vscode-textDim">
            Title
          </label>
          <input
            id="side-note-title"
            type="text"
            value={activeNote.title}
            onChange={(event) => updateActiveNote({ title: event.target.value })}
            placeholder="Target or project"
            className="min-w-0 flex-1 rounded border border-vscode-border bg-vscode-inputBg
                       px-2 py-1 font-mono text-[11px] text-vscode-textActive focus:outline-none
                       focus:border-vscode-active placeholder:text-vscode-textDim"
          />
          <button
            type="button"
            onClick={handleDeleteNote}
            aria-label={notes.length === 1 ? 'Clear note' : 'Delete selected note'}
            title={notes.length === 1 ? 'Clear note' : 'Delete selected note'}
            className="shrink-0 px-1 font-mono text-[10px] text-vscode-red hover:text-vscode-textActive"
          >
            {notes.length === 1 ? 'Clear' : 'Delete'}
          </button>
        </div>
      </div>

      {storageError && (
        <p role="status" className="shrink-0 border-b border-vscode-border px-2 py-1 font-mono text-[10px] text-vscode-red">
          {storageError}
        </p>
      )}

      <textarea
        value={activeNote.content}
        onChange={(event) => updateActiveNote({ content: event.target.value })}
        placeholder="Targets, flags, commands, and notes..."
        aria-label="Side notes"
        spellCheck={false}
        className="min-h-0 flex-1 resize-none overflow-y-auto bg-transparent py-[6px]
                   pl-10 pr-3 font-mono text-xs leading-6 text-[#e4e4e7] focus:outline-none
                   placeholder:text-vscode-textDim"
        style={{
          backgroundColor: '#1e1e1e',
          backgroundImage: [
            'linear-gradient(to right, transparent 31px, rgba(79, 193, 255, 0.35) 31px, rgba(79, 193, 255, 0.35) 32px, transparent 32px)',
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, rgba(255, 255, 255, 0.07) 23px, rgba(255, 255, 255, 0.07) 24px)',
          ].join(', '),
        }}
      />
    </aside>
  )
}

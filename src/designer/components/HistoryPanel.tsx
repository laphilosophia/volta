// ============================================================================
// History Panel - Visual Undo/Redo Log
// ============================================================================

import { ArrowRight, Clock, RotateCcw } from 'lucide-react'
import React from 'react'
import { useStore } from 'zustand'
import { useDesignerStore } from '../../core'

export const HistoryPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Access Zundo temporal store
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useDesignerStore as any).temporal
  const { pastStates, futureStates, jump } = useStore(temporal) as {
    pastStates: { actionDescription: string }[]
    futureStates: { actionDescription: string }[]
    jump: (delta: number) => void
  }

  // Access current action description from main store (not temporal)
  // We need to know what the *current* state represents.
  // Actually, pastStates contains the *previous* states.
  // The current state is "Present".
  // We can show the list combined.

  // Zundo structure:
  // pastStates: [{ currentLayout: ..., actionDescription: "..." }, ...]

  const handleJumpToPast = (index: number) => {
    // Jump back: negative index relative to now.
    // pastStates[0] is the oldest. pastStates[length-1] is the most recent past.
    // To jump to pastStates[i], we need to undo (pastStates.length - i) times.
    // Or zundo 'jump' might allow jumping to specific index?
    // zundo 'jump' takes a delta.
    // If I want to go to the state at index `i` of `pastStates`, I need to jump `(i - pastStates.length)`.
    // Example: past=[A, B], current=C. length=2.
    // Want to go to A (index 0). Delta = 0 - 2 = -2.
    // Want to go to B (index 1). Delta = 1 - 2 = -1.

    const delta = index - pastStates.length
    jump(delta)
  }

  const handleJumpToFuture = (index: number) => {
    // futureStates[0] is the immediate future (next redo).
    // To jump to futureStates[i], we jump `i + 1`.
    jump(index + 1)
  }

  const currentAction = useDesignerStore(s => s.actionDescription)

  return (
    <div className="absolute top-14 right-4 z-50 w-80 bg-(--color-surface) border border-(--color-border) shadow-xl rounded-lg flex flex-col max-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-(--color-border) bg-(--color-surface-hover)">
        <div className="flex items-center gap-2 font-medium text-(--color-text-primary)">
          <Clock className="w-4 h-4" />
          History
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-(--color-surface) rounded-md text-(--color-text-muted)"
        >
          ✕
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">

        {/* Past States */}
        {pastStates.map((state, index) => (
          <button
            key={`past-${index}`}
            onClick={() => handleJumpToPast(index)}
            className="w-full text-left px-3 py-2 rounded flex items-center gap-3 text-sm text-(--color-text-secondary) hover:bg-(--color-surface-hover) group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-(--color-border) group-hover:bg-(--color-primary-light)" />
            <span className="flex-1 truncate">{state.actionDescription || 'Unknown Action'}</span>
            <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100" />
          </button>
        ))}

        {/* Current State */}
        <div className="w-full text-left px-3 py-2 rounded flex items-center gap-3 text-sm bg-(--color-primary-light) text-(--color-primary) font-medium border border-(--color-primary)">
          <div className="w-2 h-2 rounded-full bg-(--color-primary)" />
          <span className="flex-1 truncate">{currentAction} (Current)</span>
        </div>

        {/* Future States */}
        {futureStates.map((state, index) => (
          <button
            key={`future-${index}`}
            onClick={() => handleJumpToFuture(index)}
            className="w-full text-left px-3 py-2 rounded flex items-center gap-3 text-sm text-(--color-text-muted) hover:bg-(--color-surface-hover) opacity-60"
          >
            <div className="w-1.5 h-1.5 rounded-full border border-(--color-border)" />
            <span className="flex-1 truncate line-through">{state.actionDescription || 'Unknown Action'}</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
          </button>
        ))}

        {pastStates.length === 0 && futureStates.length === 0 && (
          <div className="text-center py-8 text-(--color-text-muted) text-xs">
            No history yet
          </div>
        )}
      </div>
    </div>
  )
}

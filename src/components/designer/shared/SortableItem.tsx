// ============================================================================
// Sortable Item - Reusable Sortable Component Wrapper
// ============================================================================
// Enhanced drag handle with better positioning and visual feedback

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Move } from 'lucide-react'
import React from 'react'
import { componentRegistry, DynamicRenderer } from '../../../core'
import type { ComponentMetadata } from '../../../core/types'

// ============================================================================
// Types
// ============================================================================

interface SortableItemProps {
  /** Component metadata */
  component: ComponentMetadata
  /** Whether this item is selected */
  isSelected: boolean
  /** Whether this item is hovered */
  isHovered?: boolean
  /** Selection callback */
  onSelect: () => void
  /** Hover callback */
  onHover?: (hovered: boolean) => void
  /** Whether to show the drag handle externally or inline */
  dragHandlePosition?: 'external' | 'inline' | 'full'
}

// ============================================================================
// Sortable Item Component
// ============================================================================

export const SortableItem: React.FC<SortableItemProps> = ({
  component,
  isSelected,
  isHovered = false,
  onSelect,
  onHover,
  dragHandlePosition = 'inline',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    // Disable scale transform to fix position offset
    transition: {
      duration: 200,
      easing: 'ease',
    },
  })

  // Use Translate instead of Transform to avoid scale issues
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto',
  }

  const definition = componentRegistry.get(component.type)
  const label = definition?.label?.['en'] || component.type

  // For full drag mode, the entire item is draggable
  const fullDragProps = dragHandlePosition === 'full' ? { ...attributes, ...listeners } : {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...fullDragProps}
      className={`
        relative group rounded-lg transition-all duration-150
        ${isDragging ? 'shadow-xl bg-(--color-surface)' : ''}
        ${isSelected ? 'ring-2 ring-(--color-primary)' : ''}
        ${isHovered && !isSelected ? 'ring-2 ring-(--color-primary) ring-opacity-50' : ''}
        ${!isSelected && !isHovered && !isDragging ? 'hover:ring-2 hover:ring-(--color-primary) hover:ring-opacity-50' : ''}
        ${dragHandlePosition === 'full' ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* Drag Handle + Label (inline position - top bar) */}
      {dragHandlePosition === 'inline' && (
        <div
          className={`
            absolute -top-7 left-0 flex items-center gap-1
            transition-opacity z-20
            ${isSelected || isHovered || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-1.5 px-2 py-1 rounded-t-lg bg-(--color-primary) text-white text-xs
              cursor-grab active:cursor-grabbing shadow-md"
          >
            <GripVertical className="w-3 h-3" />
            <span className="max-w-[120px] truncate">{label}</span>
          </div>
        </div>
      )}

      {/* External Drag Handle (left side) */}
      {dragHandlePosition === 'external' && (
        <div
          {...attributes}
          {...listeners}
          className={`
            absolute -left-10 top-1/2 -translate-y-1/2
            transition-opacity z-20
            ${isSelected || isHovered || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            cursor-grab active:cursor-grabbing
            p-2 rounded-lg bg-(--color-surface) shadow-lg border border-(--color-border)
            hover:bg-(--color-surface-hover)
          `}
        >
          <Move className="w-4 h-4 text-(--color-text-muted)" />
        </div>
      )}

      {/* Component Content */}
      <div className={isDragging ? 'pointer-events-none' : ''}>
        <DynamicRenderer metadata={component} />
      </div>
    </div>
  )
}

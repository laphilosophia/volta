// ============================================================================
// Canvas Component
// ============================================================================

import type { LegacyRef } from 'react'
import { useDrop } from 'react-dnd'
import type { CanvasItem } from '../types'
import { ComponentPreview } from './ComponentPreview'

interface CanvasProps {
  items: CanvasItem[]
  selectedId: string | null
  onSelectItem: (id: string | null) => void
  onRemoveItem: (id: string) => void
  onAddItem: (componentId: string) => void
}

export function Canvas({ items, selectedId, onSelectItem, onRemoveItem, onAddItem }: CanvasProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: { componentId: string }) => {
      onAddItem(item.componentId)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div className="canvas">
      <div
        ref={drop as unknown as LegacyRef<HTMLDivElement>}
        className={`canvas-drop-zone ${isOver ? 'is-over' : ''}`}
        onClick={() => onSelectItem(null)}
      >
        {items.length === 0 ? (
          <div className="canvas-empty">
            <span className="canvas-empty-icon">🎨</span>
            <p>Drag components here to build your dashboard</p>
          </div>
        ) : (
          items.map((item) => (
            <CanvasItemComponent
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={(e) => {
                e.stopPropagation()
                onSelectItem(item.id)
              }}
              onRemove={(e) => {
                e.stopPropagation()
                onRemoveItem(item.id)
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Canvas Item
// ============================================================================

interface CanvasItemComponentProps {
  item: CanvasItem
  isSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onRemove: (e: React.MouseEvent) => void
}

function CanvasItemComponent({ item, isSelected, onSelect, onRemove }: CanvasItemComponentProps) {
  // Custom theme styles
  const customStyles: React.CSSProperties = {
    gridColumn: item.gridColumn,
  }

  if (item.theme?.primary) {
    customStyles['--item-primary' as string] = item.theme.primary
  }
  if (item.theme?.background) {
    customStyles.backgroundColor = item.theme.background
  }

  return (
    <div
      className={`canvas-item ${isSelected ? 'selected' : ''}`}
      style={customStyles}
      onClick={onSelect}
    >
      <button className="canvas-item-remove" onClick={onRemove}>
        ✕
      </button>
      <ComponentPreview componentId={item.componentId} props={item.props} theme={item.theme} />
    </div>
  )
}

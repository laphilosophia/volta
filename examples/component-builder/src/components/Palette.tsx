// ============================================================================
// Palette Component
// ============================================================================

import { useDrag } from 'react-dnd'
import { listBuilderComponents } from '../registry/components'

interface PaletteProps {
  onAddItem: (componentId: string) => void
}

export function Palette({ onAddItem }: PaletteProps) {
  const components = listBuilderComponents()

  return (
    <div className="palette">
      <h3 className="palette-title">Components</h3>
      <div className="palette-grid">
        {components.map(({ key, meta }) => (
          <PaletteItem
            key={key}
            id={key}
            name={meta.name}
            icon={meta.icon}
            onAddItem={onAddItem}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Palette Item (Draggable)
// ============================================================================

interface PaletteItemProps {
  id: string
  name: string
  icon: string
  onAddItem: (componentId: string) => void
}

function PaletteItem({ id, name, icon, onAddItem }: PaletteItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { componentId: id },
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        onAddItem(id)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag as any}
      className={`palette-item ${isDragging ? 'dragging' : ''}`}
      onClick={() => onAddItem(id)}
    >
      <span className="palette-item-icon">{icon}</span>
      <span className="palette-item-label">{name}</span>
    </div>
  )
}

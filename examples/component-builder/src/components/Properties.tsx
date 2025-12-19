// ============================================================================
// Properties Panel Component
// ============================================================================

import { getBuilderMeta } from '../registry/components'
import type { CanvasItem } from '../types'

interface PropertiesProps {
  item: CanvasItem | null
  onUpdateProps: (id: string, props: Partial<CanvasItem['props']>) => void
  onUpdateTheme: (id: string, theme: CanvasItem['theme']) => void
  onRemove: () => void
}

export function Properties({ item, onUpdateProps, onUpdateTheme, onRemove }: PropertiesProps) {
  if (!item) {
    return (
      <div className="properties">
        <h3 className="properties-title">Properties</h3>
        <div className="properties-empty">
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    )
  }

  const meta = getBuilderMeta(item.componentId)

  return (
    <div className="properties">
      <h3 className="properties-title">Properties</h3>

      {/* Component info */}
      <div className="property-group">
        <label className="property-label">Component</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{meta?.icon}</span>
          <strong>{meta?.name || item.componentId}</strong>
        </div>
      </div>

      {/* Props */}
      {Object.entries(item.props).map(([key, value]) => (
        <div key={key} className="property-group">
          <label className="property-label">{key}</label>
          <input
            type="text"
            className="property-input"
            value={String(value)}
            onChange={(e) => onUpdateProps(item.id, { [key]: e.target.value })}
          />
        </div>
      ))}

      {/* Grid size */}
      <div className="property-group">
        <label className="property-label">Width (columns)</label>
        <select
          className="property-input"
          value={item.gridColumn}
          onChange={(e) => onUpdateProps(item.id, { gridColumn: e.target.value })}
        >
          <option value="span 3">3 columns (25%)</option>
          <option value="span 4">4 columns (33%)</option>
          <option value="span 6">6 columns (50%)</option>
          <option value="span 8">8 columns (66%)</option>
          <option value="span 12">12 columns (100%)</option>
        </select>
      </div>

      {/* Theme overrides */}
      <h4 className="properties-title" style={{ marginTop: 24 }}>
        Theme Override
      </h4>

      <div className="property-group">
        <label className="property-label">Primary Color</label>
        <div className="property-color">
          <input
            type="color"
            value={item.theme?.primary || '#6366f1'}
            onChange={(e) => onUpdateTheme(item.id, { primary: e.target.value })}
          />
          <input
            type="text"
            className="property-input"
            value={item.theme?.primary || '#6366f1'}
            onChange={(e) => onUpdateTheme(item.id, { primary: e.target.value })}
          />
        </div>
      </div>

      <div className="property-group">
        <label className="property-label">Background</label>
        <div className="property-color">
          <input
            type="color"
            value={item.theme?.background || '#f1f5f9'}
            onChange={(e) => onUpdateTheme(item.id, { background: e.target.value })}
          />
          <input
            type="text"
            className="property-input"
            value={item.theme?.background || '#f1f5f9'}
            onChange={(e) => onUpdateTheme(item.id, { background: e.target.value })}
          />
        </div>
      </div>

      {/* Remove button */}
      <button
        className="btn btn-secondary"
        style={{ width: '100%', marginTop: 24, color: 'var(--danger)' }}
        onClick={onRemove}
      >
        🗑️ Remove Component
      </button>
    </div>
  )
}

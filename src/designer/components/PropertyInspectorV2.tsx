// ============================================================================
// Property Inspector V2 - Component Properties Editor with Tabs
// ============================================================================
// Now shows ALL properties from schema, not just existing props

import { Copy, Database, Settings, Sliders, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { DataSourceEditor } from '../../components/designer'
import { componentRegistry, type ComponentMetadata, type DataSourceConfig } from '../../core'

// ============================================================================
// Types
// ============================================================================

interface PropertyInspectorV2Props {
  component: ComponentMetadata | null
  onUpdateProps: (props: Record<string, unknown>) => void
  onUpdateDataSource: (dataSource: DataSourceConfig) => void
  onDelete: () => void
  onCopy: () => void
}

interface SchemaProperty {
  type: string
  enum?: string[]
  default?: unknown
}

// ============================================================================
// Component
// ============================================================================

export const PropertyInspectorV2: React.FC<PropertyInspectorV2Props> = ({
  component,
  onUpdateProps,
  onUpdateDataSource,
  onDelete,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'data'>('props')

  if (!component) {
    return (
      <div className="w-80 border-l border-(--color-border) bg-(--color-surface) p-4">
        <div className="text-center text-sm text-(--color-text-muted) mt-8">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Select a component to view and edit its properties
        </div>
      </div>
    )
  }

  const definition = componentRegistry.get(component.type)
  const schemaProperties = (definition?.schema?.properties || {}) as Record<string, SchemaProperty>

  // Merge schema properties with current component props
  // This ensures all editable properties are shown
  const allProperties = Object.keys(schemaProperties).reduce((acc, key) => {
    const schemaProp = schemaProperties[key] as SchemaProperty
    const currentValue = component.props[key]

    // Use current value if exists, otherwise use schema default or derive from type
    if (currentValue !== undefined) {
      acc[key] = currentValue
    } else if (schemaProp.default !== undefined) {
      acc[key] = schemaProp.default
    } else {
      // Default values based on type
      switch (schemaProp.type) {
        case 'string':
          acc[key] = ''
          break
        case 'boolean':
          acc[key] = false
          break
        case 'number':
          acc[key] = 0
          break
        case 'array':
          acc[key] = []
          break
        case 'object':
          acc[key] = {}
          break
        default:
          acc[key] = ''
      }
    }
    return acc
  }, {} as Record<string, unknown>)

  return (
    <div className="w-80 border-l border-(--color-border) bg-(--color-surface) overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-(--color-border)">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-(--color-text-primary) flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {definition?.label?.['en'] || component.type}
          </h2>
          <span className="px-2 py-0.5 text-xs rounded bg-(--color-primary)/10 text-(--color-primary)">
            {component.type}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-(--color-border)">
        <button
          onClick={() => setActiveTab('props')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
            ${activeTab === 'props'
              ? 'text-(--color-primary) border-b-2 border-(--color-primary)'
              : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
            }`}
        >
          <Sliders className="w-4 h-4" />
          Properties
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
            ${activeTab === 'data'
              ? 'text-(--color-primary) border-b-2 border-(--color-primary)'
              : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
            }`}
        >
          <Database className="w-4 h-4" />
          Data Source
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'props' && (
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onCopy}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg
                  bg-(--color-surface-hover) text-(--color-text-primary)
                  hover:bg-(--color-primary)/10 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg
                  bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>

            {/* Component ID */}
            <div>
              <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
                Component ID
              </label>
              <input
                type="text"
                value={component.id}
                disabled
                className="w-full px-3 py-2 text-xs rounded-lg bg-(--color-surface-hover)
                  text-(--color-text-muted) border border-(--color-border) font-mono"
              />
            </div>

            {/* Properties from Schema */}
            {Object.entries(allProperties).map(([key, value]) => {
              const schemaProp = schemaProperties[key] as SchemaProperty | undefined
              return (
                <PropertyField
                  key={key}
                  name={key}
                  value={value}
                  schemaType={schemaProp?.type}
                  enumValues={schemaProp?.enum}
                  onChange={(newValue) => onUpdateProps({ [key]: newValue })}
                />
              )
            })}

            {/* Show message if no editable properties */}
            {Object.keys(allProperties).length === 0 && (
              <div className="text-sm text-(--color-text-muted) text-center py-4">
                No editable properties for this component
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <DataSourceEditor
            config={component.dataSource || { type: 'static' }}
            onChange={onUpdateDataSource}
            availableBindings={[]}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Property Field Component - Enhanced with schema awareness
// ============================================================================

interface PropertyFieldProps {
  name: string
  value: unknown
  schemaType?: string
  enumValues?: string[]
  onChange: (value: unknown) => void
}

const PropertyField: React.FC<PropertyFieldProps> = ({
  name,
  value,
  schemaType,
  enumValues,
  onChange,
}) => {
  // Format property name for display (camelCase to Title Case)
  const displayName = name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()

  // Handle enum type (dropdown)
  if (enumValues && enumValues.length > 0) {
    return (
      <div>
        <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
          {displayName}
        </label>
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border)
            bg-(--color-surface) text-(--color-text-primary)
            focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
        >
          {enumValues.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Handle boolean type
  if (schemaType === 'boolean' || typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-1">
        <label className="text-sm text-(--color-text-primary)">{displayName}</label>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${value ? 'bg-(--color-primary)' : 'bg-(--color-border)'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
              ${value ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    )
  }

  // Handle number type
  if (schemaType === 'number' || typeof value === 'number') {
    return (
      <div>
        <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
          {displayName}
        </label>
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border)
            bg-(--color-surface) text-(--color-text-primary)
            focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
        />
      </div>
    )
  }

  // Handle array type (show as JSON editor for now)
  if (schemaType === 'array' || Array.isArray(value)) {
    return (
      <div>
        <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
          {displayName}
        </label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value))
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={3}
          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-(--color-border)
            bg-(--color-surface) text-(--color-text-primary)
            focus:ring-2 focus:ring-(--color-primary) focus:border-transparent resize-y"
          placeholder="[]"
        />
      </div>
    )
  }

  // Handle object type (show as JSON editor)
  if (schemaType === 'object' || (typeof value === 'object' && value !== null)) {
    return (
      <div>
        <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
          {displayName}
        </label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value))
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={4}
          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-(--color-border)
            bg-(--color-surface) text-(--color-text-primary)
            focus:ring-2 focus:ring-(--color-primary) focus:border-transparent resize-y"
          placeholder="{}"
        />
      </div>
    )
  }

  // Default: string input
  return (
    <div>
      <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
        {displayName}
      </label>
      <input
        type="text"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${displayName.toLowerCase()}...`}
        className="w-full px-3 py-2 text-sm rounded-lg border border-(--color-border)
          bg-(--color-surface) text-(--color-text-primary)
          focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
      />
    </div>
  )
}

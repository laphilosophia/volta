// ============================================================================
// Property Panel - Shared Property Inspector
// ============================================================================

import { Copy, Database, Settings, Sliders, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { componentRegistry } from '../../../core/component-registry'
import type { ComponentMetadata, DataSourceConfig } from '../../../core/types'
import { ActionButton } from '../../common/Button'
import DataSourceEditor from '../DataSourceEditor'

// ============================================================================
// Types
// ============================================================================

interface PropertyPanelProps {
  /** Selected component metadata */
  component: ComponentMetadata | null
  /** Callback to update component props */
  onUpdateProps: (props: Record<string, unknown>) => void
  /** Callback to update data source (optional) */
  onUpdateDataSource?: (dataSource: DataSourceConfig) => void
  /** Callback to delete */
  onDelete: () => void
  /** Callback to copy */
  onCopy: () => void
  /** Available bindings for data source editor */
  availableBindings?: Array<{
    componentId: string
    componentName: string
    outputs: { key: string; label: string }[]
  }>
  /** Whether to show data source tab */
  showDataSourceTab?: boolean
  /** Panel width class */
  width?: string
}

// ============================================================================
// Property Panel Component
// ============================================================================

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  component,
  onUpdateProps,
  onUpdateDataSource,
  onDelete,
  onCopy,
  availableBindings = [],
  showDataSourceTab = true,
  width = 'w-80',
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'data'>('props')

  // Empty state
  if (!component) {
    return (
      <div className={`${width} border-l border-(--color-border) bg-(--color-surface) p-4`}>
        <div className="text-center text-sm text-(--color-text-muted) mt-8">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Select a component to view and edit its properties
        </div>
      </div>
    )
  }

  const definition = componentRegistry.get(component.type)

  return (
    <div
      className={`${width} border-l border-(--color-border) bg-(--color-surface) overflow-y-auto flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-(--color-border)">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-(--color-text-primary) flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {definition?.label?.['en'] || component.type}
          </h2>
          <span className="px-2 py-0.5 text-xs rounded bg-(--color-primary) bg-opacity-10 text-(--color-primary)">
            {component.type}
          </span>
        </div>
      </div>

      {/* Tabs */}
      {showDataSourceTab && (
        <div className="flex border-b border-(--color-border)">
          <button
            onClick={() => setActiveTab('props')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === 'props'
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
              ${
                activeTab === 'data'
                  ? 'text-(--color-primary) border-b-2 border-(--color-primary)'
                  : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
              }`}
          >
            <Database className="w-4 h-4" />
            Data Source
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'props' && (
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2">
              <ActionButton
                onClick={onCopy}
                variant="secondary"
                size="sm"
                icon={<Copy className="w-4 h-4" />}
                className="flex-1"
              >
                Copy
              </ActionButton>
              <ActionButton
                onClick={onDelete}
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                className="flex-1"
              >
                Delete
              </ActionButton>
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
                className="w-full px-3 py-2 text-xs rounded-xs bg-(--color-surface-hover)
                  text-(--color-text-muted) border border-(--color-border) font-mono"
              />
            </div>

            {/* Properties Form */}
            {Object.entries(component.props).map(([key, value]) => (
              <PropertyField
                key={key}
                name={key}
                value={value}
                onChange={(newValue) => onUpdateProps({ [key]: newValue })}
              />
            ))}
          </div>
        )}

        {activeTab === 'data' && onUpdateDataSource && (
          <DataSourceEditor
            config={component.dataSource || { type: 'static' }}
            onChange={onUpdateDataSource}
            availableBindings={availableBindings}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Property Field Component
// ============================================================================

interface PropertyFieldProps {
  name: string
  value: unknown
  onChange: (value: unknown) => void
}

const PropertyField: React.FC<PropertyFieldProps> = ({ name, value, onChange }) => {
  if (typeof value === 'boolean') {
    return (
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-(--color-border) text-(--color-primary)
              focus:ring-(--color-primary)"
          />
          <span className="text-sm text-(--color-text-primary)">{name}</span>
        </label>
      </div>
    )
  }

  if (typeof value === 'number') {
    return (
      <div>
        <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
          {name}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
            bg-(--color-surface) text-(--color-text-primary)
            focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
        />
      </div>
    )
  }

  if (typeof value === 'object') {
    return (
      <div>
        <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">
          {name}
        </label>
        <div className="text-xs text-(--color-text-muted) p-2 bg-(--color-surface-hover) rounded">
          {JSON.stringify(value, null, 2).slice(0, 100)}...
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-xs font-medium text-(--color-text-secondary) mb-1">{name}</label>
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xs border border-(--color-border)
          bg-(--color-surface) text-(--color-text-primary)
          focus:ring-2 focus:ring-(--color-primary) focus:border-transparent"
      />
    </div>
  )
}

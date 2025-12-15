// ============================================================================
// Layout Selector Component
// ============================================================================

import { Check, Columns, Layout, LayoutDashboard, PanelLeft, PanelRight } from 'lucide-react'
import React from 'react'
import { layoutTemplates, type LayoutTemplate } from '../../core/types/layout'

// ============================================================================
// Types
// ============================================================================

interface LayoutSelectorProps {
  selectedLayoutId: string
  onSelectLayout: (template: LayoutTemplate) => void
}

// ============================================================================
// Icon mapping for layouts
// ============================================================================

const layoutIcons: Record<string, React.ReactNode> = {
  'full-width': <Layout className="w-5 h-5" />,
  'sidebar-left': <PanelLeft className="w-5 h-5" />,
  'sidebar-right': <PanelRight className="w-5 h-5" />,
  'header-sidebar-main': <LayoutDashboard className="w-5 h-5" />,
  'two-column': <Columns className="w-5 h-5" />,
}

// ============================================================================
// Layout Visual Preview
// ============================================================================

const LayoutPreview: React.FC<{ template: LayoutTemplate; isSelected: boolean }> = ({
  template,
  isSelected,
}) => {
  const renderZones = () => {
    switch (template.structure) {
      case 'sidebar-left':
        return (
          <div className="flex h-full gap-0.5">
            <div className="w-1/4 bg-current opacity-40 rounded-l" />
            <div className="flex-1 bg-current opacity-20 rounded-r" />
          </div>
        )
      case 'sidebar-right':
        return (
          <div className="flex h-full gap-0.5">
            <div className="flex-1 bg-current opacity-20 rounded-l" />
            <div className="w-1/4 bg-current opacity-40 rounded-r" />
          </div>
        )
      case 'two-column':
        return (
          <div className="flex h-full gap-0.5">
            <div className="flex-1 bg-current opacity-30 rounded-l" />
            <div className="flex-1 bg-current opacity-30 rounded-r" />
          </div>
        )
      case 'full-width':
      default:
        return <div className="h-full bg-current opacity-20 rounded" />
    }
  }

  // Special case for header-sidebar-main
  if (template.id === 'header-sidebar-main') {
    return (
      <div
        className={`w-full h-12 rounded border-2 ${isSelected ? 'border-(--color-primary) text-(--color-primary)' : 'border-(--color-border) text-(--color-text-muted)'}`}
      >
        <div className="h-2 bg-current opacity-40 rounded-t" />
        <div className="flex h-[calc(100%-8px)] gap-0.5 p-0.5">
          <div className="w-1/4 bg-current opacity-30 rounded-bl" />
          <div className="flex-1 bg-current opacity-20 rounded-br" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`w-full h-12 p-1 rounded border-2 ${isSelected ? 'border-(--color-primary) text-(--color-primary)' : 'border-(--color-border) text-(--color-text-muted)'}`}
    >
      {renderZones()}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ selectedLayoutId, onSelectLayout }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-(--color-text-secondary)">Page Layout</label>
        <span className="text-xs text-(--color-text-muted)">
          {layoutTemplates.length} templates
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {layoutTemplates.map((template) => {
          const isSelected = selectedLayoutId === template.id

          return (
            <button
              key={template.id}
              onClick={() => onSelectLayout(template)}
              className={`
                relative p-3 rounded-xs border text-left transition-all
                ${
                  isSelected
                    ? 'border-(--color-primary) bg-(--color-primary)/5'
                    : 'border-(--color-border) hover:border-(--color-primary) hover:bg-(--color-surface-hover)'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-(--color-primary)" />
                </div>
              )}

              {/* Layout Preview */}
              <LayoutPreview template={template} isSelected={isSelected} />

              {/* Layout Info */}
              <div className="mt-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={isSelected ? 'text-(--color-primary)' : 'text-(--color-text-muted)'}
                  >
                    {layoutIcons[template.id] || <Layout className="w-4 h-4" />}
                  </span>
                  <span
                    className={`text-xs font-medium ${isSelected ? 'text-(--color-primary)' : 'text-(--color-text-primary)'}`}
                  >
                    {template.name}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LayoutSelector

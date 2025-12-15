// ============================================================================
// Toolbar V2 - Designer Toolbar with Layout Picker
// ============================================================================

import {
  ChevronDown,
  ClipboardPaste,
  Edit3,
  Eye,
  Grid3X3,
  History as HistoryIcon,
  LayoutDashboard,
  Redo,
  Save,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import React from 'react'
import type { LayoutTemplate } from '../../core'

// ============================================================================
// Types
// ============================================================================

interface ToolbarV2Props {
  mode: 'edit' | 'preview'
  onModeChange: (mode: 'edit' | 'preview') => void
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  zoom: number
  onZoomChange: (zoom: number) => void
  onToggleGrid: () => void
  gridEnabled: boolean
  onPaste: () => void
  clipboardHasContent: boolean
  isDirty: boolean
  currentLayout: LayoutTemplate | null
  onOpenLayoutSelector: () => void
  onToggleHistory: () => void
  showHistory: boolean
}

// ============================================================================
// Component
// ============================================================================

export const ToolbarV2: React.FC<ToolbarV2Props> = ({
  mode,
  onModeChange,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomChange,
  onToggleGrid,
  gridEnabled,
  onPaste,
  clipboardHasContent,
  isDirty,
  currentLayout,
  onOpenLayoutSelector,
  onToggleHistory,
  showHistory,
}) => {
  return (
    <div className="h-14 border-b border-(--color-border) bg-(--color-surface) flex items-center justify-between px-4">
      {/* Left: Mode Toggle + Layout */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-(--color-border) overflow-hidden">
          <button
            onClick={() => onModeChange('edit')}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 transition-colors
              ${
                mode === 'edit'
                  ? 'bg-(--color-primary) text-white'
                  : 'text-(--color-text-primary) hover:bg-(--color-surface-hover)'
              }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onModeChange('preview')}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 transition-colors
              ${
                mode === 'preview'
                  ? 'bg-(--color-primary) text-white'
                  : 'text-(--color-text-primary) hover:bg-(--color-surface-hover)'
              }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Layout Selector Button */}
        <button
          onClick={onOpenLayoutSelector}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-(--color-border)
            hover:bg-(--color-surface-hover) transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-(--color-primary)" />
          <span className="text-(--color-text-primary)">
            {currentLayout?.name || 'Select Layout'}
          </span>
          <ChevronDown className="w-4 h-4 text-(--color-text-muted)" />
        </button>
      </div>

      {/* Center: Tools */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={onUndo}
          disabled={!canUndo}
          icon={<Undo2 className="w-4 h-4" />}
          title="Undo"
          testId="toolbar-undo"
        />
        <ToolbarButton
          onClick={onRedo}
          disabled={!canRedo}
          icon={<Redo className="w-4 h-4" />}
          title="Redo"
          testId="toolbar-redo"
        />

        <Divider />

        <ToolbarButton
          onClick={onToggleHistory}
          isActive={showHistory}
          icon={<HistoryIcon className="w-4 h-4" />}
          title="History Log"
        />

        <Divider />

        <ToolbarButton
          onClick={onPaste}
          disabled={!clipboardHasContent}
          icon={<ClipboardPaste className="w-4 h-4" />}
          title="Paste"
        />

        <Divider />

        <ToolbarButton
          onClick={() => onZoomChange(zoom - 10)}
          disabled={zoom <= 25}
          icon={<ZoomOut className="w-4 h-4" />}
          title="Zoom Out"
        />
        <span className="text-sm text-(--color-text-secondary) w-12 text-center">{zoom}%</span>
        <ToolbarButton
          onClick={() => onZoomChange(zoom + 10)}
          disabled={zoom >= 200}
          icon={<ZoomIn className="w-4 h-4" />}
          title="Zoom In"
        />

        <Divider />

        <ToolbarButton
          onClick={onToggleGrid}
          icon={<Grid3X3 className="w-4 h-4" />}
          title="Toggle Grid"
          isActive={gridEnabled}
        />
      </div>

      {/* Right: Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          data-testid="toolbar-save"
          className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors
            ${
              isDirty
                ? 'bg-(--color-primary) text-white hover:opacity-90'
                : 'bg-(--color-surface-hover) text-(--color-text-muted)'
            }`}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface ToolbarButtonProps {
  onClick: () => void
  disabled?: boolean
  icon: React.ReactNode
  title: string
  isActive?: boolean
  testId?: string
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  disabled,
  icon,
  title,
  isActive,
  testId,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    data-testid={testId}
    className={`p-2 rounded-lg transition-colors
      ${isActive ? 'bg-(--color-primary-light) text-(--color-primary)' : 'hover:bg-(--color-surface-hover)'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={title}
  >
    {icon}
  </button>
)

const Divider: React.FC = () => <div className="w-px h-6 bg-(--color-border) mx-2" />

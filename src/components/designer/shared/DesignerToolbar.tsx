// ============================================================================
// Designer Toolbar - Shared Toolbar Component
// ============================================================================

import {
  ChevronDown,
  ClipboardPaste,
  Edit3,
  Eye,
  Grid3X3,
  LayoutDashboard,
  Redo,
  Save,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import React from 'react'
import type { LayoutTemplate } from '../../../core/types/layout'
import { ActionButton, ButtonGroup, ButtonGroupItem, IconButton } from '../../common/Button'

// ============================================================================
// Types
// ============================================================================

interface DesignerToolbarProps {
  /** Current mode */
  mode: 'edit' | 'preview'
  onModeChange: (mode: 'edit' | 'preview') => void

  /** Save action */
  onSave: () => void
  isDirty: boolean

  /** History actions */
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean

  /** Zoom controls */
  zoom: number
  onZoomChange: (zoom: number) => void

  /** Grid toggle */
  gridEnabled: boolean
  onToggleGrid: () => void

  /** Paste action */
  onPaste: () => void
  clipboardHasContent: boolean

  /** Optional layout selector (for DesignerV2) */
  currentLayout?: LayoutTemplate | null
  onOpenLayoutSelector?: () => void
}

// ============================================================================
// Designer Toolbar Component
// ============================================================================

export const DesignerToolbar: React.FC<DesignerToolbarProps> = ({
  mode,
  onModeChange,
  onSave,
  isDirty,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomChange,
  gridEnabled,
  onToggleGrid,
  onPaste,
  clipboardHasContent,
  currentLayout,
  onOpenLayoutSelector,
}) => {
  return (
    <div className="h-14 border-b border-(--color-border) bg-(--color-surface) flex items-center justify-between px-4">
      {/* Left: Mode Toggle + Layout */}
      <div className="flex items-center gap-4">
        {/* Mode Toggle */}
        <ButtonGroup>
          <ButtonGroupItem
            onClick={() => onModeChange('edit')}
            isActive={mode === 'edit'}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit
          </ButtonGroupItem>
          <ButtonGroupItem
            onClick={() => onModeChange('preview')}
            isActive={mode === 'preview'}
            icon={<Eye className="w-4 h-4" />}
          >
            Preview
          </ButtonGroupItem>
        </ButtonGroup>

        {/* Layout Selector Button (optional) */}
        {onOpenLayoutSelector && (
          <button
            onClick={onOpenLayoutSelector}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xs border border-(--color-border)
              hover:bg-(--color-surface-hover) transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-(--color-primary)" />
            <span className="text-(--color-text-primary)">
              {currentLayout?.name || 'Select Layout'}
            </span>
            <ChevronDown className="w-4 h-4 text-(--color-text-muted)" />
          </button>
        )}
      </div>

      {/* Center: Tools */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <IconButton
          icon={<Undo2 className="w-4 h-4" />}
          label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <IconButton
          icon={<Redo className="w-4 h-4" />}
          label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        />

        <Divider />

        {/* Paste */}
        <IconButton
          icon={<ClipboardPaste className="w-4 h-4" />}
          label="Paste"
          onClick={onPaste}
          disabled={!clipboardHasContent}
        />

        <Divider />

        {/* Zoom */}
        <IconButton
          icon={<ZoomOut className="w-4 h-4" />}
          label="Zoom Out"
          onClick={() => onZoomChange(zoom - 10)}
          disabled={zoom <= 25}
        />
        <span className="text-sm text-(--color-text-secondary) w-12 text-center">{zoom}%</span>
        <IconButton
          icon={<ZoomIn className="w-4 h-4" />}
          label="Zoom In"
          onClick={() => onZoomChange(zoom + 10)}
          disabled={zoom >= 200}
        />

        <Divider />

        {/* Grid Toggle */}
        <IconButton
          icon={<Grid3X3 className="w-4 h-4" />}
          label="Toggle Grid"
          onClick={onToggleGrid}
          isActive={gridEnabled}
        />
      </div>

      {/* Right: Save */}
      <div className="flex items-center gap-2">
        <ActionButton
          onClick={onSave}
          variant={isDirty ? 'primary' : 'secondary'}
          icon={<Save className="w-4 h-4" />}
        >
          Save
        </ActionButton>
      </div>
    </div>
  )
}

// ============================================================================
// Divider Component
// ============================================================================

const Divider: React.FC = () => <div className="w-px h-6 bg-(--color-border) mx-2" />

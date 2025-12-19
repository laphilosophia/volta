// ============================================================================
// Builder Types
// ============================================================================

export interface CanvasItem {
  id: string
  componentId: string
  props: Record<string, unknown>
  theme?: ComponentTheme
  gridColumn: string // e.g., "span 4"
}

export interface ComponentTheme {
  primary?: string
  background?: string
  textColor?: string
}

export interface LayoutState {
  items: CanvasItem[]
}

export interface SelectionState {
  selectedId: string | null
}

export interface HistoryState {
  past: LayoutState[]
  present: LayoutState
  future: LayoutState[]
}

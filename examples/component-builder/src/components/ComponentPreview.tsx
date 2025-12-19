// ============================================================================
// Component Preview - Renders component based on type
// ============================================================================

import type { ComponentTheme } from '../types'

interface ComponentPreviewProps {
  componentId: string
  props: Record<string, unknown>
  theme?: ComponentTheme
}

export function ComponentPreview({ componentId, props, theme }: ComponentPreviewProps) {
  const primaryColor = theme?.primary || 'var(--primary)'

  switch (componentId) {
    case 'stat-card':
      return (
        <div className="stat-preview">
          <div className="stat-preview-label">{props.title as string}</div>
          <div className="stat-preview-value" style={{ color: primaryColor }}>
            {props.icon as string} {props.value as string}
          </div>
        </div>
      )

    case 'data-table':
      return (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{props.title as string}</div>
          <table className="table-preview">
            <thead>
              <tr>
                {(props.columns as string[] || ['Col 1', 'Col 2']).map((col, i) => (
                  <th key={i}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sample data</td>
                <td>...</td>
              </tr>
              <tr>
                <td>More data</td>
                <td>...</td>
              </tr>
            </tbody>
          </table>
        </div>
      )

    case 'bar-chart':
      return (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{props.title as string}</div>
          <div className="chart-preview">
            {[60, 80, 45, 90, 70].map((h, i) => (
              <div
                key={i}
                className="chart-bar"
                style={{ height: `${h}%`, backgroundColor: primaryColor }}
              />
            ))}
          </div>
        </div>
      )

    case 'text-block':
      return (
        <p style={{ fontSize: props.fontSize as string || '1rem' }}>
          {props.content as string}
        </p>
      )

    case 'header-block':
      const level = (props.level as string) || 'h2'
      if (level === 'h1') return <h1 style={{ color: primaryColor }}>{props.title as string}</h1>
      if (level === 'h3') return <h3 style={{ color: primaryColor }}>{props.title as string}</h3>
      return <h2 style={{ color: primaryColor }}>{props.title as string}</h2>

    case 'spacer':
      return <div style={{ height: props.height as string || '24px' }} />

    case 'card-container':
      return (
        <div style={{ padding: props.padding as string || '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{props.title as string}</div>
          <div style={{ color: 'var(--text-muted)' }}>Card content area</div>
        </div>
      )

    default:
      return <div>Unknown component: {componentId}</div>
  }
}

// ============================================================================
// Dynamic Renderer - Metadata-driven Component Rendering
// ============================================================================

import React, { Suspense, memo } from 'react'
import { useVoltaQuery } from '../../hooks/useVoltaQuery'
import { componentRegistry } from '../component-registry'
import type { ComponentMetadata, PageMetadata } from '../types'

// ============================================================================
// Component Skeleton (Loading Placeholder)
// ============================================================================

interface SkeletonProps {
  className?: string
}

const ComponentSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`skeleton rounded-xs h-32 w-full ${className}`}
    role="progressbar"
    aria-label="Loading component..."
  />
)

// ============================================================================
// Error Boundary for Individual Components
// ============================================================================

interface ErrorFallbackProps {
  componentId: string
  error: Error
  onRetry?: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ componentId, error, onRetry }) => (
  <div className="p-4 rounded-xs border border-red-200 bg-red-50 text-red-700" role="alert">
    <h4 className="font-semibold mb-1">Component Error</h4>
    <p className="text-sm mb-2">
      Failed to render component: <code className="bg-red-100 px-1 rounded">{componentId}</code>
    </p>
    <p className="text-xs text-red-600 mb-2">{error.message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
)

// ============================================================================
// Data Fetching Wrapper
// ============================================================================

interface DataWrapperProps {
  metadata: ComponentMetadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>
}

const DataWrapper: React.FC<DataWrapperProps> = ({ metadata, Component }) => {
  const { dataSource } = metadata

  // Use hook unconditionally - simply skip if not api type
  const isApi = dataSource?.type === 'api' && !!dataSource.endpoint
  const endpoint = isApi ? dataSource.endpoint! : ''

  // We pass enabled: isApi to ensure query only runs when valid
  const { data, isLoading, error } = useVoltaQuery(
    endpoint,
    {},
    {
      enabled: isApi,
    }
  )

  // Inject data props if API source is active
  const injectedProps = isApi
    ? {
        data: data,
        isLoading: isLoading,
        error: error,
        ...metadata.props,
      }
    : metadata.props

  return <Component {...injectedProps} dataSource={dataSource} componentId={metadata.id} />
}

// ============================================================================
// Dynamic Component Renderer
// ============================================================================

interface DynamicRendererProps {
  metadata: ComponentMetadata
  onError?: (componentId: string, error: Error) => void
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = memo(({ metadata, onError }) => {
  const [error, setError] = React.useState<Error | null>(null)

  // Check if component type is registered
  if (!componentRegistry.has(metadata.type)) {
    const missingError = new Error(`Component type "${metadata.type}" is not registered`)
    return <ErrorFallback componentId={metadata.id} error={missingError} />
  }

  // Handle error
  if (error) {
    return <ErrorFallback componentId={metadata.id} error={error} onRetry={() => setError(null)} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = componentRegistry.getLoader(metadata.type) as React.ComponentType<any>

  return (
    <Suspense fallback={<ComponentSkeleton />}>
      <ComponentErrorBoundary
        componentId={metadata.id}
        onError={(err) => {
          setError(err)
          onError?.(metadata.id, err)
        }}
      >
        {/* Use DataWrapper to handle hooks logic */}
        <DataWrapper metadata={metadata} Component={Component} />
      </ComponentErrorBoundary>
    </Suspense>
  )
})

DynamicRenderer.displayName = 'DynamicRenderer'

// ============================================================================
// Component Error Boundary
// ============================================================================

interface ComponentErrorBoundaryProps {
  componentId: string
  onError: (error: Error) => void
  children: React.ReactNode
}

interface ComponentErrorBoundaryState {
  hasError: boolean
}

class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ComponentErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    this.props.onError(error)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return null // Let parent handle the error display
    }
    return this.props.children
  }
}

// ============================================================================
// Page Renderer - Renders all components in a page
// ============================================================================

interface PageRendererProps {
  page: PageMetadata
  layout?: 'grid' | 'flex' | 'stack'
  onComponentError?: (componentId: string, error: Error) => void
}

export const PageRenderer: React.FC<PageRendererProps> = memo(
  ({ page, layout = 'stack', onComponentError }) => {
    const layoutClasses = {
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      flex: 'flex flex-wrap gap-6',
      stack: 'flex flex-col gap-6',
    }

    return (
      <div className={layoutClasses[layout]}>
        {page.components.map((component) => (
          <div
            key={component.id}
            className="animate-fadeIn"
            style={
              component.position
                ? {
                    gridColumn: `span ${component.position.width}`,
                    gridRow: `span ${component.position.height}`,
                  }
                : undefined
            }
          >
            <DynamicRenderer metadata={component} onError={onComponentError} />
          </div>
        ))}
      </div>
    )
  }
)

PageRenderer.displayName = 'PageRenderer'

// ============================================================================
// Component Wrapper for Designer Mode
// ============================================================================

interface DesignerComponentWrapperProps {
  metadata: ComponentMetadata
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
  children: React.ReactNode
}

export const DesignerComponentWrapper: React.FC<DesignerComponentWrapperProps> = ({
  metadata,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  children,
}) => {
  return (
    <div
      className={`
        relative transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-(--color-primary) ring-offset-2' : ''}
        ${isHovered && !isSelected ? 'ring-2 ring-(--color-primary) ring-opacity-50' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      data-component-id={metadata.id}
      data-component-type={metadata.type}
    >
      {/* Component Label (visible on hover/select) */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium bg-(--color-primary) text-white rounded-t">
          {metadata.type}
        </div>
      )}

      {children}

      {/* Resize handles (visible when selected) */}
      {isSelected && (
        <>
          <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-(--color-primary) rounded-sm cursor-se-resize" />
          <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-(--color-primary) rounded-sm cursor-sw-resize" />
        </>
      )}
    </div>
  )
}

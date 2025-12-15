// ============================================================================
// Headless Data Table - API-connected table using shared TableCore
// ============================================================================

import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { memo, useState } from 'react'
import { useVoltaQuery } from '../../../hooks/useVoltaQuery'
import { TableCore } from '../../shared'

// ============================================================================
// Types
// ============================================================================

interface HeadlessDataTableProps<T> {
  /** API endpoint key from VoltaConfig */
  endpoint: string
  /** Column definitions for TanStack Table */
  columns: ColumnDef<T>[]
  /** Optional query parameters */
  params?: Record<string, unknown>
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void
  /** Initial page size */
  pageSize?: number
}

// ============================================================================
// Component
// ============================================================================

function HeadlessDataTableComponent<T>({
  endpoint,
  columns,
  params,
  onRowClick,
  pageSize: initialPageSize = 10,
}: HeadlessDataTableProps<T>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const { data, isLoading, error } = useVoltaQuery<T[]>(endpoint, params)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  })

  // Handle error state
  if (error) {
    return (
      <div className="p-8 text-center border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium">Error loading data</p>
        <p className="text-sm text-red-500 mt-1">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <TableCore
      table={table}
      onRowClick={onRowClick}
      pagination={true}
      sorting={false}
      loading={isLoading}
      loadingMessage="Loading data..."
      emptyMessage="No data available"
    />
  )
}

HeadlessDataTableComponent.displayName = 'HeadlessDataTable'

// Export with memo and proper typing
export const HeadlessDataTable = memo(
  HeadlessDataTableComponent
) as typeof HeadlessDataTableComponent

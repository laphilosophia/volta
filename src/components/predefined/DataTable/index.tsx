// ============================================================================
// Data Table Component (Using TanStack Table + Shared TableCore)
// ============================================================================

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import React, { memo, useMemo, useState } from 'react'
import { TableCore } from '../../shared'

// ============================================================================
// Types
// ============================================================================

interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[]
  data?: T[]
  pagination?: boolean
  sorting?: boolean
  pageSize?: number
  loading?: boolean
  globalFilter?: string
  onRowClick?: (row: T) => void
  dataSource?: {
    query: Record<string, unknown>
    schema: Record<string, unknown>
  }
  componentId?: string
}

// ============================================================================
// Component
// ============================================================================

function DataTableComponent<T extends object>({
  columns,
  data = [],
  pagination = true,
  sorting = true,
  pageSize: initialPageSize = 10,
  loading = false,
  globalFilter: externalFilter,
  onRowClick,
}: DataTableProps<T>) {
  const [sortingState, setSortingState] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState(externalFilter || '')

  // Sync external filter
  React.useEffect(() => {
    if (externalFilter !== undefined) {
      setGlobalFilter(externalFilter)
    }
  }, [externalFilter])

  // Memoize page size options
  const pageSizeOptions = useMemo(() => [5, 10, 25, 50, 100], [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sortingState,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  })

  return (
    <TableCore
      table={table}
      onRowClick={onRowClick}
      pagination={pagination}
      sorting={sorting}
      loading={loading}
      pageSizeOptions={pageSizeOptions}
    />
  )
}

DataTableComponent.displayName = 'DataTable'

// Export with memo and proper typing
const DataTable = memo(DataTableComponent) as typeof DataTableComponent

export default DataTable

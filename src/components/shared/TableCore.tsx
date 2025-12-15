// ============================================================================
// Shared Table Core Component - Reusable table rendering with TanStack Table
// ============================================================================

import { flexRender, type HeaderGroup, type RowModel, type Table } from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
} from 'lucide-react'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

// ============================================================================
// Types
// ============================================================================

interface TableCoreProps<T> {
  /** TanStack Table instance */
  table: Table<T>
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void
  /** Whether to show pagination controls */
  pagination?: boolean
  /** Whether to show sorting indicators */
  sorting?: boolean
  /** Whether the table is in a loading state */
  loading?: boolean
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Custom empty state message */
  emptyMessage?: string
  /** Custom loading message */
  loadingMessage?: string
}

// ============================================================================
// Loading State Component
// ============================================================================

interface LoadingStateProps {
  message?: string
}

const LoadingState: React.FC<LoadingStateProps> = memo(({ message }) => {
  const { t } = useTranslation('components')

  return (
    <div className="rounded-xs border border-(--color-border) bg-(--color-surface) overflow-hidden">
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-(--color-primary)" />
        <p className="mt-2 text-sm text-(--color-text-muted)">
          {message || t('dataTable.loading')}
        </p>
      </div>
    </div>
  )
})

LoadingState.displayName = 'TableCore.LoadingState'

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  message?: string
}

const EmptyState: React.FC<EmptyStateProps> = memo(({ message }) => {
  const { t } = useTranslation('components')

  return (
    <div className="rounded-xs border border-(--color-border) bg-(--color-surface) overflow-hidden">
      <div className="p-8 text-center">
        <p className="text-sm text-(--color-text-muted)">{message || t('dataTable.noData')}</p>
      </div>
    </div>
  )
})

EmptyState.displayName = 'TableCore.EmptyState'

// ============================================================================
// Table Header Component
// ============================================================================

interface TableHeaderProps<T> {
  headerGroups: HeaderGroup<T>[]
  sorting?: boolean
}

function TableHeaderComponent<T>({ headerGroups, sorting = true }: TableHeaderProps<T>) {
  return (
    <thead className="bg-(--color-surface-hover)">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="px-4 py-3 text-left text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider"
            >
              {header.isPlaceholder ? null : (
                <div
                  className={`flex items-center gap-2 ${
                    header.column.getCanSort()
                      ? 'cursor-pointer select-none hover:text-(--color-text-primary)'
                      : ''
                  }`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {sorting && header.column.getCanSort() && (
                    <span className="flex flex-col">
                      <ChevronUp
                        className={`w-3 h-3 -mb-1 ${
                          header.column.getIsSorted() === 'asc'
                            ? 'text-(--color-primary)'
                            : 'text-(--color-text-muted)'
                        }`}
                      />
                      <ChevronDown
                        className={`w-3 h-3 ${
                          header.column.getIsSorted() === 'desc'
                            ? 'text-(--color-primary)'
                            : 'text-(--color-text-muted)'
                        }`}
                      />
                    </span>
                  )}
                </div>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  )
}

// ============================================================================
// Table Body Component
// ============================================================================

interface TableBodyProps<T> {
  rowModel: RowModel<T>
  onRowClick?: (row: T) => void
}

function TableBodyComponent<T>({ rowModel, onRowClick }: TableBodyProps<T>) {
  return (
    <tbody className="divide-y divide-(--color-border)">
      {rowModel.rows.map((row) => (
        <tr
          key={row.id}
          onClick={() => onRowClick?.(row.original)}
          className={`
            hover:bg-(--color-surface-hover) transition-colors duration-150
            ${onRowClick ? 'cursor-pointer' : ''}
          `}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="px-4 py-3 text-sm text-(--color-text-primary)">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

// ============================================================================
// Pagination Controls Component
// ============================================================================

interface PaginationControlsProps<T> {
  table: Table<T>
  pageSizeOptions: number[]
}

function PaginationControls<T>({ table, pageSizeOptions }: PaginationControlsProps<T>) {
  const { t } = useTranslation('components')
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-(--color-border) bg-(--color-surface-hover)">
      <div className="flex items-center gap-2">
        <span className="text-sm text-(--color-text-secondary)">{t('dataTable.rowsPerPage')}:</span>
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-(--color-border) rounded-md
            bg-(--color-surface) text-(--color-text-primary)
            focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm text-(--color-text-secondary)">
          {pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, totalRows)}{' '}
          {t('dataTable.of')} {totalRows}
        </span>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-md hover:bg-(--color-surface) disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-md hover:bg-(--color-surface) disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-md hover:bg-(--color-surface) disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-md hover:bg-(--color-surface) disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main TableCore Component
// ============================================================================

function TableCoreComponent<T>({
  table,
  onRowClick,
  pagination = true,
  sorting = true,
  loading = false,
  pageSizeOptions = [5, 10, 25, 50, 100],
  emptyMessage,
  loadingMessage,
}: TableCoreProps<T>) {
  const rowModel = table.getRowModel()

  if (loading) {
    return <LoadingState message={loadingMessage} />
  }

  if (rowModel.rows.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="rounded-xs border border-(--color-border) bg-(--color-surface) overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeaderComponent headerGroups={table.getHeaderGroups()} sorting={sorting} />
          <TableBodyComponent rowModel={rowModel} onRowClick={onRowClick} />
        </table>
      </div>

      {pagination && <PaginationControls table={table} pageSizeOptions={pageSizeOptions} />}
    </div>
  )
}

TableCoreComponent.displayName = 'TableCore'

// Export with memo for performance
export const TableCore = memo(TableCoreComponent) as typeof TableCoreComponent

// Also export sub-components for flexibility
export { EmptyState as TableEmptyState, LoadingState as TableLoadingState }

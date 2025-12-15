// ============================================================================
// Data Table Component (Using TanStack Table)
// ============================================================================

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data?: T[];
  pagination?: boolean;
  sorting?: boolean;
  pageSize?: number;
  loading?: boolean;
  globalFilter?: string;
  onRowClick?: (row: T) => void;
  dataSource?: {
    query: Record<string, unknown>;
    schema: Record<string, unknown>;
  };
  componentId?: string;
}

function DataTable<T extends object>({
  columns,
  data = [],
  pagination = true,
  sorting = true,
  pageSize: initialPageSize = 10,
  loading = false,
  globalFilter: externalFilter,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useTranslation('components');
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(externalFilter || '');

  // Sync external filter
  React.useEffect(() => {
    if (externalFilter !== undefined) {
      setGlobalFilter(externalFilter);
    }
  }, [externalFilter]);

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
  });

  const pageSizeOptions = useMemo(() => [5, 10, 25, 50, 100], []);

  if (loading) {
    return (
      <div className="rounded-xs border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {t('dataTable.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xs border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {t('dataTable.noData')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xs border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-surface-hover)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${header.column.getCanSort()
                          ? 'cursor-pointer select-none hover:text-[var(--color-text-primary)]'
                          : ''
                          }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sorting && header.column.getCanSort() && (
                          <span className="flex flex-col">
                            <ChevronUp
                              className={`w-3 h-3 -mb-1 ${header.column.getIsSorted() === 'asc'
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-muted)]'
                                }`}
                            />
                            <ChevronDown
                              className={`w-3 h-3 ${header.column.getIsSorted() === 'desc'
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-muted)]'
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

          <tbody className="divide-y divide-[var(--color-border)]">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`
                  hover:bg-[var(--color-surface-hover)] transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-[var(--color-text-primary)]"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-hover)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-secondary)]">
              {t('dataTable.rowsPerPage')}:
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-[var(--color-border)] rounded-md
                bg-[var(--color-surface)] text-[var(--color-text-primary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-[var(--color-text-secondary)]">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              {t('dataTable.of')} {table.getFilteredRowModel().rows.length}
            </span>

            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-md hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-md hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-md hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-md hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

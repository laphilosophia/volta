import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { useVoltaQuery } from '../../../hooks/useVoltaQuery';

interface HeadlessDataTableProps<T> {
  endpoint: string;
  columns: ColumnDef<T>[];
  params?: Record<string, unknown>;
  onRowClick?: (row: T) => void;
}

export function HeadlessDataTable<T>({ endpoint, columns, params, onRowClick }: HeadlessDataTableProps<T>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, error } = useVoltaQuery<T[]>(endpoint, params);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-(--color-text-secondary)">Loading data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading data: {(error as Error).message}</div>;
  }

  return (
    <div className="w-full border border-(--color-border) rounded-lg overflow-hidden bg-(--color-surface)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-(--color-text-primary)">
          <thead className="bg-(--color-surface-hover) border-b border-(--color-border)">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-(--color-text-secondary) uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-(--color-surface-hover) transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-(--color-border) bg-(--color-surface-hover)">
        <span className="text-xs text-(--color-text-secondary)">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-(--color-border) disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-(--color-border) disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-(--color-border) disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-(--color-border) disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

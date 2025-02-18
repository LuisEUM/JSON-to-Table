"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";

import { columns } from "./columns/columns";
import { processData } from "./data-processor";
import { TypeLegend } from "./components/type-legend";
import { TablePagination } from "./components/table-pagination";
import { TableSearch } from "./components/table-search";
import { ColumnManagerModal } from "./components/column-manager-modal";
import type { ProcessedRow } from "./data-processor";

interface JsonTableProps {
  data: Record<string, unknown>[];
}

interface TableStyles extends React.CSSProperties {
  width?: number | string;
}

export function JsonTable({ data }: JsonTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const processedData = useMemo(
    () => data.map((item) => processData(item)),
    [data]
  );
  const tableColumns = useMemo<ColumnDef<ProcessedRow>[]>(
    () => columns(processedData[0]),
    [processedData]
  );

  const tableData = useMemo(
    () =>
      processedData.map((items) =>
        items.reduce<ProcessedRow>(
          (acc, item) => ({
            ...acc,
            [item.id]: item,
          }),
          {}
        )
      ),
    [processedData]
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 100,
      size: 150,
      maxSize: 500,
    },
  });

  return (
    <CardContent className='relative'>
      <style jsx global>{`
        .resizer {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 4px;
          cursor: col-resize;
          user-select: none;
          touch-action: none;
          opacity: 0;
          background-color: hsl(var(--border));
          transition: opacity 0.2s, background-color 0.2s;
        }

        .resizer.isResizing,
        *:hover > .resizer {
          opacity: 1;
          background-color: hsl(var(--primary));
        }

        .table-wrapper {
          position: relative;
          overflow-x: auto;
        }

        .table-wrapper table {
          width: fit-content;
        }

        .table-cell {
          position: relative;
        }
      `}</style>

      <div className='flex items-center justify-between mb-4'>
        <div className='w-72'>
          <TableSearch table={table} />
        </div>
        <ColumnManagerModal table={table} />
      </div>
      <div className='rounded-md border'>
        <div className='table-wrapper'>
          <Table style={{ width: table.getCenterTotalSize() } as TableStyles}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={
                        {
                          width: header.getSize(),
                          position: "relative",
                        } as TableStyles
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={
                          {
                            width: cell.column.getSize(),
                          } as TableStyles
                        }
                        className='table-cell'
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <TablePagination table={table} />
      <TypeLegend />
    </CardContent>
  );
}

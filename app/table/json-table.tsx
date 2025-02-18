"use client"

import { useMemo } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { columns } from "./columns/columns"
import { processData } from "./data-processor"

interface JsonTableProps {
  data: Record<string, any>[]
}

export function JsonTable({ data }: JsonTableProps) {
  const processedData = useMemo(() => data.map((item) => processData(item)), [data])
  const tableColumns = useMemo<ColumnDef<any>[]>(() => columns(processedData[0]), [processedData])

  const tableData = useMemo(
    () => processedData.map((items) => items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})),
    [processedData],
  )

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 100,
      size: 150,
    },
  })

  return (
    <CardContent className="relative">
      <style jsx global>{`
        .table-wrapper {
          position: relative;
          overflow-x: auto;
        }

        .table-wrapper table {
          border-collapse: separate;
          border-spacing: 0;
          width: fit-content;
        }

        .table-cell {
          transition: all 0.2s ease;
          position: relative;
        }

        .table-cell:hover::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          border: 2px solid rgb(148 163 184);
          pointer-events: none;
        }

        .group-border-right {
          border-right: 1px solid rgb(148 163 184);
        }

        .table-head {
          transition: all 0.2s ease;
          position: relative;
        }

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
          background-color: rgb(148 163 184);
          transition: opacity 0.2s;
        }

        .resizer.isResizing {
          opacity: 1;
          background-color: rgb(148 163 184);
        }

        *:hover > .resizer {
          opacity: 1;
        }
      `}</style>

      <div className="rounded-md border border-slate-300 overflow-x-auto table-wrapper">
        <Table style={{ width: table.getCenterTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, groupIndex) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => {
                  const isGroupHeader =
                    header.column.columnDef.header && typeof header.column.columnDef.header !== "function"
                  const level = header.column.columnDef.meta?.level || 0

                  // Calculate background color based on nesting level
                  const getBgColor = () => {
                    if (!isGroupHeader) return "bg-white"
                    const colors = ["bg-slate-50", "bg-slate-100", "bg-slate-200"]
                    return colors[level % colors.length]
                  }

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      className={`
                        text-center table-head relative
                        ${getBgColor()}
                        ${groupIndex === headerGroup.headers.length - 1 ? "border-b border-slate-300" : ""}
                        ${header.column.getIsResizing() ? "border-r-2 border-r-slate-400" : ""}
                      `}
                    >
                      {header.isPlaceholder ? null : (
                        <div className={`flex flex-col gap-1 ${isGroupHeader ? "pb-2" : ""}`}>
                          {isGroupHeader && (
                            <div className="font-bold text-foreground/70">{header.column.columnDef.header}</div>
                          )}
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={`
                    table-row border-y border-slate-300
                    ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  `}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isLastInGroup = cell.column.columnDef.columns
                      ? false
                      : cell
                          .getContext()
                          .table.getHeaderGroups()[0]
                          .headers.findIndex((h) => h.column.columnDef.header === cell.column.columnDef.header) === -1

                    return (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={`
                          text-center table-cell
                          ${isLastInGroup ? "group-border-right" : "border-r border-slate-300"}
                        `}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </CardContent>
  )
}


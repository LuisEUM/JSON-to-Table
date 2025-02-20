"use client";

import { TableHeader } from "@/components/ui/table";
import type React from "react";
import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  createContext,
} from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  type Row,
  type FilterFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { columns } from "./columns/columns";
import {
  processData,
  type ProcessedItem,
  type ProcessedRow,
} from "./data-processor";
import { TypeLegend } from "./components/type-legend";
import { TablePagination } from "./components/table-pagination";
import { TableSearch } from "./components/table-search";
import { ColumnManagerModal } from "./components/column-manager-modal";
import { ActionButtons } from "./components/action-buttons";
import type { FilterCondition } from "./components/filters/filter-types";

interface JsonTableProps {
  data: Record<string, unknown>[];
}

interface TableStyles extends React.CSSProperties {
  width?: number | string;
}

// Crear el contexto del filtro
export const FilterContext = createContext<{
  applyFilter: (columnId: string, filterValue: FilterCondition) => void;
}>({
  applyFilter: () => {},
});

// Definir tipos para las funciones de filtro
interface FilterFunctions {
  [key: string]: (
    row: Row<ProcessedRow>,
    columnId: string,
    filterValue: FilterCondition
  ) => boolean;
  processedValueFilter: (
    row: Row<ProcessedRow>,
    columnId: string,
    filterValue: FilterCondition
  ) => boolean;
}

const filterFns: FilterFunctions = {
  processedValueFilter: (row, columnId, filterValue) => {
    if (!filterValue) return true;
    const processedValue = row.original[columnId] as ProcessedItem;
    if (!processedValue) return false;

    switch (filterValue.operator) {
      case "in":
        return (
          Array.isArray(filterValue.value) &&
          filterValue.value.includes(String(processedValue.value))
        );
      case "equals":
        return processedValue.value === filterValue.value;
      case "notEquals":
        return processedValue.value !== filterValue.value;
      case "contains":
        return String(processedValue.value)
          .toLowerCase()
          .includes(String(filterValue.value).toLowerCase());
      case "between":
        if (typeof processedValue.value === "number") {
          return (
            processedValue.value >= (filterValue.value as number) &&
            processedValue.value <= (filterValue.additionalValue as number)
          );
        }
        return false;
      default:
        return true;
    }
  },
};

export function JsonTable({ data }: JsonTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>(
    () => data
  );
  const [useFixedColumn, setUseFixedColumn] = useState(false);
  const [fixedColumnId, setFixedColumnId] = useState<string | null>(null);
  const [originalColumnOrder, setOriginalColumnOrder] = useState<string[]>([]);

  const processedData = useMemo(
    () => tableData.map((item) => processData(item)),
    [tableData]
  );

  const handleDelete = useCallback((index: number) => {
    setTableData((prev) => {
      const newData = [...prev];
      newData.splice(index, 1);
      toast.success("Registro eliminado correctamente");
      return newData;
    });
  }, []);

  const tableColumns = useMemo<ColumnDef<ProcessedRow>[]>(() => {
    const baseColumns = columns(processedData[0]);
    let allColumns: ColumnDef<ProcessedRow>[] = [];

    const indexColumn: ColumnDef<ProcessedRow> = {
      id: "index",
      header: "#",
      size: 50,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className='text-right tabular-nums text-muted-foreground'>
          {row.index + 1}
        </div>
      ),
    };

    if (!useFixedColumn || !fixedColumnId) {
      allColumns.push(indexColumn);
    }

    if (useFixedColumn && fixedColumnId) {
      const fixedColumnIndex = baseColumns.findIndex(
        (col) => col.id === fixedColumnId
      );
      if (fixedColumnIndex !== -1) {
        const fixedColumn = baseColumns[fixedColumnIndex];
        allColumns.push({ ...fixedColumn, enableHiding: false });
        allColumns = [
          ...allColumns,
          ...baseColumns.slice(0, fixedColumnIndex),
          ...baseColumns.slice(fixedColumnIndex + 1),
        ];
      } else {
        allColumns = [...allColumns, ...baseColumns];
      }
    } else {
      allColumns = [...allColumns, ...baseColumns];
    }

    const actionsColumn: ColumnDef<ProcessedRow> = {
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      enableHiding: false,
      size: 50,
      cell: ({ row }) => (
        <ActionButtons
          row={row.original}
          onDelete={() => handleDelete(row.index)}
        />
      ),
    };

    allColumns.push(actionsColumn);
    return allColumns;
  }, [processedData, handleDelete, useFixedColumn, fixedColumnId]);

  const processedTableData = useMemo(
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
    data: processedTableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    filterFns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 100,
      size: 150,
      maxSize: 500,
      filterFn: filterFns.processedValueFilter as FilterFn<ProcessedRow>,
    },
  });

  useEffect(() => {
    if (!originalColumnOrder.length) {
      setOriginalColumnOrder(table.getAllLeafColumns().map((col) => col.id));
    }
  }, [table, originalColumnOrder]);

  const toggleFixedColumn = useCallback(
    (value: boolean) => {
      setUseFixedColumn(value);
      if (!value) {
        const currentOrder = table.getState().columnOrder;
        const newOrder = [
          "index",
          ...currentOrder.filter(
            (id) => id !== "index" && id !== fixedColumnId
          ),
        ];
        table.setColumnOrder(newOrder);
        setFixedColumnId(null);
      }
    },
    [fixedColumnId, table]
  );

  const changeFixedColumn = useCallback(
    (columnId: string | null) => {
      setFixedColumnId(columnId);
      if (columnId) {
        const currentOrder = table.getState().columnOrder;
        const newOrder = [
          columnId,
          ...currentOrder.filter((id) => id !== columnId && id !== "index"),
        ];
        table.setColumnOrder(newOrder);
      }
    },
    [table]
  );

  // Método para aplicar filtros
  const applyFilter = useCallback(
    (columnId: string, filterValue: FilterCondition) => {
      table.getColumn(columnId)?.setFilterValue(filterValue);
    },
    [table]
  );

  // Contexto del filtro
  const filterContextValue = useMemo(
    () => ({
      applyFilter,
    }),
    [applyFilter]
  );

  return (
    <FilterContext.Provider value={filterContextValue}>
      <CardContent className='relative'>
        <style jsx global>{`
          .table-wrapper {
            position: relative;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }

          .table-wrapper::-webkit-scrollbar {
            width: 14px;
            height: 14px;
            display: block;
          }

          .table-wrapper::-webkit-scrollbar-track {
            background: hsl(var(--muted));
            border-radius: 0;
          }

          .table-wrapper::-webkit-scrollbar-thumb {
            background-color: hsl(var(--muted-foreground));
            border: 3px solid hsl(var(--muted));
            border-radius: 7px;
          }

          .table-wrapper::-webkit-scrollbar-corner {
            background: hsl(var(--muted));
          }

          .table-wrapper {
            scrollbar-width: auto;
            scrollbar-color: hsl(var(--muted-foreground)) hsl(var(--muted));
          }

          .table-wrapper table {
            width: fit-content;
            min-width: 100%;
          }

          .table-cell {
            position: relative;
          }

          .fixed-left {
            position: sticky;
            left: 0;
            background-color: hsl(var(--background));
            border-right: 1px solid hsl(var(--border));
            z-index: 10;
          }

          .fixed-left-header {
            position: sticky;
            left: 0;
            top: 0;
            background-color: hsl(var(--background));
            border-right: 1px solid hsl(var(--border));
            z-index: 30;
          }

          .actions-column {
            position: sticky;
            right: 0;
            background-color: hsl(var(--background));
            border-left: 1px solid hsl(var(--border));
            z-index: 10;
            padding: 0 !important;
            width: 50px !important;
          }

          .actions-header {
            position: sticky;
            right: 0;
            top: 0;
            background-color: hsl(var(--background));
            border-left: 1px solid hsl(var(--border));
            z-index: 30;
            width: 50px !important;
          }

          .table-header {
            position: sticky;
            top: 0;
            background-color: hsl(var(--background));
            z-index: 20;
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
            background-color: hsl(var(--border));
            transition: opacity 0.2s, background-color 0.2s;
          }

          .resizer.isResizing,
          *:hover > .resizer {
            opacity: 1;
            background-color: hsl(var(--primary));
          }

          .table-cell > div {
            min-width: 0;
          }

          .fixed-column {
            background-color: hsl(var(--muted));
          }

          @media (max-width: 640px) {
            .table-wrapper {
              margin: 0 -1rem;
              width: calc(100% + 2rem);
            }
          }
        `}</style>

        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4'>
          <div className='w-full sm:w-72'>
            <TableSearch table={table} />
          </div>
          <div className='flex justify-end'>
            <ColumnManagerModal
              table={table}
              useFixedColumn={useFixedColumn}
              onFixedColumnChange={toggleFixedColumn}
              fixedColumnId={fixedColumnId}
              onFixedColumnIdChange={changeFixedColumn}
              originalColumnOrder={originalColumnOrder}
            />
          </div>
        </div>
        <div className='rounded-md border overflow-hidden'>
          <div className='table-wrapper' style={{ maxHeight: "600px" }}>
            <Table style={{ width: table.getCenterTotalSize() } as TableStyles}>
              <TableHeader className='table-header sticky top-0 z-10 bg-background'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          style={{
                            width: header.getSize(),
                            position: "relative",
                          }}
                          className={`
                            ${
                              header.column.id === "actions"
                                ? "actions-header"
                                : ""
                            }
                            ${
                              header.column.id === fixedColumnId ||
                              header.column.id === "index"
                                ? "fixed-left-header fixed-column"
                                : ""
                            }
                          `}
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
                                header.column.getIsResizing()
                                  ? "isResizing"
                                  : ""
                              }`}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            style={{
                              width: cell.column.getSize(),
                            }}
                            className={`
                              table-cell
                              ${
                                cell.column.id === "actions"
                                  ? "actions-column"
                                  : ""
                              }
                              ${
                                cell.column.id === fixedColumnId ||
                                cell.column.id === "index"
                                  ? "fixed-left fixed-column"
                                  : ""
                              }
                            `}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
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
    </FilterContext.Provider>
  );
}

"use client";

import { TableHeader } from "@/components/ui/table";
import React from "react";
import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  createContext,
} from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  useReactTable,
  Column, // Para leer info de pinning
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

import { columns } from "./columns/columns"; // Ajusta la ruta a tu archivo de columnas
import {
  processData,
  type ProcessedItem,
  type ProcessedRow,
} from "./data-processor"; // Ajusta la ruta
import { TypeLegend } from "./components/type-legend"; // Ajusta la ruta
import { TablePagination } from "./components/table-pagination"; // Ajusta la ruta
import { TableSearch } from "./components/table-search"; // Ajusta la ruta
import { ColumnManagerModal } from "./components/column-manager-modal"; // Ajusta la ruta
import { ActionButtons } from "./components/action-buttons"; // Ajusta la ruta
import type { FilterCondition } from "./components/filters/filter-types";
import { ExportDropdown } from "./components/export-dropdown";
import { SecondaryTables } from "./components/secondary-tables";

// --------------------
// 1) Contexto de filtros (opcional)
// --------------------
export const FilterContext = createContext<{
  applyFilter: (columnId: string, filterValue: FilterCondition) => void;
}>({
  applyFilter: () => {},
});

// --------------------
// 3) Columnas "selección", "index" y "actions"
// --------------------
const selectionColumn: ColumnDef<ProcessedRow> = {
  id: "selection",
  header: ({ table }) => (
    <div className='flex items-center justify-center'>
      <input
        type='checkbox'
        className='h-4 w-4'
        {...{
          checked: table.getIsAllRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    </div>
  ),
  cell: ({ row }) => (
    <div className='flex items-center justify-center'>
      <input
        type='checkbox'
        className='h-4 w-4'
        {...{
          checked: row.getIsSelected(),
          onChange: row.getToggleSelectedHandler(),
        }}
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
  enableResizing: false,
  size: 50,
  minSize: 50,
  maxSize: 50,
};

const indexColumn: ColumnDef<ProcessedRow> = {
  id: "index",
  header: ({}) => (
    <div className='text-center text-muted-foreground w-6'>#</div>
  ),
  size: 50,
  enableSorting: false,
  enableHiding: false,
  cell: ({ row }) => (
    <div className='text-center text-muted-foreground w-full'>
      {row.index + 1}
    </div>
  ),
};

function createActionsColumn(
  onDelete: (index: number) => void
): ColumnDef<ProcessedRow> {
  return {
    id: "actions",
    header: ({}) => (
      <div className='text-center text-muted-foreground w-28'>Acciones</div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <ActionButtons
          row={row.original}
          onDelete={() => onDelete(row.index)}
        />
      </div>
    ),
  };
}

// --------------------
// 4) Funciones para pinning con TanStack (sin solaparse)
// --------------------
function getTanStackPinningStyles(
  column: Column<ProcessedRow>,
  isHeader = false
): React.CSSProperties {
  const isPinned = column.getIsPinned();

  return {
    position: isPinned ? "sticky" : "relative",
    left: isPinned === "left" ? column.getStart("left") : undefined,
    right: isPinned === "right" ? column.getStart("right") : undefined,
    top: isHeader ? 0 : undefined,
    zIndex: isPinned ? (isHeader ? 30 : 10) : 1,
    backgroundColor: "oklch(.985 0 0)",
  };
}

// --------------------
// 5) Componente principal
// --------------------
interface JsonTableProps {
  data: Record<string, unknown>[];
  isSecondaryTable?: boolean;
  onArrayColumnsChange?: (
    columns: {
      id: string;
      label: string;
      data: Record<string, unknown>[];
    }[]
  ) => void;
  parentTableInfo?: {
    id: string;
    name: string;
  };
}

export function JsonTable({
  data,
  isSecondaryTable = false,
  onArrayColumnsChange,
  parentTableInfo,
}: JsonTableProps) {
  // 1. Todos los useState primero
  const [tableData, setTableData] = useState(data);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [useFixedColumn, setUseFixedColumn] = useState(false);
  const [fixedColumnId, setFixedColumnId] = useState<string | null>(null);
  const [originalColumnOrder, setOriginalColumnOrder] = useState<string[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [arrayColumns, setArrayColumns] = useState<
    {
      id: string;
      label: string;
      data: Record<string, unknown>[];
      parentTable?: {
        id: string;
        name: string;
      };
    }[]
  >([]);
  const [uniqueArrayColumns] = useState(
    () =>
      new Map<
        string,
        {
          id: string;
          label: string;
          data: Record<string, unknown>[];
          parentTable?: {
            id: string;
            name: string;
          };
        }
      >()
  );

  // 2. Todos los useMemo
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

  const actionsColumn = useMemo(
    () => createActionsColumn(handleDelete),
    [handleDelete]
  );

  const baseColumns = useMemo<ColumnDef<ProcessedRow>[]>(() => {
    if (!processedData[0]) return [];
    const cols = columns(processedData[0]);
    return cols.map((col) => ({
      ...col,
      meta: {
        ...col.meta,
        type:
          processedData[0].find((item) => item.id === col.id)?.type || "string",
      },
    }));
  }, [processedData]);

  const tableColumns = useMemo<ColumnDef<ProcessedRow>[]>(() => {
    return [selectionColumn, indexColumn, ...baseColumns, actionsColumn];
  }, [baseColumns, actionsColumn]);

  const processedTableData = useMemo(() => {
    // Limpia el mapa de columnas array al reprocesar
    uniqueArrayColumns.clear();

    // Diccionario para agrupar todos los datos por tipo de tabla secundaria
    const secondaryTableData: Record<string, Record<string, unknown>[]> = {};

    return processedData
      .map((items: ProcessedItem[]) => {
        const row = items.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as ProcessedRow);

        const rowId = items.find((item) => item.isId)?.value || "";

        // Procesar arrays de objetos para tablas secundarias
        Object.values(row).forEach((item) => {
          if (item.type === "array[objeto]") {
            const columnId = item.path.join(".");

            // Procesar cada item secundario con su respectivo ID padre
            const processedSubItems =
              item.items?.map((subItem) => {
                // Asegurar que cada item secundario tenga referencia a su fila padre específica
                return {
                  ...(subItem.value as object),
                  __parentId: rowId,
                };
              }) || [];

            // Agrupar por tipo de tabla secundaria en el diccionario temporal
            if (!secondaryTableData[columnId]) {
              secondaryTableData[columnId] = [];
            }

            // Añadir todos los items a su grupo correspondiente
            secondaryTableData[columnId].push(...processedSubItems);
          }
        });

        return row;
      })
      .map((row) => {
        // Después de procesar todas las filas, ahora configuramos las tablas secundarias
        Object.entries(secondaryTableData).forEach(([columnId, dataItems]) => {
          uniqueArrayColumns.set(columnId, {
            id: columnId,
            label: columnId.split(".").pop() || columnId,
            data: dataItems,
            parentTable: parentTableInfo,
          });
        });

        return row;
      });
  }, [processedData, parentTableInfo, uniqueArrayColumns]);

  // 3. Instancia de la tabla
  const table = useReactTable({
    data: processedTableData,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    filterFns: {
      processedValueFilter: (row, columnId, filterValue) => {
        if (
          !filterValue ||
          typeof filterValue !== "object" ||
          !("operator" in filterValue)
        ) {
          return true;
        }

        const processedValue = row.original[columnId] as ProcessedItem;
        if (!processedValue) return false;

        const rawValue = processedValue.value;

        switch (filterValue.operator) {
          case "in":
            return (
              Array.isArray(filterValue.value) &&
              filterValue.value.includes(String(rawValue))
            );
          case "equals":
            return rawValue === filterValue.value;
          case "notEquals":
            return rawValue !== filterValue.value;
          case "contains":
            return String(rawValue)
              .toLowerCase()
              .includes(String(filterValue.value).toLowerCase());
          default:
            return true;
        }
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableFilters: true,
    enableGlobalFilter: true,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchTerm = String(filterValue).toLowerCase();

      // Buscar en todos los valores de la fila
      const searchInObject = (obj: unknown): boolean => {
        if (!obj) return false;

        // Si es un ProcessedItem, buscar en su valor
        if (
          typeof obj === "object" &&
          obj !== null &&
          "value" in obj &&
          "type" in obj
        ) {
          const processedItem = obj as ProcessedItem;
          const value = String(processedItem.value).toLowerCase();
          if (value.includes(searchTerm)) return true;

          // Si es un array, buscar en sus items
          if (
            processedItem.type === "array" &&
            Array.isArray(processedItem.items)
          ) {
            return processedItem.items.some((item: unknown) =>
              searchInObject(item)
            );
          }
        }

        // Si es un objeto, buscar recursivamente
        if (typeof obj === "object" && obj !== null) {
          return Object.values(obj).some((value) => searchInObject(value));
        }

        // Para valores primitivos
        return String(obj).toLowerCase().includes(searchTerm);
      };

      // Buscar en toda la fila
      return searchInObject(row.original);
    },
    getColumnCanGlobalFilter: (column) => {
      // Permitir filtrado global en todas las columnas excepto acciones o columnas especiales
      return column.id !== "actions" && column.id !== "select";
    },
  });

  // 4. Callbacks
  const applyFilter = useCallback(
    (columnId: string, filterValue: FilterCondition) => {
      table.getColumn(columnId)?.setFilterValue(filterValue);
    },
    [table]
  );

  const filterContextValue = useMemo(
    () => ({
      applyFilter,
    }),
    [applyFilter]
  );

  // 5. Efectos
  useEffect(() => {
    if (!processedData.length) {
      setArrayColumns([]);
      return;
    }

    const newArrayColumns = Array.from(uniqueArrayColumns.values());
    console.log("📊 Array columns procesadas:", {
      count: newArrayColumns.length,
      columns: newArrayColumns.map((col) => ({
        id: col.id,
        dataLength: col.data.length,
        firstItemParentId: col.data[0]?.__parentId,
      })),
    });

    setArrayColumns(newArrayColumns);

    if (isSecondaryTable && onArrayColumnsChange) {
      onArrayColumnsChange(newArrayColumns);
    }
  }, [
    processedData,
    parentTableInfo,
    isSecondaryTable,
    onArrayColumnsChange,
    uniqueArrayColumns,
  ]);

  useEffect(() => {
    if (!originalColumnOrder.length) {
      setOriginalColumnOrder(table.getAllLeafColumns().map((col) => col.id));
    }
  }, [table, originalColumnOrder]);

  useEffect(() => {
    const indexColumn = table.getColumn("index");
    if (indexColumn) {
      indexColumn.toggleVisibility(!useFixedColumn);
    }

    const leftPins = ["selection"];
    if (useFixedColumn && fixedColumnId) {
      leftPins.push(fixedColumnId);
    } else {
      leftPins.push("index");
    }

    table.setColumnPinning({
      left: leftPins,
      right: ["actions"],
    });
  }, [useFixedColumn, fixedColumnId, table]);

  // 6. Render
  return (
    <FilterContext.Provider value={filterContextValue}>
      <CardContent className='relative'>
        {/* Encabezado: barra de búsqueda y modal de columnas */}
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='w-full sm:w-72'>
            <TableSearch table={table} />
          </div>
          <div className='flex justify-end'>
            <ColumnManagerModal
              table={table}
              useFixedColumn={useFixedColumn}
              onFixedColumnChange={setUseFixedColumn}
              fixedColumnId={fixedColumnId}
              onFixedColumnIdChange={setFixedColumnId}
              originalColumnOrder={originalColumnOrder}
            />
            <ExportDropdown
              selectedRows={table.getSelectedRowModel().rows}
              allRows={table.getCoreRowModel().rows}
            />
          </div>
        </div>

        {/* Contenedor principal de la tabla */}
        <div className='rounded-md border'>
          <div
            className='overflow-auto'
            style={{
              height: "calc(100vh - 400px)", // Ajusta este valor según necesites
              minHeight: "300px",
              maxHeight: "800px",
            }}
          >
            <Table
              className='table-auto w-full border-separate border-spacing-0'
              style={{ width: table.getCenterTotalSize() }}
            >
              {/* ENCABEZADO */}
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const stylePin = getTanStackPinningStyles(
                        header.column,
                        true
                      );
                      return (
                        <TableHead
                          key={header.id}
                          className='px-4 m-0 bg-background border-x-1 border-y-1 border-zinc-200 text-center font-black'
                          style={{
                            width: header.getSize(),
                            ...stylePin,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}

                          {/* Resizer */}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              // Classes de Tailwind para la "resizer"
                              className={
                                "absolute top-0 right-0 h-full w-1 cursor-col-resize " +
                                "opacity-0 transition-opacity duration-200 " +
                                (header.column.getIsResizing()
                                  ? "bg-[hsl(var(--primary))] opacity-100"
                                  : "bg-[hsl(var(--border))] hover:opacity-100")
                              }
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              {/* CUERPO */}
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className='hover:bg-muted/50'>
                      {row.getVisibleCells().map((cell) => {
                        const stylePin = getTanStackPinningStyles(
                          cell.column,
                          false
                        );
                        return (
                          <TableCell
                            key={cell.id}
                            className='p-4 m-0 border-x-1 border-y-1 border-zinc-200 w-fit'
                            style={{
                              width: "fit-content",
                              maxWidth: cell.column.getSize(),
                              ...stylePin,
                            }}
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

        {/* Paginación y leyenda */}
        <TablePagination table={table} />
        <TypeLegend />

        {/* Tablas secundarias */}
        {!isSecondaryTable && arrayColumns.length > 0 && (
          <SecondaryTables arrayColumns={arrayColumns} />
        )}
      </CardContent>
    </FilterContext.Provider>
  );
}

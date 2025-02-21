"use client"

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
  type Row,
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

// --------------------
// 1) Contexto de filtros (opcional)
// --------------------
export const FilterContext = createContext<{
  applyFilter: (columnId: string, filterValue: FilterCondition) => void;
}>({
  applyFilter: () => {},
});

// --------------------
// 2) Definición de filtros personalizados
// --------------------
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
  // Ejemplo de otro filtro
  arrIncludesSome: (row, columnId, filterValue) => {
    const value = row.getValue(columnId);
    return (
      Array.isArray(value) &&
      Array.isArray(filterValue) &&
      filterValue.some((item) => value.includes(item))
    );
  },
};

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
  data: Record<string, unknown>[]
}

export function JsonTable({ data }: JsonTableProps) {
  // Estado de datos
  const [tableData, setTableData] = useState(data);

  // Estados de TanStack
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Para permitir fijar (pin) una columna extra a la izquierda
  const [useFixedColumn, setUseFixedColumn] = useState(false);
  const [fixedColumnId, setFixedColumnId] = useState<string | null>(null);

  // Guardar el orden original de columnas, si se usa en tu modal
  const [originalColumnOrder, setOriginalColumnOrder] = useState<string[]>([]);

  // Procesamos los datos
  const processedData = useMemo(
    () => tableData.map((item) => processData(item)),
    [tableData]
  );

  // Manejar "delete"
  const handleDelete = useCallback((index: number) => {
    setTableData((prev) => {
      const newData = [...prev];
      newData.splice(index, 1);
      toast.success("Registro eliminado correctamente");
      return newData;
    });
  }, []);

  // Columna de acciones
  const actionsColumn = useMemo(
    () => createActionsColumn(handleDelete),
    [handleDelete]
  );

  // Columnas base (definidas con tu lógica)
  const baseColumns = useMemo<ColumnDef<ProcessedRow>[]>(() => {
    if (!processedData[0]) return [];
    return columns(processedData[0]);
  }, [processedData]);

  // Definimos el orden "por defecto" de TODAS las columnas
  const tableColumns = useMemo<ColumnDef<ProcessedRow>[]>(() => {
    return [selectionColumn, indexColumn, ...baseColumns, actionsColumn];
  }, [baseColumns, actionsColumn]);

  // Convertimos ProcessedItem[] => ProcessedRow[] para la tabla
  const processedTableData = useMemo(() => {
    return processedData.map((items) =>
      items.reduce<ProcessedRow>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {})
    );
  }, [processedData]);

  // Instanciamos la tabla
  const table = useReactTable({
    data: processedTableData,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    filterFns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 100,
      size: 150,
      maxSize: 500,
      filterFn: filterFns.processedValueFilter,
    },
  })

  useEffect(() => {
    if (!originalColumnOrder.length) {
      setOriginalColumnOrder(table.getAllLeafColumns().map((col) => col.id))
    }
  }, [table, originalColumnOrder])


  // Guardamos el orden inicial de columnas (para tu modal, si hace falta)
  useEffect(() => {
    if (!originalColumnOrder.length) {
      setOriginalColumnOrder(table.getAllLeafColumns().map((col) => col.id));
    }
  }, [table, originalColumnOrder]);

  // Efecto para "pinear" columnas a la izquierda/derecha
  useEffect(() => {
    // Si hay una columna fija, ocultamos el índice y mostramos la columna fija
    // Si no hay columna fija, mostramos el índice
    const indexColumn = table.getColumn("index");
    if (indexColumn) {
      indexColumn.toggleVisibility(!useFixedColumn);
    }

    // Configuramos el pinning
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

  // Método para aplicar filtros (usado por tu FilterContext)
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
      </CardContent>
    </FilterContext.Provider>
  );
}


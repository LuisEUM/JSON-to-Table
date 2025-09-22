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
  type ColumnOrderState,
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
  type FilterFn,
  type ColumnPinningState,
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
import { Button } from "@/components/ui/button";
import { columns } from "../columns/columns";
import {
  type ProcessedItem,
  type ProcessedRow,
  processBatchData,
} from "../../core/utils/data-processor";
import { TypeLegend } from "../../molecules/table-parts/type-legend";
import { TablePagination } from "../../molecules/navigation/table-pagination";
import type { FilterCondition } from "../../molecules/filters/filter-types";
import {
  matchesFilterWithSeparator,
  matchesTextSearch,
  normalizeFilterValues,
  type SeparatorType,
} from "../../core/filters/filter-utils";
import { ActionButtons } from "../../molecules/table-parts/action-buttons";
import { SecondaryTables } from "./secondary-tables";
import { TableSkeleton } from "./table-skeleton";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { dateBetweenFilterFn } from "../../molecules/filters/filter-types";
import { Checkbox } from "@/components/ui/checkbox";
import { TableToolbar } from "../panels/table-toolbar";
import { downloadFile } from "../../core/utils/export-utils";

declare module "@tanstack/table-core" {
  interface FilterFns {
    dateBetweenFilterFn: FilterFn<ProcessedRow>;
  }
}

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
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={table.getToggleAllRowsSelectedHandler()}
        aria-label='Select all rows'
        className='mr-4'
      />
    </div>
  ),
  cell: ({ row }) => (
    <div className='flex items-center justify-center'>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={row.getToggleSelectedHandler()}
        aria-label={`Select row ${row.index}`}
        className='mr-4'
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
  enableHiding: true, // Allow hiding the index column
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
  isLoading?: boolean;
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

interface FilterFns {
  processedValueFilter: FilterFn<ProcessedRow>;
  dateBetweenFilterFn: FilterFn<ProcessedRow>;
}

// const generateColumns = (data: ProcessedRow[]): ColumnDef<ProcessedRow>[] => {
//   if (!data.length) return [];

//   const firstRow = data[0];
//   return Object.keys(firstRow).map((key) => {
//     const column: ColumnDef<ProcessedRow> = {
//       id: key,
//       accessorKey: key,
//       header: key,
//       cell: (info) => {
//         const value = info.getValue() as ProcessedItem;
//         if (!value) return null;
//         return String(value.value);
//       },
//     };

//     // Obtener el tipo de la columna del primer valor no nulo
//     const columnType = data.find((row) => row[key])?.[key as keyof ProcessedRow]
//       ?.type;

//     if (columnType === "date") {
//       column.filterFn = "dateBetweenFilterFn";
//     }

//     return column;
//   });
// };

export function JsonTable({
  data,
  isLoading = false,
  isSecondaryTable = false,
  onArrayColumnsChange,
  parentTableInfo,
}: JsonTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    selection: true, // Ensure selection column is visible by default
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isSecondaryTablesLoading, setIsSecondaryTablesLoading] =
    useState(false);
  const [useFixedColumn, setUseFixedColumn] = useState(true);
  const [fixedColumnId, setFixedColumnId] = useState<string | null>(null);
  const [originalColumnOrder, setOriginalColumnOrder] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [isProcessingData, setIsProcessingData] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Debounce para los filtros
  const debouncedColumnFilters = useDebounce(columnFilters, 300);
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  // Funciones de persistencia
  const getStorageKey = (suffix: string) => {
    const baseKey = isSecondaryTable
      ? `table-config-${parentTableInfo?.name || "secondary"}-${suffix}`
      : `table-config-main-${suffix}`;
    return baseKey;
  };

  const saveColumnConfiguration = () => {
    const config = {
      columnOrder,
      columnVisibility,
      useFixedColumn,
      fixedColumnId,
      sorting,
      columnFilters,
      globalFilter,
      timestamp: Date.now(),
    };
    localStorage.setItem(getStorageKey("current"), JSON.stringify(config));
  };

  const loadColumnConfiguration = () => {
    try {
      const saved = localStorage.getItem(getStorageKey("current"));
      if (saved) {
        const config = JSON.parse(saved);
        return config;
      }
    } catch (error) {
      console.error("Error loading column configuration:", error);
    }
    return null;
  };

  const saveAsDefaultConfiguration = () => {
    const config = {
      columnOrder,
      columnVisibility,
      useFixedColumn,
      fixedColumnId,
      timestamp: Date.now(),
    };
    localStorage.setItem(getStorageKey("default"), JSON.stringify(config));
    toast.success("Configuración guardada como predeterminada");
  };

  const loadDefaultConfiguration = () => {
    try {
      const saved = localStorage.getItem(getStorageKey("default"));
      if (saved) {
        const config = JSON.parse(saved);
        return config;
      }
    } catch (error) {
      console.error("Error loading default configuration:", error);
    }
    return null;
  };

  // Handler para cambios en el orden de columnas
  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder);
  };

  // Función para calcular el orden efectivo de la tabla (orden lógico + pinning)
  const getEffectiveColumnOrder = useCallback(() => {
    const baseOrder =
      columnOrder.length > 0 ? columnOrder : originalColumnOrder;

    // Separar actions del resto (actions siempre va al final)
    const actionsIndex = baseOrder.indexOf("actions");
    const baseOrderWithoutActions = baseOrder.filter((id) => id !== "actions");
    const hasActions = actionsIndex !== -1;

    // Si no hay columna fija, usar el orden base (sin actions) + actions al final
    if (!useFixedColumn) {
      const result = hasActions
        ? [...baseOrderWithoutActions, "actions"]
        : baseOrderWithoutActions;
      console.log("📋 No fixed column, using base order:", result);
      return result;
    }

    // Determinar qué columna está pintada
    const pinnedColumnId = fixedColumnId || "index";

    // Si la columna pintada no está en el orden base, agregarla al inicio
    if (!baseOrderWithoutActions.includes(pinnedColumnId)) {
      const result = hasActions
        ? [pinnedColumnId, ...baseOrderWithoutActions, "actions"]
        : [pinnedColumnId, ...baseOrderWithoutActions];
      console.log("📋 Pinned column not in base order, adding:", {
        pinnedColumnId,
        baseOrder: baseOrderWithoutActions,
        result,
      });
      return result;
    }

    // Aplicar pinning: columna pintada al inicio, resto en su orden lógico, actions al final
    const otherColumns = baseOrderWithoutActions.filter(
      (id) => id !== pinnedColumnId
    );
    const result = hasActions
      ? [pinnedColumnId, ...otherColumns, "actions"]
      : [pinnedColumnId, ...otherColumns];

    console.log("📋 Effective column order:", {
      baseOrder: baseOrderWithoutActions,
      pinnedColumnId,
      otherColumns,
      hasActions,
      result,
    });

    return result;
  }, [columnOrder, originalColumnOrder, useFixedColumn, fixedColumnId]);

  // Map para almacenar las columnas de arrays únicos
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

  // Estado para guardar la configuración actual para las vistas
  const [currentViewConfig, setCurrentViewConfig] = useState<
    Record<string, unknown>
  >({});

  // 2. Todos los useMemo
  const processedData = useMemo(
    () => processBatchData(data, { sampleSize: 100 }),
    [data]
  );

  const handleDelete = useCallback((index: number) => {
    // Por ahora solo mostrar el toast ya que el manejo de datos
    // se debe hacer desde el componente padre
    toast.success(`Registro #${index + 1} eliminado correctamente`);
    // TODO: Implementar lógica de eliminación a través de props
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
    return processedData.map((items: ProcessedItem[]) => {
      const row = items.reduce<ProcessedRow>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const rowId =
        row["id"]?.value ||
        Object.values(row).find((item) => item.isId)?.value ||
        Object.values(row).find((item) =>
          item.path?.[item.path.length - 1].toLowerCase().includes("id")
        )?.value;

      console.log("📝 Procesando fila para arrays:", {
        rowId,
        hasId: !!rowId,
        rowKeys: Object.keys(row),
      });

      Object.values(row).forEach((item) => {
        // Solo procesamos arrays de objetos para tablas secundarias
        if (
          item.type === "array[objeto]" ||
          (item.type === "array" && item.items?.[0]?.type === "objeto")
        ) {
          const columnId = item.path.join(".");

          // Verificar si ya existe esta columna
          if (!uniqueArrayColumns.has(columnId)) {
            console.log("📊 Creando nueva tabla secundaria:", {
              columnId,
              rowId,
              type: item.type,
            });

            const processedData =
              item.items?.map((subItem) => {
                console.log("🔄 Procesando subitem:", {
                  parentId: rowId,
                  columnId,
                  subItemType: subItem.type,
                });

                return {
                  ...(subItem.value as object),
                  __parentId: rowId,
                  __parentTable: parentTableInfo?.id || columnId,
                };
              }) || [];

            uniqueArrayColumns.set(columnId, {
              id: columnId,
              label: item.path.join("."),
              data: processedData,
              parentTable: parentTableInfo,
            });
          } else {
            // Para columnas existentes, solo agregar datos si el padre es diferente
            // Esto evita duplicación de datos en tablas secundarias
            const existingColumn = uniqueArrayColumns.get(columnId);

            if (existingColumn) {
              // Verificar si estos datos (basados en parentId) ya están incluidos
              const hasParentId = existingColumn.data.some(
                (record) => record.__parentId === rowId
              );

              if (!hasParentId) {
                console.log(
                  "📊 Agregando datos a tabla secundaria existente:",
                  {
                    columnId,
                    rowId,
                    existingDataLength: existingColumn.data.length,
                  }
                );

                // Procesar y agregar nuevos datos que no están duplicados
                const newProcessedData =
                  item.items?.map((subItem) => ({
                    ...(subItem.value as object),
                    __parentId: rowId,
                    __parentTable: parentTableInfo?.id || columnId,
                  })) || [];

                // Actualizar la columna con los datos combinados
                uniqueArrayColumns.set(columnId, {
                  ...existingColumn,
                  data: [...existingColumn.data, ...newProcessedData],
                });
              }
            }
          }
        }
        // No procesamos arrays de primitivos para tablas secundarias
        else if (item.type === "array[primitivo]") {
          console.log(
            "📊 Ignorando array de primitivos para tablas secundarias:",
            {
              columnId: item.path.join("."),
              rowId,
              type: item.type,
              values: item.items?.map((i) => i.value).slice(0, 3), // Mostrar solo los primeros 3 valores
            }
          );
        }
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
      columnOrder: getEffectiveColumnOrder(),
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    // onColumnOrderChange removido - manejamos el orden manualmente
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

        // Debug: Ver la estructura del processedValue para arrays
        if (
          columnId.includes("shippingAddresses") ||
          columnId.includes("memberships")
        ) {
          console.log("🔍 ProcessedValue debug:", {
            columnId,
            processedValue: {
              type: processedValue.type,
              value: processedValue.value,
              items: processedValue.items,
              hasItems: !!processedValue.items,
              itemsLength: processedValue.items?.length,
              firstItem: processedValue.items?.[0],
            },
          });
        }

        const rawValue = processedValue.value;
        const columnType = processedValue.type;

        switch (filterValue.operator) {
          case "arrIncludesSome":
            if (columnType === "date") {
              try {
                // Obtener la fecha de la celda
                const cellDate = new Date(String(rawValue));

                // Formatear la fecha a dd/mm/yyyy para comparación
                let formattedCellDate = "";
                if (!isNaN(cellDate.getTime())) {
                  const day = cellDate.getDate().toString().padStart(2, "0");
                  const month = (cellDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0");
                  const year = cellDate.getFullYear();
                  formattedCellDate = `${day}/${month}/${year}`;
                }

                // Asegurarse de que filterValue.value sea un array
                const filterValues = Array.isArray(filterValue.value)
                  ? filterValue.value
                  : [filterValue.value];

                // Ya no necesitamos convertir entre formatos, las comparaciones serán directas
                console.log(
                  `Comparando fecha: ${formattedCellDate} con filtros:`,
                  filterValues
                );

                // Verificar si alguno de los valores de filtro coincide con la fecha formateada
                const result = filterValues.some((val: unknown) => {
                  const stringVal = String(val).trim();
                  const match = formattedCellDate === stringVal;
                  console.log(
                    `- Comparando con ${stringVal}: ${
                      match ? "COINCIDE" : "no coincide"
                    }`
                  );
                  return match;
                });

                console.log(
                  `Resultado final para ${formattedCellDate}: ${
                    result ? "INCLUIDO" : "NO INCLUIDO"
                  }`
                );
                return result;
              } catch (error) {
                console.error("Error al comparar fechas:", error);
                return false;
              }
            } else if (
              columnType === "array[objeto]" ||
              columnType === "array"
            ) {
              // Debug: Log para arrays
              console.log("🔍 Filtering array column:", {
                columnId,
                columnType,
                rawValue,
                filterValue,
                rawValueType: typeof rawValue,
                isRawValueArray: Array.isArray(rawValue),
              });

              // Manejar arrays de objetos específicamente
              const filterValues = Array.isArray(filterValue.value)
                ? filterValue.value
                : [filterValue.value];

              // Para arrays procesados, los elementos están en processedValue.items
              let arrayToCheck = rawValue;
              if (processedValue.items && Array.isArray(processedValue.items)) {
                // Extraer los valores reales de los ProcessedValue items
                arrayToCheck = processedValue.items.map((item) => item.value);
                console.log("🔍 Using items array:", {
                  originalRawValue: rawValue,
                  itemsArray: arrayToCheck,
                  itemsLength: (arrayToCheck as unknown[]).length,
                });
              }

              // Si tenemos un array para verificar, verificar si algún elemento coincide
              if (Array.isArray(arrayToCheck)) {
                const result = arrayToCheck.some((arrayItem: unknown) => {
                  return filterValues.some((filterVal: unknown) => {
                    console.log("🔍 Comparing array items:", {
                      arrayItem:
                        typeof arrayItem === "object"
                          ? JSON.stringify(arrayItem).slice(0, 100)
                          : arrayItem,
                      filterVal:
                        typeof filterVal === "object"
                          ? JSON.stringify(filterVal).slice(0, 100)
                          : filterVal,
                      arrayItemType: typeof arrayItem,
                      filterValType: typeof filterVal,
                    });

                    // Para objetos, comparar por contenido
                    if (
                      typeof arrayItem === "object" &&
                      typeof filterVal === "object" &&
                      arrayItem !== null &&
                      filterVal !== null
                    ) {
                      try {
                        const match =
                          JSON.stringify(arrayItem) ===
                          JSON.stringify(filterVal);
                        console.log("🔍 Object comparison result:", match);
                        return match;
                      } catch {
                        console.log("🔍 Object comparison failed");
                        return false;
                      }
                    }
                    // Para primitivos, comparación directa
                    const match = arrayItem === filterVal;
                    console.log("🔍 Primitive comparison result:", match);
                    return match;
                  });
                });

                console.log("🔍 Array filter result:", result);
                return result;
              }

              console.log(
                "🔍 Array filter - arrayToCheck is not array, returning false"
              );
              return false;
            } else {
              // Para valores no-fecha y no-array, verificar el tipo de columna
              const filterValues = Array.isArray(filterValue.value)
                ? filterValue.value
                : [filterValue.value];

              // Si es una columna numérica, hacer comparación exacta de números
              if (columnType === "número") {
                const numericRawValue = Number(rawValue);
                if (isNaN(numericRawValue)) return false;

                return filterValues.some((val: unknown) => {
                  const numericFilterValue = Number(val);
                  return (
                    !isNaN(numericFilterValue) &&
                    numericRawValue === numericFilterValue
                  );
                });
              }

              // Para otros tipos (texto), usar la lógica original de includes
              return filterValues.some((val: unknown) => {
                const stringVal = String(val).toLowerCase();
                const stringRawVal = String(rawValue).toLowerCase();
                return stringRawVal.includes(stringVal);
              });
            }
          case "in": {
            // Manejo mejorado para filtros con separadores
            const filterValues = normalizeFilterValues(filterValue.value);
            const fieldValue = String(rawValue);
            const separator = filterValue.additionalValue as SeparatorType;
            const exactMatch = filterValue.exactMatch === true;

            // Si hay separador, usar la lógica de separación
            if (separator && separator !== "none") {
              return matchesFilterWithSeparator(
                fieldValue,
                filterValues,
                separator,
                exactMatch
              );
            }

            // Sin separador: comparación directa
            return filterValues.includes(fieldValue);
          }
          case "notIn":
            return (
              Array.isArray(filterValue.value) &&
              !filterValue.value.includes(String(rawValue))
            );
          case "equals":
            return rawValue === filterValue.value;
          case "notEquals":
            return rawValue !== filterValue.value;
          case "contains": {
            const searchTerms = normalizeFilterValues(filterValue.value);
            const textValue = String(rawValue);
            const exactWordMatch = filterValue.exactMatch === true;

            return matchesTextSearch(textValue, searchTerms, exactWordMatch);
          }
          case "notContains":
            return !String(rawValue)
              .toLowerCase()
              .includes(String(filterValue.value).toLowerCase());
          case "exactWordMatch":
            if (typeof filterValue.value === "string") {
              const searchTerms: string[] = filterValue.value.split("|");
              const patterns: RegExp[] = searchTerms.map(
                (term: string) => new RegExp(`\\b${term}\\b`, "i")
              );
              return patterns.some((pattern: RegExp) =>
                pattern.test(String(rawValue))
              );
            }
            return false;
          case "notExactWordMatch":
            if (typeof filterValue.value === "string") {
              const searchTerms: string[] = filterValue.value.split("|");
              const patterns: RegExp[] = searchTerms.map(
                (term: string) => new RegExp(`\\b${term}\\b`, "i")
              );
              return !patterns.some((pattern: RegExp) =>
                pattern.test(String(rawValue))
              );
            }
            return true;
          case "startsWith":
            return String(rawValue)
              .toLowerCase()
              .startsWith(String(filterValue.value).toLowerCase());
          case "endsWith":
            return String(rawValue)
              .toLowerCase()
              .endsWith(String(filterValue.value).toLowerCase());
          case "greaterThan":
            return Number(rawValue) > Number(filterValue.value);
          case "lessThan":
            return Number(rawValue) < Number(filterValue.value);
          case "between":
            if (
              filterValue.value !== undefined &&
              filterValue.additionalValue !== undefined
            ) {
              const min = Number(filterValue.value);
              const max = Number(filterValue.additionalValue);
              const value = Number(rawValue);
              return value >= min && value <= max;
            }
            return false;
          case "notBetween":
            if (
              filterValue.value !== undefined &&
              filterValue.additionalValue !== undefined
            ) {
              const min = Number(filterValue.value);
              const max = Number(filterValue.additionalValue);
              const value = Number(rawValue);
              return value < min || value > max;
            }
            return false;
          case "isNull":
            return rawValue === null || rawValue === undefined;
          case "isNotNull":
            return rawValue !== null && rawValue !== undefined;
          case "includesString":
            if (typeof filterValue.value === "string") {
              const pattern = filterValue.value.split("|");
              return pattern.some((value: string) =>
                String(rawValue).toLowerCase().includes(value.toLowerCase())
              );
            }
            return false;
          case "objectPropertyFilter":
            // Usar la función objectPropertyFilter importada
            if (!Array.isArray(filterValue.value)) return false;

            // Helper function to extract property values from objects
            const extractPropertyValues = (obj: unknown): string[] => {
              const values: string[] = [];

              if (typeof obj === "object" && obj !== null) {
                if (Array.isArray(obj)) {
                  // For arrays, extract from each item
                  obj.forEach((item) => {
                    if (typeof item === "object" && item !== null) {
                      Object.values(item).forEach((value) => {
                        if (value !== null && value !== undefined) {
                          values.push(String(value).toLowerCase());
                        }
                      });
                    } else {
                      values.push(String(item).toLowerCase());
                    }
                  });
                } else {
                  // For objects, extract all property values
                  Object.values(obj).forEach((value) => {
                    if (value !== null && value !== undefined) {
                      if (typeof value === "object") {
                        values.push(...extractPropertyValues(value));
                      } else {
                        values.push(String(value).toLowerCase());
                      }
                    }
                  });
                }
              } else {
                values.push(String(obj).toLowerCase());
              }

              return values;
            };

            const objectValues = extractPropertyValues(rawValue);
            const searchTerms = (filterValue.value as string[]).map((term) =>
              String(term).toLowerCase()
            );

            // Check if any of the search terms match any of the object property values
            const hasMatch = searchTerms.some((searchTerm) =>
              objectValues.some((objValue) => objValue.includes(searchTerm))
            );

            // Handle inclusion/exclusion logic
            const isInclude = filterValue.additionalValue === "include";
            const matchResult = isInclude ? hasMatch : !hasMatch;

            console.log("🔍 ObjectPropertyFilter resultado:", {
              columnId,
              searchTerms,
              objectValues: objectValues.slice(0, 5), // Show first 5 for debugging
              hasMatch,
              isInclude,
              finalResult: matchResult,
            });

            return matchResult;
          default:
            return true;
        }
      },
      dateBetweenFilterFn,
    } as FilterFns,
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
      if (!searchTerm) return true;

      console.log("🔍 Buscando en la fila:", {
        searchTerm,
        rowId: row.id,
        originalLength: Object.keys(row.original).length,
      });

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

          // Para string, buscar directamente
          if (typeof processedItem.value === "string") {
            const value = processedItem.value.toLowerCase();
            if (value.includes(searchTerm)) return true;
          }
          // Para números, convertir a string y buscar
          else if (typeof processedItem.value === "number") {
            const value = String(processedItem.value).toLowerCase();
            if (value.includes(searchTerm)) return true;
          }
          // Para fechas, buscar en el formato legible
          else if (processedItem.type === "fecha") {
            const value = String(processedItem.value).toLowerCase();
            if (value.includes(searchTerm)) return true;
          }
          // Para booleanos, buscar por 'verdadero' o 'falso'
          else if (processedItem.type === "boolean") {
            const boolString = processedItem.value ? "verdadero" : "falso";
            if (boolString.includes(searchTerm)) return true;
          }

          // Si es un array, buscar en sus items
          if (
            processedItem.type.includes("array") &&
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
        if (obj !== undefined && obj !== null) {
          return String(obj).toLowerCase().includes(searchTerm);
        }

        return false;
      };

      // Buscar en toda la fila
      const found = searchInObject(row.original);
      console.log("🔍 Resultado de búsqueda:", {
        rowId: row.id,
        found,
      });
      return found;
    },
    getColumnCanGlobalFilter: (column) => {
      // Permitir filtrado global en todas las columnas excepto acciones o columnas especiales
      return column.id !== "actions" && column.id !== "select";
    },
  });

  // 4. Callbacks
  const applyFilter = useCallback(
    (columnId: string, filterValue: FilterCondition) => {
      console.log("🎯 Aplicando filtro:", {
        columnId,
        operator: filterValue.operator,
        value: filterValue.value,
        additionalValue: filterValue.additionalValue,
      });

      const column = table.getColumn(columnId);
      if (column) {
        // Set the filter function based on the operator
        if (filterValue.operator === "objectPropertyFilter") {
          column.setFilterValue(filterValue);
          console.log("✅ Filtro objectPropertyFilter aplicado");
        } else {
          column.setFilterValue(filterValue);
        }
      } else {
        console.warn("❌ Columna no encontrada:", columnId);
      }
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
      if (onArrayColumnsChange) {
        onArrayColumnsChange([]);
      }
      return;
    }

    const newArrayColumns = Array.from(uniqueArrayColumns.values());

    // Deduplicar y limpiar tablas secundarias vacías
    const validArrayColumns = newArrayColumns.filter(
      (col) => col.data && col.data.length > 0 && col.id
    );

    console.log("📊 Array columns procesadas:", {
      count: validArrayColumns.length,
      totalRegistros: validArrayColumns.reduce(
        (acc, col) => acc + col.data.length,
        0
      ),
      columns: validArrayColumns.map((col) => ({
        id: col.id,
        label: col.label,
        dataLength: col.data.length,
        firstItemParentId: col.data[0]?.__parentId,
      })),
    });

    // Notificar cambios en las columnas si existe el callback
    if (onArrayColumnsChange) {
      onArrayColumnsChange(validArrayColumns);
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
      const allColumnIds = table.getAllLeafColumns().map((col) => col.id);
      setOriginalColumnOrder(allColumnIds);

      // Intentar cargar configuración guardada o usar configuración por defecto
      const savedConfig = loadColumnConfiguration();
      const defaultConfig = loadDefaultConfiguration();

      if (savedConfig) {
        // Aplicar configuración guardada
        if (savedConfig.columnOrder && savedConfig.columnOrder.length > 0) {
          const validOrder = savedConfig.columnOrder.filter((id: string) =>
            allColumnIds.includes(id)
          );
          if (validOrder.length > 0) {
            setColumnOrder(validOrder);
          }
        }
        if (savedConfig.columnVisibility) {
          setColumnVisibility(savedConfig.columnVisibility);
        }
        if (typeof savedConfig.useFixedColumn === "boolean") {
          setUseFixedColumn(savedConfig.useFixedColumn);
        }
        if (savedConfig.fixedColumnId !== undefined) {
          setFixedColumnId(savedConfig.fixedColumnId);
        }
      } else if (defaultConfig) {
        // Aplicar configuración por defecto si no hay configuración actual
        if (defaultConfig.columnOrder && defaultConfig.columnOrder.length > 0) {
          const validOrder = defaultConfig.columnOrder.filter((id: string) =>
            allColumnIds.includes(id)
          );
          if (validOrder.length > 0) {
            setColumnOrder(validOrder);
          }
        }
        if (defaultConfig.columnVisibility) {
          setColumnVisibility(defaultConfig.columnVisibility);
        }
        if (typeof defaultConfig.useFixedColumn === "boolean") {
          setUseFixedColumn(defaultConfig.useFixedColumn);
        }
        if (defaultConfig.fixedColumnId !== undefined) {
          setFixedColumnId(defaultConfig.fixedColumnId);
        }
      }
    }
  }, [table, originalColumnOrder]);

  useEffect(() => {
    // Lógica de pinning basada en la configuración del usuario
    const leftPins = ["selection"];

    if (useFixedColumn) {
      if (fixedColumnId) {
        // Columna específica seleccionada como fija
        leftPins.push(fixedColumnId);
      } else {
        // Index seleccionado como columna fija
        const indexColumn = table.getColumn("index");
        if (indexColumn && indexColumn.getIsVisible()) {
          leftPins.push("index");
        }
      }
    }
    // Si useFixedColumn es false, no fijamos ninguna columna adicional

    table.setColumnPinning({
      left: leftPins,
      right: ["actions"],
    });
  }, [useFixedColumn, fixedColumnId, table]);

  // Auto-guardar configuración cuando cambia
  useEffect(() => {
    if (originalColumnOrder.length > 0) {
      saveColumnConfiguration();
    }
  }, [
    columnOrder,
    columnVisibility,
    useFixedColumn,
    fixedColumnId,
    sorting,
    columnFilters,
    globalFilter,
  ]);

  // Función para procesar las tablas secundarias
  const processSecondaryTables = useCallback(
    (filteredData: ProcessedRow[]) => {
      if (isSecondaryTable) return; // No procesar si es una tabla secundaria

      setIsSecondaryTablesLoading(true);
      uniqueArrayColumns.clear();

      filteredData.forEach((row) => {
        const rowId =
          row["id"]?.value ||
          Object.values(row).find((item) => item.isId)?.value ||
          Object.values(row).find((item) =>
            item.path?.[item.path.length - 1].toLowerCase().includes("id")
          )?.value;

        Object.values(row).forEach((item) => {
          if (
            item.type === "array[objeto]" ||
            (item.type === "array" && item.items?.[0]?.type === "objeto")
          ) {
            const columnId = item.path.join(".");

            if (!uniqueArrayColumns.has(columnId)) {
              const processedData =
                item.items?.map((subItem) => ({
                  ...(subItem.value as object),
                  __parentId: rowId,
                  __parentTable: parentTableInfo?.id || columnId,
                })) || [];

              uniqueArrayColumns.set(columnId, {
                id: columnId,
                label: item.path.join("."),
                data: processedData,
                parentTable: parentTableInfo,
              });
            } else {
              const existingColumn = uniqueArrayColumns.get(columnId);
              if (existingColumn) {
                const hasParentId = existingColumn.data.some(
                  (record) => record.__parentId === rowId
                );

                if (!hasParentId) {
                  const newProcessedData =
                    item.items?.map((subItem) => ({
                      ...(subItem.value as object),
                      __parentId: rowId,
                      __parentTable: parentTableInfo?.id || columnId,
                    })) || [];

                  uniqueArrayColumns.set(columnId, {
                    ...existingColumn,
                    data: [...existingColumn.data, ...newProcessedData],
                  });
                }
              }
            }
          }
        });
      });

      if (onArrayColumnsChange) {
        onArrayColumnsChange(Array.from(uniqueArrayColumns.values()));
      }

      // Pequeño delay para asegurar que la UI se actualice
      setTimeout(() => {
        setIsSecondaryTablesLoading(false);
      }, 300);
    },
    [
      isSecondaryTable,
      uniqueArrayColumns,
      parentTableInfo,
      onArrayColumnsChange,
    ]
  );

  // Efecto para controlar el estado inicial de carga
  useEffect(() => {
    if (data.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [data.length, hasInitialData]);

  // Efecto para procesar las tablas secundarias cuando cambian los filtros
  useEffect(() => {
    const processData = async () => {
      setIsProcessingData(true);
      const filteredRows = table.getFilteredRowModel().rows;
      const filteredData = filteredRows.map((row) => row.original);
      await processSecondaryTables(filteredData);
      setIsProcessingData(false);
    };

    if (hasInitialData) {
      processData();
    }
  }, [
    debouncedColumnFilters,
    debouncedGlobalFilter,
    table,
    processSecondaryTables,
    hasInitialData,
  ]);

  // Función para obtener la configuración actual
  const getCurrentConfiguration = useCallback(() => {
    return {
      sorting,
      columnVisibility,
      columnFilters,
      columnPinning: table.getState().columnPinning,
      globalFilter: globalFilter,
      pagination: {
        pageIndex: table.getState().pagination.pageIndex,
        pageSize: table.getState().pagination.pageSize,
      },
    };
  }, [sorting, columnVisibility, columnFilters, globalFilter, table]);

  // Función para extraer tipos de columnas de la tabla y datos procesados
  const getColumnTypesFromTable = useCallback(
    (table: any, processedData: ProcessedItem[][]) => {
      const columnTypes: Record<string, string> = {};

      if (processedData.length > 0) {
        const firstRow = processedData[0];
        firstRow.forEach((item) => {
          if (
            item.id &&
            item.type &&
            !["index", "selection", "actions"].includes(item.id)
          ) {
            columnTypes[item.id] = item.type;
          }
        });
      }

      return columnTypes;
    },
    []
  );

  // Actualizar la configuración actual cuando cambian los filtros, ordenación, etc.
  useEffect(() => {
    setCurrentViewConfig(getCurrentConfiguration());
  }, [
    sorting,
    columnVisibility,
    columnFilters,
    globalFilter,
    getCurrentConfiguration,
  ]);

  // Cargar una configuración guardada
  const handleLoadView = useCallback(
    (config: Record<string, unknown>) => {
      try {
        // Validar compatibilidad de columnas si existe metadata
        const tableMetadata =
          config.tableMetadata ||
          (config.columnMetadata as
            | {
                availableColumns?: string[];
                filteredColumns?: string[];
                sortedColumns?: string[];
                compatibilityHash?: string;
                totalColumns?: number;
                columnTypes?: Record<string, string>;
              }
            | undefined);

        if (tableMetadata?.availableColumns) {
          const currentColumns = table.getAllColumns().map((col) => col.id);
          const missingColumns =
            tableMetadata.filteredColumns?.filter(
              (col) => !currentColumns.includes(col)
            ) || [];

          // Verificar compatibilidad por hash si está disponible
          if (tableMetadata.compatibilityHash) {
            const currentCoreColumns = currentColumns
              .filter((col) => !["index", "selection", "actions"].includes(col))
              .sort();
            const currentHash = Buffer.from(currentCoreColumns.join("|"))
              .toString("base64")
              .slice(0, 16);

            if (currentHash !== tableMetadata.compatibilityHash) {
              toast.warning(
                "Esta vista fue creada para una tabla con estructura diferente. Algunos filtros podrían no funcionar correctamente.",
                { duration: 6000 }
              );
            }
          }

          if (missingColumns.length > 0) {
            toast.warning(
              `Algunas columnas de la vista no están disponibles: ${missingColumns.join(
                ", "
              )}`,
              { duration: 5000 }
            );
          }
        }

        // Aplicar ordenación solo si las columnas existen
        if (config.sorting) {
          const sortingState = config.sorting as SortingState;
          const currentColumns = table.getAllColumns().map((col) => col.id);
          const validSorting = sortingState.filter((sort) =>
            currentColumns.includes(sort.id)
          );
          setSorting(validSorting);
        }

        // Aplicar visibilidad de columnas
        if (config.columnVisibility) {
          setColumnVisibility(config.columnVisibility as VisibilityState);
        }

        // Aplicar filtros de columnas solo si las columnas existen
        if (config.columnFilters) {
          const filtersState = config.columnFilters as ColumnFiltersState;
          const currentColumns = table.getAllColumns().map((col) => col.id);
          const validFilters = filtersState.filter((filter) =>
            currentColumns.includes(filter.id)
          );

          if (validFilters.length !== filtersState.length) {
            toast.warning(
              "Algunos filtros no se pudieron aplicar porque las columnas no existen",
              { duration: 4000 }
            );
          }

          setColumnFilters(validFilters);
        }

        // Aplicar pinning de columnas solo si existen
        if (config.columnPinning) {
          const pinningState = config.columnPinning as ColumnPinningState;
          const currentColumns = table.getAllColumns().map((col) => col.id);

          const validPinning: ColumnPinningState = {
            left: pinningState.left?.filter((col) =>
              currentColumns.includes(col)
            ),
            right: pinningState.right?.filter((col) =>
              currentColumns.includes(col)
            ),
          };

          table.setColumnPinning(validPinning);
        }

        // Aplicar búsqueda global
        if (config.globalFilter) {
          setGlobalFilter(config.globalFilter as string);
        }

        // Aplicar paginación
        if (config.pagination) {
          const pagination = config.pagination as {
            pageIndex: number;
            pageSize: number;
          };
          table.setPageIndex(pagination.pageIndex);
          table.setPageSize(pagination.pageSize);
        }

        // Mensaje de éxito con información adicional
        const compatibilityInfo = tableMetadata?.compatibilityHash
          ? " (100% compatible)"
          : tableMetadata?.availableColumns
          ? " (verificada)"
          : "";
        toast.success(`Vista cargada correctamente${compatibilityInfo}`);
      } catch (error) {
        console.error("Error al cargar vista:", error);
        toast.error("Error al cargar la vista");
      }
    },
    [setGlobalFilter, setSorting, setColumnVisibility, setColumnFilters, table]
  );

  // Render loading state
  if (isLoading || (!hasInitialData && data.length === 0)) {
    return (
      <FilterContext.Provider value={filterContextValue}>
        <CardContent className='relative'>
          <div className='text-center text-muted-foreground py-8'>
            Cargando datos...
          </div>
        </CardContent>
      </FilterContext.Provider>
    );
  }

  // Render empty state
  if (!isLoading && data.length === 0) {
    return (
      <FilterContext.Provider value={filterContextValue}>
        <CardContent className='relative'>
          <div className='text-center text-muted-foreground py-8'>
            No hay datos disponibles
          </div>
        </CardContent>
      </FilterContext.Provider>
    );
  }

  return (
    <FilterContext.Provider value={filterContextValue}>
      <CardContent className='relative'>
        {/* Mostrar skeleton loader mientras se procesan los datos */}
        {isProcessingData && (
          <div className='absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center'>
            <TableSkeleton
              columnCount={7}
              rowCount={Math.min(10, data.length || 10)}
            />
          </div>
        )}

        {/* Toolbar con búsqueda y administración de filtros */}
        <TableToolbar
          table={table}
          searchPlaceholder={`Buscar en ${processedData.length} ${
            isSecondaryTable ? "registros relacionados" : "registros"
          }...`}
          currentConfig={{
            ...currentViewConfig,
            // Agregar información de tipos de columnas para mejor compatibilidad
            columnTypes: getColumnTypesFromTable(table, processedData),
          }}
          onLoadView={handleLoadView}
          processedData={processedTableData}
          downloadFile={downloadFile}
          useFixedColumn={useFixedColumn}
          onFixedColumnChange={setUseFixedColumn}
          fixedColumnId={fixedColumnId}
          onFixedColumnIdChange={setFixedColumnId}
          originalColumnOrder={getEffectiveColumnOrder()}
          onColumnOrderChange={handleColumnOrderChange}
          onSaveAsDefault={saveAsDefaultConfiguration}
        />

        {/* Contenedor principal de la tabla */}
        <div className='rounded-md border'>
          {Object.keys(rowSelection).length > 0 && (
            <div className='bg-muted/30 border-b p-2 flex items-center justify-between'>
              <div className='text-sm'>
                <span className='font-medium'>
                  {Object.keys(rowSelection).length}
                </span>{" "}
                {Object.keys(rowSelection).length === 1
                  ? "fila seleccionada"
                  : "filas seleccionadas"}
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setRowSelection({})}
              >
                Limpiar selección
              </Button>
            </div>
          )}
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
                      colSpan={table.getAllColumns().length}
                      className='h-24 text-center'
                    >
                      {table.getFilteredRowModel().rows.length === 0 &&
                      table.getCoreRowModel().rows.length > 0 ? (
                        <>
                          No se encontraron resultados con los filtros
                          aplicados.
                          <div className='mt-2'>
                            <Button
                              variant='outline'
                              onClick={() => {
                                table.resetColumnFilters();
                                table.setGlobalFilter("");
                              }}
                            >
                              Limpiar filtros
                            </Button>
                          </div>
                        </>
                      ) : (
                        "No hay datos disponibles"
                      )}
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
        {!isSecondaryTable && (
          <SecondaryTables
            arrayColumns={Array.from(uniqueArrayColumns.values())}
            level={0}
            isLoading={isSecondaryTablesLoading}
          />
        )}
      </CardContent>
    </FilterContext.Provider>
  );
}

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Filter, Link2 } from "lucide-react";
import {
  groupColumns,
  type ProcessedItem,
  type GroupedColumns,
  type ProcessedRow,
  type ProcessedValue,
  processValue,
} from "../data-processor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterFactory } from "../components/filters/filter-factory";
import type { FilterCondition } from "../components/filters/filter-types";
import { CellFactory } from "../components/cells/cell-factory";
import { TypeDot } from "../components/type-indicators";

interface NestedRecord {
  [key: string]: ProcessedItem | unknown | { [key: string]: NestedRecord };
}

// Helper function to determine if a column should be sortable and what sort type
const getSortableInfo = (type: string) => {
  const sortableTypes = {
    string: { sortable: true, sortType: "text" },
    número: { sortable: true, sortType: "numeric" },
    boolean: { sortable: true, sortType: "basic" },
    fecha: { sortable: true, sortType: "datetime" },
    "array[primitivo]": { sortable: false, sortType: "none" },
    "array[objeto]": { sortable: false, sortType: "none" },
    array: { sortable: false, sortType: "none" },
    objeto: { sortable: false, sortType: "none" },
    referencia: { sortable: true, sortType: "text" },
    null: { sortable: false, sortType: "none" },
    undefined: { sortable: false, sortType: "none" },
  };

  return sortableTypes[type as keyof typeof sortableTypes] || { sortable: false, sortType: "none" };
};

// Helper function to get tooltip text based on sort capability
const getSortTooltip = (isSorted: false | "asc" | "desc", sortInfo: { sortable: boolean; sortType: string }) => {
  if (!sortInfo.sortable) {
    return "No se puede ordenar este tipo de dato";
  }

  if (!isSorted) {
    return `Ordenar ${sortInfo.sortType === "datetime" ? "por fecha" :
                      sortInfo.sortType === "numeric" ? "numéricamente" :
                      sortInfo.sortType === "text" ? "alfabéticamente" : ""}`;
  }

  if (isSorted === "asc") {
    return `Ordenado ${sortInfo.sortType === "datetime" ? "de más antiguo a más reciente" :
                       sortInfo.sortType === "numeric" ? "de menor a mayor" :
                       sortInfo.sortType === "text" ? "de A a Z" : "ascendente"} - Click para ordenar ${
                       sortInfo.sortType === "datetime" ? "de más reciente a más antiguo" :
                       sortInfo.sortType === "numeric" ? "de mayor a menor" :
                       sortInfo.sortType === "text" ? "de Z a A" : "descendente"}`;
  }

  return `Ordenado ${sortInfo.sortType === "datetime" ? "de más reciente a más antiguo" :
                     sortInfo.sortType === "numeric" ? "de mayor a menor" :
                     sortInfo.sortType === "text" ? "de Z a A" : "descendente"} - Click para quitar ordenamiento`;
};

const createColumnDef = (item: ProcessedItem): ColumnDef<ProcessedRow> => {
  const isReferenceColumn =
    item.id === "__parentId" || item.id === "__parentTable";

  const sortInfo = getSortableInfo(isReferenceColumn ? "string" : item.type);
  const columnName = item.path[item.path.length - 1];
  const fullPathName = item.id;

  console.log("📊 Creando definición de columna:", {
    columnId: item.id,
    isReference: isReferenceColumn,
    type: item.type,
    path: item.path,
  });

  return {
    id: item.id,
    accessorFn: (row: ProcessedRow) => {
      const directValue = row[item.id];
      if (directValue !== undefined) return directValue;

      let value: NestedRecord = row;
      for (const key of item.path) {
        value = value?.[key] as NestedRecord;
        if (value === undefined) break;
      }

      return processValue(value, item.id, row.__parentId?.toString());
    },
    enableSorting: sortInfo.sortable,
    enableHiding: !isReferenceColumn,
    meta: {
      type: isReferenceColumn ? "string" : item.type,
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      const isFiltered = column.getFilterValue() !== undefined;
      const displayName = item.path.length > 1 ? fullPathName : columnName;

      return (
        <TooltipProvider>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <TypeDot type={isReferenceColumn ? "string" : item.type} />
              <Tooltip>
                <TooltipTrigger className='truncate max-w-[200px]'>
                  <span className='flex items-center gap-1'>
                    {isReferenceColumn && <Link2 className='h-3 w-3' />}
                    {displayName}
                  </span>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Path: {fullPathName}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className='flex items-center'>
              {sortInfo.sortable ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className={`h-6 w-6 p-0 ${
                        isSorted
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => {
                        // Three-state sorting: none → asc → desc → none
                        if (!isSorted) {
                          column.toggleSorting(false); // asc
                        } else if (isSorted === "asc") {
                          column.toggleSorting(true); // desc
                        } else {
                          column.clearSorting(); // none
                        }
                      }}
                    >
                      {!isSorted && <ArrowUpDown className='h-4 w-4' />}
                      {isSorted === "asc" && <ArrowUp className='h-4 w-4' />}
                      {isSorted === "desc" && <ArrowDown className='h-4 w-4' />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    <p>{getSortTooltip(isSorted, sortInfo)}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0 text-muted-foreground opacity-50 cursor-not-allowed'
                      disabled
                    >
                      <ArrowUpDown className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    <p>{getSortTooltip(isSorted, sortInfo)}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className={`h-6 w-6 p-0 relative ${
                      isFiltered
                        ? "bg-primary text-primary-foreground rounded-0.5"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Filter className='h-4 w-4' />
                    {isFiltered && (
                      <span className='absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full' />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className='p-6 w-fit max-w-[90vw] min-h-[400px] max-h-[80dvh] overflow-auto'>
                  <DialogTitle>Filtrar {displayName}</DialogTitle>
                  <div className='w-[400px]'>
                    <FilterFactory
                      column={column}
                      columnId={column.id}
                      columnName={displayName}
                      columnType={isReferenceColumn ? "string" : item.type}
                      uniqueValues={[]} // This will be overridden in FilterFactory
                      initialValue={column.getFilterValue() as FilterCondition}
                      onApply={(condition) => {
                        console.log("🎯 Applying filter condition:", {
                          columnId: column.id,
                          condition,
                        });
                        column.setFilterValue(condition);
                      }}
                      onClear={() => {
                        console.log(
                          "🧹 Clearing filter for column:",
                          column.id
                        );
                        column.setFilterValue(undefined);
                      }}
                      onClose={() => {
                        const trigger = document.querySelector(
                          `[data-state="open"]`
                        ) as HTMLButtonElement;
                        trigger?.click();
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={() => column.toggleVisibility()}
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Mostrar/Ocultar columna</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      );
    },
    cell: ({ getValue }) => {
      const value = getValue() as ProcessedValue;

      console.log("🔍 Renderizando celda:", {
        columnId: item.id,
        isReference: item.isReference,
        value,
      });

      // Use our new CellFactory component
      return <CellFactory value={value} isReference={item.isReference} />;
    },
    filterFn: "processedValueFilter",
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = rowA.getValue(columnId) as ProcessedValue;
      const valueB = rowB.getValue(columnId) as ProcessedValue;

      // Handle null/undefined values - always sort them to the end
      if (valueA?.value == null && valueB?.value == null) return 0;
      if (valueA?.value == null) return 1;
      if (valueB?.value == null) return -1;

      const rawA = valueA.value;
      const rawB = valueB.value;

      // Sort by type
      switch (sortInfo.sortType) {
        case "datetime":
          const dateA = valueA.dateValue || new Date(String(rawA));
          const dateB = valueB.dateValue || new Date(String(rawB));
          return dateA.getTime() - dateB.getTime();

        case "numeric":
          const numA = typeof rawA === 'number' ? rawA : parseFloat(String(rawA));
          const numB = typeof rawB === 'number' ? rawB : parseFloat(String(rawB));

          if (isNaN(numA) && isNaN(numB)) return 0;
          if (isNaN(numA)) return 1;
          if (isNaN(numB)) return -1;

          return numA - numB;

        case "basic":
          // For booleans and basic types
          const strA = String(rawA).toLowerCase();
          const strB = String(rawB).toLowerCase();
          return strA.localeCompare(strB);

        case "text":
        default:
          // String comparison with locale support
          const textA = String(rawA);
          const textB = String(rawB);
          return textA.localeCompare(textB, 'es', {
            numeric: true,
            sensitivity: 'base'
          });
      }
    },
  };
};

const processGroup = (group: GroupedColumns): ColumnDef<ProcessedRow>[] => {
  const itemColumns = group.items?.map(createColumnDef) || [];
  const childColumns = (group.children || []).flatMap(processGroup);
  const allColumns = [...itemColumns, ...childColumns];

  if (!allColumns.length) {
    return [];
  }

  return [
    {
      id: group.id,
      header: group.header,
      columns: allColumns,
      meta: { level: group.level },
    },
  ];
};

// Añadir función para validar que solo haya una columna con llave
const validateSingleKey = (items: ProcessedItem[]): ProcessedItem[] => {
  const keyColumns = items.filter((item) => item.isId);

  // Si hay más de una columna con llave, mantener solo la primera
  if (keyColumns.length > 1) {
    const firstKeyColumn = keyColumns[0];
    return items.map((item) => ({
      ...item,
      isId: item.id === firstKeyColumn.id ? true : false,
    }));
  }

  return items;
};

export const columns = (data: ProcessedItem[]): ColumnDef<ProcessedRow>[] => {
  if (!data?.length) return [];
  const { rootItems, groups } = groupColumns(data);

  // Validar columnas raíz
  const validatedRootItems = validateSingleKey(rootItems);

  const rootColumns = validatedRootItems.map(createColumnDef);
  const groupedColumns = groups.flatMap((group) => {
    // Validar columnas agrupadas
    const validatedGroupItems = group.items
      ? validateSingleKey(group.items)
      : [];
    return processGroup({ ...group, items: validatedGroupItems });
  });

  return [...rootColumns, ...groupedColumns];
};

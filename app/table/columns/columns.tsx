import type { ColumnDef } from "@tanstack/react-table";
import { ArrayCell } from "../components/array-cell";
import { TypeDot } from "../components/type-dot";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye, Filter, Link2 } from "lucide-react";
import {
  groupColumns,
  type ProcessedItem,
  type GroupedColumns,
  type ProcessedRow,
  type ProcessedValue,
} from "../data-processor";
import { ObjectCard } from "../components/object-card";
import { formatDateString } from "../utils/date-formatter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FilterFactory } from "../components/filters/filter-factory";
import type { FilterCondition } from "../components/filters/filter-types";

const createColumnDef = (item: ProcessedItem): ColumnDef<ProcessedRow> => {
  const isReferenceColumn =
    item.id === "__parentId" || item.id === "__parentTable";
  const isSortable = ["string", "número", "boolean", "fecha"].includes(
    item.type
  );
  const columnName = item.path[item.path.length - 1];

  console.log("📊 Creando definición de columna:", {
    columnId: item.id,
    isReference: isReferenceColumn,
    type: item.type,
    path: item.path,
  });

  return {
    id: item.id,
    accessorKey: item.id,
    enableSorting: true,
    enableHiding: !isReferenceColumn,
    meta: {
      type: isReferenceColumn ? "string" : item.type,
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      const isFiltered = column.getFilterValue() !== undefined;

      return (
        <TooltipProvider>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <TypeDot type={isReferenceColumn ? "string" : item.type} />
              <span className='flex items-center gap-1'>
                {isReferenceColumn && <Link2 className='h-3 w-3' />}
                {columnName}
              </span>
            </div>
            <div className='flex items-center'>
              {isSortable && (
                <div className='flex'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className={`h-6 w-6 p-0 ${
                          isSorted === "asc"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => column.toggleSorting(false)}
                      >
                        <ArrowUp className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p>Ordenar ascendente</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className={`h-6 w-6 p-0 ${
                          isSorted === "desc"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => column.toggleSorting(true)}
                      >
                        <ArrowDown className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p>Ordenar descendente</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                  <div className='w-[400px]'>
                    <FilterFactory
                      column={column}
                      columnId={column.id}
                      columnName={columnName}
                      columnType={isReferenceColumn ? "string" : item.type}
                      uniqueValues={[]}
                      onApply={(condition) => {
                        column.setFilterValue(condition);
                      }}
                      onClear={() => {
                        column.setFilterValue(undefined);
                      }}
                      onClose={() => {
                        const trigger = document.querySelector(
                          `[data-state="open"]`
                        ) as HTMLButtonElement;
                        trigger?.click();
                      }}
                      initialValue={column.getFilterValue() as FilterCondition}
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
        isReference: isReferenceColumn,
        value,
      });

      if (isReferenceColumn || value?.isReference) {
        return (
          <div className='flex items-center gap-1'>
            <Link2 className='h-3 w-3 text-muted-foreground' />
            <span className='font-mono text-sm text-primary'>
              {String(value?.value || value)}
            </span>
          </div>
        );
      }

      if (!value) {
        console.log("⚠️ Valor nulo o indefinido en celda:", {
          columnId: item.id,
          value,
        });
        return null;
      }

      if (typeof value === "object" && "type" in value) {
        switch (value.type) {
          case "array":
            return <ArrayCell items={value.items || []} />;
          case "objeto":
            return <ObjectCard value={value} compact />;
          case "fecha":
            return formatDateString(value.value as string);
          default:
            return (
              <span className='font-mono text-sm'>
                {value.type === "string"
                  ? `"${String(value.value)}"`
                  : String(value.value)}
              </span>
            );
        }
      }

      return (
        <span className='font-mono text-sm'>
          {String((value as ProcessedValue)?.value || value)}
        </span>
      );
    },
    filterFn: "processedValueFilter",
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

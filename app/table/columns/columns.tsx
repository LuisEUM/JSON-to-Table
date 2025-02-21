import type { ColumnDef } from "@tanstack/react-table";
import { ArrayCell } from "../components/array-cell";
import { TypeDot } from "../components/type-dot";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye, Filter } from "lucide-react";
import {
  groupColumns,
  type ProcessedItem,
  type GroupedColumns,
  type ProcessedRow,
} from "../data-processor";
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
  const isSortable = [
    "string",
    "número entero",
    "número decimal",
    "boolean",
    "fecha",
  ].includes(item.type);
  const columnName = item.path[item.path.length - 1];

  return {
    id: item.id,
    accessorFn: (row) => row[item.id],
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      const isFiltered = column.getFilterValue() !== undefined;

      return (
        <TooltipProvider>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <TypeDot type={item.type} />
              <span>{columnName}</span>
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
                      columnName={column.id.split(".").pop() || column.id}
                      columnType='unknown'
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
    cell: ({ row }) => {
      const value = row.getValue(item.id) as ProcessedItem;
      if (value?.type === "array") {
        return <ArrayCell items={value.items || []} />;
      }
      return <span className='font-mono'>{String(value?.value)}</span>;
    },
    enableSorting: isSortable,
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

export const columns = (data: ProcessedItem[]): ColumnDef<ProcessedRow>[] => {
  const { rootItems, groups } = groupColumns(data);
  const rootColumns = rootItems.map(createColumnDef);
  const groupedColumns = groups.flatMap(processGroup);
  return [...rootColumns, ...groupedColumns];
};


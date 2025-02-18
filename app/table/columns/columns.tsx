import type { ColumnDef } from "@tanstack/react-table";
import { ArrayCell } from "../components/array-cell";
import { TypeDot } from "../components/type-dot";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye } from "lucide-react";
import {
  groupColumns,
  type ProcessedItem,
  type GroupedColumns,
  type ProcessedRow,
} from "../data-processor";
import { DateCell } from "../components/date-cell";

const createColumnDef = (item: ProcessedItem): ColumnDef<ProcessedRow> => {
  const isSortable = [
    "string",
    "número entero",
    "número decimal",
    "boolean",
    "fecha",
  ].includes(item.type);

  return {
    id: item.id,
    accessorFn: (row) => row[item.id],
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <div className='flex flex-col items-center gap-1'>
          <div className='flex items-center gap-2'>
            <span>{item.path[item.path.length - 1]}</span>
            <TypeDot type={item.type} />
          </div>
          <div className='flex items-center gap-1'>
            {isSortable && (
              <div className='flex'>
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
              </div>
            )}
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={() => column.toggleVisibility()}
            >
              <Eye className='h-4 w-4' />
            </Button>
          </div>
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(item.id) as ProcessedItem;
      if (value?.type === "array") {
        return <ArrayCell items={value.items || []} />;
      }
      if (value?.type === "fecha") {
        return <DateCell value={String(value.value)} />;
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

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProcessedRow } from "../../core/utils/data-processor";
import { Checkbox } from "@/components/primitives/ui/checkbox";
import { ActionButtons } from "../../molecules/table-parts/action-buttons";

export const selectionColumn: ColumnDef<ProcessedRow> = {
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

export const indexColumn: ColumnDef<ProcessedRow> = {
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

export function createActionsColumn(
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

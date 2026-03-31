"use client";

import { Button } from "@/components/ui/button";
import { Check, X, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Table, Column } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TypeDot } from "../../atoms/indicators/TypeDot";
import { ColumnActions } from "./column-actions";

interface ColumnInfo {
  id: string;
  type: string;
}

interface ColumnListProps<TData> {
  columns: ColumnInfo[];
  filteredColumns: ColumnInfo[];
  table: Table<TData>;
  hasActiveFilter: boolean;
  pendingPositions: Record<string, number>;
  useFixedColumn: boolean;
  fixedColumnId: string | null;
  getColumn: (columnId: string) => Column<TData, unknown> | undefined;
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (columnId: string) => void;
  onToggleKey: (columnId: string) => void;
  onSetPendingPosition: (columnId: string, position: number) => void;
  onApplyPendingPosition: (columnId: string) => void;
  onCancelPendingPosition: (columnId: string) => void;
}

export function ColumnList<TData>({
  columns,
  filteredColumns,
  hasActiveFilter,
  pendingPositions,
  useFixedColumn,
  fixedColumnId,
  getColumn,
  onMoveColumn,
  onToggleVisibility,
  onToggleKey,
  onSetPendingPosition,
  onApplyPendingPosition,
  onCancelPendingPosition,
}: ColumnListProps<TData>) {
  const isFixedColumn = (columnId: string): boolean => {
    return useFixedColumn && fixedColumnId === columnId;
  };

  const canSetAsKey = (columnId: string): boolean => {
    const column = getColumn(columnId);
    return column ? column.getIsVisible() : false;
  };

  const canMoveUp = (index: number) => index > 0;
  const canMoveDown = (index: number) => index < columns.length - 1;

  return (
    <div className='border rounded-md overflow-hidden'>
      <div className='h-full overflow-y-auto overflow-x-hidden'>
        <table className='w-full'>
          <thead className='bg-muted sticky top-0 z-10'>
            <tr className='border-b'>
              <th className='text-left px-3 py-2 text-sm font-medium text-muted-foreground w-16'>
                #
              </th>
              <th className='text-left px-3 py-2 text-sm font-medium text-muted-foreground'>
                Columna
              </th>
              <th className='text-center px-3 py-2 text-sm font-medium text-muted-foreground w-16'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredColumns.map((column) => {
              const tableColumn = getColumn(column.id);
              if (!tableColumn) return null;

              const realIndex = columns.findIndex(
                (col) => col.id === column.id
              );

              return (
                <tr
                  key={column.id}
                  className={`border-b hover:bg-muted/30 ${
                    isFixedColumn(column.id) ? "bg-muted/50" : ""
                  } ${!tableColumn.getIsVisible() ? "opacity-40" : ""}`}
                >
                  {/* Posición */}
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-1'>
                      <Input
                        type='number'
                        min='0'
                        max={columns.length - 1}
                        value={pendingPositions[column.id] ?? realIndex}
                        onChange={(e) => {
                          const newPosition = parseInt(e.target.value, 10);
                          if (!isNaN(newPosition)) {
                            onSetPendingPosition(column.id, newPosition);
                          }
                        }}
                        className='w-16 h-8 text-center text-sm'
                        title={`Posición actual: ${realIndex}. Rango: 0-${
                          columns.length - 1
                        }`}
                      />
                      {pendingPositions[column.id] !== undefined && (
                        <div className='flex items-center gap-1'>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50'
                                  onClick={() =>
                                    onApplyPendingPosition(column.id)
                                  }
                                >
                                  <Check className='h-3 w-3' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Aplicar nueva posición
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                                  onClick={() =>
                                    onCancelPendingPosition(column.id)
                                  }
                                >
                                  <X className='h-3 w-3' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Cancelar cambio
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nombre columna */}
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-2 min-w-0'>
                      <TypeDot type={column.type} />
                      <span className='truncate font-medium text-sm'>
                        {column.id}
                      </span>
                      {isFixedColumn(column.id) && (
                        <Key className='h-4 w-4' />
                      )}
                    </div>
                  </td>

                  {/* Menú de Acciones */}
                  <td className='px-3 py-2 text-center'>
                    <ColumnActions
                      columnId={column.id}
                      realIndex={realIndex}
                      tableColumn={tableColumn}
                      isFixed={isFixedColumn(column.id)}
                      canSetAsKey={canSetAsKey(column.id)}
                      hasActiveFilter={hasActiveFilter}
                      canMoveUp={canMoveUp(realIndex)}
                      canMoveDown={canMoveDown(realIndex)}
                      canMoveToStart={canMoveUp(realIndex)}
                      canMoveToEnd={canMoveDown(realIndex)}
                      onMoveUp={() => onMoveColumn(realIndex, realIndex - 1)}
                      onMoveDown={() => onMoveColumn(realIndex, realIndex + 1)}
                      onMoveToStart={() => onMoveColumn(realIndex, 0)}
                      onMoveToEnd={() => onMoveColumn(realIndex, columns.length - 1)}
                      onToggleVisibility={() => onToggleVisibility(column.id)}
                      onToggleKey={() => onToggleKey(column.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

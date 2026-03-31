"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Eye,
  EyeOff,
  Key,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column } from "@tanstack/react-table";

interface ColumnActionsProps<TData> {
  columnId: string;
  realIndex: number;
  tableColumn: Column<TData, unknown>;
  isFixed: boolean;
  canSetAsKey: boolean;
  hasActiveFilter: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canMoveToStart: boolean;
  canMoveToEnd: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToStart: () => void;
  onMoveToEnd: () => void;
  onToggleVisibility: () => void;
  onToggleKey: () => void;
}

export function ColumnActions<TData>({
  tableColumn,
  isFixed,
  canSetAsKey,
  hasActiveFilter,
  canMoveUp,
  canMoveDown,
  canMoveToStart,
  canMoveToEnd,
  onMoveUp,
  onMoveDown,
  onMoveToStart,
  onMoveToEnd,
  onToggleVisibility,
  onToggleKey,
}: ColumnActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0 hover:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>
            Abrir menú de acciones
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>Orden</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={!canMoveToStart || hasActiveFilter}
          onClick={onMoveToStart}
          className='gap-2'
        >
          <ChevronsUp className='h-4 w-4' />
          Mover al inicio
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canMoveUp || hasActiveFilter}
          onClick={onMoveUp}
          className='gap-2'
        >
          <ChevronUp className='h-4 w-4' />
          Mover arriba
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canMoveDown || hasActiveFilter}
          onClick={onMoveDown}
          className='gap-2'
        >
          <ChevronDown className='h-4 w-4' />
          Mover abajo
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canMoveToEnd || hasActiveFilter}
          onClick={onMoveToEnd}
          className='gap-2'
        >
          <ChevronsDown className='h-4 w-4' />
          Mover al final
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!tableColumn.getCanHide()}
          onClick={onToggleVisibility}
          className='gap-2'
        >
          {tableColumn.getIsVisible() ? (
            <>
              <EyeOff className='h-4 w-4' />
              Ocultar columna
            </>
          ) : (
            <>
              <Eye className='h-4 w-4' />
              Mostrar columna
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!canSetAsKey}
          onClick={onToggleKey}
          className='gap-2'
        >
          <Key className='h-4 w-4' />
          {isFixed
            ? "Quitar como fija"
            : "Establecer como fija"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

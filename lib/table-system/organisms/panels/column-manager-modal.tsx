"use client";

import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/respinsive-modal";
import {
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Eye,
  EyeOff,
  Key,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Table } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import type { ProcessedRow } from "../../core";
import { TypeDot } from "../../atoms/indicators/TypeDot";

interface ColumnManagerModalProps<TData> {
  table: Table<TData>;
  useFixedColumn: boolean;
  onFixedColumnChange: (value: boolean) => void;
  fixedColumnId: string | null;
  onFixedColumnIdChange: (value: string | null) => void;
  originalColumnOrder: string[];
  onColumnOrderChange?: (newOrder: string[]) => void;
  onSaveAsDefault?: () => void;
}

interface ColumnInfo {
  id: string;
  type: string;
}

export function ColumnManagerModal<TData extends ProcessedRow>({
  table,
  useFixedColumn,
  onFixedColumnChange,
  fixedColumnId,
  onFixedColumnIdChange,
  originalColumnOrder,
  onColumnOrderChange,
  onSaveAsDefault,
}: ColumnManagerModalProps<TData>) {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingPositions, setPendingPositions] = useState<
    Record<string, number>
  >({});

  // Función auxiliar para obtener columna de la tabla
  const getColumn = (columnId: string) => {
    return table.getAllLeafColumns().find((col) => col.id === columnId);
  };

  // Verificar si una columna es la columna fija actual
  const isFixedColumn = (columnId: string): boolean => {
    return useFixedColumn && fixedColumnId === columnId;
  };

  // Verificar si se puede establecer como columna fija
  const canSetAsKey = (columnId: string): boolean => {
    const column = getColumn(columnId);
    return column ? column.getIsVisible() : false;
  };

  // Toggle visibilidad de columna
  const handleToggleVisibility = (columnId: string) => {
    const column = getColumn(columnId);
    if (column) {
      column.toggleVisibility();
    }
  };

  // Toggle columna fija
  const handleToggleKey = (columnId: string) => {
    if (isFixedColumn(columnId)) {
      onFixedColumnChange(false);
      onFixedColumnIdChange(null);
    } else if (canSetAsKey(columnId)) {
      onFixedColumnChange(true);
      onFixedColumnIdChange(columnId);
    }
  };

  // Funciones de movimiento
  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    setColumns(newColumns);

    if (onColumnOrderChange) {
      onColumnOrderChange(newColumns.map((col) => col.id));
    }
  };

  const canMoveUp = (index: number) => index > 0;
  const canMoveDown = (index: number) => index < columns.length - 1;
  const canMoveToStart = (index: number) => index > 0;
  const canMoveToEnd = (index: number) => index < columns.length - 1;

  const moveColumnUp = (index: number) => {
    if (canMoveUp(index)) {
      moveColumn(index, index - 1);
    }
  };

  const moveColumnDown = (index: number) => {
    if (canMoveDown(index)) {
      moveColumn(index, index + 1);
    }
  };

  const moveColumnToStart = (index: number) => {
    if (canMoveToStart(index)) {
      moveColumn(index, 0);
    }
  };

  const moveColumnToEnd = (index: number) => {
    if (canMoveToEnd(index)) {
      moveColumn(index, columns.length - 1);
    }
  };

  // Función para establecer posición pendiente
  const setPendingPosition = (columnId: string, position: number) => {
    const clampedPosition = Math.max(0, Math.min(position, columns.length - 1));
    setPendingPositions((prev) => ({
      ...prev,
      [columnId]: clampedPosition,
    }));
  };

  // Función para aplicar posición pendiente
  const applyPendingPosition = (columnId: string) => {
    const pendingPosition = pendingPositions[columnId];
    if (pendingPosition !== undefined) {
      const currentIndex = columns.findIndex((col) => col.id === columnId);
      if (currentIndex !== -1 && currentIndex !== pendingPosition) {
        moveColumn(currentIndex, pendingPosition);
      }
      // Limpiar posición pendiente
      setPendingPositions((prev) => {
        const newPending = { ...prev };
        delete newPending[columnId];
        return newPending;
      });
    }
  };

  // Función para cancelar posición pendiente
  const cancelPendingPosition = (columnId: string) => {
    setPendingPositions((prev) => {
      const newPending = { ...prev };
      delete newPending[columnId];
      return newPending;
    });
  };

  // Verificar si hay filtro activo
  const hasActiveFilter = searchTerm.trim().length > 0;

  useEffect(() => {
    const allColumns = table.getAllLeafColumns();
    const firstRow = table.getRowModel().rows[0]?.original;

    const getColumnInfo = (columnId: string): ColumnInfo => {
      if (columnId === "index") {
        return { id: columnId, type: "número entero" };
      }
      if (columnId === "actions") {
        return { id: columnId, type: "acciones" };
      }
      return {
        id: columnId,
        type: firstRow?.[columnId]?.type || "unknown",
      };
    };

    // Obtener todas las columnas disponibles
    const availableColumns = allColumns
      .filter(
        (col) =>
          (typeof col.accessorFn !== "undefined" || col.id === "index") &&
          col.id !== "actions"
      )
      .map((col) => col.id);

    // Usar el orden personalizado si está disponible
    let displayOrder: string[];
    if (originalColumnOrder.length > 0) {
      displayOrder = originalColumnOrder.filter((id) =>
        availableColumns.includes(id)
      );
      // Agregar columnas nuevas que no estén en el orden original
      const missingColumns = availableColumns.filter(
        (id) => !originalColumnOrder.includes(id)
      );
      displayOrder = [...displayOrder, ...missingColumns];
    } else {
      displayOrder = availableColumns;
    }

    const columnInfos = displayOrder.map(getColumnInfo);
    setColumns(columnInfos);
  }, [table, originalColumnOrder]);

  // Filtrar columnas basado en búsqueda
  const filteredColumns = columns.filter((column) =>
    column.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <span>Columnas</span>
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent className='max-w-4xl'>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Gestión de Columnas</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className='space-y-4'>
          {/* Búsqueda */}
          <div className='space-y-2'>
            <Input
              placeholder='Buscar columnas...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={hasActiveFilter ? "border-amber-200 bg-amber-50" : ""}
            />
            {hasActiveFilter && (
              <p className='text-xs text-amber-600 flex items-center gap-1'>
                <span>🔍</span>
                Filtro activo: Los botones de orden están deshabilitados. Limpia
                la búsqueda para reordenar.
              </p>
            )}
          </div>

          {/* Tabla de columnas */}
          <div className='border rounded-md overflow-hidden '>
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

                    // Encontrar la posición real de la columna en el array completo
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
                                const newPosition = parseInt(
                                  e.target.value,
                                  10
                                );
                                if (!isNaN(newPosition)) {
                                  setPendingPosition(column.id, newPosition);
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
                                          applyPendingPosition(column.id)
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
                                          cancelPendingPosition(column.id)
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
                                disabled={
                                  !canMoveToStart(realIndex) || hasActiveFilter
                                }
                                onClick={() => moveColumnToStart(realIndex)}
                                className='gap-2'
                              >
                                <ChevronsUp className='h-4 w-4' />
                                Mover al inicio
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  !canMoveUp(realIndex) || hasActiveFilter
                                }
                                onClick={() => moveColumnUp(realIndex)}
                                className='gap-2'
                              >
                                <ChevronUp className='h-4 w-4' />
                                Mover arriba
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  !canMoveDown(realIndex) || hasActiveFilter
                                }
                                onClick={() => moveColumnDown(realIndex)}
                                className='gap-2'
                              >
                                <ChevronDown className='h-4 w-4' />
                                Mover abajo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  !canMoveToEnd(realIndex) || hasActiveFilter
                                }
                                onClick={() => moveColumnToEnd(realIndex)}
                                className='gap-2'
                              >
                                <ChevronsDown className='h-4 w-4' />
                                Mover al final
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                disabled={!tableColumn.getCanHide()}
                                onClick={() =>
                                  handleToggleVisibility(column.id)
                                }
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
                                disabled={!canSetAsKey(column.id)}
                                onClick={() => handleToggleKey(column.id)}
                                className='gap-2'
                              >
                                <Key className='h-4 w-4' />
                                {isFixedColumn(column.id)
                                  ? "Quitar como fija"
                                  : "Establecer como fija"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Botón para guardar como configuración por defecto */}
        {onSaveAsDefault && (
          <div className='flex justify-end pt-4 border-t'>
            <Button
              onClick={onSaveAsDefault}
              variant='outline'
              className='gap-2'
            >
              Guardar como configuración por defecto
            </Button>
          </div>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Table } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import type { ProcessedRow } from "../../data-processor";
import { TypeDot } from "../type-indicators";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [pendingPositions, setPendingPositions] = useState<
    Record<string, number>
  >({});

  // Función para obtener columna de la tabla
  const getColumn = (columnId: string) =>
    table.getAllLeafColumns().find((col) => col.id === columnId);

  // Funciones auxiliares para determinar restricciones
  const isFixedColumn = (columnId: string) => {
    if (!useFixedColumn) return false;
    if (columnId === "index" && !fixedColumnId) return true; // Index es la fija
    if (columnId === fixedColumnId) return true; // Columna personalizada es la fija
    return false;
  };

  // Funciones de validación de movimiento (ahora más simples)
  // Como el pin es independiente, las columnas se pueden mover libremente en el modal
  const canMoveUp = (index: number) => {
    // Solo no puede mover arriba si ya está en la primera posición
    return index > 0;
  };

  const canMoveDown = (index: number) => {
    // Solo no puede mover abajo si ya está en la última posición
    return index < columns.length - 1;
  };

  const canMoveToStart = (index: number) => {
    // Solo no puede mover al inicio si ya está en la primera posición
    return index > 0;
  };

  const canMoveToEnd = (index: number) => {
    // Solo no puede mover al final si ya está en la última posición
    return index < columns.length - 1;
  };

  // Funciones para manejar visibilidad y key
  const handleToggleVisibility = (columnId: string) => {
    const tableColumn = getColumn(columnId);
    if (!tableColumn) return;

    // Verificar si la columna puede ser ocultada
    if (!tableColumn.getCanHide()) {
      console.log("⚠️ Column cannot be hidden:", columnId);
      return;
    }

    const newVisibility = !tableColumn.getIsVisible();
    tableColumn.toggleVisibility(newVisibility);

    // Si se desactiva una columna que está actualmente fija
    if (!newVisibility && isFixedColumn(columnId)) {
      if (columnId === "index" && !fixedColumnId) {
        // Si se desactiva index siendo la columna fija por defecto
        console.log("📌 Index fixed -> changing to none");
        onFixedColumnIdChange(null);
        onFixedColumnChange(false);
      } else if (columnId === fixedColumnId) {
        // Si se desactiva una columna personalizada que es fija
        console.log("📌 Custom fixed column -> fallback logic");
        const indexColumn = getColumn("index");
        if (indexColumn && indexColumn.getIsVisible()) {
          onFixedColumnIdChange(null); // index
          onFixedColumnChange(true);
        } else {
          onFixedColumnIdChange(null);
          onFixedColumnChange(false); // ninguna
        }
      }
    }
  };

  const handleToggleKey = (columnId: string) => {
    const isCurrentlyFixed = isFixedColumn(columnId);

    if (isCurrentlyFixed) {
      // Si ya es fija, la desactivamos
      console.log("🔑 Removing key from:", columnId);

      // Fallback: si hay index visible, usarlo como fijo por defecto
      const indexColumn = getColumn("index");
      if (indexColumn && indexColumn.getIsVisible() && columnId !== "index") {
        onFixedColumnIdChange(null); // index
        onFixedColumnChange(true);
        console.log("🔑 Fallback to index as fixed column");
      } else {
        // Sin columna fija
        onFixedColumnIdChange(null);
        onFixedColumnChange(false);
        console.log("🔑 No fixed column");
      }
    } else {
      // Si no es fija, la establecemos como fija
      console.log("🔑 Setting key to:", columnId);
      if (columnId === "index") {
        onFixedColumnIdChange(null); // index es null en fixedColumnId
        onFixedColumnChange(true);
      } else {
        onFixedColumnIdChange(columnId);
        onFixedColumnChange(true);
      }
    }

    // IMPORTANTE: No cambiamos el orden de las columnas
    // El pin es completamente independiente del orden
  };

  const canSetAsKey = (columnId: string) => {
    const tableColumn = getColumn(columnId);
    // Solo se puede establecer como key si está visible y no es la columna de acciones
    // (actions ya está excluida del modal, pero mantenemos la validación por seguridad)
    return tableColumn && tableColumn.getIsVisible() && columnId !== "actions";
  };

  // Funciones para reordenar columnas
  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);

    setColumns(newColumns);

    // Notificar cambio de orden
    const newOrder = newColumns.map((col) => col.id);
    onColumnOrderChange?.(newOrder);
  };

  const moveColumnUp = (index: number) => {
    if (index > 0) {
      moveColumn(index, index - 1);
    }
  };

  const moveColumnDown = (index: number) => {
    if (index < columns.length - 1) {
      moveColumn(index, index + 1);
    }
  };

  const moveColumnToStart = (index: number) => {
    if (index > 0) {
      moveColumn(index, 0);
    }
  };

  const moveColumnToEnd = (index: number) => {
    if (index < columns.length - 1) {
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

  // Debug: Log state changes
  console.log("🔍 ColumnManager State:", {
    useFixedColumn,
    fixedColumnId,
    selectValue: useFixedColumn ? fixedColumnId || "index" : "none",
    indexVisible: getColumn("index")?.getIsVisible(),
    indexDisabled: useFixedColumn && !fixedColumnId,
    hasActiveFilter,
  });

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

    // Obtener todas las columnas disponibles (sin reordenar por pin)
    // Excluir actions ya que es fija siempre y no se gestiona
    const availableColumns = allColumns
      .filter(
        (col) =>
          (typeof col.accessorFn !== "undefined" || col.id === "index") &&
          col.id !== "actions" // Excluir actions
      )
      .map((col) => col.id);

    // Si tenemos un orden personalizado (originalColumnOrder), usarlo
    // Si no, usar el orden natural de las columnas
    let displayOrder: string[];
    if (originalColumnOrder.length > 0) {
      // Usar el orden desde el parent, pero filtrar solo las columnas disponibles
      displayOrder = originalColumnOrder.filter((id) =>
        availableColumns.includes(id)
      );
      // Agregar cualquier columna nueva que no esté en el orden original
      const missingColumns = availableColumns.filter(
        (id) => !displayOrder.includes(id)
      );
      displayOrder = [...displayOrder, ...missingColumns];
    } else {
      // Orden natural: index primero, luego el resto (sin actions)
      const indexColumn = availableColumns.find((id) => id === "index");
      const otherColumns = availableColumns.filter((id) => id !== "index");

      displayOrder = [...(indexColumn ? [indexColumn] : []), ...otherColumns];
    }

    // Convertir a ColumnInfo manteniendo el orden independiente del pin
    const orderedColumns = displayOrder.map((id) => getColumnInfo(id));
    setColumns(orderedColumns);

    console.log("📊 Column order (independent of pin):", {
      displayOrder,
      fixedColumnId,
      useFixedColumn,
    });
  }, [table, originalColumnOrder]); // eslint-disable-line react-hooks/exhaustive-deps
  // fixedColumnId y useFixedColumn no afectan el orden - intencionalmente excluidos

  const filteredColumns = columns.filter((column) =>
    column.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button variant='outline' size='sm' className='ml-auto'>
          <Eye className='h-4 w-4 mr-2' />
          Columnas
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent
        side='bottom'
        className='sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] w-[90vw] max-h-[90dvh]'
      >
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Columnas</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <div className='py-4'>
          <div className='space-y-4'>
            <div className='mb-4'>
              <Input
                placeholder='Buscar columnas...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={
                  hasActiveFilter ? "border-amber-200 bg-amber-50" : ""
                }
              />
              {hasActiveFilter && (
                <p className='text-xs text-amber-600 mt-1 flex items-center gap-1'>
                  <span>🔍</span>
                  Filtro activo: Los botones de orden están deshabilitados.
                  Limpia la búsqueda para reordenar.
                </p>
              )}
            </div>

            <div className='border rounded-md'>
              <div className='max-h-[60vh] overflow-auto'>
                {filteredColumns.map((column, index) => {
                  const tableColumn = getColumn(column.id);
                  if (!tableColumn) return null;

                  return (
                    <div
                      key={column.id}
                      className={`grid grid-cols-1 sm:grid-cols-[120px,1fr,auto] items-start sm:items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50 ${
                        isFixedColumn(column.id) ? "bg-muted" : ""
                      }`}
                    >
                      {/* Columna de posición */}
                      <div className='flex items-center justify-center sm:justify-start'>
                        <div className='flex flex-col sm:flex-row items-center gap-2'>
                          <span className='text-xs text-muted-foreground sm:hidden'>
                            Pos:
                          </span>
                          <div className='flex items-center gap-1'>
                            <Input
                              type='number'
                              min='0'
                              max={filteredColumns.length - 1}
                              value={pendingPositions[column.id] ?? index}
                              onChange={(e) => {
                                const newPosition = parseInt(
                                  e.target.value,
                                  10
                                );
                                if (!isNaN(newPosition)) {
                                  setPendingPosition(column.id, newPosition);
                                }
                              }}
                              className='w-14 h-8 text-center text-sm'
                              title={`Posición actual: ${index}. Rango: 0-${
                                filteredColumns.length - 1
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
                                        className='h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50'
                                        onClick={() =>
                                          applyPendingPosition(column.id)
                                        }
                                      >
                                        <Check className='h-4 w-4' />
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
                                        className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                                        onClick={() =>
                                          cancelPendingPosition(column.id)
                                        }
                                      >
                                        <X className='h-4 w-4' />
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
                        </div>
                      </div>

                      {/* Información de la columna y controles en móvil */}
                      <div className='flex flex-col sm:flex-row sm:items-center gap-3 min-w-0'>
                        {/* Información de la columna */}
                        <div className='flex items-center gap-2 min-w-0'>
                          <TypeDot type={column.type} />
                          <span className='truncate'>{column.id}</span>
                          {isFixedColumn(column.id) && (
                            <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded'>
                              Columna Fija
                            </span>
                          )}
                          <span className='text-sm text-muted-foreground whitespace-nowrap sm:hidden'>
                            {index} de {filteredColumns.length - 1}
                          </span>
                        </div>

                        {/* Controles en móvil */}
                        <div className='flex sm:hidden flex-wrap items-center gap-2'>
                          {/* Control de visibilidad móvil */}
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-muted-foreground'>
                              Visible:
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={
                                      tableColumn.getIsVisible()
                                        ? "default"
                                        : "outline"
                                    }
                                    size='sm'
                                    className='h-8 w-8 p-0'
                                    disabled={!tableColumn.getCanHide()}
                                    onClick={() =>
                                      handleToggleVisibility(column.id)
                                    }
                                  >
                                    {tableColumn.getIsVisible() ? (
                                      <Eye className='h-3 w-3' />
                                    ) : (
                                      <EyeOff className='h-3 w-3' />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {!tableColumn.getCanHide()
                                    ? `"${column.id}" no se puede ocultar`
                                    : tableColumn.getIsVisible()
                                    ? `Ocultar "${column.id}"`
                                    : `Mostrar "${column.id}"`}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Control de key móvil */}
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-muted-foreground'>
                              Key:
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={
                                      isFixedColumn(column.id)
                                        ? "default"
                                        : "outline"
                                    }
                                    size='sm'
                                    className='h-8 w-8 p-0'
                                    disabled={!canSetAsKey(column.id)}
                                    onClick={() => handleToggleKey(column.id)}
                                  >
                                    <Key className='h-3 w-3' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {!canSetAsKey(column.id)
                                    ? `"${column.id}" debe estar visible para ser columna fija`
                                    : isFixedColumn(column.id)
                                    ? `Quitar "${column.id}" como columna fija`
                                    : `Establecer "${column.id}" como columna fija`}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Controles de ordenamiento móvil */}
                          <div className='flex items-center gap-1'>
                            <span className='text-xs text-muted-foreground'>
                              Orden:
                            </span>
                            <TooltipProvider>
                              <div className='flex items-center gap-0.5'>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='h-7 w-7 p-0'
                                      disabled={!canMoveUp(index)}
                                      onClick={() => moveColumnUp(index)}
                                    >
                                      <ChevronUp className='h-3 w-3' />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Mover arriba</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='h-7 w-7 p-0'
                                      disabled={!canMoveDown(index)}
                                      onClick={() => moveColumnDown(index)}
                                    >
                                      <ChevronDown className='h-3 w-3' />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Mover abajo</TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                      {/* Controles solo para desktop */}
                      <div className='hidden sm:flex flex-row items-center justify-end gap-2'>
                        {/* Control de visibilidad */}
                        <div className='flex items-center gap-2'>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={
                                    tableColumn.getIsVisible()
                                      ? "default"
                                      : "outline"
                                  }
                                  size='sm'
                                  className='h-9 w-9 sm:h-8 sm:w-8 p-0'
                                  disabled={!tableColumn.getCanHide()}
                                  onClick={() =>
                                    handleToggleVisibility(column.id)
                                  }
                                >
                                  {tableColumn.getIsVisible() ? (
                                    <Eye className='h-4 w-4' />
                                  ) : (
                                    <EyeOff className='h-4 w-4' />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {!tableColumn.getCanHide()
                                  ? `"${column.id}" no se puede ocultar`
                                  : tableColumn.getIsVisible()
                                  ? `Ocultar "${column.id}"`
                                  : `Mostrar "${column.id}"`}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Control de key (columna fija) */}
                        <div className='flex items-center gap-2'>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={
                                    isFixedColumn(column.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  size='sm'
                                  className='h-9 w-9 sm:h-8 sm:w-8 p-0'
                                  disabled={!canSetAsKey(column.id)}
                                  onClick={() => handleToggleKey(column.id)}
                                >
                                  <Key className='h-4 w-4' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {!canSetAsKey(column.id)
                                  ? `"${column.id}" debe estar visible para ser columna fija`
                                  : isFixedColumn(column.id)
                                  ? `Quitar "${column.id}" como columna fija`
                                  : `Establecer "${column.id}" como columna fija`}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Controles de ordenamiento */}
                        <div className='flex items-center gap-1'>
                          <TooltipProvider>
                            <div className='flex items-center gap-1 sm:gap-0.5'>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-9 w-9 sm:h-8 sm:w-8 p-0'
                                    disabled={
                                      !canMoveToStart(index) || hasActiveFilter
                                    }
                                    onClick={() => {
                                      console.log(
                                        "🔝 Mover al inicio:",
                                        column.id
                                      );
                                      moveColumnToStart(index);
                                    }}
                                  >
                                    <ChevronsUp className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {hasActiveFilter
                                    ? "Limpiar búsqueda para reordenar columnas"
                                    : canMoveToStart(index)
                                    ? `Mover "${column.id}" al inicio`
                                    : `"${column.id}" ya está en la primera posición`}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-9 w-9 sm:h-8 sm:w-8 p-0'
                                    disabled={
                                      !canMoveUp(index) || hasActiveFilter
                                    }
                                    onClick={() => {
                                      console.log(
                                        "⬆️ Mover arriba:",
                                        column.id
                                      );
                                      moveColumnUp(index);
                                    }}
                                  >
                                    <ChevronUp className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {hasActiveFilter
                                    ? "Limpiar búsqueda para reordenar columnas"
                                    : canMoveUp(index)
                                    ? `Mover "${column.id}" arriba`
                                    : `"${column.id}" ya está en la primera posición`}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-9 w-9 sm:h-8 sm:w-8 p-0'
                                    disabled={
                                      !canMoveDown(index) || hasActiveFilter
                                    }
                                    onClick={() => {
                                      console.log("⬇️ Mover abajo:", column.id);
                                      moveColumnDown(index);
                                    }}
                                  >
                                    <ChevronDown className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {hasActiveFilter
                                    ? "Limpiar búsqueda para reordenar columnas"
                                    : canMoveDown(index)
                                    ? `Mover "${column.id}" abajo`
                                    : `"${column.id}" ya está en la última posición`}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-9 w-9 sm:h-8 sm:w-8 p-0'
                                    disabled={
                                      !canMoveToEnd(index) || hasActiveFilter
                                    }
                                    onClick={() => {
                                      console.log(
                                        "🔽 Mover al final:",
                                        column.id
                                      );
                                      moveColumnToEnd(index);
                                    }}
                                  >
                                    <ChevronsDown className='h-4 w-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {hasActiveFilter
                                    ? "Limpiar búsqueda para reordenar columnas"
                                    : canMoveToEnd(index)
                                    ? `Mover "${column.id}" al final`
                                    : `"${column.id}" ya está en la última posición`}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

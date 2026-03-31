"use client";

import { Button } from "@/components/primitives/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/primitives/ui/respinsive-modal";
import { Input } from "@/components/primitives/ui/input";
import type { Table } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import type { ProcessedRow } from "../../core";
import { ColumnList } from "./column-list";

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

  const getColumn = (columnId: string) => {
    return table.getAllLeafColumns().find((col) => col.id === columnId);
  };

  const handleToggleVisibility = (columnId: string) => {
    const column = getColumn(columnId);
    if (column) {
      column.toggleVisibility();
    }
  };

  const handleToggleKey = (columnId: string) => {
    if (useFixedColumn && fixedColumnId === columnId) {
      onFixedColumnChange(false);
      onFixedColumnIdChange(null);
    } else {
      const column = getColumn(columnId);
      if (column?.getIsVisible()) {
        onFixedColumnChange(true);
        onFixedColumnIdChange(columnId);
      }
    }
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    setColumns(newColumns);

    if (onColumnOrderChange) {
      onColumnOrderChange(newColumns.map((col) => col.id));
    }
  };

  const setPendingPosition = (columnId: string, position: number) => {
    const clampedPosition = Math.max(0, Math.min(position, columns.length - 1));
    setPendingPositions((prev) => ({
      ...prev,
      [columnId]: clampedPosition,
    }));
  };

  const applyPendingPosition = (columnId: string) => {
    const pendingPosition = pendingPositions[columnId];
    if (pendingPosition !== undefined) {
      const currentIndex = columns.findIndex((col) => col.id === columnId);
      if (currentIndex !== -1 && currentIndex !== pendingPosition) {
        moveColumn(currentIndex, pendingPosition);
      }
      setPendingPositions((prev) => {
        const newPending = { ...prev };
        delete newPending[columnId];
        return newPending;
      });
    }
  };

  const cancelPendingPosition = (columnId: string) => {
    setPendingPositions((prev) => {
      const newPending = { ...prev };
      delete newPending[columnId];
      return newPending;
    });
  };

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

    const availableColumns = allColumns
      .filter(
        (col) =>
          (typeof col.accessorFn !== "undefined" || col.id === "index") &&
          col.id !== "actions"
      )
      .map((col) => col.id);

    let displayOrder: string[];
    if (originalColumnOrder.length > 0) {
      displayOrder = originalColumnOrder.filter((id) =>
        availableColumns.includes(id)
      );
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
      <ResponsiveModalContent className='max-w-4xl' aria-describedby='column-manager-description'>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Gestión de Columnas</ResponsiveModalTitle>
          <p id='column-manager-description' className='sr-only'>
            Gestiona la visibilidad, el orden y la fijación de las columnas de la tabla.
          </p>
        </ResponsiveModalHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Input
              placeholder='Buscar columnas...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={hasActiveFilter ? "border-amber-200 bg-amber-50" : ""}
              aria-label='Buscar columnas'
            />
            {hasActiveFilter && (
              <p className='text-xs text-amber-600 flex items-center gap-1'>
                <span>🔍</span>
                Filtro activo: Los botones de orden están deshabilitados. Limpia
                la búsqueda para reordenar.
              </p>
            )}
          </div>

          <ColumnList
            columns={columns}
            filteredColumns={filteredColumns}
            table={table}
            hasActiveFilter={hasActiveFilter}
            pendingPositions={pendingPositions}
            useFixedColumn={useFixedColumn}
            fixedColumnId={fixedColumnId}
            getColumn={getColumn}
            onMoveColumn={moveColumn}
            onToggleVisibility={handleToggleVisibility}
            onToggleKey={handleToggleKey}
            onSetPendingPosition={setPendingPosition}
            onApplyPendingPosition={applyPendingPosition}
            onCancelPendingPosition={cancelPendingPosition}
          />
        </div>

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

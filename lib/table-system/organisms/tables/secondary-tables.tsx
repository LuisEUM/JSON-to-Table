"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link2 } from "lucide-react";
import { JsonTable } from "./json-table";

interface SecondaryTablesProps {
  arrayColumns: {
    id: string;
    label: string;
    data: Record<string, unknown>[];
    parentTable?: {
      id: string;
      name: string;
    };
  }[];
  level?: number; // Nivel de anidación
  parentId?: string; // ID de la tabla padre
  isLoading?: boolean; // Estado de carga
}

export function SecondaryTables({
  arrayColumns,
  level = 0,
  parentId,
  isLoading = false,
}: SecondaryTablesProps) {
  console.log("🎯 Renderizando SecondaryTables:", {
    level,
    parentId,
    isLoading,
    arrayColumnsCount: arrayColumns.length,
    arrayColumns: arrayColumns.map((col) => ({
      id: col.id,
      label: col.label,
      dataLength: col.data.length,
      firstItemParentId: col.data[0]?.__parentId,
    })),
  });

  // Usar useMemo para el Set inicial
  const initialSelectedTables = useMemo(
    () => new Set(arrayColumns.map((col) => col.id)),
    [arrayColumns]
  );

  const [selectedTables, setSelectedTables] = useState<Set<string>>(
    initialSelectedTables
  );
  const [nestedTables, setNestedTables] = useState<{
    [tableId: string]: {
      id: string;
      label: string;
      data: Record<string, unknown>[];
    }[];
  }>({});

  // Actualizar selección cuando cambian las columnas
  useEffect(() => {
    if (isLoading) return; // No actualizar durante la carga

    const newTableIds = new Set(arrayColumns.map((col) => col.id));
    setSelectedTables((prev) => {
      const hasChanges =
        prev.size !== newTableIds.size ||
        ![...prev].every((id) => newTableIds.has(id));

      return hasChanges ? newTableIds : prev;
    });
  }, [arrayColumns, isLoading]);

  const handleNestedTablesChange = useCallback(
    (tableId: string, columns: typeof arrayColumns) => {
      setNestedTables((prev) => {
        const current = prev[tableId];
        // Solo actualizar si hay cambios
        if (JSON.stringify(current) !== JSON.stringify(columns)) {
          return { ...prev, [tableId]: columns };
        }
        return prev;
      });
    },
    []
  );

  if (isLoading) {
    // Skeleton para tablas secundarias
    return (
      <div className={`mt-8 space-y-6 ${level > 0 ? "ml-8" : ""}`}>
        <div className='flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50'>
          <div className='w-full flex items-center justify-between'>
            <div className='h-6 bg-muted rounded w-1/3 animate-pulse'></div>
            <div className='flex gap-4'>
              <div className='h-4 bg-muted rounded w-24 animate-pulse'></div>
              <div className='h-4 bg-muted rounded w-24 animate-pulse'></div>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center space-x-2'>
              <div className='h-4 w-4 bg-muted rounded animate-pulse'></div>
              <div className='h-4 bg-muted rounded w-32 animate-pulse'></div>
            </div>
          ))}
        </div>

        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className='h-6 bg-muted rounded w-1/2 animate-pulse'></div>
            </CardHeader>
            <CardContent>
              <div className='h-[300px] bg-muted/30 rounded animate-pulse'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!arrayColumns.length) return null;

  const marginClass = level > 0 ? "ml-8" : "";

  return (
    <div className={`mt-8 space-y-6 ${marginClass}`}>
      <div className='flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50'>
        <div className='w-full flex items-center justify-between'>
          <p className='font-medium'>
            {level === 0
              ? `Tablas secundarias disponibles (${
                  arrayColumns.length
                } tablas, ${arrayColumns.reduce(
                  (total, col) => total + col.data.length,
                  0
                )} registros totales):`
              : `Tablas relacionadas con ${parentId} (${
                  arrayColumns.length
                } tablas, ${arrayColumns.reduce(
                  (total, col) => total + col.data.length,
                  0
                )} registros totales):`}
          </p>
          <div className='flex gap-4'>
            <button
              className='text-sm text-muted-foreground hover:text-foreground'
              onClick={() =>
                setSelectedTables(new Set(arrayColumns.map((col) => col.id)))
              }
            >
              Seleccionar todas
            </button>
            <button
              className='text-sm text-muted-foreground hover:text-foreground'
              onClick={() => setSelectedTables(new Set())}
            >
              Deseleccionar todas
            </button>
          </div>
        </div>
        {arrayColumns.map(({ id, label, data }) => (
          <div key={id} className='flex items-center space-x-2'>
            <Checkbox
              id={`${parentId ? `${parentId}-` : ""}${id}`}
              checked={selectedTables.has(id)}
              onCheckedChange={(checked) => {
                setSelectedTables((prev) => {
                  const next = new Set(prev);
                  if (checked) {
                    next.add(id);
                  } else {
                    next.delete(id);
                  }
                  return next;
                });
              }}
            />
            <Label htmlFor={`${parentId ? `${parentId}-` : ""}${id}`}>
              {label}{" "}
              <span className='text-xs text-muted-foreground ml-1'>
                ({data.length} registros)
              </span>
            </Label>
          </div>
        ))}
      </div>

      {Array.from(selectedTables).map((tableId) => {
        const tableData = arrayColumns.find((col) => col.id === tableId);
        if (!tableData) return null;

        console.log("📑 Renderizando tabla secundaria:", {
          tableId,
          parentId,
          dataLength: tableData.data.length,
          firstItemParentId: tableData.data[0]?.__parentId,
        });

        return (
          <div key={tableId} id={tableId} className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  {tableData.parentTable ? (
                    <span className='flex items-center gap-2'>
                      <span className='text-muted-foreground flex items-center gap-1'>
                        {tableData.parentTable.name}
                        <Link2
                          className='h-3 w-3'
                          aria-label={`ID: ${String(
                            tableData.data[0]?.__parentId || ""
                          )}`}
                        />
                      </span>
                      <span className='text-muted-foreground'>/</span>
                      <span>
                        {tableData.label}
                        <span className='text-sm font-normal text-muted-foreground ml-2'>
                          ({tableData.data.length} registros)
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span>
                      {tableData.label}
                      <span className='text-sm font-normal text-muted-foreground ml-2'>
                        ({tableData.data.length} registros)
                      </span>
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JsonTable
                  data={tableData.data}
                  isSecondaryTable
                  isLoading={isLoading}
                  parentTableInfo={{
                    id: tableId,
                    name: tableData.label,
                  }}
                  onArrayColumnsChange={(columns) =>
                    handleNestedTablesChange(tableId, columns)
                  }
                />
              </CardContent>
            </Card>

            {nestedTables[tableId]?.length > 0 && (
              <SecondaryTables
                arrayColumns={nestedTables[tableId]}
                level={level + 1}
                parentId={String(tableData.data[0]?.__parentId || "")}
                isLoading={isLoading}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

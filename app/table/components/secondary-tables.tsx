"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JsonTable } from "../json-table";
import { Link2 } from "lucide-react";

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
}

export function SecondaryTables({
  arrayColumns,
  level = 0,
  parentId,
}: SecondaryTablesProps) {
  /* 
    Renderizado de tablas secundarias:
    - Nivel: ${level}
    - ID padre: ${parentId}
    - Número de columnas array: ${arrayColumns.length}
    - Columnas: ${arrayColumns.map((col) => ({
      id: col.id,
      label: col.label,
      dataLength: col.data.length,
      firstItemParentId: col.data[0]?.__parentId,
    }))}
  */

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

  // Nuevo state para filtrar por parentId
  const [selectedParentIds, setSelectedParentIds] = useState<
    Map<string, Set<string>>
  >(new Map());

  // Agrupar registros por parentId para cada tabla
  const parentIdsByTable = useMemo(() => {
    const result = new Map<string, Map<string, number>>();

    arrayColumns.forEach((column) => {
      const parentIdCounts = new Map<string, number>();

      // Contar ocurrencias de cada parentId
      column.data.forEach((item) => {
        if (item.__parentId) {
          const parentId = String(item.__parentId);
          parentIdCounts.set(parentId, (parentIdCounts.get(parentId) || 0) + 1);
        }
      });

      result.set(column.id, parentIdCounts);
    });

    return result;
  }, [arrayColumns]);

  // Actualizar selección cuando cambian las columnas
  useEffect(() => {
    const newTableIds = new Set(arrayColumns.map((col) => col.id));
    setSelectedTables((prev) => {
      const hasChanges =
        prev.size !== newTableIds.size ||
        ![...prev].every((id) => newTableIds.has(id));

      return hasChanges ? newTableIds : prev;
    });

    // Inicializar selectedParentIds para todas las tablas
    const newSelectedParentIds = new Map<string, Set<string>>();
    arrayColumns.forEach((column) => {
      const parentIds = new Set<string>();
      column.data.forEach((item) => {
        if (item.__parentId) {
          parentIds.add(String(item.__parentId));
        }
      });
      newSelectedParentIds.set(column.id, parentIds);
    });
    setSelectedParentIds(newSelectedParentIds);
  }, [arrayColumns]);

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

  // Filtrar datos según los parentIds seleccionados
  const getFilteredTableData = useCallback(
    (tableId: string, data: Record<string, unknown>[]) => {
      const selectedIds = selectedParentIds.get(tableId);
      if (!selectedIds || selectedIds.size === 0) return data;

      return data.filter((item) => {
        if (item.__parentId) {
          return selectedIds.has(String(item.__parentId));
        }
        return false;
      });
    },
    [selectedParentIds]
  );

  if (!arrayColumns.length) return null;

  const marginClass = level > 0 ? "ml-8" : "";

  return (
    <div className={`mt-8 space-y-6 ${marginClass}`}>
      <div className='flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50'>
        <div className='w-full flex items-center justify-between'>
          <p className='font-medium'>
            {level === 0
              ? "Tablas secundarias disponibles:"
              : `Tablas relacionadas con ${parentId}:`}
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
            <Label
              htmlFor={`${parentId ? `${parentId}-` : ""}${id}`}
              className='flex items-center gap-2'
            >
              {label}
              <span className='text-xs text-muted-foreground'>
                ({data.length} registros)
              </span>
            </Label>
          </div>
        ))}
      </div>

      {Array.from(selectedTables).map((tableId) => {
        const tableData = arrayColumns.find((col) => col.id === tableId);
        if (!tableData) return null;

        const filteredData = getFilteredTableData(tableId, tableData.data);
        const parentIdCounts = parentIdsByTable.get(tableId);
        const hasMultipleParents = parentIdCounts && parentIdCounts.size > 1;

        return (
          <div key={tableId} id={tableId} className='space-y-4'>
            <Card>
              <CardHeader className='border-b'>
                <CardTitle className='text-base'>
                  {tableData.parentTable ? (
                    <span className='flex items-center gap-2'>
                      <span className='text-muted-foreground flex items-center gap-1'>
                        {tableData.parentTable.name}
                        <Link2 className='h-3 w-3' />
                      </span>
                      <span className='text-muted-foreground'>/</span>
                      <span className='font-medium'>{tableData.label}</span>
                    </span>
                  ) : (
                    <span className='font-medium'>{tableData.label}</span>
                  )}
                </CardTitle>
                <div className='text-xs text-muted-foreground mt-1'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span>Tabla padre:</span>
                      <span className='font-mono bg-muted px-1 py-0.5 rounded'>
                        {tableData.parentTable
                          ? tableData.parentTable.name
                          : "Raíz"}
                      </span>
                    </div>

                    {hasMultipleParents && (
                      <div className='mt-2'>
                        <div className='text-sm font-medium mb-1'>
                          Filtrar por ID padre:
                        </div>
                        <div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1'>
                          {Array.from(parentIdCounts?.entries() || []).map(
                            ([pid, count]) => {
                              const isSelected =
                                selectedParentIds.get(tableId)?.has(pid) ||
                                false;
                              return (
                                <div
                                  key={pid}
                                  className={`px-2 py-1 rounded text-xs cursor-pointer flex items-center gap-1 
                                  ${
                                    isSelected
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted hover:bg-muted/80"
                                  }`}
                                  onClick={() => {
                                    setSelectedParentIds((prev) => {
                                      const newMap = new Map(prev);
                                      const currentSet = new Set(
                                        newMap.get(tableId) || []
                                      );

                                      if (currentSet.has(pid)) {
                                        currentSet.delete(pid);
                                      } else {
                                        currentSet.add(pid);
                                      }

                                      if (currentSet.size === 0) {
                                        // Si no hay selección, seleccionar todos
                                        parentIdCounts?.forEach((_, key) =>
                                          currentSet.add(key)
                                        );
                                      }

                                      newMap.set(tableId, currentSet);
                                      return newMap;
                                    });
                                  }}
                                >
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full 
                                  ${
                                    isSelected
                                      ? "bg-primary"
                                      : "bg-muted-foreground"
                                  }`}
                                  ></span>
                                  <span className='font-mono'>
                                    {pid.substring(0, 8)}...
                                  </span>
                                  <span>({count})</span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <JsonTable
                  data={filteredData}
                  isSecondaryTable
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
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

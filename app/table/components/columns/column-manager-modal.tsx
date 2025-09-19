"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Table } from "@tanstack/react-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
}: ColumnManagerModalProps<TData>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [columns, setColumns] = useState<ColumnInfo[]>([]);

  // Función para obtener columna de la tabla
  const getColumn = (columnId: string) =>
    table.getAllLeafColumns().find((col) => col.id === columnId);

  // Debug: Log state changes
  console.log("🔍 ColumnManager State:", {
    useFixedColumn,
    fixedColumnId,
    selectValue: useFixedColumn ? fixedColumnId || "index" : "none",
    indexVisible: getColumn("index")?.getIsVisible(),
    indexDisabled: useFixedColumn && !fixedColumnId,
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

    const indexColumn = allColumns.find((col) => col.id === "index");
    const fixedColumn = allColumns.find((col) => col.id === fixedColumnId);
    const otherColumns = allColumns.filter(
      (col) =>
        col.id !== "index" &&
        col.id !== "actions" &&
        col.id !== fixedColumnId &&
        typeof col.accessorFn !== "undefined" &&
        col.getCanHide()
    );

    const orderedColumns = [
      ...(indexColumn ? [getColumnInfo(indexColumn.id)] : []),
      ...(fixedColumn ? [getColumnInfo(fixedColumn.id)] : []),
      ...otherColumns.map((col) => getColumnInfo(col.id)),
    ];

    setColumns(orderedColumns);

    // Ya no forzamos la visibilidad del index - el usuario tiene control total
  }, [table, fixedColumnId, useFixedColumn]);

  const filteredColumns = columns.filter((column) =>
    column.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='ml-auto'>
          <Settings className='h-4 w-4 mr-2' />
          Gestionar Columnas
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] w-[90vw]'>
        <DialogHeader>
          <DialogTitle>Gestionar Columnas</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <div className='space-y-4'>
            <div className='rounded-lg border p-4 space-y-4'>
              <div className='space-y-2'>
                <span className='font-medium'>Columna fija</span>
                <span className='text-sm text-muted-foreground'>
                  Selecciona qué columna mantener fija a la izquierda
                </span>
                <Select
                  value={useFixedColumn ? fixedColumnId || "index" : "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      onFixedColumnIdChange(null);
                      onFixedColumnChange(false);
                    } else if (value === "index") {
                      onFixedColumnIdChange(null);
                      onFixedColumnChange(true);
                    } else {
                      onFixedColumnIdChange(value);
                      onFixedColumnChange(true);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona una columna' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground'>—</span>
                        Ninguna
                      </div>
                    </SelectItem>
                    {/* Solo mostrar index si está visible */}
                    {(() => {
                      const indexColumn = getColumn("index");
                      return indexColumn && indexColumn.getIsVisible() ? (
                        <SelectItem value='index'>
                          <div className='flex items-center gap-2'>
                            <TypeDot type='número entero' />
                            index (por defecto)
                          </div>
                        </SelectItem>
                      ) : null;
                    })()}
                    {/* Solo mostrar columnas que están visibles */}
                    {columns
                      .filter((column) => {
                        if (column.id === "index" || column.id === "actions")
                          return false;
                        const tableColumn = getColumn(column.id);
                        return tableColumn && tableColumn.getIsVisible();
                      })
                      .map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          <div className='flex items-center gap-2'>
                            <TypeDot type={column.type} />
                            {column.id}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Input
              placeholder='Buscar columnas...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='mb-4'
            />

            <div className='border rounded-md'>
              <div className='grid grid-cols-[minmax(200px,1fr),200px] items-center gap-4 p-4 border-b bg-muted/50'>
                <div className='font-medium'>Columna</div>
                <div className='text-right font-medium'>Visible Ordenar</div>
              </div>
              <div className='max-h-[60vh] overflow-auto'>
                {filteredColumns.map((column, index) => {
                  const tableColumn = getColumn(column.id);
                  if (!tableColumn) return null;

                  return (
                    <div
                      key={column.id}
                      className={`grid grid-cols-[minmax(200px,1fr),auto] items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50 ${
                        (column.id === fixedColumnId && useFixedColumn) ||
                        (column.id === "index" &&
                          useFixedColumn &&
                          !fixedColumnId)
                          ? "bg-muted"
                          : ""
                      }`}
                    >
                      <div className='flex items-center gap-2 min-w-0'>
                        <TypeDot type={column.type} />
                        <span className='truncate'>{column.id}</span>
                        {((column.id === fixedColumnId && useFixedColumn) ||
                          (column.id === "index" &&
                            useFixedColumn &&
                            !fixedColumnId)) && (
                          <span className='text-xs text-muted-foreground'>
                            (Columna Fija)
                          </span>
                        )}
                        <span className='text-sm text-muted-foreground whitespace-nowrap'>
                          {index} de {filteredColumns.length - 1}
                        </span>
                      </div>
                      <div className='flex items-center justify-end gap-2'>
                        <Switch
                          checked={tableColumn.getIsVisible()}
                          onCheckedChange={(value) => {
                            console.log("🔄 Toggle clicked:", {
                              column: column.id,
                              newValue: value,
                              useFixedColumn,
                              fixedColumnId,
                              isIndexFixed:
                                column.id === "index" &&
                                useFixedColumn &&
                                !fixedColumnId,
                              isCustomFixed:
                                column.id === fixedColumnId && useFixedColumn,
                              canHide: tableColumn.getCanHide(),
                            });

                            // Verificar si la columna puede ser ocultada
                            if (!tableColumn.getCanHide()) {
                              console.log(
                                "⚠️ Column cannot be hidden:",
                                column.id
                              );
                              return;
                            }

                            tableColumn.toggleVisibility(!!value);

                            // Si se desactiva una columna que está actualmente fija
                            if (!value) {
                              if (
                                column.id === "index" &&
                                useFixedColumn &&
                                !fixedColumnId
                              ) {
                                // Si se desactiva index siendo la columna fija por defecto
                                console.log(
                                  "📌 Index fixed -> changing to none"
                                );
                                onFixedColumnIdChange(null);
                                onFixedColumnChange(false);
                              } else if (
                                column.id === fixedColumnId &&
                                useFixedColumn
                              ) {
                                // Si se desactiva una columna personalizada que es fija
                                console.log(
                                  "📌 Custom fixed column -> fallback logic"
                                );
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
                          }}
                          disabled={
                            !tableColumn.getCanHide() ||
                            (column.id === fixedColumnId && useFixedColumn)
                          }
                          className={
                            !tableColumn.getCanHide() ||
                            (column.id === fixedColumnId && useFixedColumn)
                              ? "opacity-50"
                              : ""
                          }
                        />
                        <div className='flex items-center gap-0.5'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                                disabled={
                                  index <= 1 ||
                                  (column.id === fixedColumnId &&
                                    useFixedColumn)
                                }
                              >
                                <ChevronsUp className='h-4 w-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='p-2'>
                              <p>Mover &quot;{column.id}&quot; al inicio</p>
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                                disabled={
                                  index <= 1 ||
                                  (column.id === fixedColumnId &&
                                    useFixedColumn)
                                }
                              >
                                <ChevronUp className='h-4 w-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='p-2'>
                              <p>Mover &quot;{column.id}&quot; arriba</p>
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                                disabled={
                                  index >= filteredColumns.length - 1 ||
                                  (column.id === fixedColumnId &&
                                    useFixedColumn)
                                }
                              >
                                <ChevronDown className='h-4 w-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='p-2'>
                              <p>Mover &quot;{column.id}&quot; abajo</p>
                            </PopoverContent>
                          </Popover>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                                disabled={
                                  index >= filteredColumns.length - 1 ||
                                  (column.id === fixedColumnId &&
                                    useFixedColumn)
                                }
                              >
                                <ChevronsDown className='h-4 w-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='p-2'>
                              <p>Mover &quot;{column.id}&quot; al final</p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

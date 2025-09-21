"use client";

import { Table } from "@tanstack/react-table";
import { TableSearch } from "./table-search";
import { FilterCombobox } from "../filters/filter-combobox";
import { Button } from "@/components/ui/button";
import { Download, FileJson } from "lucide-react";
import { cleanProcessedData, convertToCSV } from "../../utils/export-utils";
import { ColumnManagerModal } from "../columns/column-manager-modal";
import type { ProcessedRow } from "../../data-processor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableToolbarProps {
  table: Table<ProcessedRow>;
  searchPlaceholder?: string;
  // La configuración actual para ViewsToolbar
  currentConfig?: Record<string, unknown>;
  // Callback para cuando se carga una vista guardada
  onLoadView?: (config: Record<string, unknown>) => void;
  // Propiedades para exportación con datos procesados
  processedData?: ProcessedRow[];
  downloadFile?: (content: string, fileName: string, mimeType: string) => void;
  // Propiedades para ColumnManagerModal
  useFixedColumn?: boolean;
  onFixedColumnChange?: (value: boolean) => void;
  fixedColumnId?: string | null;
  onFixedColumnIdChange?: (id: string | null) => void;
  originalColumnOrder?: string[];
  onColumnOrderChange?: (newOrder: string[]) => void;
  onSaveAsDefault?: () => void;
}

export function TableToolbar({
  table,
  searchPlaceholder = "Buscar en todas las columnas...",
  currentConfig = {},
  onLoadView = () => {},
  processedData = [],
  downloadFile,
  useFixedColumn = false,
  onFixedColumnChange = () => {},
  fixedColumnId = null,
  onFixedColumnIdChange = () => {},
  originalColumnOrder = [],
  onColumnOrderChange,
  onSaveAsDefault,
}: TableToolbarProps) {
  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-center py-4 gap-3'>
      <div className='flex-1 w-full md:w-auto'>
        <TableSearch table={table} placeholder={searchPlaceholder} />
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        {/* Componente unificado para filtros */}
        <FilterCombobox currentConfig={currentConfig} onLoadView={onLoadView} />

        {/* Modal de gestión de columnas */}
        <ColumnManagerModal
          table={table}
          useFixedColumn={useFixedColumn}
          onFixedColumnChange={onFixedColumnChange}
          fixedColumnId={fixedColumnId}
          onFixedColumnIdChange={onFixedColumnIdChange}
          originalColumnOrder={originalColumnOrder}
          onColumnOrderChange={onColumnOrderChange}
          onSaveAsDefault={onSaveAsDefault}
        />

        {/* Botón de exportación unificado */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2'>
              <Download className='h-4 w-4' />
              <span>Exportar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[160px]'>
            <DropdownMenuItem
              onClick={() => {
                if (!downloadFile) {
                  console.warn("downloadFile function not provided");
                  return;
                }

                // Obtener solo las filas filtradas de la tabla
                const filteredRows = table.getFilteredRowModel().rows;

                console.log("📊 Exportando JSON filtrado:", {
                  totalRows: processedData.length,
                  filteredRows: filteredRows.length,
                  hasFilters:
                    Object.keys(table.getState().columnFilters).length > 0,
                });

                // Limpiar los datos filtrados antes de exportar
                const cleanedData = cleanProcessedData(
                  filteredRows.map((row) => row.original) as Record<
                    string,
                    any
                  >[]
                );

                const jsonData = JSON.stringify(cleanedData, null, 2);

                // Crear nombre de archivo dinámico
                const hasActiveFilters =
                  Object.keys(table.getState().columnFilters).length > 0;
                const fileName = hasActiveFilters
                  ? `datos_filtrados_${filteredRows.length}_registros.json`
                  : `datos_${filteredRows.length}_registros.json`;

                downloadFile(jsonData, fileName, "application/json");
              }}
              className='gap-2'
            >
              <FileJson className='h-4 w-4' />
              Exportar a JSON
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                if (!downloadFile) {
                  console.warn("downloadFile function not provided");
                  return;
                }

                // Obtener solo las filas filtradas de la tabla
                const filteredRows = table.getFilteredRowModel().rows;

                console.log("📊 Exportando CSV filtrado:", {
                  totalRows: processedData.length,
                  filteredRows: filteredRows.length,
                  hasFilters:
                    Object.keys(table.getState().columnFilters).length > 0,
                });

                // Convertir las filas filtradas a formato para export
                const dataToExport = filteredRows.map((row) => row.original);
                const csvData = convertToCSV(
                  dataToExport as Record<string, unknown>[]
                );

                // Crear nombre de archivo dinámico
                const hasActiveFilters =
                  Object.keys(table.getState().columnFilters).length > 0;
                const fileName = hasActiveFilters
                  ? `datos_filtrados_${filteredRows.length}_registros.csv`
                  : `datos_${filteredRows.length}_registros.csv`;

                downloadFile(csvData, fileName, "text/csv;charset=utf-8;");
              }}
              className='gap-2'
            >
              <Download className='h-4 w-4' />
              Exportar a CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

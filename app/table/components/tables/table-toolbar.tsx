"use client";

import { Table } from "@tanstack/react-table";
import { TableSearch } from "./table-search";
import ViewsToolbar from "../views/views-toolbar";
import { Button } from "@/components/ui/button";
import { Download, FileJson } from "lucide-react";

interface TableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  // La configuración actual para ViewsToolbar
  currentConfig?: Record<string, unknown>;
  // Callback para cuando se carga una vista guardada
  onLoadView?: (config: Record<string, unknown>) => void;
}

export function TableToolbar<TData>({
  table,
  searchPlaceholder = "Buscar en todas las columnas...",
  onExportJSON,
  onExportCSV,
  currentConfig = {},
  onLoadView = () => {},
}: TableToolbarProps<TData>) {
  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-center py-4 gap-3'>
      <div className='flex-1 w-full md:w-auto'>
        <TableSearch table={table} placeholder={searchPlaceholder} />
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        {/* Componente para guardar y cargar vistas */}
        <ViewsToolbar currentConfig={currentConfig} onLoadView={onLoadView} />

        {/* Botones de exportación */}
        <div className='flex items-center gap-2'>
          {onExportJSON && (
            <Button
              variant='outline'
              size='sm'
              onClick={onExportJSON}
              className='gap-2'
            >
              <FileJson className='h-4 w-4' />
              <span>JSON</span>
            </Button>
          )}

          {onExportCSV && (
            <Button
              variant='outline'
              size='sm'
              onClick={onExportCSV}
              className='gap-2'
            >
              <Download className='h-4 w-4' />
              <span>CSV</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

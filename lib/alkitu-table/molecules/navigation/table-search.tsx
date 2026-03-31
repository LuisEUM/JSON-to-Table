"use client";

import { Input } from "@/components/primitives/ui/input";
import { Search, X } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { logger } from "../../core/services/logging-service";

export interface TableSearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
}

export function TableSearch<TData>({
  table,
  placeholder = "Buscar...",
}: TableSearchProps<TData>) {
  const [searchValue, setSearchValue] = useState("");

  // Sincronizar con el estado global de la tabla
  useEffect(() => {
    setSearchValue(table.getState().globalFilter ?? "");
  }, [table]);

  // Usar debounce para mejorar el rendimiento
  const debouncedValue = useDebounce(searchValue, 300);

  // Aplicar el filtro cuando cambie el valor debounced
  useEffect(() => {
    logger.debug("Valor de busqueda:", debouncedValue);
    table.setGlobalFilter(debouncedValue);
  }, [debouncedValue, table]);

  return (
    <div className='relative w-full md:w-80' role='search'>
      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          logger.debug("Input value changed:", e.target.value);
        }}
        className='w-full pl-8 pr-10'
      />
      {searchValue && (
        <button
          onClick={() => setSearchValue("")}
          className='absolute right-2 top-2.5 text-muted-foreground hover:text-foreground'
          aria-label='Limpiar búsqueda'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}

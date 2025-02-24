"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface TableSearchProps<TData> {
  table: Table<TData>;
}

export function TableSearch<TData>({ table }: TableSearchProps<TData>) {
  const [value, setValue] = useState("");

  // Sincronizar con el estado global de la tabla
  useEffect(() => {
    setValue(table.getState().globalFilter ?? "");
  }, [table]);

  // Usar debounce para mejorar el rendimiento
  const debouncedValue = useDebounce(value, 300);

  // Aplicar el filtro cuando cambie el valor debounced
  useEffect(() => {
    console.log("Valor de búsqueda:", debouncedValue); // Para debugging
    table.setGlobalFilter(debouncedValue);
  }, [debouncedValue, table]);

  return (
    <div className='relative'>
      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
      <Input
        placeholder='Buscar...'
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          console.log("Input value changed:", e.target.value); // Para debugging
        }}
        className='pl-8'
      />
    </div>
  );
}

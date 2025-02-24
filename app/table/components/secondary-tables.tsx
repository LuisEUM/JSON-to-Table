"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JsonTable } from "../json-table";

interface SecondaryTablesProps {
  arrayColumns: {
    id: string;
    label: string;
    data: Record<string, unknown>[];
  }[];
}

export function SecondaryTables({ arrayColumns }: SecondaryTablesProps) {
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());

  // Inicializar con todas las tablas seleccionadas
  useEffect(() => {
    const allTableIds = new Set(arrayColumns.map((col) => col.id));
    setSelectedTables(allTableIds);
  }, [arrayColumns]);

  if (!arrayColumns.length) return null;

  return (
    <div className='mt-8 space-y-6'>
      <div className='flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50'>
        <div className='w-full flex items-center justify-between'>
          <p className='font-medium'>Tablas secundarias disponibles:</p>
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
        {arrayColumns.map(({ id, label }) => (
          <div key={id} className='flex items-center space-x-2'>
            <Checkbox
              id={id}
              checked={selectedTables.has(id)}
              onCheckedChange={(checked) => {
                const newSelection = new Set(selectedTables);
                checked ? newSelection.add(id) : newSelection.delete(id);
                setSelectedTables(newSelection);
              }}
            />
            <Label htmlFor={id}>{label}</Label>
          </div>
        ))}
      </div>

      {Array.from(selectedTables).map((tableId) => {
        const tableData = arrayColumns.find((col) => col.id === tableId);
        if (!tableData) return null;

        return (
          <Card key={tableId}>
            <CardHeader>
              <CardTitle className='text-base'>{tableData.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonTable data={tableData.data} isSecondaryTable />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

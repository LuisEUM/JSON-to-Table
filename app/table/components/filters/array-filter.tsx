"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import type { FilterComponentProps, } from "./filter-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";

interface ArrayItem {
  cursoId?: string;
  titulo?: string;
  fechaInscripcion?: number;
  estado?: string;
  [key: string]: unknown;
}

export function ArrayFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  uniqueValues,
  arrayType,
}: FilterComponentProps & { arrayType?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(
    (initialValue?.value as string[]) || []
  );

  // Extraer todos los objetos únicos de los arrays
  const allUniqueItems = uniqueValues.reduce<ArrayItem[]>((acc, option) => {
    const arrayValue = option.original as { value: ArrayItem[] };
    if (Array.isArray(arrayValue?.value)) {
      arrayValue.value.forEach((item) => {
        if (
          !acc.some(
            (existing) => JSON.stringify(existing) === JSON.stringify(item)
          )
        ) {
          acc.push(item);
        }
      });
    }
    return acc;
  }, []);

  const filteredItems = allUniqueItems
    .filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));

  const handleApply = () => {
    onApply({
      field: columnId,
      operator: "in",
      value: selectedValues,
    });
    onClose();
  };

  const renderItemContent = (item: ArrayItem) => {
    return (
      <div className='space-y-1'>
        <div className='font-medium'>{item.titulo}</div>
        <div className='text-xs text-muted-foreground space-x-2'>
          <span>ID: {item.cursoId}</span>
          <span>•</span>
          <span>Estado: {item.estado}</span>
          <span>•</span>
          <span>
            Fecha: {new Date(item.fechaInscripcion || 0).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para array de tipo:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeColor(arrayType || "unknown").split(" ")[0]
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-grow flex flex-col'>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar valores...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>

        <ScrollArea className='flex-grow border rounded-md bg-muted/30 p-2'>
          <div className='space-y-2'>
            {filteredItems.map((item) => {
              const itemString = JSON.stringify(item);
              return (
                <div
                  key={itemString}
                  className='flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md'
                >
                  <Checkbox
                    id={itemString}
                    checked={selectedValues.includes(itemString)}
                    onCheckedChange={(checked) => {
                      setSelectedValues(
                        checked
                          ? [...selectedValues, itemString]
                          : selectedValues.filter((v) => v !== itemString)
                      );
                    }}
                    className='mt-1'
                  />
                  <label
                    htmlFor={itemString}
                    className='flex-grow cursor-pointer'
                  >
                    {renderItemContent(item)}
                  </label>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className='pt-2 text-sm text-muted-foreground'>
          {selectedValues.length} de {allUniqueItems.length} seleccionados
        </div>
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

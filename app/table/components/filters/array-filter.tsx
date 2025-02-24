"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import type { FilterComponentProps, FilterValue } from "./filter-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";

interface FilterItem {
  value: unknown;
  count: number;
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
  const [selectedValues, setSelectedValues] = useState<FilterValue[]>(
    (initialValue?.value as FilterValue[]) || []
  );

  // Extraer valores únicos de los arrays y contar ocurrencias
  const allUniqueValues = uniqueValues.reduce<Map<unknown, number>>(
    (acc, option) => {
      const arrayValue = option.original as { value: unknown[] };
      if (Array.isArray(arrayValue?.value)) {
        arrayValue.value.forEach((item) => {
          // Si el item es un objeto, procesamos cada propiedad
          if (typeof item === "object" && item !== null) {
            Object.entries(item).forEach(([key, value]) => {
              const valueWithKey = `${key}: ${value}`;
              acc.set(valueWithKey, (acc.get(valueWithKey) || 0) + 1);
            });
          } else {
            // Si no es un objeto, usamos el valor directamente
            acc.set(item, (acc.get(item) || 0) + 1);
          }
        });
      }
      return acc;
    },
    new Map()
  );

  const filteredValues = Array.from(allUniqueValues.entries())
    .map(([value, count]): FilterItem => ({ value, count }))
    .filter((item) =>
      String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => String(a.value).localeCompare(String(b.value)));

  const handleApply = () => {
    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: selectedValues as FilterValue[],
    });
    onClose();
  };

  const formatValue = (value: unknown): string => {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
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

        <ScrollArea className='flex-grow border rounded-md bg-muted/30 p-2 max-h-[100px] overflow-auto'>
          <div className='space-y-2'>
            {filteredValues.map(({ value, count }) => {
              const valueString = formatValue(value);
              return (
                <div
                  key={valueString}
                  className='flex items-center justify-between p-2 hover:bg-muted/50 rounded-md '
                >
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id={valueString}
                      checked={selectedValues.includes(value as FilterValue)}
                      onCheckedChange={(checked) => {
                        setSelectedValues(
                          checked
                            ? [...selectedValues, value as FilterValue]
                            : selectedValues.filter((v) => v !== value)
                        );
                      }}
                    />
                    <label
                      htmlFor={valueString}
                      className='cursor-pointer text-sm'
                    >
                      {valueString}
                    </label>
                  </div>
                  <span className='text-sm text-muted-foreground'>{count}</span>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className='pt-2 text-sm text-muted-foreground'>
          {selectedValues.length} de {allUniqueValues.size} seleccionados
        </div>
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}


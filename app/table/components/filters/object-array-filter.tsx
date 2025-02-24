"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import type { FilterComponentProps, FilterValue } from "./filter-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";
import { TypeDot } from "../type-dot";
import { processValue } from "../../data-processor";

interface FilterItem {
  value: unknown;
  count: number;
  type?: string;
  isDisabled?: boolean;
}

export function ObjectArrayFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnType,
  uniqueValues,
}: FilterComponentProps) {
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
          // Procesar el item para obtener su valor real y tipo
          const processedItem = processValue(item, columnId);
          const displayValue =
            processedItem.type === "boolean"
              ? processedItem.value
                ? "1"
                : "0"
              : processedItem.value;

          acc.set(displayValue, (acc.get(displayValue) || 0) + 1);
        });
      }
      return acc;
    },
    new Map()
  );

  const filteredValues = Array.from(allUniqueValues.entries())
    .map(([value, count]): FilterItem => {
      const processedValue = processValue(value, columnId);
      return {
        value,
        count,
        type: processedValue.type,
        isDisabled: value === undefined || value === null,
      };
    })
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
              getTypeColor(columnType || "unknown").dot
            }`}
          />
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

        <div className='flex-grow space-y-6'>
          <ScrollArea className='flex-1'>
            <div className='space-y-2'>
              {filteredValues.map(({ value, count, type, isDisabled }) => {
                const valueString = formatValue(value);
                return (
                  <div
                    key={valueString}
                    className={`flex items-center space-x-2 px-2 py-1.5 hover:bg-muted/50 rounded-sm ${
                      isDisabled ? "opacity-50" : ""
                    }`}
                  >
                    <div className='flex items-center justify-between w-full'>
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
                        disabled={isDisabled}
                        aria-label={
                          isDisabled ? "Valor no filtrable" : undefined
                        }
                      />
                      <label
                        htmlFor={valueString}
                        className={`cursor-pointer text-sm flex-1 flex items-center gap-2 ml-2 ${
                          isDisabled ? "italic" : ""
                        }`}
                      >
                        <TypeDot type={type || "unknown"} />
                        <span>{valueString}</span>
                        <span className='text-xs text-muted-foreground'>
                          ({count})
                        </span>
                        {isDisabled && <span>(no filtrable)</span>}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className='pt-2 text-sm text-muted-foreground'>
          {selectedValues.length} de {allUniqueValues.size} seleccionados
        </div>
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

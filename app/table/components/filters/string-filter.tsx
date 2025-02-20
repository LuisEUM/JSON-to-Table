"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import type { FilterComponentProps } from "./filter-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";

export function StringFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  columnType,
  uniqueValues,
}: FilterComponentProps) {
  const [search, setSearch] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(initialValue?.value)
      ? initialValue.value.map(String).filter(Boolean)
      : []
  );

  const filteredOptions = uniqueValues.filter((option) =>
    option.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = () => {
    setSelectedValues(filteredOptions.map((option) => option.value));
  };

  const handleClearSelection = () => {
    setSelectedValues([]);
  };

  const handleToggle = (value: string) => {
    setSelectedValues((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  };

  const handleApply = () => {
    if (selectedValues.length === 0) {
      onClear();
    } else {
      onApply({
        field: columnId,
        operator: "in",
        value: selectedValues,
      });
    }
    onClose();
  };

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeColor(columnType).split(" ")[0]
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-8'
          />
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <Button variant='outline' size='sm' onClick={handleSelectAll}>
            Seleccionar todo
          </Button>
          <Button variant='outline' size='sm' onClick={handleClearSelection}>
            Limpiar
          </Button>
        </div>

        <ScrollArea className='flex-grow border rounded-md bg-muted/30 p-2'>
          <div className='space-y-2'>
            {filteredOptions.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                className='flex items-center justify-between'
              >
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={() => handleToggle(option.value)}
                  />
                  <label className='text-sm'>{option.value}</label>
                </div>
                <span className='text-sm text-muted-foreground'>
                  {option.count}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className='pt-2 text-sm text-muted-foreground'>
          {selectedValues.length} de {uniqueValues.length} seleccionados
        </div>
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

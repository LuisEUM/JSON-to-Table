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
import { TypeDot } from "../type-dot";

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
      ? initialValue.value
          .map((v) =>
            typeof v === "boolean" ? (v ? "verdadero" : "falso") : String(v)
          )
          .filter(Boolean)
          .filter((v) => v !== "undefined")
      : []
  );

  const filteredOptions = uniqueValues
    .map((option) => ({
      ...option,
      value:
        option.value === undefined
          ? "undefined"
          : typeof option.value === "boolean"
          ? option.value
            ? "verdadero"
            : "falso"
          : String(option.value),
      isDisabled: option.value === undefined || option.value === null,
    }))
    .filter((option) =>
      option.value.toLowerCase().includes(search.toLowerCase())
    );

  const handleSelectAll = () => {
    setSelectedValues(
      filteredOptions
        .filter((option) => !option.isDisabled && option.value !== "undefined")
        .map((option) => option.value)
    );
  };

  const handleClearSelection = () => {
    setSelectedValues([]);
  };

  const handleToggle = (value: string) => {
    setSelectedValues((current) =>
      current.includes(value) && value !== "undefined"
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  };

  const handleApply = () => {
    onApply({
      field: columnId,
      operator: "in",
      value: selectedValues,
    });
    onClose();
  };

  const typeColors = getTypeColor(columnType);

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium flex items-center gap-2'>
          <TypeDot type={columnType} />
          <span>Filtro para {columnName}</span>
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

        <ScrollArea
          className={`flex-grow border rounded-md ${typeColors.bg} bg-opacity-30 p-2`}
        >
          <div className='space-y-2'>
            {filteredOptions.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                className={`flex items-center justify-between ${
                  option.isDisabled ? "opacity-50" : ""
                }`}
              >
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    checked={
                      option.value !== "undefined" &&
                      selectedValues.includes(option.value)
                    }
                    onCheckedChange={() => handleToggle(option.value)}
                    disabled={option.isDisabled || option.value === "undefined"}
                    aria-label={
                      option.isDisabled || option.value === "undefined"
                        ? "Valor no filtrable"
                        : undefined
                    }
                  />
                  <label
                    className={`text-sm ${typeColors.text} ${
                      option.isDisabled || option.value === "undefined"
                        ? "italic"
                        : ""
                    }`}
                  >
                    {option.value}
                    {(option.isDisabled || option.value === "undefined") &&
                      " (no filtrable)"}
                  </label>
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

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";
import { TypeDot } from "../../atoms/indicators/TypeDot";

// Tipos para los filtros embebidos
interface EmbeddedFilterProps {
  values: Array<{
    value: unknown;
    count: number;
    original: any;
  }>;
  selectedValues: unknown[];
  onSelectionChange: (values: unknown[]) => void;
  columnType: string;
}

// Filtro embebido para strings
export function EmbeddedStringFilter({
  values,
  selectedValues,
  onSelectionChange,
  columnType,
}: EmbeddedFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredValues = values.filter((item) =>
    String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (value: unknown, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    }
  };

  const selectAll = () => {
    const allValues = filteredValues.map((item) => item.value);
    const newSelection = [...selectedValues];

    allValues.forEach((value) => {
      if (!newSelection.includes(value)) {
        newSelection.push(value);
      }
    });

    onSelectionChange(newSelection);
  };

  const clearAll = () => {
    const valuesToRemove = filteredValues.map((item) => item.value);
    onSelectionChange(
      selectedValues.filter((v) => !valuesToRemove.includes(v))
    );
  };

  return (
    <div className='space-y-3'>
      {/* Búsqueda */}
      <div className='relative'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Buscar valores de texto...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-8 h-8'
        />
      </div>

      {/* Acciones rápidas */}
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={selectAll}
          className='h-7 text-xs'
        >
          Seleccionar todos
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={clearAll}
          className='h-7 text-xs'
        >
          Limpiar
        </Button>
      </div>

      {/* Lista de valores */}
      <ScrollArea className='h-[200px] w-full rounded-md border'>
        <div className='p-2 space-y-1'>
          {filteredValues.map((item, index) => {
            const isSelected = selectedValues.includes(item.value);
            const valueString = String(item.value);

            return (
              <div
                key={`${valueString}-${index}`}
                className='flex items-center space-x-2 p-1 hover:bg-muted/50 rounded-sm'
              >
                <Checkbox
                  id={`string-${index}`}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(item.value, !!checked)
                  }
                  className='flex-shrink-0'
                />
                <label
                  htmlFor={`string-${index}`}
                  className='cursor-pointer text-xs flex-1 flex items-center justify-between'
                >
                  <span className='truncate max-w-[150px]' title={valueString}>
                    {valueString || "(vacío)"}
                  </span>
                  <span className='text-muted-foreground'>({item.count})</span>
                </label>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className='text-xs text-muted-foreground'>
        {
          selectedValues.filter((v) =>
            filteredValues.some((item) => item.value === v)
          ).length
        }{" "}
        de {filteredValues.length} seleccionados
      </div>
    </div>
  );
}

// Filtro embebido para números
export function EmbeddedNumberFilter({
  values,
  selectedValues,
  onSelectionChange,
}: EmbeddedFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [rangeMode, setRangeMode] = useState(false);
  const [minValue, setMinValue] = useState<number | undefined>();
  const [maxValue, setMaxValue] = useState<number | undefined>();

  const numbers = values
    .map((item) => Number(item.value))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  const filteredValues = values.filter((item) => {
    const searchMatch = String(item.value)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (rangeMode && minValue !== undefined && maxValue !== undefined) {
      const numValue = Number(item.value);
      return searchMatch && numValue >= minValue && numValue <= maxValue;
    }

    return searchMatch;
  });

  const handleCheckboxChange = (value: unknown, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    }
  };

  const applyRange = () => {
    if (minValue !== undefined && maxValue !== undefined) {
      const rangeValues = numbers.filter((n) => n >= minValue && n <= maxValue);
      const newSelection = [...selectedValues];

      rangeValues.forEach((value) => {
        if (!newSelection.includes(value)) {
          newSelection.push(value);
        }
      });

      onSelectionChange(newSelection);
    }
  };

  return (
    <div className='space-y-3'>
      {/* Toggle modo rango */}
      <div className='flex items-center space-x-2'>
        <Switch
          id='range-mode'
          checked={rangeMode}
          onCheckedChange={setRangeMode}
        />
        <Label htmlFor='range-mode' className='text-xs'>
          Filtro por rango
        </Label>
      </div>

      {rangeMode ? (
        /* Modo rango */
        <div className='space-y-2'>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <Label className='text-xs'>Mínimo</Label>
              <Input
                type='number'
                placeholder={String(min)}
                value={minValue ?? ""}
                onChange={(e) =>
                  setMinValue(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className='h-8'
              />
            </div>
            <div>
              <Label className='text-xs'>Máximo</Label>
              <Input
                type='number'
                placeholder={String(max)}
                value={maxValue ?? ""}
                onChange={(e) =>
                  setMaxValue(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className='h-8'
              />
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={applyRange}
            className='w-full h-7 text-xs'
            disabled={minValue === undefined || maxValue === undefined}
          >
            Aplicar rango
          </Button>
        </div>
      ) : (
        /* Modo checkbox */
        <>
          <div className='relative'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar números...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8 h-8'
            />
          </div>

          <ScrollArea className='h-[200px] w-full rounded-md border'>
            <div className='p-2 space-y-1'>
              {filteredValues.map((item, index) => {
                const isSelected = selectedValues.includes(item.value);
                const valueString = String(item.value);

                return (
                  <div
                    key={`${valueString}-${index}`}
                    className='flex items-center space-x-2 p-1 hover:bg-muted/50 rounded-sm'
                  >
                    <Checkbox
                      id={`number-${index}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(item.value, !!checked)
                      }
                      className='flex-shrink-0'
                    />
                    <label
                      htmlFor={`number-${index}`}
                      className='cursor-pointer text-xs flex-1 flex items-center justify-between'
                    >
                      <span className='font-mono'>{valueString}</span>
                      <span className='text-muted-foreground'>
                        ({item.count})
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      <div className='text-xs text-muted-foreground'>
        {
          selectedValues.filter((v) =>
            filteredValues.some((item) => item.value === v)
          ).length
        }{" "}
        de {filteredValues.length} seleccionados
      </div>
    </div>
  );
}

// Filtro embebido para fechas
export function EmbeddedDateFilter({
  values,
  selectedValues,
  onSelectionChange,
}: EmbeddedFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredValues = values.filter((item) =>
    String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (value: unknown, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    }
  };

  // Agrupar fechas por año/mes para mejor organización
  const groupedDates = filteredValues.reduce((acc, item) => {
    const dateStr = String(item.value);
    const year = dateStr.split("-")[2] || "Sin año";

    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {} as Record<string, typeof filteredValues>);

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Buscar fechas...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-8 h-8'
        />
      </div>

      <ScrollArea className='h-[200px] w-full rounded-md border'>
        <div className='p-2 space-y-2'>
          {Object.entries(groupedDates).map(([year, items]) => (
            <div key={year}>
              <div className='text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                {year}
              </div>
              <div className='space-y-1 ml-4'>
                {items.map((item, index) => {
                  const isSelected = selectedValues.includes(item.value);
                  const valueString = String(item.value);

                  return (
                    <div
                      key={`${valueString}-${index}`}
                      className='flex items-center space-x-2 p-1 hover:bg-muted/50 rounded-sm'
                    >
                      <Checkbox
                        id={`date-${year}-${index}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(item.value, !!checked)
                        }
                        className='flex-shrink-0'
                      />
                      <label
                        htmlFor={`date-${year}-${index}`}
                        className='cursor-pointer text-xs flex-1 flex items-center justify-between'
                      >
                        <span className='font-mono'>{valueString}</span>
                        <span className='text-muted-foreground'>
                          ({item.count})
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className='text-xs text-muted-foreground'>
        {
          selectedValues.filter((v) =>
            filteredValues.some((item) => item.value === v)
          ).length
        }{" "}
        de {filteredValues.length} seleccionados
      </div>
    </div>
  );
}

// Filtro embebido para booleanos
export function EmbeddedBooleanFilter({
  values,
  selectedValues,
  onSelectionChange,
}: EmbeddedFilterProps) {
  const handleCheckboxChange = (value: unknown, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedValues, value]);
    } else {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    }
  };

  return (
    <div className='space-y-2'>
      {values.map((item, index) => {
        const isSelected = selectedValues.includes(item.value);
        const valueString = String(item.value);
        const displayValue =
          valueString === "true"
            ? "Verdadero"
            : valueString === "false"
            ? "Falso"
            : valueString;

        return (
          <div
            key={`${valueString}-${index}`}
            className='flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-sm'
          >
            <Checkbox
              id={`boolean-${index}`}
              checked={isSelected}
              onCheckedChange={(checked) =>
                handleCheckboxChange(item.value, !!checked)
              }
              className='flex-shrink-0'
            />
            <label
              htmlFor={`boolean-${index}`}
              className='cursor-pointer text-sm flex-1 flex items-center justify-between'
            >
              <span>{displayValue}</span>
              <span className='text-muted-foreground'>({item.count})</span>
            </label>
          </div>
        );
      })}

      <div className='text-xs text-muted-foreground'>
        {
          selectedValues.filter((v) => values.some((item) => item.value === v))
            .length
        }{" "}
        de {values.length} seleccionados
      </div>
    </div>
  );
}

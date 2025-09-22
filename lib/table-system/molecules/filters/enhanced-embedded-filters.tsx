"use client";

import { useState, useMemo } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Calendar } from "lucide-react";

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

// Separadores para texto
const SEPARATORS = [
  { label: "Ninguno", value: "none" },
  { label: "Coma", value: "comma" },
  { label: "Punto y coma", value: "semicolon" },
  { label: "Espacio", value: "space" },
  { label: "Nueva línea", value: "newline" },
] as const;

type SeparatorType = (typeof SEPARATORS)[number]["value"];

// Filtro embebido para strings con funcionalidad completa
export function EnhancedEmbeddedStringFilter({
  values,
  selectedValues,
  onSelectionChange,
}: EmbeddedFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeparator, setSelectedSeparator] =
    useState<SeparatorType>("none");
  const [exactMatch, setExactMatch] = useState(false);

  const filteredValues = values.filter((item) =>
    String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (value: unknown, checked: boolean) => {
    const newSelection = new Set(selectedValues);
    if (checked) {
      newSelection.add(value);
    } else {
      newSelection.delete(value);
    }
    onSelectionChange(Array.from(newSelection));
  };

  const selectAll = () => {
    onSelectionChange(filteredValues.map((item) => item.value));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className='space-y-3'>
      {/* Búsqueda */}
      <div className='relative'>
        <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          placeholder='Buscar valores de texto...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-8 h-8 text-xs'
        />
      </div>

      {/* Separador */}
      <div>
        <Label className='text-xs font-medium'>Separador</Label>
        <Select
          value={selectedSeparator}
          onValueChange={(value: SeparatorType) => setSelectedSeparator(value)}
        >
          <SelectTrigger className='h-8'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEPARATORS.map((sep) => (
              <SelectItem key={sep.value} value={sep.value}>
                {sep.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Coincidencia exacta */}
      <div className='flex items-center justify-between'>
        <Label className='text-xs font-medium'>Coincidencia exacta</Label>
        <Switch
          checked={exactMatch}
          onCheckedChange={setExactMatch}
          className='scale-75'
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
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(item.value, !!checked)
                  }
                  className='flex-shrink-0'
                />
                <span className='cursor-pointer text-xs flex-1 flex items-center justify-between'>
                  <span className='truncate max-w-[150px]' title={valueString}>
                    {valueString || "(vacío)"}
                  </span>
                  <span className='text-muted-foreground'>({item.count})</span>
                </span>
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

// Filtro embebido para números con funcionalidad completa
export function EnhancedEmbeddedNumberFilter({
  values,
  selectedValues,
  onSelectionChange,
}: EmbeddedFilterProps) {
  const [rangeMode, setRangeMode] = useState(false);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("custom");

  // Calcular estadísticas de los números
  const numbers = values
    .map((v) => Number(v.value))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const actualMin = Math.min(...numbers);
  const actualMax = Math.max(...numbers);
  const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;

  // Detectar tipos de valores
  const hasNegativeValues = numbers.some((n) => n < 0);
  const hasPositiveValues = numbers.some((n) => n > 0);
  const hasZero = numbers.some((n) => n === 0);

  // Presets dinámicos
  const PRESETS = [
    { label: "Personalizado", value: "custom" },
    ...(hasPositiveValues || (hasZero && !hasNegativeValues)
      ? [{ label: "Valores positivos", value: "positive" }]
      : []),
    ...(hasNegativeValues
      ? [{ label: "Valores negativos", value: "negative" }]
      : []),
    { label: "Mayores a la media", value: "aboveAverage" },
    { label: "Menores a la media", value: "belowAverage" },
  ];

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);

    let filteredValues: unknown[] = [];

    switch (preset) {
      case "positive":
        filteredValues = values
          .filter((v) => Number(v.value) > 0)
          .map((v) => v.value);
        break;
      case "negative":
        filteredValues = values
          .filter((v) => Number(v.value) < 0)
          .map((v) => v.value);
        break;
      case "aboveAverage":
        filteredValues = values
          .filter((v) => Number(v.value) > avg)
          .map((v) => v.value);
        break;
      case "belowAverage":
        filteredValues = values
          .filter((v) => Number(v.value) < avg)
          .map((v) => v.value);
        break;
      default:
        return;
    }

    onSelectionChange(filteredValues);
  };

  const handleRangeApply = () => {
    const min = minValue ? Number(minValue) : actualMin;
    const max = maxValue ? Number(maxValue) : actualMax;

    const inRange = values
      .filter((v) => {
        const num = Number(v.value);
        return !isNaN(num) && num >= min && num <= max;
      })
      .map((v) => v.value);

    onSelectionChange(inRange);
  };

  const handleCheckboxSelection = (value: unknown, checked: boolean) => {
    const newSelection = new Set(selectedValues);
    if (checked) {
      newSelection.add(value);
    } else {
      newSelection.delete(value);
    }
    onSelectionChange(Array.from(newSelection));
  };

  if (rangeMode) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium'>Filtro por rango</Label>
          <Switch checked={rangeMode} onCheckedChange={setRangeMode} />
        </div>

        <div>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder='Personalizado' />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div>
            <Label className='text-xs'>Mínimo</Label>
            <Input
              type='number'
              placeholder={actualMin.toString()}
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
            />
          </div>
          <div>
            <Label className='text-xs'>Máximo</Label>
            <Input
              type='number'
              placeholder={actualMax.toString()}
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleRangeApply} className='w-full' size='sm'>
          Aplicar rango
        </Button>

        <div className='text-xs text-muted-foreground'>
          {selectedValues.length} valores seleccionados en el rango
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>Filtro por rango</Label>
        <Switch checked={rangeMode} onCheckedChange={setRangeMode} />
      </div>

      <ScrollArea className='h-32'>
        <div className='space-y-2'>
          {values.map((option, index) => (
            <div key={index} className='flex items-center space-x-2'>
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxSelection(option.value, checked as boolean)
                }
              />
              <span className='text-sm font-mono'>{String(option.value)}</span>
              <span className='text-xs text-muted-foreground'>
                ({option.count})
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className='text-xs text-muted-foreground'>
        {selectedValues.length} de {values.length} seleccionados
      </div>
    </div>
  );
}

// Filtro embebido para fechas con funcionalidad completa
export function EnhancedEmbeddedDateFilter({
  values,
  selectedValues,
  onSelectionChange,
}: EmbeddedFilterProps) {
  const [rangeMode, setRangeMode] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Agrupar fechas por año
  const groupedByYear = useMemo(() => {
    const groups: { [year: string]: typeof values } = {};

    values.forEach((item) => {
      const dateStr = String(item.value);
      let year = "Otros";

      try {
        // Intentar extraer el año de diferentes formatos
        const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          year = yearMatch[0];
        }
      } catch (e) {
        // Mantener como "Otros"
      }

      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(item);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [values]);

  const filteredValues = values.filter((item) =>
    String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (value: unknown, checked: boolean) => {
    const newSelection = new Set(selectedValues);
    if (checked) {
      newSelection.add(value);
    } else {
      newSelection.delete(value);
    }
    onSelectionChange(Array.from(newSelection));
  };

  const handleRangeApply = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const inRange = values
      .filter((v) => {
        try {
          const itemDate = new Date(String(v.value));
          return itemDate >= start && itemDate <= end;
        } catch {
          return false;
        }
      })
      .map((v) => v.value);

    onSelectionChange(inRange);
  };

  if (rangeMode) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium'>
            Incluir fechas en el rango
          </Label>
          <Switch checked={rangeMode} onCheckedChange={setRangeMode} />
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div>
            <Label className='text-xs'>Desde</Label>
            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label className='text-xs'>Hasta</Label>
            <Input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleRangeApply} className='w-full' size='sm'>
          Aplicar rango
        </Button>

        <div className='text-xs text-muted-foreground'>
          {selectedValues.length} fechas seleccionadas en el rango
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>
          Incluir fechas en el rango
        </Label>
        <Switch checked={rangeMode} onCheckedChange={setRangeMode} />
      </div>

      {/* Búsqueda */}
      <div className='relative'>
        <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          placeholder='Buscar fechas...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-8 h-8 text-xs'
        />
      </div>

      {/* Fechas agrupadas por año */}
      <Accordion type='multiple' className='w-full'>
        {groupedByYear.map(([year, yearValues]) => (
          <AccordionItem key={year} value={year}>
            <AccordionTrigger className='text-sm'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>{year}</span>
                <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full'>
                  {yearValues.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className='h-32'>
                <div className='space-y-1'>
                  {yearValues
                    .filter((item) =>
                      String(item.value)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((item, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <Checkbox
                          checked={selectedValues.includes(item.value)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(item.value, checked as boolean)
                          }
                        />
                        <span className='text-xs'>{String(item.value)}</span>
                        <span className='text-xs text-muted-foreground'>
                          ({item.count})
                        </span>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className='text-xs text-muted-foreground'>
        {selectedValues.length} de {values.length} fechas seleccionadas
      </div>
    </div>
  );
}

// Filtro embebido para booleanos
export function EnhancedEmbeddedBooleanFilter({
  values,
  selectedValues,
  onSelectionChange,
}: EmbeddedFilterProps) {
  const handleCheckboxChange = (value: unknown, checked: boolean) => {
    const newSelection = new Set(selectedValues);
    if (checked) {
      newSelection.add(value);
    } else {
      newSelection.delete(value);
    }
    onSelectionChange(Array.from(newSelection));
  };

  return (
    <div className='space-y-3'>
      <div className='space-y-2'>
        {values.map((option, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <Checkbox
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(option.value, checked as boolean)
              }
            />
            <span className='text-sm'>
              {String(option.value) === "true" ? "Verdadero" : "Falso"}
            </span>
            <span className='text-xs text-muted-foreground'>
              ({option.count})
            </span>
          </div>
        ))}
      </div>

      <div className='text-xs text-muted-foreground'>
        {selectedValues.length} de {values.length} seleccionados
      </div>
    </div>
  );
}

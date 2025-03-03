"use client";

import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
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
import type {
  FilterComponentProps,
  DateRange,
  DateRangePreset,
} from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeStyle } from "../type-indicators";
import { toUTCDate, formatDate } from "../../utils/error-handling";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search } from "lucide-react";

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: "Personalizado", value: "custom" },
  { label: "Hoy", value: "today" },
  { label: "Ayer", value: "yesterday" },
  { label: "Esta semana", value: "thisWeek" },
  { label: "Semana pasada", value: "lastWeek" },
  { label: "Este mes", value: "thisMonth" },
  { label: "Mes pasado", value: "lastMonth" },
  { label: "Este año", value: "thisYear" },
  { label: "Año pasado", value: "lastYear" },
  { label: "Últimos 7 días", value: "last7Days" },
  { label: "Últimos 30 días", value: "last30Days" },
  { label: "Últimos 90 días", value: "last90Days" },
  { label: "Últimos 12 meses", value: "last12Months" },
];

const getPresetDateRange = (preset: DateRangePreset): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
    case "thisWeek": {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(today);
      end.setDate(end.getDate() + (6 - end.getDay()));
      return { start, end };
    }
    case "lastWeek": {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay() - 7);
      const end = new Date(today);
      end.setDate(end.getDate() - end.getDay() - 1);
      return { start, end };
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }
    case "lastMonth": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end };
    }
    case "thisYear": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return { start, end };
    }
    case "lastYear": {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = new Date(today.getFullYear() - 1, 11, 31);
      return { start, end };
    }
    case "last7Days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { start, end: today };
    }
    case "last30Days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return { start, end: today };
    }
    case "last90Days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return { start, end: today };
    }
    case "last12Months": {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 12);
      return { start, end: today };
    }
    default:
      return { start: undefined, end: undefined };
  }
};

interface DateOptionItem {
  date: Date;
  label: string;
  count: number;
}

export function DateFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  columnType,
  uniqueValues,
}: FilterComponentProps) {
  // Convertir los valores únicos a opciones de fecha
  const dateOptions = useMemo(() => {
    const valueCounts = new Map<string, number>();

    // Recorrer los valores únicos y contar las ocurrencias de cada fecha
    uniqueValues.forEach((option) => {
      if (option.value) {
        try {
          const date = new Date(option.value);
          if (!isNaN(date.getTime())) {
            const dateStr = formatDate(date, "yyyy-MM-dd");
            valueCounts.set(
              dateStr,
              (valueCounts.get(dateStr) || 0) + option.count
            );
          }
        } catch {
          // Ignorar valores que no pueden convertirse a fecha
        }
      }
    });

    // Convertir el mapa a un array de opciones
    return Array.from(valueCounts.entries())
      .map(([dateStr, count]) => {
        return {
          date: new Date(dateStr),
          label: dateStr,
          count: count,
        } as DateOptionItem;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [uniqueValues]);

  // Inicializar estado de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para modo invertido (incluir vs. excluir)
  const [isInverted, setIsInverted] = useState(true);

  // Estado para preset seleccionado
  const [selectedPreset, setSelectedPreset] =
    useState<DateRangePreset>("custom");

  // Inicializar dateRange desde initialValue o vacío
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (!initialValue?.value || !Array.isArray(initialValue.value)) {
      return { start: undefined, end: undefined };
    }

    // Convertir las fechas string a objetos Date y ordenarlas
    const dates = (initialValue.value as string[])
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      return { start: undefined, end: undefined };
    }

    // Usar la primera y última fecha del array como rango
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  });

  // Calcular fechas seleccionadas basadas en el rango y el modo invertido
  // Esta es una función, no un estado, para evitar ciclos de actualización
  const getSelectedDates = useCallback(() => {
    if (!dateOptions.length) return new Set<string>();

    const selected = new Set<string>();

    dateOptions.forEach((option) => {
      const date = option.date;
      const isInRange = (() => {
        if (!dateRange.start && !dateRange.end) return true;
        if (dateRange.start && !dateRange.end) return date >= dateRange.start;
        if (!dateRange.start && dateRange.end) return date <= dateRange.end;
        return dateRange.start && dateRange.end
          ? date >= dateRange.start && date <= dateRange.end
          : true;
      })();

      if (isInverted ? isInRange : !isInRange) {
        selected.add(option.label);
      }
    });

    return selected;
  }, [dateOptions, dateRange.start, dateRange.end, isInverted]);

  // Handlers simplificados que modifican una sola fuente de verdad
  const handleDateInputChange = useCallback(
    (type: "start" | "end", value: string) => {
      const date = value ? toUTCDate(new Date(value)) : undefined;
      setDateRange((prev) => ({
        ...prev,
        [type]: date,
      }));
      setSelectedPreset("custom");
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (dateStr: string, checked: boolean) => {
      // Si se marca una fecha, actualizamos el rango para incluirla
      const date = new Date(dateStr);

      setDateRange((prev) => {
        if (checked) {
          // Si es el primer checkbox seleccionado
          if (!prev.start && !prev.end) {
            return { start: date, end: date };
          }

          // Si está fuera del rango actual, expandir el rango
          const start = prev.start
            ? new Date(Math.min(prev.start.getTime(), date.getTime()))
            : date;
          const end = prev.end
            ? new Date(Math.max(prev.end.getTime(), date.getTime()))
            : date;

          return { start, end };
        } else {
          // Si se desmarca, tendríamos que recalcular el rango basado en los que quedan seleccionados
          // Por simplicidad, no modificamos el rango al desmarcar (el usuario puede usar el rango manual)
          return prev;
        }
      });

      setSelectedPreset("custom");
    },
    []
  );

  const handlePresetChange = useCallback((preset: DateRangePreset) => {
    if (preset === "custom") {
      setSelectedPreset(preset);
      return;
    }

    const newRange = getPresetDateRange(preset);
    setDateRange(newRange);
    setSelectedPreset(preset);
  }, []);

  const handleApply = useCallback(() => {
    const selectedDates = getSelectedDates();
    if (selectedDates.size === 0) {
      onClear();
      onClose();
      return;
    }

    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: Array.from(selectedDates),
    });
    onClose();
  }, [getSelectedDates, onApply, onClear, onClose, columnId]);

  // Filtrar las opciones visibles por término de búsqueda
  const filteredOptions = useMemo(() => {
    return dateOptions.filter(
      (option) =>
        !searchTerm ||
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dateOptions, searchTerm]);

  // Calcular si hay opciones seleccionadas (para el indicador visual)
  const hasSelections = useMemo(() => {
    return getSelectedDates().size > 0;
  }, [getSelectedDates]);

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle(columnType).bg
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-1'>
        <TooltipProvider>
          <Select
            value={selectedPreset}
            onValueChange={handlePresetChange}
            defaultValue='custom'
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Selecciona un rango predefinido' />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TooltipProvider>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Desde</Label>
            <Input
              type='date'
              value={
                dateRange.start ? formatDate(dateRange.start, "yyyy-MM-dd") : ""
              }
              onChange={(e) => {
                handleDateInputChange("start", e.target.value);
              }}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hasta</Label>
            <Input
              type='date'
              value={
                dateRange.end ? formatDate(dateRange.end, "yyyy-MM-dd") : ""
              }
              onChange={(e) => {
                handleDateInputChange("end", e.target.value);
              }}
            />
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            id='inverted-mode'
            checked={isInverted}
            onCheckedChange={setIsInverted}
          />
          <Label htmlFor='inverted-mode'>
            {isInverted
              ? "Incluir fechas en el rango"
              : "Excluir fechas en el rango"}
          </Label>
        </div>

        {dateOptions.length > 0 && (
          <>
            <Accordion type='single' collapsible defaultValue='item-1'>
              <AccordionItem value='item-1'>
                <AccordionTrigger>
                  Fechas disponibles{" "}
                  {hasSelections && (
                    <span className='ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5'>
                      {getSelectedDates().size}
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
                    <div className='relative'>
                      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input
                        placeholder='Buscar fechas'
                        className='pl-8'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <ScrollArea className='w-full rounded-md border'>
                      <div className='p-4 space-y-2 h-[200px]'>
                        {filteredOptions.map((option) => {
                          // Calcular si está seleccionado basado en el rango y modo
                          const selectedDates = getSelectedDates();
                          const isSelected = selectedDates.has(option.label);

                          return (
                            <div
                              key={option.label}
                              className='flex items-center justify-between'
                            >
                              <div className='flex items-center space-x-2'>
                                <Checkbox
                                  id={option.label}
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                      option.label,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label htmlFor={option.label}>
                                  {option.label}
                                </Label>
                              </div>
                              <span className='text-sm text-muted-foreground'>
                                {option.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </div>

      <FilterFooter onApply={handleApply} onClear={onClear} onClose={onClose} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
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
import { getTypeColor } from "../../utils/colors";
import { toUTCDate, formatDate } from "@/app/utils/date-formatter";

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

interface DateOption {
  date: Date;
  label: string;
  checked: boolean;
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
  const [selectedPreset, setSelectedPreset] =
    useState<DateRangePreset>("custom");

  const [isInverted, setIsInverted] = useState(() => {
    // Siempre inicializar con true ya que usamos arrIncludesSome
    return true;
  });

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

  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(() => {
    if (!initialValue?.value || !Array.isArray(initialValue.value)) {
      return new Set<string>();
    }
    return new Set(initialValue.value as string[]);
  });

  // Efecto para generar las opciones de fecha cuando cambia uniqueValues
  useEffect(() => {
    const dateCounts = new Map<string, number>();
    const allDates = new Set<string>();

    uniqueValues.forEach((option) => {
      const date = option.value ? new Date(option.value) : null;
      if (date && !isNaN(date.getTime())) {
        const dateStr = formatDate(date, "yyyy-MM-dd");
        dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + option.count);
        allDates.add(dateStr);
      }
    });

    const options: DateOption[] = Array.from(allDates)
      .sort()
      .map((dateStr) => ({
        date: new Date(dateStr),
        label: dateStr,
        checked: selectedDates.has(dateStr),
        count: dateCounts.get(dateStr) || 0,
      }));

    setDateOptions(options);
  }, [uniqueValues, selectedDates]);

  useEffect(() => {
    // Si hay fechas seleccionadas pero no hay rango definido,
    // establecer el rango basado en las fechas seleccionadas
    if (selectedDates.size > 0 && (!dateRange.start || !dateRange.end)) {
      const selectedDatesArray = Array.from(selectedDates).map(
        (dateStr) => new Date(dateStr)
      );
      const minDate = new Date(
        Math.min(...selectedDatesArray.map((d) => d.getTime()))
      );
      const maxDate = new Date(
        Math.max(...selectedDatesArray.map((d) => d.getTime()))
      );

      setDateRange({
        start: minDate,
        end: maxDate,
      });
    }
  }, [selectedDates, dateRange]);

  const handleDateInputChange = (type: "start" | "end", value: string) => {
    const date = value ? toUTCDate(new Date(value)) : undefined;
    setDateRange((prev) => {
      const newRange = {
        ...prev,
        [type]: date,
      };

      // Actualizar selecciones basadas en el nuevo rango
      const newSelected = new Set<string>();
      dateOptions.forEach((option) => {
        const date = new Date(option.label);
        const isInRange = (() => {
          if (!newRange.start && !newRange.end) return true;
          if (newRange.start && !newRange.end) return date >= newRange.start;
          if (!newRange.start && newRange.end) return date <= newRange.end;
          return newRange.start && newRange.end
            ? date >= newRange.start && date <= newRange.end
            : true;
        })();

        // Si está invertido, seleccionar las fechas que están en el rango
        // Si no está invertido, seleccionar las fechas que NO están en el rango
        if (isInverted ? isInRange : !isInRange) {
          newSelected.add(option.label);
        }
      });

      setSelectedDates(newSelected);
      return newRange;
    });
  };

  const handleCheckboxChange = (dateStr: string, checked: boolean) => {
    const newSelected = new Set(selectedDates);
    if (checked) {
      newSelected.add(dateStr);
    } else {
      newSelected.delete(dateStr);
    }
    setSelectedDates(newSelected);
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    if (preset === "custom") {
      // Al cambiar a personalizado, mantener las selecciones actuales
      return;
    }

    const newRange = getPresetDateRange(preset);
    setDateRange(newRange);

    // Actualizar selecciones basadas en el nuevo rango
    if (newRange.start || newRange.end) {
      const newSelected = new Set<string>();
      dateOptions.forEach((option) => {
        const date = new Date(option.label);
        const isInRange = (() => {
          if (!newRange.start && !newRange.end) return true;
          if (newRange.start && !newRange.end) return date >= newRange.start;
          if (!newRange.start && newRange.end) return date <= newRange.end;
          return newRange.start && newRange.end
            ? date >= newRange.start && date <= newRange.end
            : true;
        })();

        // Si está invertido, seleccionar las fechas que están en el rango
        // Si no está invertido, seleccionar las fechas que NO están en el rango
        if (isInverted ? isInRange : !isInRange) {
          newSelected.add(option.label);
        }
      });

      setSelectedDates(newSelected);
    }
  };

  // Efecto para mantener sincronizadas las selecciones cuando cambia el modo o el rango
  useEffect(() => {
    if (dateOptions.length === 0) return;

    const newSelected = new Set<string>();
    dateOptions.forEach((option) => {
      const date = new Date(option.label);
      const isInRange = (() => {
        if (!dateRange.start && !dateRange.end) return true;
        if (dateRange.start && !dateRange.end) return date >= dateRange.start;
        if (!dateRange.start && dateRange.end) return date <= dateRange.end;
        return dateRange.start && dateRange.end
          ? date >= dateRange.start && date <= dateRange.end
          : true;
      })();

      if (isInverted ? isInRange : !isInRange) {
        newSelected.add(option.label);
      }
    });

    setSelectedDates(newSelected);
  }, [dateOptions, isInverted, dateRange.start, dateRange.end]);

  const handleApply = () => {
    if (selectedDates.size === 0) {
      console.log("🧹 Limpiando filtro de fecha");
      onClear();
      onClose();
      return;
    }

    console.log("✅ Aplicando filtro de fecha:", {
      field: columnId,
      selectedDates: Array.from(selectedDates),
      isInverted,
    });

    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: Array.from(selectedDates),
    });
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

      <div className='space-y-4 flex-1'>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger>
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

        <div className='flex items-center justify-between space-x-2'>
          <Label htmlFor='range-mode' className='text-sm'>
            {isInverted ? "Dentro del rango" : "Fuera del rango"}
          </Label>
          <Switch
            id='range-mode'
            checked={isInverted}
            onCheckedChange={setIsInverted}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Desde</Label>
            <Input
              type='date'
              value={
                dateRange.start ? formatDate(dateRange.start, "yyyy-MM-dd") : ""
              }
              onChange={(e) => {
                setSelectedPreset("custom");
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
                setSelectedPreset("custom");
                handleDateInputChange("end", e.target.value);
              }}
            />
          </div>
        </div>

        {dateOptions.length > 0 && (
          <>
            <div className='text-sm text-muted-foreground'>
              {selectedDates.size} días seleccionados en el rango
            </div>

            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='date-breakdown'>
                <AccordionTrigger className='text-sm'>
                  Ver desglose por días
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className='w-full rounded-md border'>
                    <div className='p-4 space-y-2 h-[200px]'>
                      {dateOptions.map((option) => (
                        <div
                          key={option.label}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id={option.label}
                              checked={selectedDates.has(option.label)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  option.label,
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor={option.label}>{option.label}</Label>
                          </div>
                          <span className='text-sm text-muted-foreground'>
                            {option.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}

        {dateOptions.length === 0 && (
          <div className='flex-1 flex items-center justify-center text-muted-foreground text-sm'>
            Selecciona un rango de fechas para ver las opciones
          </div>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { getTypeStyle } from "../../core/constants/type-styles";
import { FilterTabs, useFilterTabs } from "./filter-tabs";
import { formatDate } from "../../core/utils/error-handling";
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
          // Intentamos manejar diferentes formatos de fecha
          let date;
          const value = String(option.value).trim();

          // Comprobar si tiene el formato dd/mm/yyyy (con barra)
          if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
            const [day, month, year] = value
              .split("/")
              .map((n) => parseInt(n, 10));
            date = new Date(year, month - 1, day);
          }
          // Comprobar si tiene el formato dd-mm-yyyy (con guión)
          else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) {
            const [day, month, year] = value
              .split("-")
              .map((n) => parseInt(n, 10));
            date = new Date(year, month - 1, day);
          }
          // Intentar otros formatos
          else {
            date = new Date(value);
          }

          if (!isNaN(date.getTime())) {
            // Siempre guardamos en formato dd/mm/yyyy para ser consistente
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            const dateStr = `${day}/${month}/${year}`;
            valueCounts.set(
              dateStr,
              (valueCounts.get(dateStr) || 0) + option.count
            );
          }
        } catch {
          // Ignorar valores que no pueden convertirse a fecha
          console.warn("No se pudo convertir a fecha:", option.value);
        }
      }
    });

    // Convertir el mapa a un array de opciones
    return Array.from(valueCounts.entries())
      .map(([dateStr, count]) => {
        const [day, month, year] = dateStr.split("/");
        return {
          date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
          label: dateStr,
          count: count,
        } as DateOptionItem;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [uniqueValues]);

  // Estado para seguir las fechas específicas seleccionadas (valores iniciales)
  const [selectedDatesSet, setSelectedDatesSet] = useState<Set<string>>(() => {
    if (!initialValue?.value || !Array.isArray(initialValue.value)) {
      return new Set<string>();
    }

    // Convertir los valores iniciales a fechas formateadas para consistencia
    const formattedDates = initialValue.value
      .map((val) => {
        try {
          let date: Date;
          const value = String(val);

          // Si es un timestamp, convertir directamente
          if (/^\d+$/.test(value)) {
            date = new Date(parseInt(value));
          }
          // Comprobar si tiene el formato yyyy-mm-dd
          else if (/^\d{4}-\d{1,2}-\d{1,2}/.test(value)) {
            date = new Date(value);
          }
          // Comprobar si tiene el formato dd/mm/yyyy (con barra)
          else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
            const [day, month, year] = value
              .split("/")
              .map((n) => parseInt(n, 10));
            date = new Date(year, month - 1, day);
          }
          // Comprobar si tiene el formato dd-mm-yyyy (con guión)
          else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) {
            const [day, month, year] = value
              .split("-")
              .map((n) => parseInt(n, 10));
            date = new Date(year, month - 1, day);
          }
          // Intentar otros formatos
          else {
            date = new Date(value);
          }

          if (!isNaN(date.getTime())) {
            // Siempre retornar en formato dd/mm/yyyy para ser consistente
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter((dateStr): dateStr is string => dateStr !== null);

    return new Set(formattedDates);
  });

  // Hook para manejar los tabs
  const { filteredItems, counts } = useFilterTabs(
    dateOptions,
    Array.from(selectedDatesSet).map((dateStr) => {
      const found = dateOptions.find((opt) => opt.label === dateStr);
      return found || { date: new Date(), label: dateStr, count: 0 };
    }),
    (item, selected) => item.label === selected.label
  );

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
      .map((dateStr) => {
        try {
          const value = dateStr.trim();
          let date;

          // Comprobar si tiene el formato dd-mm-yyyy (con guión)
          if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) {
            const [day, month, year] = value
              .split("-")
              .map((n) => parseInt(n, 10));
            date = new Date(year, month - 1, day);
          }
          // Comprobar si tiene el formato dd/mm/yyyy (con barra)
          else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
            const [day, month, year] = value
              .split("/")
              .map((n) => parseInt(n, 10));
            date = new Date(year, month - 1, day);
          }
          // Intentar otros formatos
          else {
            date = new Date(value);
          }

          return date;
        } catch {
          return new Date(NaN); // Fecha inválida
        }
      })
      .filter((date) => !isNaN(date.getTime())) // Filtrar fechas inválidas
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
    // Si tenemos fechas explícitamente seleccionadas (al volver a abrir), usarlas
    if (selectedDatesSet.size > 0) {
      return selectedDatesSet;
    }

    // Si hay un valor inicial, usarlo para la primera renderización
    if (
      initialValue?.value &&
      Array.isArray(initialValue.value) &&
      initialValue.value.length > 0
    ) {
      const initialDates = new Set<string>(initialValue.value as string[]);
      setSelectedDatesSet(initialDates); // Actualizar el estado para futuras referencias
      return initialDates;
    }

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
  }, [
    dateOptions,
    dateRange.start,
    dateRange.end,
    isInverted,
    selectedDatesSet,
    initialValue,
    setSelectedDatesSet,
  ]);

  // Actualizar las fechas seleccionadas cuando cambia el rango
  useEffect(() => {
    // Reiniciar las fechas seleccionadas explícitamente cuando el usuario cambia el rango
    if (dateRange.start || dateRange.end) {
      setSelectedDatesSet(new Set<string>());
    }
  }, [dateRange.start, dateRange.end]);

  // Handlers simplificados que modifican una sola fuente de verdad
  const handleDateInputChange = useCallback(
    (date: "start" | "end") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      console.log(`Cambio en input de fecha ${date}: ${value}`);

      if (value) {
        try {
          // Para inputs HTML, el formato es yyyy-mm-dd
          const [year, month, day] = value
            .split("-")
            .map((n) => parseInt(n, 10));

          // Crear la fecha con el día correcto
          const newDate = new Date(Date.UTC(year, month - 1, day));

          if (!isNaN(newDate.getTime())) {
            console.log(`Fecha parseada: ${newDate.toISOString()}`);
            setDateRange((prev) => ({
              ...prev,
              [date]: newDate,
            }));
            setSelectedPreset("custom");
          } else {
            console.warn(`Fecha inválida: ${value}`);
          }
        } catch (error) {
          console.error(`Error al parsear fecha: ${value}`, error);
        }
      } else {
        // Si el input está vacío, establecer la fecha como undefined
        setDateRange((prev) => ({
          ...prev,
          [date]: undefined,
        }));
        setSelectedPreset("custom");
      }
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

  // Función auxiliar para parsear fechas en diferentes formatos
  const parseDate = useCallback((dateStr: string): Date | null => {
    try {
      const value = dateStr.trim();

      // Comprobar si tiene el formato dd/mm/yyyy (con barra)
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split("/").map((n) => parseInt(n, 10));
        return new Date(year, month - 1, day);
      }
      // Comprobar si tiene el formato dd-mm-yyyy (con guión) - para compatibilidad
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(value)) {
        const [day, month, year] = value.split("-").map((n) => parseInt(n, 10));
        return new Date(year, month - 1, day);
      }
      // Intentar otros formatos
      else {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      }
    } catch {
      return null;
    }
  }, []);

  const handleApply = useCallback(() => {
    console.log("Aplicando filtro de fechas");

    const selectedDates = getSelectedDates();
    if (selectedDates.size === 0) {
      console.log("No hay fechas seleccionadas, se limpiará el filtro");
      onClear();
      onClose();
      return;
    }

    // Log de fechas seleccionadas antes de normalizar
    console.log(
      "Fechas seleccionadas antes de normalizar:",
      Array.from(selectedDates)
    );

    // Normalizar todas las fechas a formato dd/mm/yyyy
    const normalizedSelectedDates: string[] = [];

    selectedDates.forEach((dateStr: string) => {
      console.log(`Normalizando fecha: ${dateStr}`);
      try {
        // Intentar parsear la fecha
        const date = parseDate(dateStr);
        if (date) {
          // Formatear a dd/mm/yyyy
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          const formattedDate = `${day}/${month}/${year}`;
          console.log(`  Fecha parseada y formateada: ${formattedDate}`);
          normalizedSelectedDates.push(formattedDate);
        } else {
          console.log(
            `  No se pudo parsear la fecha, se mantiene original: ${dateStr}`
          );
          normalizedSelectedDates.push(dateStr); // Mantener el string original si no se puede parsear
        }
      } catch (error) {
        console.log(
          `  Error al procesar fecha: ${error}, se mantiene original: ${dateStr}`
        );
        normalizedSelectedDates.push(dateStr); // Mantener el string original en caso de error
      }
    });

    console.log("Fechas normalizadas:", normalizedSelectedDates);

    // Actualizar el conjunto de fechas seleccionadas para uso futuro
    const newSelectedDatesSet = new Set<string>(normalizedSelectedDates);
    setSelectedDatesSet(newSelectedDatesSet);

    // Aplicar el filtro con las fechas normalizadas
    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: normalizedSelectedDates,
    });
    onClose();
  }, [
    getSelectedDates,
    onApply,
    onClear,
    onClose,
    columnId,
    setSelectedDatesSet,
    parseDate,
  ]);

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

  const toggleDateSelection = useCallback(
    (option: DateOptionItem) => {
      // Actualizar directamente las fechas seleccionadas cuando se hace clic
      setSelectedDatesSet((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(option.label)) {
          newSet.delete(option.label);
        } else {
          newSet.add(option.label);
        }
        return newSet;
      });

      setSelectedPreset("custom");
    },
    [setSelectedDatesSet]
  );

  // Función para renderizar lista de fechas
  const renderDatesList = (options: DateOptionItem[]) => (
    <ScrollArea className='w-full rounded-md border'>
      <div className='p-4 space-y-2 min-h-[250px] max-h-[300px]'>
        {options
          .filter(
            (option) =>
              !searchTerm ||
              option.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((option) => {
            // Calcular si está seleccionado basado en el rango y modo
            const selectedDates = getSelectedDates();
            const isSelected = selectedDates.has(option.label);

            return (
              <div
                key={option.label}
                className='flex items-center justify-between p-2 hover:bg-muted/50 rounded-sm'
              >
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id={`date-${option.label}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const newSelected = new Set(selectedDatesSet);
                      if (checked) {
                        newSelected.add(option.label);
                      } else {
                        newSelected.delete(option.label);
                      }
                      setSelectedDatesSet(newSelected);
                    }}
                  />
                  <label
                    htmlFor={`date-${option.label}`}
                    className='text-sm cursor-pointer'
                    style={{
                      color: getTypeStyle("fecha").text,
                    }}
                  >
                    {option.label}
                  </label>
                </div>
                <span className='text-xs text-muted-foreground'>
                  ({option.count})
                </span>
              </div>
            );
          })}
      </div>
    </ScrollArea>
  );

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle(columnType || "fecha").bg
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
                dateRange.start ? formatDate(dateRange.start, "yyyy-mm-dd") : ""
              }
              onChange={handleDateInputChange("start")}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hasta</Label>
            <Input
              type='date'
              value={
                dateRange.end ? formatDate(dateRange.end, "yyyy-mm-dd") : ""
              }
              onChange={handleDateInputChange("end")}
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
            <Accordion type='single' collapsible>
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

                    <div className='flex-1'>
                      <FilterTabs counts={counts} defaultTab='todos'>
                        {{
                          todos: renderDatesList(filteredItems.todos),
                          activos: renderDatesList(filteredItems.activos),
                          inactivos: renderDatesList(filteredItems.inactivos),
                        }}
                      </FilterTabs>
                    </div>
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

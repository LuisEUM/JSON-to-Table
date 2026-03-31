"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FilterComponentProps, DateRangePreset, DateRange } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeStyle } from "../../core/constants/type-styles";
import { FilterTabs, useFilterTabs } from "./filter-tabs";
import { Search } from "lucide-react";
import { logger } from "../../core/services/logging-service";
import { parseDate, formatDateToDDMMYYYY } from "./date-filter-presets";
import { DateRangePicker } from "./date-range-picker";

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
  hideFooter = false,
}: FilterComponentProps & { hideFooter?: boolean }) {
  // Convertir los valores únicos a opciones de fecha
  const dateOptions = useMemo(() => {
    const valueCounts = new Map<string, number>();

    uniqueValues.forEach((option) => {
      if (option.value) {
        try {
          const date = parseDate(String(option.value).trim());
          if (date) {
            const dateStr = formatDateToDDMMYYYY(date);
            valueCounts.set(
              dateStr,
              (valueCounts.get(dateStr) || 0) + option.count
            );
          }
        } catch {
          logger.warn("No se pudo convertir a fecha:", option.value);
        }
      }
    });

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

    const formattedDates = initialValue.value
      .map((val) => {
        try {
          let date: Date;
          const value = String(val);

          if (/^\d+$/.test(value)) {
            date = new Date(parseInt(value));
          } else if (/^\d{4}-\d{1,2}-\d{1,2}/.test(value)) {
            date = new Date(value);
          } else {
            const parsed = parseDate(value);
            if (!parsed) return null;
            date = parsed;
          }

          if (!isNaN(date.getTime())) {
            return formatDateToDDMMYYYY(date);
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

  const [searchTerm, setSearchTerm] = useState("");
  const [isInverted, setIsInverted] = useState(true);
  const [selectedPreset, setSelectedPreset] =
    useState<DateRangePreset>("custom");

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (!initialValue?.value || !Array.isArray(initialValue.value)) {
      return { start: undefined, end: undefined };
    }

    const dates = (initialValue.value as string[])
      .map((dateStr) => {
        try {
          return parseDate(dateStr.trim());
        } catch {
          return null;
        }
      })
      .filter((date): date is Date => date !== null && !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      return { start: undefined, end: undefined };
    }

    return { start: dates[0], end: dates[dates.length - 1] };
  });

  // Calcular fechas seleccionadas basadas en el rango y el modo invertido
  const getSelectedDates = useCallback(() => {
    if (selectedDatesSet.size > 0) {
      return selectedDatesSet;
    }

    if (
      initialValue?.value &&
      Array.isArray(initialValue.value) &&
      initialValue.value.length > 0
    ) {
      const initialDates = new Set<string>(initialValue.value as string[]);
      setSelectedDatesSet(initialDates);
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
    if (dateRange.start || dateRange.end) {
      const newSelected = new Set<string>();

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
          newSelected.add(option.label);
        }
      });

      setSelectedDatesSet(newSelected);
    }
  }, [dateRange.start, dateRange.end, dateOptions, isInverted]);

  const handleApply = useCallback(() => {
    logger.debug("Aplicando filtro de fechas");

    const selectedDates = getSelectedDates();
    if (selectedDates.size === 0) {
      logger.debug("No hay fechas seleccionadas, se limpiara el filtro");
      onClear();
      onClose();
      return;
    }

    logger.debug(
      "Fechas seleccionadas antes de normalizar:",
      Array.from(selectedDates)
    );

    const normalizedSelectedDates: string[] = [];

    selectedDates.forEach((dateStr: string) => {
      logger.debug(`Normalizando fecha: ${dateStr}`);
      try {
        const date = parseDate(dateStr);
        if (date) {
          const formattedDate = formatDateToDDMMYYYY(date);
          logger.debug(`  Fecha parseada y formateada: ${formattedDate}`);
          normalizedSelectedDates.push(formattedDate);
        } else {
          logger.debug(
            `  No se pudo parsear la fecha, se mantiene original: ${dateStr}`
          );
          normalizedSelectedDates.push(dateStr);
        }
      } catch (error) {
        logger.debug(
          `  Error al procesar fecha: ${error}, se mantiene original: ${dateStr}`
        );
        normalizedSelectedDates.push(dateStr);
      }
    });

    logger.debug("Fechas normalizadas:", normalizedSelectedDates);

    const newSelectedDatesSet = new Set<string>(normalizedSelectedDates);
    setSelectedDatesSet(newSelectedDatesSet);

    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: normalizedSelectedDates,
    });
    onClose();
  }, [getSelectedDates, onApply, onClear, onClose, columnId]);

  const hasSelections = useMemo(() => {
    return getSelectedDates().size > 0;
  }, [getSelectedDates]);

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
                      color: getTypeStyle("date").text,
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
              getTypeStyle(columnType || "date").bg
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-1'>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedPreset={selectedPreset}
          onPresetChange={setSelectedPreset}
          isInverted={isInverted}
          onInvertedChange={setIsInverted}
        />

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
                        aria-label='Buscar fechas'
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

      {!hideFooter && (
        <FilterFooter
          onApply={handleApply}
          onClear={onClear}
          onClose={onClose}
        />
      )}
    </div>
  );
}

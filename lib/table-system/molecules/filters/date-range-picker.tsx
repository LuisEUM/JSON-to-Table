"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { DateRange, DateRangePreset } from "./filter-types";
import { PRESETS, getPresetDateRange } from "./date-filter-presets";
import { formatDate } from "../../core/utils/error-handling";
import { logger } from "../../core/services/logging-service";

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange | ((prev: DateRange) => DateRange)) => void;
  selectedPreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  isInverted: boolean;
  onInvertedChange: (inverted: boolean) => void;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  selectedPreset,
  onPresetChange,
  isInverted,
  onInvertedChange,
}: DateRangePickerProps) {
  const handleDateInputChange = useCallback(
    (date: "start" | "end") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      logger.debug(`Cambio en input de fecha ${date}: ${value}`);

      if (value) {
        try {
          // Para inputs HTML, el formato es yyyy-mm-dd
          const [year, month, day] = value
            .split("-")
            .map((n) => parseInt(n, 10));

          // Crear la fecha con el día correcto
          const newDate = new Date(Date.UTC(year, month - 1, day));

          if (!isNaN(newDate.getTime())) {
            logger.debug(`Fecha parseada: ${newDate.toISOString()}`);
            onDateRangeChange((prev) => ({
              ...prev,
              [date]: newDate,
            }));
            onPresetChange("custom");
          } else {
            logger.warn(`Fecha invalida: ${value}`);
          }
        } catch (error) {
          logger.error(`Error al parsear fecha: ${value}`, error);
        }
      } else {
        // Si el input está vacío, establecer la fecha como undefined
        onDateRangeChange((prev) => ({
          ...prev,
          [date]: undefined,
        }));
        onPresetChange("custom");
      }
    },
    [onDateRangeChange, onPresetChange]
  );

  const handlePresetChange = useCallback(
    (preset: DateRangePreset) => {
      if (preset === "custom") {
        onPresetChange(preset);
        return;
      }

      const newRange = getPresetDateRange(preset);
      onDateRangeChange(newRange);
      onPresetChange(preset);
    },
    [onDateRangeChange, onPresetChange]
  );

  return (
    <>
      <div role="group" aria-label="Presets de fecha">
        <TooltipProvider>
          <Select
            value={selectedPreset}
            onValueChange={handlePresetChange}
            defaultValue='custom'
          >
            <SelectTrigger className='w-full' aria-label="Seleccionar rango de fecha predefinido">
              <SelectValue placeholder='Selecciona un rango predefinido' />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((preset) => (
                <SelectItem
                  key={preset.value}
                  value={preset.value}
                  aria-pressed={selectedPreset === preset.value}
                >
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TooltipProvider>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>Desde</Label>
          <Input
            type='date'
            value={
              dateRange.start ? formatDate(dateRange.start, "yyyy-mm-dd") : ""
            }
            onChange={handleDateInputChange("start")}
            aria-label='Fecha desde'
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
            aria-label='Fecha hasta'
          />
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Switch
          id='inverted-mode'
          checked={isInverted}
          onCheckedChange={onInvertedChange}
        />
        <Label htmlFor='inverted-mode'>
          {isInverted
            ? "Incluir fechas en el rango"
            : "Excluir fechas en el rango"}
        </Label>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FilterComponentProps,
  DateRangePreset,
  DateRange,
} from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";
import { toUTCDate } from "../../utils/date-formatter";

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: "Rango personalizado", value: "custom" },
  { label: "Año actual", value: "thisYear" },
  { label: "Año anterior", value: "lastYear" },
  { label: "Últimos 12 meses", value: "last12Months" },
  { label: "Últimos 7 días", value: "last7Days" },
  { label: "Mes actual", value: "thisMonth" },
  { label: "Mes anterior", value: "lastMonth" },
  { label: "1er trimestre", value: "quarter1" },
  { label: "2do trimestre", value: "quarter2" },
  { label: "3er trimestre", value: "quarter3" },
  { label: "4to trimestre", value: "quarter4" },
];

const calculateDateRange = (preset: DateRangePreset): DateRange => {
  const now = toUTCDate(new Date());
  const startOfYear = toUTCDate(new Date(now.getFullYear(), 0, 1));
  const endOfYear = toUTCDate(new Date(now.getFullYear(), 11, 31));

  switch (preset) {
    case "thisYear":
      return { start: startOfYear, end: endOfYear };
    case "lastYear":
      return {
        start: toUTCDate(new Date(now.getFullYear() - 1, 0, 1)),
        end: toUTCDate(new Date(now.getFullYear() - 1, 11, 31)),
      };
    default:
      return { start: now, end: now };
  }
};

export function DateFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  columnType,
}: FilterComponentProps) {
  const [preset, setPreset] = useState<DateRangePreset>("custom");
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const start = initialValue?.value
      ? toUTCDate(initialValue.value as string | number | Date)
      : toUTCDate(new Date());
    const end = initialValue?.additionalValue
      ? toUTCDate(initialValue.additionalValue as string | number | Date)
      : toUTCDate(new Date());
    return { start, end };
  });

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset);
    if (newPreset !== "custom") {
      const range = calculateDateRange(newPreset);
      setDateRange(range);
    }
  };

  const handleApply = () => {
    onApply({
      field: columnId,
      operator: "between",
      value: dateRange.start,
      additionalValue: dateRange.end,
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
              getTypeColor(columnType).dot
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Rango de fechas</label>
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar rango' />
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

        {preset === "custom" && (
          <div className='border rounded-md p-4 overflow-auto'>
            <Calendar
              mode='range'
              selected={{
                from: dateRange.start,
                to: dateRange.end,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({
                    start: toUTCDate(range.from),
                    end: toUTCDate(range.to),
                  });
                }
              }}
              numberOfMonths={2}
            />
          </div>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

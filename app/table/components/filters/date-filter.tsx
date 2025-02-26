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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  FilterComponentProps,
  DateRangePreset,
  DateRange,
} from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeColor } from "../type-badge";
import { toUTCDate, formatDate } from "@/app/utils/date-formatter";

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

const RANGE_TYPES = [
  { label: "Dentro del rango", value: "between" },
  { label: "Fuera del rango", value: "notBetween" },
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
  const [rangeType, setRangeType] = useState<"between" | "notBetween">(
    "between"
  );
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const start = initialValue?.value
      ? toUTCDate(initialValue.value as string | number | Date)
      : undefined;
    const end = initialValue?.additionalValue
      ? toUTCDate(initialValue.additionalValue as string | number | Date)
      : undefined;
    return { start, end };
  });

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset);
    if (newPreset !== "custom") {
      const range = calculateDateRange(newPreset);
      setDateRange(range);
    }
  };

  const handleDateInputChange = (type: "start" | "end", value: string) => {
    const date = value ? toUTCDate(new Date(value)) : undefined;
    setDateRange((prev) => ({
      ...prev,
      [type]: date,
    }));
  };

  const handleApply = () => {
    if (!dateRange.start && !dateRange.end) {
      onClear();
      onClose();
      return;
    }

    onApply({
      field: columnId,
      operator: rangeType,
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
              getTypeColor(columnType).split(" ")[0]
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label>Tipo de rango</Label>
          <Select
            value={rangeType}
            onValueChange={(value: "between" | "notBetween") =>
              setRangeType(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar tipo de rango' />
            </SelectTrigger>
            <SelectContent>
              {RANGE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Rango predefinido</Label>
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
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Desde</Label>
                <Input
                  type='date'
                  value={
                    dateRange.start
                      ? formatDate(dateRange.start, "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) =>
                    handleDateInputChange("start", e.target.value)
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>Hasta</Label>
                <Input
                  type='date'
                  value={
                    dateRange.end ? formatDate(dateRange.end, "yyyy-MM-dd") : ""
                  }
                  onChange={(e) => handleDateInputChange("end", e.target.value)}
                />
              </div>
            </div>

            <div className='border rounded-md p-4 overflow-auto'>
              <Calendar
                mode='range'
                selected={{
                  from: dateRange.start,
                  to: dateRange.end,
                }}
                onSelect={(range) => {
                  setDateRange({
                    start: range?.from,
                    end: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
            </div>
          </div>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

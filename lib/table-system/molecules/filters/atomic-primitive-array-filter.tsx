"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Search } from "lucide-react";
import type { FilterComponentProps, DateRangePreset } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { FilterTabs, useFilterTabs } from "./filter-tabs";
import { getTypeStyle } from "../../core/constants/type-styles";
import { processValue, type ProcessedItem } from "../../core";

// Types for controllers
type SeparatorType =
  | "none"
  | "tab"
  | "semicolon"
  | "comma"
  | "space"
  | "multispace"
  | "newline";
type NumberRange = { start?: number; end?: number };
type DateRange = { start?: Date; end?: Date };

interface ArrayValueOption {
  value: unknown;
  count: number;
  type: string;
  displayName: string;
}

interface ControllerState {
  selectedValues: Set<string>;
  searchTerm: string;
  stringControls: {
    separator: SeparatorType;
    exactMatch: boolean;
  };
  numberControls: {
    preset: string;
    range: NumberRange;
    isInverted: boolean;
  };
  dateControls: {
    preset: DateRangePreset;
    range: DateRange;
    isInverted: boolean;
  };
}

interface PrimitiveArrayFilterProps extends FilterComponentProps {
  arrayType?: string;
}

// Separators for string controller
const SEPARATORS = [
  { label: "Ninguno", value: "none" },
  { label: "Tabulación", value: "tab" },
  { label: "Punto y coma", value: "semicolon" },
  { label: "Coma", value: "comma" },
  { label: "Espacio", value: "space" },
  { label: "Múltiples espacios", value: "multispace" },
  { label: "Nueva línea", value: "newline" },
] as const;

// Number presets
const NUMBER_PRESETS = [
  { label: "Personalizado", value: "custom" },
  { label: "Valores positivos", value: "positive" },
  { label: "Valores negativos", value: "negative" },
  { label: "Mayores a la media", value: "aboveAverage" },
  { label: "Menores a la media", value: "belowAverage" },
  { label: "Top 25%", value: "top25" },
  { label: "Último 25%", value: "bottom25" },
];

// Date presets (matching DateFilter exactly)
const DATE_PRESETS: { label: string; value: DateRangePreset }[] = [
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

export function AtomicPrimitiveArrayFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  uniqueValues,
}: PrimitiveArrayFilterProps) {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // Initialize controller state
  const [controllerState, setControllerState] = useState<ControllerState>(
    () => ({
      selectedValues:
        initialValue?.value && Array.isArray(initialValue.value)
          ? new Set(initialValue.value.map(String))
          : new Set(),
      searchTerm: "",
      stringControls: {
        separator: "none",
        exactMatch: false,
      },
      numberControls: {
        preset: "custom",
        range: {},
        isInverted: true,
      },
      dateControls: {
        preset: "custom",
        range: {},
        isInverted: true,
      },
    })
  );

  // Process and group values by type
  const arrayOptions = useMemo(() => {
    const valueCounts = new Map<string, ArrayValueOption>();

    uniqueValues.forEach((option) => {
      const processedItem = option.original as ProcessedItem;

      const processElement = (item: unknown) => {
        const processed = processValue(item, columnId, undefined);
        let type = processed.type;

        // Enhanced date detection
        if (typeof item === "string") {
          const datePatterns = [
            /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/,
            /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/,
            /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/,
          ];

          if (datePatterns.some((pattern) => pattern.test(item))) {
            try {
              const testDate = new Date(item);
              if (
                !isNaN(testDate.getTime()) &&
                testDate.getFullYear() >= 1900 &&
                testDate.getFullYear() <= 2100
              ) {
                type = "fecha";
              }
            } catch {}
          }
        }

        const displayKey = String(item);
        const existing = valueCounts.get(displayKey);

        if (existing) {
          existing.count += option.count;
        } else {
          const typeDisplayNames: Record<string, string> = {
            fecha: "Fecha",
            número: "Número",
            boolean: "Booleano",
            string: "Texto",
          };

          valueCounts.set(displayKey, {
            value: item,
            count: option.count,
            type,
            displayName: typeDisplayNames[type] || "Otro",
          });
        }
      };

      // Process arrays and individual values
      if (Array.isArray(processedItem?.value)) {
        processedItem.value.forEach(processElement);
      } else if (processedItem?.value != null) {
        processElement(processedItem.value);
      }
    });

    return Array.from(valueCounts.values()).sort((a, b) => {
      if (a.type !== b.type) {
        const typeOrder = ["fecha", "número", "boolean", "string"];
        return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
      }
      if (a.type === "número") {
        return Number(a.value) - Number(b.value);
      }
      return String(a.value).localeCompare(String(b.value));
    });
  }, [uniqueValues, columnId]);

  // Get values by type for controllers
  const getValuesByType = useCallback(
    (type: string) => {
      return arrayOptions.filter((option) => option.type === type);
    },
    [arrayOptions]
  );

  // Available types for selector
  const availableTypes = useMemo(() => {
    const types = new Set(arrayOptions.map((option) => option.type));
    return [
      { value: "all", label: "Todos los tipos" },
      ...Array.from(types).map((type) => ({
        value: type,
        label:
          arrayOptions.find((opt) => opt.type === type)?.displayName || type,
      })),
    ];
  }, [arrayOptions]);

  // Update controller state helper
  const updateControllerState = (updates: Partial<ControllerState>) => {
    setControllerState((prev) => ({ ...prev, ...updates }));
  };

  // Get separator regex
  const getSeparatorRegex = (separator: SeparatorType): RegExp => {
    switch (separator) {
      case "tab":
        return /\t/g;
      case "semicolon":
        return /;/g;
      case "comma":
        return /,/g;
      case "space":
        return / /g;
      case "multispace":
        return /\s+/g;
      case "newline":
        return /\n/g;
      default:
        return /$/;
    }
  };

  // Get processed string values considering separator
  const getProcessedStringValues = useCallback(() => {
    const stringValues = getValuesByType("string");
    const { separator } = controllerState.stringControls;

    if (separator === "none") {
      return stringValues;
    }

    // Process with separator
    const processedOptions: ArrayValueOption[] = [];

    stringValues.forEach((option) => {
      const value = String(option.value);
      const regex = getSeparatorRegex(separator);
      const parts = value
        .split(regex)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      parts.forEach((part) => {
        // Check if this separated part already exists
        const existingOption = processedOptions.find(
          (opt) => String(opt.value) === part
        );
        if (existingOption) {
          existingOption.count += Math.floor(option.count / parts.length);
        } else {
          processedOptions.push({
            value: part,
            count: Math.floor(option.count / parts.length) || 1,
            type: "string",
            displayName: "Texto (separado)",
          });
        }
      });
    });

    return processedOptions;
  }, [getValuesByType, controllerState.stringControls]);

  // Filter options by type and search with exact match support
  const filteredOptions = useMemo(() => {
    let filtered = arrayOptions;

    // Use processed string values if string type is selected and separator is active
    if (
      selectedTypeFilter === "string" &&
      controllerState.stringControls.separator !== "none"
    ) {
      const processedStrings = getProcessedStringValues();
      const otherTypes = arrayOptions.filter((opt) => opt.type !== "string");
      // Only replace if we have processed strings, otherwise keep original
      if (processedStrings.length > 0) {
        filtered = [...otherTypes, ...processedStrings];
      }
    }

    if (selectedTypeFilter !== "all") {
      filtered = filtered.filter(
        (option) => option.type === selectedTypeFilter
      );
    }

    // Apply search filter with exact match support (same logic as string-filter.tsx)
    if (controllerState.searchTerm && controllerState.searchTerm.trim()) {
      const searchLower = controllerState.searchTerm.toLowerCase();

      filtered = filtered.filter((option) => {
        const valueLower = String(option.value).toLowerCase();

        // Always show selected values, even if they don't match the search
        const isSelected = controllerState.selectedValues.has(
          String(option.value)
        );
        if (isSelected) {
          return true;
        }

        // Apply exact match logic for string types when separator is active
        if (
          option.type === "string" &&
          controllerState.stringControls.separator !== "none" &&
          controllerState.stringControls.exactMatch
        ) {
          // First try exact match
          const exactRegex = new RegExp(`\\b${searchLower}\\b`, "i");
          if (exactRegex.test(valueLower)) {
            return true;
          }

          // If no exact match but term is short (≤3 chars), use includes for better UX
          if (searchLower.length <= 3) {
            return valueLower.includes(searchLower);
          }

          // For longer terms without exact match, don't show
          return false;
        } else {
          // For contains match, use simple includes
          return valueLower.includes(searchLower);
        }
      });
    }

    return filtered;
  }, [
    arrayOptions,
    selectedTypeFilter,
    controllerState.searchTerm,
    controllerState.stringControls.separator,
    controllerState.stringControls.exactMatch,
    getProcessedStringValues,
  ]);

  // FilterTabs hook
  const { filteredItems, counts } = useFilterTabs(
    filteredOptions,
    Array.from(controllerState.selectedValues)
      .map((value) =>
        filteredOptions.find((opt) => String(opt.value) === value)
      )
      .filter(Boolean) as ArrayValueOption[],
    (item, selected) => String(item.value) === String(selected.value)
  );

  // Get date range from preset (matching DateFilter exactly)
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

  // String controller handlers
  const handleSeparatorChange = (separator: SeparatorType) => {
    updateControllerState({
      stringControls: { ...controllerState.stringControls, separator },
      selectedValues: new Set(), // Clear selections when changing separator
    });
  };

  // Number controller handlers
  const handleNumberPresetChange = (preset: string) => {
    updateControllerState({
      numberControls: { ...controllerState.numberControls, preset },
    });

    if (preset !== "custom") {
      const numberValues = getValuesByType("número")
        .map((opt) => Number(opt.value))
        .filter((n) => !isNaN(n));

      if (numberValues.length === 0) return;

      const numbers = numberValues.sort((a, b) => a - b);
      const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      const q1 = numbers[Math.floor(numbers.length * 0.25)];
      const q3 = numbers[Math.floor(numbers.length * 0.75)];

      let newRange: NumberRange = {};
      let selectedNumbers: number[] = [];

      switch (preset) {
        case "positive":
          selectedNumbers = numbers.filter((n) => n > 0);
          break;
        case "negative":
          selectedNumbers = numbers.filter((n) => n < 0);
          break;
        case "aboveAverage":
          selectedNumbers = numbers.filter((n) => n > avg);
          newRange = { start: avg, end: Math.max(...numbers) };
          break;
        case "belowAverage":
          selectedNumbers = numbers.filter((n) => n < avg);
          newRange = { start: Math.min(...numbers), end: avg };
          break;
        case "top25":
          selectedNumbers = numbers.filter((n) => n >= q3);
          newRange = { start: q3, end: Math.max(...numbers) };
          break;
        case "bottom25":
          selectedNumbers = numbers.filter((n) => n <= q1);
          newRange = { start: Math.min(...numbers), end: q1 };
          break;
      }

      updateControllerState({
        numberControls: {
          ...controllerState.numberControls,
          preset,
          range: newRange,
        },
        selectedValues: new Set([
          ...Array.from(controllerState.selectedValues).filter(
            (v) =>
              !getValuesByType("número").some((opt) => String(opt.value) === v)
          ),
          ...selectedNumbers.map(String),
        ]),
      });
    }
  };

  const handleNumberRangeChange = (start?: number, end?: number) => {
    const numberValues = getValuesByType("número");
    const { isInverted } = controllerState.numberControls;

    const selectedNumbers = numberValues
      .filter((option) => {
        const num = Number(option.value);
        if (isNaN(num)) return false;

        const inRange =
          (start === undefined || num >= start) &&
          (end === undefined || num <= end);

        return isInverted ? inRange : !inRange;
      })
      .map((opt) => String(opt.value));

    updateControllerState({
      numberControls: {
        ...controllerState.numberControls,
        range: { start, end },
        preset: "custom",
      },
      selectedValues: new Set([
        ...Array.from(controllerState.selectedValues).filter(
          (v) =>
            !getValuesByType("número").some((opt) => String(opt.value) === v)
        ),
        ...selectedNumbers,
      ]),
    });
  };

  // Date controller handlers
  const handleDatePresetChange = (preset: DateRangePreset) => {
    updateControllerState({
      dateControls: { ...controllerState.dateControls, preset },
    });

    if (preset !== "custom") {
      const newRange = getPresetDateRange(preset);
      handleDateRangeChange(newRange.start, newRange.end);
    }
  };

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    const dateValues = getValuesByType("fecha");
    const { isInverted } = controllerState.dateControls;

    const selectedDates = dateValues
      .filter((option) => {
        try {
          const dateStr = String(option.value);
          let itemDate: Date;

          // Parse date with different formats
          if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr
              .split("/")
              .map((n) => parseInt(n, 10));
            itemDate = new Date(year, month - 1, day);
          } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr
              .split("-")
              .map((n) => parseInt(n, 10));
            itemDate = new Date(year, month - 1, day);
          } else {
            itemDate = new Date(dateStr);
          }

          if (isNaN(itemDate.getTime())) return false;

          const inRange =
            (!start || itemDate >= start) && (!end || itemDate <= end);
          return isInverted ? inRange : !inRange;
        } catch {
          return false;
        }
      })
      .map((opt) => String(opt.value));

    // Clear previous date selections and apply new ones
    const nonDateValues = Array.from(controllerState.selectedValues).filter(
      (v) => !getValuesByType("fecha").some((opt) => String(opt.value) === v)
    );

    updateControllerState({
      dateControls: {
        ...controllerState.dateControls,
        range: { start, end },
        preset: "custom",
      },
      selectedValues: new Set([...nonDateValues, ...selectedDates]),
    });
  };

  // Helper function to format date for HTML input (dd/mm/yyyy -> yyyy-mm-dd)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date from HTML input (yyyy-mm-dd -> Date)
  const parseDateFromInput = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  };

  // Handle checkbox changes
  const handleValueToggle = (value: unknown, checked: boolean) => {
    const valueStr = String(value);
    const newSelected = new Set(controllerState.selectedValues);
    if (checked) {
      newSelected.add(valueStr);
    } else {
      newSelected.delete(valueStr);
    }
    updateControllerState({ selectedValues: newSelected });
  };

  // Apply filter
  const handleApply = () => {
    if (controllerState.selectedValues.size === 0) {
      onClear();
      return;
    }

    const selectedFilterValues = Array.from(controllerState.selectedValues)
      .map((valueStr) => {
        const option = arrayOptions.find(
          (opt) => String(opt.value) === valueStr
        );
        return option?.value || valueStr;
      })
      .filter(
        (value): value is string | number | boolean | Date =>
          value !== null && value !== undefined
      );

    const filterCondition = {
      field: columnId,
      operator: "arrIncludesSome" as const,
      value: selectedFilterValues,
      // Include string controls for proper filtering (like string-filter.tsx)
      additionalValue: controllerState.stringControls.separator,
      exactMatch: controllerState.stringControls.exactMatch,
    };

    onApply(filterCondition);
    onClose?.();
  };

  const handleClear = () => {
    setControllerState((prev) => ({ ...prev, selectedValues: new Set() }));
    onClear();
  };

  // Type colors
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fecha: "bg-purple-500",
      número: "bg-blue-500",
      boolean: "bg-orange-500",
      string: "bg-green-500",
    };
    return colors[type] || "bg-gray-500";
  };

  // Render options list
  const renderOptionsList = (options: ArrayValueOption[]) => (
    <ScrollArea className='flex-1 w-full rounded-md border'>
      <div className='p-4 space-y-1 min-h-[250px] max-h-[300px]'>
        {options.map((option, index) => (
          <div
            key={`${option.type}-${String(option.value)}-${index}`}
            className={`flex items-start justify-between p-3 rounded-md hover:bg-muted/50 transition-colors ${
              index < options.length - 1 ? "border-b border-border/30" : ""
            }`}
          >
            <div className='flex items-start space-x-3 flex-1 min-w-0'>
              <Checkbox
                id={`array-${option.type}-${index}`}
                checked={controllerState.selectedValues.has(
                  String(option.value)
                )}
                onCheckedChange={(checked) => {
                  handleValueToggle(option.value, !!checked);
                }}
                className='mt-0.5 flex-shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <label
                  htmlFor={`array-${option.type}-${index}`}
                  className='text-sm cursor-pointer block'
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${getTypeColor(
                        option.type
                      )}`}
                    />
                    <span
                      className='break-all'
                      style={{
                        color: getTypeStyle(option.type).text,
                      }}
                    >
                      {String(option.value) || "(vacío)"}
                    </span>
                  </div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    {option.displayName}
                  </div>
                </label>
              </div>
            </div>
            <span className='text-xs text-muted-foreground ml-2 flex-shrink-0'>
              ({option.count})
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );

  // Render specific controllers
  const renderStringController = () => (
    <div className='space-y-3 p-4 bg-muted/30 rounded-lg'>
      <div>
        <Label htmlFor='separator-select' className='text-sm font-medium'>
          Separador para dividir valores
        </Label>
        <Select
          value={controllerState.stringControls.separator}
          onValueChange={(value: SeparatorType) => handleSeparatorChange(value)}
        >
          <SelectTrigger id='separator-select'>
            <SelectValue placeholder='Seleccionar separador' />
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

      {controllerState.stringControls.separator !== "none" && (
        <div className='flex items-center justify-between space-x-2'>
          <div className='flex flex-col'>
            <Label htmlFor='exact-match' className='text-sm font-medium'>
              Coincidencia exacta
            </Label>
            <span className='text-xs text-muted-foreground'>
              Buscar solo valores que coincidan exactamente con todos los
              términos
            </span>
          </div>
          <Switch
            id='exact-match'
            checked={controllerState.stringControls.exactMatch}
            onCheckedChange={(checked) =>
              updateControllerState({
                stringControls: {
                  ...controllerState.stringControls,
                  exactMatch: checked,
                },
              })
            }
          />
        </div>
      )}
    </div>
  );

  const renderNumberController = () => {
    const numberValues = getValuesByType("número")
      .map((opt) => Number(opt.value))
      .filter((n) => !isNaN(n));

    if (numberValues.length === 0) {
      return (
        <div className='space-y-3 p-4 bg-muted/30 rounded-lg'>
          <div className='text-sm text-muted-foreground'>
            No hay valores numéricos disponibles
          </div>
        </div>
      );
    }

    const min = Math.min(...numberValues);
    const max = Math.max(...numberValues);

    // Detectar si hay valores negativos y positivos (como en NumberFilter original)
    const hasNegativeValues = numberValues.some((n) => n < 0);
    const hasPositiveValues = numberValues.some((n) => n > 0);
    const hasZero = numberValues.some((n) => n === 0);

    // Filtrar presets dinámicamente basado en los datos
    const availablePresets = NUMBER_PRESETS.filter((preset) => {
      switch (preset.value) {
        case "negative":
          return hasNegativeValues;
        case "positive":
          return hasPositiveValues || (hasZero && !hasNegativeValues);
        default:
          return true;
      }
    });

    return (
      <div className='space-y-3 p-4 bg-muted/30 rounded-lg'>
        <div>
          <Label className='text-sm font-medium'>Presets numéricos</Label>
          <Select
            value={controllerState.numberControls.preset}
            onValueChange={handleNumberPresetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder='Selecciona un rango predefinido' />
            </SelectTrigger>
            <SelectContent>
              {availablePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center justify-between space-x-2'>
          <Label className='text-sm'>
            {controllerState.numberControls.isInverted
              ? "Dentro del rango"
              : "Fuera del rango"}
          </Label>
          <Switch
            checked={controllerState.numberControls.isInverted}
            onCheckedChange={(checked) =>
              updateControllerState({
                numberControls: {
                  ...controllerState.numberControls,
                  isInverted: checked,
                },
              })
            }
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Desde</Label>
            <Input
              type='number'
              value={controllerState.numberControls.range.start ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleNumberRangeChange(
                  value,
                  controllerState.numberControls.range.end
                );
              }}
              min={min}
              max={max}
              placeholder={min.toString()}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hasta</Label>
            <Input
              type='number'
              value={controllerState.numberControls.range.end ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleNumberRangeChange(
                  controllerState.numberControls.range.start,
                  value
                );
              }}
              min={min}
              max={max}
              placeholder={max.toString()}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDateController = () => {
    const dateValues = getValuesByType("fecha");

    if (dateValues.length === 0) {
      return (
        <div className='space-y-3 p-4 bg-muted/30 rounded-lg'>
          <div className='text-sm text-muted-foreground'>
            No hay valores de fecha disponibles
          </div>
        </div>
      );
    }

    return (
      <div className='space-y-3 p-4 bg-muted/30 rounded-lg'>
        <div>
          <Label className='text-sm font-medium'>Presets de fecha</Label>
          <Select
            value={controllerState.dateControls.preset}
            onValueChange={handleDatePresetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder='Selecciona un rango predefinido' />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Desde</Label>
            <Input
              type='date'
              value={
                controllerState.dateControls.range.start
                  ? formatDateForInput(controllerState.dateControls.range.start)
                  : ""
              }
              onChange={(e) => {
                const date = parseDateFromInput(e.target.value);
                handleDateRangeChange(
                  date || undefined,
                  controllerState.dateControls.range.end
                );
              }}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hasta</Label>
            <Input
              type='date'
              value={
                controllerState.dateControls.range.end
                  ? formatDateForInput(controllerState.dateControls.range.end)
                  : ""
              }
              onChange={(e) => {
                const date = parseDateFromInput(e.target.value);
                handleDateRangeChange(
                  controllerState.dateControls.range.start,
                  date || undefined
                );
              }}
            />
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            checked={controllerState.dateControls.isInverted}
            onCheckedChange={(checked) => {
              // First update the state
              updateControllerState({
                dateControls: {
                  ...controllerState.dateControls,
                  isInverted: checked,
                },
              });

              // Then immediately re-apply the current range with new inversion
              // This works even if there are already selected dates
              const { start, end } = controllerState.dateControls.range;

              // Use setTimeout to ensure state update completes first
              setTimeout(() => {
                // Get updated state and recalculate selections
                const dateValues = getValuesByType("fecha");

                const selectedDates = dateValues
                  .filter((option) => {
                    try {
                      const dateStr = String(option.value);
                      let itemDate: Date;

                      // Parse date with different formats
                      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                        const [day, month, year] = dateStr
                          .split("/")
                          .map((n) => parseInt(n, 10));
                        itemDate = new Date(year, month - 1, day);
                      } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
                        const [day, month, year] = dateStr
                          .split("-")
                          .map((n) => parseInt(n, 10));
                        itemDate = new Date(year, month - 1, day);
                      } else {
                        itemDate = new Date(dateStr);
                      }

                      if (isNaN(itemDate.getTime())) return false;

                      const inRange =
                        (!start || itemDate >= start) &&
                        (!end || itemDate <= end);
                      return checked ? inRange : !inRange; // Use the new checked value
                    } catch {
                      return false;
                    }
                  })
                  .map((opt) => String(opt.value));

                // Clear previous date selections and apply new ones
                const nonDateValues = Array.from(
                  controllerState.selectedValues
                ).filter(
                  (v) =>
                    !getValuesByType("fecha").some(
                      (opt) => String(opt.value) === v
                    )
                );

                updateControllerState({
                  selectedValues: new Set([...nonDateValues, ...selectedDates]),
                });
              }, 0);
            }}
          />
          <Label>
            {controllerState.dateControls.isInverted
              ? "Incluir fechas en el rango"
              : "Excluir fechas en el rango"}
          </Label>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle("array[primitivo]").bg
            }`}
          />{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-grow flex flex-col'>
        {/* Type filter selector */}
        <div>
          <Label htmlFor='type-select' className='text-sm font-medium'>
            Filtrar por tipo de dato
          </Label>
          <Select
            value={selectedTypeFilter}
            onValueChange={setSelectedTypeFilter}
          >
            <SelectTrigger id='type-select'>
              <SelectValue placeholder='Seleccionar tipo' />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className='flex items-center gap-2'>
                    {type.value !== "all" && (
                      <div
                        className={`w-2 h-2 rounded-full ${getTypeColor(
                          type.value
                        )}`}
                      />
                    )}
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Specific controllers */}
        {selectedTypeFilter === "string" && renderStringController()}
        {selectedTypeFilter === "número" && renderNumberController()}
        {selectedTypeFilter === "fecha" && renderDateController()}

        {filteredOptions.length > 0 && (
          <>
            {/* Selection count */}
            <div className='text-sm text-muted-foreground'>
              {controllerState.selectedValues.size} valores seleccionados de{" "}
              {arrayOptions.length} disponibles
            </div>

            {/* Search input */}
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar valores...'
                value={controllerState.searchTerm}
                onChange={(e) =>
                  updateControllerState({ searchTerm: e.target.value })
                }
                className='pl-8'
              />
            </div>

            {/* FilterTabs */}
            <div className='flex-1'>
              <FilterTabs counts={counts} defaultTab='todos'>
                {{
                  todos: renderOptionsList(filteredItems.todos),
                  activos: renderOptionsList(filteredItems.activos),
                  inactivos: renderOptionsList(filteredItems.inactivos),
                }}
              </FilterTabs>
            </div>
          </>
        )}
      </div>

      <FilterFooter
        onClear={handleClear}
        onClose={onClose}
        onApply={handleApply}
      />
    </div>
  );
}

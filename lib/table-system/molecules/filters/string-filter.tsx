"use client";

import { useState, useEffect } from "react";
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
import type { FilterComponentProps, FilterOperator } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeStyle } from "../../core/constants/type-styles";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FilterTabs, useFilterTabs } from "./filter-tabs";

const SEPARATORS = [
  { label: "Ninguno", value: "none" },
  { label: "Tabulación", value: "tab" },
  { label: "Punto y coma", value: "semicolon" },
  { label: "Coma", value: "comma" },
  { label: "Espacio", value: "space" },
  { label: "Múltiples espacios", value: "multispace" },
  { label: "Nueva línea", value: "newline" },
] as const;

type SeparatorType = (typeof SEPARATORS)[number]["value"];

interface StringOption {
  value: string;
  count: number;
}

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
      return /$/; // No splitting
  }
};

export function StringFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  columnType,
  uniqueValues,
}: FilterComponentProps) {
  const [selectedOperator, setSelectedOperator] = useState<FilterOperator>(
    () => {
      return (
        (initialValue?.operator as FilterOperator) ||
        (uniqueValues.length <= 50 ? "in" : "contains")
      );
    }
  );

  const [selectedSeparator, setSelectedSeparator] = useState<SeparatorType>(
    () => {
      return (initialValue?.additionalValue as SeparatorType) || "none";
    }
  );

  const [exactMatch, setExactMatch] = useState<boolean>(() => {
    return (
      initialValue?.operator === "exactMatch" ||
      initialValue?.operator === "exactMatchAny"
    );
  });

  const [stringOptions, setStringOptions] = useState<StringOption[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStrings, setSelectedStrings] = useState<Set<string>>(() => {
    if (!initialValue?.value) return new Set<string>();
    if (typeof initialValue.value === "string") {
      return new Set(initialValue.value.split("|"));
    }
    if (Array.isArray(initialValue.value)) {
      return new Set(initialValue.value as string[]);
    }
    return new Set<string>();
  });

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const newSelected = new Set(selectedStrings);
    if (checked) {
      newSelected.add(value);
    } else {
      newSelected.delete(value);
    }
    setSelectedStrings(newSelected);
  };

  const handleApply = () => {
    const values = Array.from(selectedStrings);
    onApply({
      field: columnId,
      operator: selectedOperator,
      value: values,
      additionalValue: selectedSeparator,
    });
    onClose();
  };

  // Process unique values based on separator
  useEffect(() => {
    const valueCounts = new Map<string, number>();
    const validValues = new Set<string>();

    uniqueValues.forEach((option) => {
      const displayValue =
        typeof option.value === "string" ? option.value : String(option.value);

      if (selectedSeparator === "none") {
        valueCounts.set(
          displayValue,
          (valueCounts.get(displayValue) || 0) + option.count
        );
        validValues.add(displayValue);
      } else {
        const regex = getSeparatorRegex(selectedSeparator);
        const parts = displayValue
          .split(regex)
          .map((part) => part.trim())
          .filter((part) => part.length > 0);

        parts.forEach((part) => {
          valueCounts.set(part, (valueCounts.get(part) || 0) + option.count);
          validValues.add(part);
        });
      }
    });

    const options: StringOption[] = Array.from(valueCounts.entries())
      .map(([value, count]) => ({
        value,
        count,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));

    setStringOptions(options);

    // Solo mantener las selecciones que son válidas con el separador actual
    setSelectedStrings((prev) => {
      const newSelected = new Set<string>();
      prev.forEach((value) => {
        if (validValues.has(value)) {
          newSelected.add(value);
        }
      });
      return newSelected;
    });
  }, [uniqueValues, selectedSeparator]);

  // Hook para manejar los tabs
  const { filteredItems, counts } = useFilterTabs(
    stringOptions,
    Array.from(selectedStrings).map((str) => ({ value: str } as StringOption)),
    (item, selected) => item.value === selected.value
  );

  // Filter options based on search term and exact match setting
  const getFilteredOptions = (options: StringOption[]) =>
    options.filter((option) => {
      if (!searchTerm.trim()) return true;

      const searchLower = searchTerm.toLowerCase();
      const valueLower = option.value.toLowerCase();

      if (exactMatch) {
        // For exact match, create a regex that matches the whole word
        const regex = new RegExp(`\\b${searchLower}\\b`, "i");
        return regex.test(valueLower);
      } else {
        // For contains match, use simple includes
        return valueLower.includes(searchLower);
      }
    });

  // Aplicar filtro de búsqueda a cada tab
  const searchFilteredOptions = {
    todos: getFilteredOptions(filteredItems.todos),
    activos: getFilteredOptions(filteredItems.activos),
    inactivos: getFilteredOptions(filteredItems.inactivos),
  };

  // Función para renderizar lista de opciones
  const renderOptionsList = (options: StringOption[]) => (
    <ScrollArea className='flex-1 w-full rounded-md border'>
      <div className='p-4 space-y-1 min-h-[250px] max-h-[300px]'>
        {options.map((option, index) => (
          <div
            key={option.value}
            className={`flex items-start justify-between p-3 rounded-md hover:bg-muted/50 transition-colors ${
              index < options.length - 1 ? "border-b border-border/30" : ""
            }`}
          >
            <div className='flex items-start space-x-3 flex-1 min-w-0'>
              <Checkbox
                id={`string-${option.value}`}
                checked={selectedStrings.has(option.value)}
                onCheckedChange={(checked) => {
                  handleCheckboxChange(option.value, !!checked);
                }}
                className='mt-0.5 flex-shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <label
                  htmlFor={`string-${option.value}`}
                  className='text-sm cursor-pointer block'
                >
                  <span
                    className='break-all'
                    style={{
                      color: getTypeStyle(columnType || "string").text,
                    }}
                  >
                    {option.value || "(vacío)"}
                  </span>
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

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle(columnType || "string").bg
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-grow flex flex-col'>
        <div className='space-y-3'>
          <div>
            <Label htmlFor='operator-select' className='text-sm font-medium'>
              Operador
            </Label>
            <Select
              value={selectedOperator}
              onValueChange={(value: FilterOperator) =>
                setSelectedOperator(value)
              }
            >
              <SelectTrigger id='operator-select'>
                <SelectValue placeholder='Seleccionar operador' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='in'>Incluye cualquiera</SelectItem>
                <SelectItem value='contains'>Contiene texto</SelectItem>
                <SelectItem value='exactMatch'>Coincidencia exacta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedOperator === "in" && (
            <div>
              <Label htmlFor='separator-select' className='text-sm font-medium'>
                Separador para dividir valores
              </Label>
              <Select
                value={selectedSeparator}
                onValueChange={(value: SeparatorType) =>
                  setSelectedSeparator(value)
                }
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
          )}
        </div>

        {selectedOperator === "contains" && (
          <div className='flex items-center justify-between space-x-2'>
            <Label htmlFor='exact-match' className='text-sm'>
              Coincidencia exacta de palabra
            </Label>
            <Switch
              id='exact-match'
              checked={exactMatch}
              onCheckedChange={setExactMatch}
            />
          </div>
        )}

        {stringOptions.length > 0 && (
          <>
            <div className='text-sm text-muted-foreground'>
              {selectedStrings.size} valores seleccionados de{" "}
              {stringOptions.length} disponibles
            </div>

            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar valores...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>

            <div className='flex-1'>
              <FilterTabs counts={counts} defaultTab='todos'>
                {{
                  todos: renderOptionsList(searchFilteredOptions.todos),
                  activos: renderOptionsList(searchFilteredOptions.activos),
                  inactivos: renderOptionsList(searchFilteredOptions.inactivos),
                }}
              </FilterTabs>
            </div>
          </>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

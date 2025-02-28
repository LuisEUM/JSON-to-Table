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
import { getTypeStyle } from "../type-indicators";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
    case "none":
    default:
      return /(?!)/g; // Regex que no coincide con nada
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
  const [selectedSeparator, setSelectedSeparator] = useState<SeparatorType>(
    () => {
      if (!initialValue?.value) return "none";
      return typeof initialValue.value === "string" ? "comma" : "none";
    }
  );

  const [isInverted, setIsInverted] = useState(() => {
    if (!initialValue) return true;
    return !["notIn", "notContains"].includes(initialValue.operator);
  });

  const [exactMatch, setExactMatch] = useState(() => {
    if (!initialValue) return false;
    return ["exactWordMatch", "notExactWordMatch"].includes(
      initialValue.operator
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
    if (selectedStrings.size === 0) {
      onClear();
      onClose();
      return;
    }

    const selectedValues = Array.from(selectedStrings);

    let operator: FilterOperator;
    if (selectedSeparator === "none") {
      operator = isInverted ? "arrIncludesSome" : "notIn";
    } else {
      if (exactMatch) {
        // Use a custom operator for exact word matching
        operator = isInverted ? "exactWordMatch" : "notExactWordMatch";
      } else {
        operator = isInverted ? "includesString" : "notContains";
      }
    }

    onApply({
      field: columnId,
      operator,
      value:
        selectedSeparator === "none"
          ? selectedValues
          : selectedValues.join("|"),
    });
    onClose();
  };

  useEffect(() => {
    const valueCounts = new Map<string, number>();
    const validValues = new Set<string>();

    uniqueValues.forEach((option) => {
      if (typeof option.value === "string") {
        if (selectedSeparator === "none") {
          valueCounts.set(
            option.value,
            (valueCounts.get(option.value) || 0) + option.count
          );
          validValues.add(option.value);
        } else {
          const parts = option.value
            .split(getSeparatorRegex(selectedSeparator))
            .map((part) => part.trim())
            .filter(Boolean);

          parts.forEach((part) => {
            valueCounts.set(part, (valueCounts.get(part) || 0) + option.count);
            validValues.add(part);
          });
        }
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

  // Filter options based on search term and exact match setting
  const filteredOptions = stringOptions.filter((option) => {
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
        <Select
          value={selectedSeparator}
          onValueChange={(value: SeparatorType) => setSelectedSeparator(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecciona un separador' />
          </SelectTrigger>
          <SelectContent>
            <DialogTitle className='sr-only'>
              Seleccionar separador de texto
            </DialogTitle>
            {SEPARATORS.map((separator) => (
              <SelectItem key={separator.value} value={separator.value}>
                {separator.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className='flex items-center justify-between space-x-2'>
          <Label htmlFor='filter-mode' className='text-sm'>
            {isInverted ? "Incluir seleccionados" : "Excluir seleccionados"}
          </Label>
          <Switch
            id='filter-mode'
            checked={isInverted}
            onCheckedChange={setIsInverted}
          />
        </div>

        {selectedSeparator !== "none" && (
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

            <ScrollArea className='flex-1 w-full rounded-md border'>
              <div className='p-4 space-y-2 h-[200px]'>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id={option.value}
                        checked={selectedStrings.has(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(option.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={option.value}
                        className='overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px]'
                      >
                        {option.value}
                      </Label>
                    </div>
                    <span className='text-sm text-muted-foreground ml-2'>
                      {option.count}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {stringOptions.length === 0 && (
          <div className='flex-1 flex items-center justify-center text-muted-foreground text-sm'>
            No hay valores disponibles
          </div>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

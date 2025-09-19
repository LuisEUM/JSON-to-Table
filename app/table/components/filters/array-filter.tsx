"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import type { FilterComponentProps, FilterValue } from "./filter-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterFooter } from "./filter-footer";
import { getTypeStyle } from "../type-indicators";
import { processValue, type ProcessedItem } from "../../data-processor";
import { TypeDot } from "../type-indicators";
import { FilterTabs, useFilterTabs } from "./filter-tabs";

interface FilterItem {
  value: unknown;
  displayValue?: string;
  count: number;
  type?: string;
}

export function ArrayFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  uniqueValues,
  arrayType,
}: FilterComponentProps & { arrayType?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<FilterValue[]>(() => {
    const initial = (initialValue?.value as FilterValue[]) || [];
    console.log("🔍 ArrayFilter loading initial values:", {
      columnId,
      initialValue,
      extractedValues: initial,
      count: initial.length,
    });
    return initial;
  });

  // Detectar el tipo real del array analizando el contenido
  const detectedArrayType = useMemo(() => {
    if (arrayType) {
      console.log("🎯 ArrayFilter using provided arrayType:", arrayType);
      return arrayType;
    }

    // Analizar una muestra de los valores únicos para determinar el tipo
    const sampleArrays = uniqueValues
      .slice(0, 10)
      .map((option) => option.original as ProcessedItem)
      .filter((item) => Array.isArray(item?.value))
      .map((item) => item.value as unknown[]);

    if (sampleArrays.length === 0) {
      console.log("🎯 ArrayFilter: No arrays found, defaulting to 'array'");
      return "array";
    }

    // Verificar si algún array contiene objetos
    const hasObjects = sampleArrays.some((arr) =>
      arr.some(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          !Array.isArray(item) &&
          !(item instanceof Date)
      )
    );

    const detectedType = hasObjects ? "array[objeto]" : "array[primitivo]";
    console.log("🎯 ArrayFilter detected type:", {
      columnId,
      detectedType,
      sampleCount: sampleArrays.length,
      hasObjects,
      sampleItems: sampleArrays.slice(0, 2).map((arr) => arr.slice(0, 3)),
    });

    return detectedType;
  }, [arrayType, uniqueValues, columnId]);

  // Extraer valores únicos de los arrays y contar ocurrencias
  const allUniqueValues = uniqueValues.reduce<
    Map<string, { count: number; originalValue: unknown; type: string }>
  >((acc, option) => {
    // option.original ahora es un ProcessedItem completo
    const processedItem = option.original as ProcessedItem;

    if (Array.isArray(processedItem?.value)) {
      processedItem.value.forEach((item) => {
        let displayKey: string;
        let displayType: string;
        let originalValue: unknown = item;

        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          // Para objetos, crear una representación legible
          const obj = item as Record<string, unknown>;

          // Buscar campos comunes para el nombre
          const nameFields = ["name", "nombre", "title", "titulo", "label"];
          const idFields = ["id", "_id", "key", "codigo", "code"];

          let nameValue = "";
          let idValue = "";

          for (const field of nameFields) {
            if (obj[field] && typeof obj[field] === "string") {
              nameValue = String(obj[field]);
              break;
            }
          }

          for (const field of idFields) {
            if (obj[field]) {
              idValue = String(obj[field]);
              break;
            }
          }

          if (nameValue && idValue) {
            displayKey = `${nameValue} (${idValue})`;
          } else if (nameValue) {
            displayKey = nameValue;
          } else if (idValue) {
            displayKey = `ID: ${idValue}`;
          } else {
            // Mostrar las primeras propiedades
            const entries = Object.entries(obj).slice(0, 2);
            displayKey = entries
              .map(([key, val]) => `${key}: ${String(val).slice(0, 20)}`)
              .join(", ");
            if (Object.keys(obj).length > 2) {
              displayKey += "...";
            }
          }
          displayType = "objeto";
        } else {
          // Para valores primitivos, usar el procesamiento normal
          const processedItem = processValue(item, columnId, undefined);
          displayKey =
            processedItem.type === "boolean"
              ? processedItem.value
                ? "1"
                : "0"
              : String(processedItem.value);
          displayType = processedItem.type;
        }

        const existing = acc.get(displayKey);
        if (existing) {
          existing.count++;
        } else {
          acc.set(displayKey, { count: 1, originalValue, type: displayType });
        }
      });
    }
    return acc;
  }, new Map());

  const allFilterItems = Array.from(allUniqueValues.entries())
    .map(([displayKey, { count, originalValue, type }]): FilterItem => {
      return {
        value: originalValue, // Mantener el valor original para el filtrado
        displayValue: displayKey, // Valor para mostrar
        count,
        type,
      };
    })
    .sort((a, b) =>
      (a.displayValue || String(a.value)).localeCompare(
        b.displayValue || String(b.value)
      )
    );

  // Función de comparación para objetos
  const compareItems = (item: FilterItem, selected: FilterValue) => {
    if (
      typeof item.value === "object" &&
      typeof selected === "object" &&
      item.value !== null &&
      selected !== null
    ) {
      return JSON.stringify(item.value) === JSON.stringify(selected);
    }
    return item.value === selected;
  };

  // Hook para manejar los tabs
  const { filteredItems, counts } = useFilterTabs(
    allFilterItems,
    selectedValues.map((val) => ({ value: val } as FilterItem)),
    (item, selected) => compareItems(item, selected.value)
  );

  // Aplicar filtro de búsqueda a cada tab
  const searchFilteredItems = {
    todos: filteredItems.todos.filter((item) =>
      (item.displayValue || String(item.value))
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ),
    activos: filteredItems.activos.filter((item) =>
      (item.displayValue || String(item.value))
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ),
    inactivos: filteredItems.inactivos.filter((item) =>
      (item.displayValue || String(item.value))
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ),
  };

  const handleApply = () => {
    console.log("🎯 ArrayFilter applying filter:", {
      field: columnId,
      operator: "arrIncludesSome",
      value: selectedValues as FilterValue[],
      selectedValuesTypes: selectedValues.map((v) => typeof v),
      selectedValuesPreview: selectedValues.map((v) =>
        typeof v === "object" ? JSON.stringify(v).slice(0, 100) : v
      ),
    });

    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: selectedValues as FilterValue[],
    });
    onClose();
  };

  const formatValue = (item: FilterItem): string => {
    // Si tenemos un displayValue, usarlo
    if (item.displayValue) {
      return item.displayValue;
    }

    // Fallback al valor original
    const value = item.value;
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Función para renderizar lista de elementos
  const renderItemsList = (items: FilterItem[]) => (
    <ScrollArea className='w-full rounded-md border'>
      <div className='p-4 space-y-1 min-h-[250px] max-h-[300px]'>
        {items.map((item) => {
          const { value, count, type } = item;
          const valueString = formatValue(item);
          const uniqueKey = `${valueString}-${count}-${type}`;

          return (
            <div
              key={uniqueKey}
              className='flex items-center space-x-2 px-2 py-1.5 hover:bg-muted/50 rounded-sm'
            >
              <div className='flex items-center justify-between w-full'>
                <Checkbox
                  id={uniqueKey}
                  checked={selectedValues.some((selectedValue) => {
                    // Para objetos, comparar por contenido
                    if (
                      typeof value === "object" &&
                      typeof selectedValue === "object" &&
                      value !== null &&
                      selectedValue !== null
                    ) {
                      return (
                        JSON.stringify(value) === JSON.stringify(selectedValue)
                      );
                    }
                    // Para primitivos, comparación directa
                    return selectedValue === value;
                  })}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedValues([
                        ...selectedValues,
                        value as FilterValue,
                      ]);
                    } else {
                      setSelectedValues(
                        selectedValues.filter((selectedValue) => {
                          // Para objetos, comparar por contenido
                          if (
                            typeof value === "object" &&
                            typeof selectedValue === "object" &&
                            value !== null &&
                            selectedValue !== null
                          ) {
                            return (
                              JSON.stringify(value) !==
                              JSON.stringify(selectedValue)
                            );
                          }
                          // Para primitivos, comparación directa
                          return selectedValue !== value;
                        })
                      );
                    }
                  }}
                />
                <label
                  htmlFor={uniqueKey}
                  className='cursor-pointer text-sm flex-1 flex items-center gap-2 ml-2'
                >
                  <TypeDot type={type || "unknown"} />
                  <span className='truncate max-w-[200px]' title={valueString}>
                    {valueString}
                  </span>
                  <span className='text-xs text-muted-foreground ml-auto'>
                    ({count})
                  </span>
                </label>
              </div>
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
          Filtro para array de tipo:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle(detectedArrayType).bg
            }`}
          ></span>{" "}
          {columnName} ({detectedArrayType})
        </h3>
      </div>

      <div className='space-y-4 flex-grow flex flex-col'>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar valores...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>

        <div className='flex-grow'>
          <FilterTabs counts={counts} defaultTab='todos'>
            {{
              todos: renderItemsList(searchFilteredItems.todos),
              activos: renderItemsList(searchFilteredItems.activos),
              inactivos: renderItemsList(searchFilteredItems.inactivos),
            }}
          </FilterTabs>
        </div>

        <div className='pt-2 text-sm text-muted-foreground'>
          {selectedValues.length} de {allFilterItems.length} seleccionados
        </div>
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

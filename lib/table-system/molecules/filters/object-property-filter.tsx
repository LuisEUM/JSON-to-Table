"use client";

import { useState, useEffect, useMemo } from "react";
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
import { FilterTabs, useFilterTabs } from "./filter-tabs";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DataPatternAnalyzer, type ObjectSchema } from "./pattern-analyzer";

interface PropertyFilter {
  property: string;
  values: Set<string>;
}

interface PropertyOption {
  path: string;
  value: string;
  count: number;
  displayValue: string;
}

export function ObjectPropertyFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  columnType,
  uniqueValues,
}: FilterComponentProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [isInverted, setIsInverted] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);

  // Analyze the data pattern
  const analysis = useMemo(() => {
    return DataPatternAnalyzer.analyzeColumn(uniqueValues);
  }, [uniqueValues]);

  // Extract available properties from the schema
  const availableProperties = useMemo(() => {
    if (analysis.type !== "object-property" || !analysis.schema) {
      return [];
    }

    return Object.entries(analysis.schema.properties)
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .map(([key, prop]) => ({
        key,
        label: `${key} (${prop.type}) - ${prop.frequency} valores`,
        frequency: prop.frequency,
        type: prop.type,
      }));
  }, [analysis]);

  // Extract property values when a property is selected
  useEffect(() => {
    if (!selectedProperty || analysis.type !== "object-property") {
      setPropertyOptions([]);
      return;
    }

    const valueCounts = new Map<string, number>();

    uniqueValues.forEach((option) => {
      // Helper function to get nested property value with enhanced path handling
      const getNestedPropertyValue = (
        obj: unknown,
        propertyPath: string
      ): unknown[] => {
        const values: unknown[] = [];

        // Handle dot notation paths (e.g., "items.value", "customFields.label")
        const pathParts = propertyPath.split(".");

        const extractValue = (current: unknown, parts: string[]): void => {
          if (parts.length === 0) return;

          const [currentPart, ...remainingParts] = parts;

          if (typeof current === "object" && current !== null) {
            if (Array.isArray(current)) {
              // For arrays, extract from each item
              current.forEach((item) => {
                if (typeof item === "object" && item !== null) {
                  const itemValue = (item as Record<string, unknown>)[
                    currentPart
                  ];
                  if (remainingParts.length === 0) {
                    // This is the final property
                    if (itemValue !== null && itemValue !== undefined) {
                      values.push(itemValue);
                    }
                  } else {
                    // Continue down the path
                    extractValue(itemValue, remainingParts);
                  }
                }
              });
            } else {
              // For objects, get the property
              const directValue = (current as Record<string, unknown>)[
                currentPart
              ];
              if (remainingParts.length === 0) {
                // This is the final property
                if (directValue !== null && directValue !== undefined) {
                  values.push(directValue);
                }
              } else {
                // Continue down the path
                extractValue(directValue, remainingParts);
              }
            }
          }
        };

        extractValue(obj, pathParts);
        return values;
      };

      const propertyValues = getNestedPropertyValue(
        option.original,
        selectedProperty
      );

      propertyValues.forEach((value) => {
        if (Array.isArray(value)) {
          // For arrays, extract each individual element as a separate filter option
          value.forEach((arrayItem) => {
            let displayValue: string;

            if (typeof arrayItem === "object" && arrayItem !== null) {
              try {
                // Create a more readable JSON-like format
                const obj = arrayItem as Record<string, unknown>;
                const entries = Object.entries(obj);

                if (entries.length > 0) {
                  const formattedProps = entries.map(([key, value]) => {
                    let formattedValue: string;
                    if (typeof value === "string") {
                      formattedValue = `"${value}"`;
                    } else if (value === null) {
                      formattedValue = "null";
                    } else if (Array.isArray(value)) {
                      if (value.length === 0) {
                        formattedValue = "[]";
                      } else if (value.length <= 3) {
                        // Show all elements for small arrays
                        const elements = value.map((item) => {
                          if (typeof item === "string") return `"${item}"`;
                          if (typeof item === "object" && item !== null)
                            return "{...}";
                          return String(item);
                        });
                        formattedValue = `[${elements.join(", ")}]`;
                      } else {
                        // Show first 3 elements for larger arrays
                        const firstElements = value.slice(0, 3).map((item) => {
                          if (typeof item === "string") return `"${item}"`;
                          if (typeof item === "object" && item !== null)
                            return "{...}";
                          return String(item);
                        });
                        formattedValue = `[${firstElements.join(", ")}, ... +${
                          value.length - 3
                        } más]`;
                      }
                    } else if (typeof value === "object") {
                      formattedValue = "{...}";
                    } else {
                      formattedValue = String(value);
                    }
                    return `  ${key}: ${formattedValue}`;
                  });

                  displayValue = `{\n${formattedProps.join(",\n")}\n}`;
                } else {
                  displayValue = "{}";
                }
              } catch {
                displayValue = "[Objeto inválido]";
              }
            } else {
              displayValue = String(arrayItem);
            }

            valueCounts.set(
              displayValue,
              (valueCounts.get(displayValue) || 0) + option.count
            );
          });
        } else if (typeof value === "object" && value !== null) {
          // For object values, create readable JSON format
          let displayValue: string;
          try {
            const obj = value as Record<string, unknown>;
            const entries = Object.entries(obj);

            if (entries.length > 0) {
              const formattedProps = entries.map(([key, propValue]) => {
                let formattedValue: string;
                if (typeof propValue === "string") {
                  formattedValue = `"${propValue}"`;
                } else if (propValue === null) {
                  formattedValue = "null";
                } else if (Array.isArray(propValue)) {
                  if (propValue.length === 0) {
                    formattedValue = "[]";
                  } else if (propValue.length <= 3) {
                    // Show all elements for small arrays
                    const elements = propValue.map((item) => {
                      if (typeof item === "string") return `"${item}"`;
                      if (typeof item === "object" && item !== null)
                        return "{...}";
                      return String(item);
                    });
                    formattedValue = `[${elements.join(", ")}]`;
                  } else {
                    // Show first 3 elements for larger arrays
                    const firstElements = propValue.slice(0, 3).map((item) => {
                      if (typeof item === "string") return `"${item}"`;
                      if (typeof item === "object" && item !== null)
                        return "{...}";
                      return String(item);
                    });
                    formattedValue = `[${firstElements.join(", ")}, ... +${
                      propValue.length - 3
                    } más]`;
                  }
                } else if (typeof propValue === "object") {
                  formattedValue = "{...}";
                } else {
                  formattedValue = String(propValue);
                }
                return `  ${key}: ${formattedValue}`;
              });

              displayValue = `{\n${formattedProps.join(",\n")}\n}`;
            } else {
              displayValue = "{}";
            }
          } catch {
            displayValue = "[Objeto inválido]";
          }
          valueCounts.set(
            displayValue,
            (valueCounts.get(displayValue) || 0) + option.count
          );
        } else {
          // For primitive values, show them directly
          const displayValue = String(value);
          valueCounts.set(
            displayValue,
            (valueCounts.get(displayValue) || 0) + option.count
          );
        }
      });
    });

    const options: PropertyOption[] = Array.from(valueCounts.entries())
      .map(([displayValue, count]) => ({
        path: selectedProperty,
        value: displayValue.toLowerCase(),
        count,
        displayValue,
      }))
      .sort((a, b) => a.displayValue.localeCompare(b.displayValue));

    setPropertyOptions(options);

    // Reset selected values when property changes
    setSelectedValues(new Set());
  }, [selectedProperty, uniqueValues, analysis]);

  // Initialize from existing filter
  useEffect(() => {
    if (!initialValue?.value) return;

    if (
      typeof initialValue.value === "string" &&
      initialValue.value.includes(".")
    ) {
      // Try to extract property from existing filter
      const parts = initialValue.value.split(".");
      if (parts.length >= 2) {
        setSelectedProperty(parts[0]);
      }
    }

    setIsInverted(!["notIn", "notContains"].includes(initialValue.operator));
  }, [initialValue]);

  // Hook para manejar los tabs
  const { filteredItems, counts } = useFilterTabs(
    propertyOptions,
    Array.from(selectedValues).map(
      (value) =>
        ({
          value,
          label: value,
          count: 0,
        } as PropertyOption)
    ),
    (item, selected) => item.value === selected.value
  );

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const newSelected = new Set(selectedValues);
    if (checked) {
      newSelected.add(value);
    } else {
      newSelected.delete(value);
    }
    setSelectedValues(newSelected);
  };

  const handleApply = () => {
    if (!selectedProperty || selectedValues.size === 0) {
      onClear();
      onClose();
      return;
    }

    const selectedArray = Array.from(selectedValues);

    // Always use objectPropertyFilter for object-based filtering
    // The inclusion/exclusion logic is handled in the filter function itself
    const operator: FilterOperator = "objectPropertyFilter";

    // Add a flag to indicate whether it's inverted
    onApply({
      field: columnId,
      operator,
      value: selectedArray,
      // Add custom metadata to indicate if this should be inverted
      additionalValue: isInverted ? "include" : "exclude",
    });

    onClose();
  };

  // Filter options based on search term
  const filteredOptions = propertyOptions.filter((option) => {
    if (!searchTerm.trim()) return true;
    return option.displayValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Don't render if this isn't suitable for object property filtering
  if (analysis.type !== "object-property" || !analysis.schema) {
    return null;
  }

  // Función para renderizar lista de opciones
  const renderOptionsList = (options: PropertyOption[]) => (
    <ScrollArea className='flex-1 w-full rounded-md border'>
      <div className='p-4 space-y-1 min-h-[250px] max-h-[300px]'>
        {options
          .filter((option) => {
            if (!searchTerm.trim()) return true;
            return option.displayValue
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          })
          .map((option, index) => (
            <div
              key={option.value}
              className={`flex items-start justify-between p-3 rounded-md hover:bg-muted/50 transition-colors ${
                index < options.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <div className='flex items-start space-x-3 flex-1 min-w-0'>
                <Checkbox
                  id={`object-${option.value}`}
                  checked={selectedValues.has(option.value)}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange(option.value, !!checked);
                  }}
                  className='mt-0.5 flex-shrink-0'
                />
                <div className='flex-1 min-w-0'>
                  <label
                    htmlFor={`object-${option.value}`}
                    className='text-sm cursor-pointer block'
                  >
                    <span
                      className='break-all'
                      style={{
                        color: getTypeStyle(columnType).text,
                      }}
                    >
                      {option.displayValue}
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
    <div className='w-full h-full min-h-[400px] flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro inteligente para:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle(columnType || "objeto").bg
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-1'>
        {/* Schema info */}
        <div className='text-xs text-muted-foreground bg-muted p-2 rounded'>
          Estructura detectada:{" "}
          {analysis.schema.isHomogeneous ? "Homogénea" : "Mixta"}(
          {analysis.schema.totalSamples} muestras,{" "}
          {Object.keys(analysis.schema.properties).length} propiedades)
        </div>

        {/* Property selector */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>
            Selecciona la propiedad a filtrar:
          </Label>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger>
              <SelectValue placeholder='Elige una propiedad del objeto...' />
            </SelectTrigger>
            <SelectContent>
              <DialogTitle className='sr-only'>
                Seleccionar propiedad del objeto
              </DialogTitle>
              {availableProperties.map((prop) => (
                <SelectItem key={prop.key} value={prop.key}>
                  {prop.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Include/Exclude toggle */}
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

        {/* Property values */}
        {selectedProperty && propertyOptions.length > 0 && (
          <>
            <div className='text-sm text-muted-foreground'>
              {selectedValues.size} valores seleccionados de{" "}
              {propertyOptions.length} disponibles para "{selectedProperty}"
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
                  todos: renderOptionsList(filteredItems.todos),
                  activos: renderOptionsList(filteredItems.activos),
                  inactivos: renderOptionsList(filteredItems.inactivos),
                }}
              </FilterTabs>
            </div>
          </>
        )}

        {selectedProperty && propertyOptions.length === 0 && (
          <div className='flex-1 flex items-center justify-center text-muted-foreground text-sm'>
            No hay valores disponibles para la propiedad "{selectedProperty}"
          </div>
        )}

        {!selectedProperty && (
          <div className='flex-1 flex items-center justify-center text-muted-foreground text-sm'>
            Selecciona una propiedad para ver los valores disponibles
          </div>
        )}
      </div>

      <FilterFooter onClear={onClear} onClose={onClose} onApply={handleApply} />
    </div>
  );
}

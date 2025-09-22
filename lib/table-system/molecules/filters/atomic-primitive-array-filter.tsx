"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FilterComponentProps, FilterValue } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { FilterTabs, useFilterTabs } from "./filter-tabs";
import { getTypeStyle } from "../../core/constants/type-styles";
import { processValue, type ProcessedItem } from "../../core";

interface PrimitiveGroup {
  type: string;
  values: Array<{
    value: unknown;
    count: number;
    original: ProcessedItem;
  }>;
  displayName: string;
}

interface PrimitiveArrayFilterProps extends FilterComponentProps {
  arrayType?: string;
}

export function AtomicPrimitiveArrayFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  uniqueValues,
  arrayType,
}: PrimitiveArrayFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<FilterValue[]>(() => {
    const initial = (initialValue?.value as FilterValue[]) || [];
    return initial;
  });

  // Analizar y agrupar valores por tipo de primitivo con acordiones predefinidos
  const primitiveGroups = useMemo(() => {
    // Inicializar todos los tipos posibles
    const allTypes = {
      fecha: { values: new Map(), displayName: "Fechas" },
      número: { values: new Map(), displayName: "Valores Numéricos" },
      boolean: { values: new Map(), displayName: "Valores Booleanos" },
      string: { values: new Map(), displayName: "Valores de Texto" },
    };

    uniqueValues.forEach((option) => {
      const processedItem = option.original as ProcessedItem;

      // Función para procesar un elemento individual
      const processElement = (item: unknown) => {
        const processed = processValue(item, columnId, undefined);
        let type = processed.type;

        // DETECCIÓN AGRESIVA DE FECHAS - Forzar detección sin muestreo
        if (typeof item === "string") {
          const datePatterns = [
            /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/, // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
            /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/, // YYYY-MM-DD, YYYY/MM/DD
            /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/, // DD Month YYYY
          ];

          const isLikelyDate = datePatterns.some((pattern) =>
            pattern.test(item)
          );

          if (isLikelyDate) {
            try {
              let testDate: Date | null = null;

              // DD-MM-YYYY o DD/MM/YYYY
              if (/^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/.test(item)) {
                const parts = item.split(/[-\/\.]/);
                const [first, second, year] = parts.map(Number);

                // Intentar DD-MM-YYYY primero (más común en Europa)
                testDate = new Date(year, second - 1, first);

                // Si no es válida, intentar MM-DD-YYYY
                if (isNaN(testDate.getTime()) || first > 31 || second > 12) {
                  testDate = new Date(year, first - 1, second);
                }
              }
              // YYYY-MM-DD
              else if (/^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/.test(item)) {
                testDate = new Date(item);
              }

              // Validar que la fecha es razonable
              if (
                testDate &&
                !isNaN(testDate.getTime()) &&
                testDate.getFullYear() >= 1900 &&
                testDate.getFullYear() <= 2100
              ) {
                type = "fecha";
              }
            } catch (e) {
              // Mantener como string
            }
          }
        }

        const displayKey = String(item);

        // Solo procesar tipos que tenemos definidos
        if (allTypes[type as keyof typeof allTypes]) {
          const typeGroup = allTypes[type as keyof typeof allTypes];
          const existing = typeGroup.values.get(displayKey);

          if (existing) {
            existing.count++;
          } else {
            typeGroup.values.set(displayKey, {
              count: 1,
              originalValue: item,
              processedItem: {
                ...processed,
                type,
                id: `${columnId}_${displayKey}`,
                path: processed.path || [],
              },
            });
          }
        }
      };

      // Procesar arrays
      if (Array.isArray(processedItem?.value)) {
        processedItem.value.forEach((item) => processElement(item));
      }
      // Procesar valores individuales (strings, números, etc.)
      else if (processedItem?.value != null) {
        processElement(processedItem.value);
      }
    });

    // Convertir a estructura de grupos - INCLUIR TODOS, incluso los vacíos
    const groups: PrimitiveGroup[] = Object.entries(allTypes).map(
      ([type, data]) => ({
        type,
        displayName: data.displayName,
        values: Array.from(data.values.entries())
          .map(([, data]) => ({
            value: data.originalValue,
            count: data.count,
            original: data.processedItem,
          }))
          .sort((a, b) => String(a.value).localeCompare(String(b.value))),
      })
    );

    // Ordenar: grupos con datos primero, luego por cantidad
    const sortedGroups = groups.sort((a, b) => {
      if (a.values.length === 0 && b.values.length === 0) return 0;
      if (a.values.length === 0) return 1;
      if (b.values.length === 0) return -1;
      return b.values.length - a.values.length;
    });

    return sortedGroups.filter((group) => group.values.length > 0); // Solo grupos con datos
  }, [uniqueValues, columnId]);

  // Función para obtener colores por tipo
  function getTypeColor(type: string): string {
    switch (type) {
      case "fecha":
        return "bg-purple-500";
      case "número":
        return "bg-blue-500";
      case "boolean":
        return "bg-orange-500";
      case "string":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }

  // Función para manejar cambios de selección por grupo
  const handleGroupSelectionChange = (
    group: PrimitiveGroup,
    newGroupSelection: FilterValue[]
  ) => {
    // Remover todas las selecciones de este grupo
    const otherGroupValues = selectedValues.filter(
      (value) => !group.values.some((item) => item.value === value)
    );

    // Agregar las nuevas selecciones del grupo
    const updatedSelection = [...otherGroupValues, ...newGroupSelection];
    setSelectedValues(updatedSelection);
  };

  // Función para obtener selección actual de un grupo
  const getGroupSelection = (group: PrimitiveGroup): FilterValue[] => {
    return selectedValues.filter((value) =>
      group.values.some((item) => item.value === value)
    );
  };

  // Función para renderizar componente de filtro por grupo usando la estructura original
  const renderFilterComponent = (group: PrimitiveGroup) => {
    const groupSelection = getGroupSelection(group);

    // Usar FilterTabs como los filtros originales
    const { filteredItems, counts } = useFilterTabs(
      group.values,
      groupSelection.map((value) => ({ value })),
      (item, selected) => item.value === selected.value
    );

    // Filtrar por búsqueda
    const searchFilteredItems = {
      todos: filteredItems.todos.filter((item) =>
        String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
      ),
      activos: filteredItems.activos.filter((item) =>
        String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
      ),
      inactivos: filteredItems.inactivos.filter((item) =>
        String(item.value).toLowerCase().includes(searchTerm.toLowerCase())
      ),
    };

    const handleCheckboxChange = (value: unknown, checked: boolean) => {
      const currentSelection = getGroupSelection(group);
      const newSelection = new Set(currentSelection);

      if (checked) {
        newSelection.add(value as FilterValue);
      } else {
        newSelection.delete(value as FilterValue);
      }

      handleGroupSelectionChange(group, Array.from(newSelection));
    };

    // Función para renderizar lista de opciones (igual que los filtros originales)
    const renderOptionsList = (options: typeof group.values) => (
      <div className='p-4 space-y-1 min-h-[200px] max-h-[250px] overflow-y-auto'>
        {options.map((option, index) => (
          <div
            key={`${String(option.value)}-${index}`}
            className={`flex items-start justify-between p-3 rounded-md hover:bg-muted/50 transition-colors ${
              index < options.length - 1 ? "border-b border-border/30" : ""
            }`}
          >
            <div className='flex items-start space-x-3 flex-1 min-w-0'>
              <input
                type='checkbox'
                id={`${group.type}-${index}`}
                checked={groupSelection.some(
                  (selected) => selected === option.value
                )}
                onChange={(e) =>
                  handleCheckboxChange(option.value, e.target.checked)
                }
                className='mt-0.5 flex-shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <label
                  htmlFor={`${group.type}-${index}`}
                  className='text-sm cursor-pointer block'
                >
                  <span
                    className='break-all'
                    style={{
                      color: getTypeStyle(group.type).text,
                    }}
                  >
                    {String(option.value) || "(vacío)"}
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
    );

    return (
      <div className='space-y-4'>
        <FilterTabs counts={counts} defaultTab='todos'>
          {{
            todos: renderOptionsList(searchFilteredItems.todos),
            activos: renderOptionsList(searchFilteredItems.activos),
            inactivos: renderOptionsList(searchFilteredItems.inactivos),
          }}
        </FilterTabs>

        <div className='text-xs text-muted-foreground'>
          {groupSelection.length} de {group.values.length} seleccionados
        </div>
      </div>
    );
  };

  const handleApply = () => {
    if (selectedValues.length === 0) {
      onClear();
      return;
    }

    onApply({
      operator: "arrIncludesSome",
      value: selectedValues,
    });
  };

  const handleClear = () => {
    setSelectedValues([]);
    onClear();
  };

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      {/* Título consistente con filtros originales */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium'>
          Filtro para array de primitivos:{" "}
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              getTypeStyle("array[primitivo]").bg
            }`}
          ></span>{" "}
          {columnName}
        </h3>
      </div>

      <div className='space-y-4 flex-grow flex flex-col'>
        {/* Búsqueda global */}
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar en todos los tipos...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>

        {/* Conteo global */}
        <div className='text-sm text-muted-foreground'>
          {selectedValues.length} valores seleccionados de{" "}
          {primitiveGroups.reduce((acc, group) => acc + group.values.length, 0)}{" "}
          únicos
        </div>

        {/* Acordiones por tipo de primitivo - Solo mostrar los que tienen datos */}
        <div className='flex-grow'>
          <Accordion type='multiple' className='w-full'>
            {primitiveGroups.map((group) => (
              <AccordionItem key={group.type} value={group.type}>
                <AccordionTrigger className='text-sm'>
                  <div className='flex items-center gap-2'>
                    {/* Usar div en lugar de TypeDot para evitar botón anidado */}
                    <div
                      className={`w-3 h-3 rounded-full ${getTypeColor(
                        group.type
                      )}`}
                    />
                    <span>{group.displayName}</span>
                    <span className='text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full'>
                      {group.values.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className='pt-2'>{renderFilterComponent(group)}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <FilterFooter
        onClear={handleClear}
        onClose={onClose}
        onApply={handleApply}
      />
    </div>
  );
}

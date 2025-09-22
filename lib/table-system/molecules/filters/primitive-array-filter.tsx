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
import { getTypeStyle } from "../../core/constants/type-styles";
import { processValue, type ProcessedItem } from "../../core";
// import { TypeDot } from "../../atoms/indicators/TypeDot"; // Removido para evitar botón anidado

// Importar componentes de filtro embebidos mejorados
import {
  EnhancedEmbeddedStringFilter,
  EnhancedEmbeddedNumberFilter,
  EnhancedEmbeddedDateFilter,
  EnhancedEmbeddedBooleanFilter,
} from "./enhanced-embedded-filters";

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

export function PrimitiveArrayFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  uniqueValues,
}: PrimitiveArrayFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<FilterValue[]>(() => {
    const initial = (initialValue?.value as FilterValue[]) || [];
    console.log("🔍 PrimitiveArrayFilter loading initial values:", {
      columnId,
      initialValue,
      extractedValues: initial,
      count: initial.length,
    });
    return initial;
  });

  // Analizar y agrupar valores por tipo de primitivo con acordiones predefinidos
  const primitiveGroups = useMemo(() => {
    console.log("🚀 PRIMITIVE ARRAY FILTER EJECUTÁNDOSE:", {
      columnId,
      uniqueValuesCount: uniqueValues.length,
      sampleValues: uniqueValues.slice(0, 5).map((v) => v.original),
    });

    // Inicializar todos los tipos posibles
    const allTypes = {
      fecha: { values: new Map(), displayName: "Fechas" },
      número: { values: new Map(), displayName: "Valores Numéricos" },
      boolean: { values: new Map(), displayName: "Valores Booleanos" },
      string: { values: new Map(), displayName: "Valores de Texto" },
    };

    uniqueValues.forEach((option) => {
      const processedItem = option.original as ProcessedItem;

      if (Array.isArray(processedItem?.value)) {
        processedItem.value.forEach((item) => {
          // Procesar cada elemento del array para determinar su tipo
          const processed = processValue(item, columnId, undefined);
          let type = processed.type;

          // DETECCIÓN AGRESIVA DE FECHAS - Forzar detección sin muestreo
          if (typeof item === "string") {
            // Patrones de fecha comunes
            const datePatterns = [
              /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/, // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
              /^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}$/, // YYYY-MM-DD, YYYY/MM/DD
              /^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/, // DD Month YYYY
            ];

            const isLikelyDate = datePatterns.some((pattern) =>
              pattern.test(item)
            );

            if (isLikelyDate) {
              console.log("📅 FECHA DETECTADA:", {
                item,
                processedType: processed.type,
                willForceAsDate: true,
              });

              // Intentar validar como fecha
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
                  console.log("✅ FECHA FORZADA EXITOSAMENTE:", {
                    originalItem: item,
                    newType: type,
                    dateObject: testDate,
                  });
                }
              } catch (e) {
                console.log("❌ Date validation failed:", e);
              }
            }
          }

          const displayKey = String(item); // Usar valor original para la clave

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
        });
      }
      // NUEVO: Procesar valores individuales (no arrays)
      else if (processedItem?.value != null) {
        const item = processedItem.value;

        // Procesar el valor individual para determinar su tipo
        const processed = processValue(item, columnId, undefined);
        let type = processed.type;

        // DETECCIÓN AGRESIVA DE FECHAS para valores individuales
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
            console.log("📅 FECHA INDIVIDUAL DETECTADA:", {
              item,
              processedType: processed.type,
              willForceAsDate: true,
            });

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
                console.log("✅ FECHA INDIVIDUAL FORZADA EXITOSAMENTE:", {
                  originalItem: item,
                  newType: type,
                  dateObject: testDate,
                });
              }
            } catch (e) {
              console.log("❌ Individual date validation failed:", e);
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

    console.log("🎯 TODOS LOS GRUPOS CREADOS:", {
      columnId,
      groups: groups.map((g) => ({
        type: g.type,
        count: g.values.length,
        displayName: g.displayName,
        sampleValues: g.values.slice(0, 3).map((v) => v.value),
        isEmpty: g.values.length === 0,
      })),
    });

    // Ordenar: grupos con datos primero, luego por cantidad
    const sortedGroups = groups.sort((a, b) => {
      if (a.values.length === 0 && b.values.length === 0) return 0;
      if (a.values.length === 0) return 1;
      if (b.values.length === 0) return -1;
      return b.values.length - a.values.length;
    });

    console.log(
      "🏆 RESULTADO FINAL - Todos los grupos:",
      sortedGroups.map((g) => `${g.displayName}: ${g.values.length} items`)
    );

    return sortedGroups;
  }, [uniqueValues, columnId]);

  // Función para obtener nombre de display para cada tipo (ya no se usa, se define en allTypes)
  // function getDisplayNameForType(type: string): string {
  //   switch (type) {
  //     case "string":
  //       return "Valores de Texto";
  //     case "número":
  //       return "Valores Numéricos";
  //     case "fecha":
  //       return "Fechas";
  //     case "boolean":
  //       return "Valores Booleanos";
  //     default:
  //       return `Valores ${type}`;
  //   }
  // }

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
    // Remover valores anteriores de este grupo
    const groupValues = group.values.map((v) => v.value);
    const withoutGroupValues = selectedValues.filter(
      (val) => !groupValues.includes(val)
    );

    // Agregar nuevos valores seleccionados
    const updatedSelection = [...withoutGroupValues, ...newGroupSelection];
    setSelectedValues(updatedSelection);

    console.log("🎯 Group selection changed:", {
      groupType: group.type,
      groupSelection: newGroupSelection,
      totalSelection: updatedSelection.length,
    });
  };

  // Función para obtener valores seleccionados de un grupo específico
  const getGroupSelection = (group: PrimitiveGroup): unknown[] => {
    const groupValues = group.values.map((v) => v.value);
    return selectedValues.filter((val) => groupValues.includes(val));
  };

  const handleApply = () => {
    console.log("🎯 PrimitiveArrayFilter applying filter:", {
      field: columnId,
      operator: "arrIncludesSome",
      value: selectedValues,
      selectedCount: selectedValues.length,
    });

    onApply({
      field: columnId,
      operator: "arrIncludesSome",
      value: selectedValues,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedValues([]);
    onClear();
  };

  // Función para renderizar el componente de filtro apropiado para cada tipo
  const renderFilterComponent = (group: PrimitiveGroup) => {
    const groupSelection = getGroupSelection(group);
    const embeddedProps = {
      values: group.values,
      selectedValues: groupSelection,
      onSelectionChange: (newSelection: unknown[]) =>
        handleGroupSelectionChange(group, newSelection as FilterValue[]),
      columnType: group.type,
    };

    switch (group.type) {
      case "string":
        return <EnhancedEmbeddedStringFilter {...embeddedProps} />;
      case "número":
        return <EnhancedEmbeddedNumberFilter {...embeddedProps} />;
      case "fecha":
        return <EnhancedEmbeddedDateFilter {...embeddedProps} />;
      case "boolean":
        return <EnhancedEmbeddedBooleanFilter {...embeddedProps} />;
      default:
        // Para tipos no soportados, mostrar lista simple
        return (
          <div className='space-y-2'>
            <div className='text-sm text-muted-foreground'>
              {group.values.length} valores únicos de tipo &quot;{group.type}
              &quot;
            </div>
            <div className='max-h-[200px] overflow-y-auto space-y-1 border rounded p-2'>
              {group.values.map((item, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded'
                >
                  <span className='truncate'>{String(item.value)}</span>
                  <span className='text-muted-foreground'>({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  if (primitiveGroups.length === 0) {
    return (
      <div className='w-full h-full min-h-[350px] flex flex-col items-center justify-center'>
        <div className='text-center text-muted-foreground'>
          <p>No se encontraron valores primitivos en este array</p>
          <p className='text-xs mt-1'>
            El array podría estar vacío o contener solo objetos
          </p>
        </div>
        <FilterFooter
          onClear={handleClear}
          onClose={onClose}
          onApply={handleApply}
        />
      </div>
    );
  }

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
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
        {/* Buscador global */}
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar en todos los tipos...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>

        {/* Resumen de selección */}
        <div className='text-sm text-muted-foreground bg-muted/30 p-2 rounded'>
          {selectedValues.length} valores seleccionados de{" "}
          {primitiveGroups.reduce((acc, group) => acc + group.values.length, 0)}{" "}
          únicos
        </div>

        {/* Acordiones por tipo de primitivo - Solo mostrar los que tienen datos */}
        <div className='flex-grow'>
          <Accordion type='multiple' className='w-full'>
            {primitiveGroups
              .filter((group) => group.values.length > 0) // Solo mostrar grupos con datos
              .map((group) => (
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

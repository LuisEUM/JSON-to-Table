"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Función para renderizar componente de filtro por grupo con controladores específicos
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

    // Renderizar controladores específicos por tipo
    switch (group.type) {
      case "número":
        return renderNumberController(
          group,
          searchFilteredItems,
          counts,
          renderOptionsList
        );
      case "fecha":
        return renderDateController(
          group,
          searchFilteredItems,
          counts,
          renderOptionsList
        );
      case "string":
        return renderStringController(
          group,
          searchFilteredItems,
          counts,
          renderOptionsList
        );
      case "boolean":
        return renderBooleanController(
          group,
          searchFilteredItems,
          counts,
          renderOptionsList
        );
      default:
        return renderBasicController(
          group,
          searchFilteredItems,
          counts,
          renderOptionsList
        );
    }
  };

  // Controlador específico para números (como NumberFilter)
  const renderNumberController = (
    group: PrimitiveGroup,
    searchFilteredItems: any,
    counts: any,
    renderOptionsList: any
  ) => {
    const [selectedPreset, setSelectedPreset] = useState("custom");
    const [isInverted, setIsInverted] = useState(true);
    const [numberRange, setNumberRange] = useState({ start: "", end: "" });

    const numbers = group.values
      .map((v) => Number(v.value))
      .filter((n) => !isNaN(n));
    const calculatedMin = Math.min(...numbers);
    const calculatedMax = Math.max(...numbers);
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;

    const hasNegativeValues = numbers.some((n) => n < 0);
    const hasPositiveValues = numbers.some((n) => n > 0);
    const hasZero = numbers.some((n) => n === 0);

    const PRESETS = [
      { label: "Personalizado", value: "custom" },
      ...(hasPositiveValues || (hasZero && !hasNegativeValues)
        ? [{ label: "Valores positivos", value: "positive" }]
        : []),
      ...(hasNegativeValues
        ? [{ label: "Valores negativos", value: "negative" }]
        : []),
      { label: "Mayores a la media", value: "aboveAverage" },
      { label: "Menores a la media", value: "belowAverage" },
    ];

    const handlePresetChange = (preset: string) => {
      setSelectedPreset(preset);
      if (preset === "custom") return;

      let filteredValues: FilterValue[] = [];

      switch (preset) {
        case "positive":
          filteredValues = group.values
            .filter((v) => Number(v.value) > 0)
            .map((v) => v.value as FilterValue);
          break;
        case "negative":
          filteredValues = group.values
            .filter((v) => Number(v.value) < 0)
            .map((v) => v.value as FilterValue);
          break;
        case "aboveAverage":
          filteredValues = group.values
            .filter((v) => Number(v.value) > avg)
            .map((v) => v.value as FilterValue);
          break;
        case "belowAverage":
          filteredValues = group.values
            .filter((v) => Number(v.value) < avg)
            .map((v) => v.value as FilterValue);
          break;
      }

      handleGroupSelectionChange(group, filteredValues);
    };

    const handleRangeApply = () => {
      const min = numberRange.start ? Number(numberRange.start) : calculatedMin;
      const max = numberRange.end ? Number(numberRange.end) : calculatedMax;

      const inRange = group.values
        .filter((v) => {
          const num = Number(v.value);
          return !isNaN(num) && num >= min && num <= max;
        })
        .map((v) => v.value as FilterValue);

      handleGroupSelectionChange(group, inRange);
    };

    return (
      <div className='space-y-4'>
        {/* Presets */}
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder='Selecciona un rango predefinido' />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Switch dentro/fuera del rango */}
        <div className='flex items-center justify-between space-x-2'>
          <Label className='text-sm'>
            {isInverted ? "Dentro del rango" : "Fuera del rango"}
          </Label>
          <Switch checked={isInverted} onCheckedChange={setIsInverted} />
        </div>

        {/* Campos de rango */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Desde</Label>
            <Input
              type='number'
              value={numberRange.start}
              onChange={(e) => {
                setSelectedPreset("custom");
                setNumberRange((prev) => ({ ...prev, start: e.target.value }));
              }}
              placeholder={calculatedMin.toString()}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hasta</Label>
            <Input
              type='number'
              value={numberRange.end}
              onChange={(e) => {
                setSelectedPreset("custom");
                setNumberRange((prev) => ({ ...prev, end: e.target.value }));
              }}
              placeholder={calculatedMax.toString()}
            />
          </div>
        </div>

        <Button onClick={handleRangeApply} className='w-full' size='sm'>
          Aplicar rango
        </Button>

        {/* Accordion con FilterTabs */}
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='number-breakdown'>
            <AccordionTrigger className='text-sm'>
              Ver desglose por valores ({group.values.length} números)
            </AccordionTrigger>
            <AccordionContent>
              <FilterTabs counts={counts} defaultTab='todos'>
                {{
                  todos: renderOptionsList(searchFilteredItems.todos),
                  activos: renderOptionsList(searchFilteredItems.activos),
                  inactivos: renderOptionsList(searchFilteredItems.inactivos),
                }}
              </FilterTabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className='text-xs text-muted-foreground'>
          {getGroupSelection(group).length} de {group.values.length}{" "}
          seleccionados
        </div>
      </div>
    );
  };

  // Controlador específico para fechas (como DateFilter)
  const renderDateController = (
    group: PrimitiveGroup,
    searchFilteredItems: any,
    counts: any,
    renderOptionsList: any
  ) => {
    const [selectedPreset, setSelectedPreset] = useState("custom");
    const [isInverted, setIsInverted] = useState(true);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    // Presets de fechas como en DateFilter original
    const PRESETS = [
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
    ];

    const getPresetDateRange = (preset: string) => {
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
        default:
          return { start: undefined, end: undefined };
      }
    };

    const handlePresetChange = (preset: string) => {
      setSelectedPreset(preset);
      if (preset === "custom") return;

      const newRange = getPresetDateRange(preset);
      if (newRange.start && newRange.end) {
        // Formatear fechas para inputs HTML (yyyy-mm-dd)
        const formatDateForInput = (date: Date) => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        setDateRange({
          start: formatDateForInput(newRange.start),
          end: formatDateForInput(newRange.end),
        });

        // Aplicar filtro automáticamente
        handleRangeApply(newRange.start, newRange.end);
      }
    };

    const handleRangeApply = (startDateObj?: Date, endDateObj?: Date) => {
      let start: Date, end: Date;

      if (startDateObj && endDateObj) {
        start = startDateObj;
        end = endDateObj;
      } else {
        if (!dateRange.start || !dateRange.end) return;
        start = new Date(dateRange.start);
        end = new Date(dateRange.end);
      }

      const inRange = group.values
        .filter((v) => {
          try {
            // Parsear fecha con diferentes formatos como en DateFilter original
            const dateStr = String(v.value).trim();
            let itemDate: Date;

            // DD/MM/YYYY
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
              const [day, month, year] = dateStr
                .split("/")
                .map((n) => parseInt(n, 10));
              itemDate = new Date(year, month - 1, day);
            }
            // DD-MM-YYYY
            else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
              const [day, month, year] = dateStr
                .split("-")
                .map((n) => parseInt(n, 10));
              itemDate = new Date(year, month - 1, day);
            }
            // YYYY-MM-DD
            else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
              itemDate = new Date(dateStr);
            } else {
              itemDate = new Date(dateStr);
            }

            if (isNaN(itemDate.getTime())) return false;

            const isInRange = itemDate >= start && itemDate <= end;
            return isInverted ? isInRange : !isInRange;
          } catch {
            return false;
          }
        })
        .map((v) => v.value as FilterValue);

      handleGroupSelectionChange(group, inRange);
    };

    return (
      <div className='space-y-4'>
        {/* Presets como DateFilter original */}
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder='Selecciona un rango predefinido' />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campos de fecha */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Desde</Label>
            <Input
              type='date'
              value={dateRange.start}
              onChange={(e) => {
                setSelectedPreset("custom");
                setDateRange((prev) => ({ ...prev, start: e.target.value }));
              }}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hasta</Label>
            <Input
              type='date'
              value={dateRange.end}
              onChange={(e) => {
                setSelectedPreset("custom");
                setDateRange((prev) => ({ ...prev, end: e.target.value }));
              }}
            />
          </div>
        </div>

        {/* Switch incluir/excluir como DateFilter original */}
        <div className='flex items-center space-x-2'>
          <Switch checked={isInverted} onCheckedChange={setIsInverted} />
          <Label>
            {isInverted
              ? "Incluir fechas en el rango"
              : "Excluir fechas en el rango"}
          </Label>
        </div>

        <Button onClick={() => handleRangeApply()} className='w-full' size='sm'>
          Aplicar rango
        </Button>

        {/* Accordion con FilterTabs como DateFilter original */}
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='date-breakdown'>
            <AccordionTrigger className='text-sm'>
              Fechas disponibles ({group.values.length} fechas)
            </AccordionTrigger>
            <AccordionContent>
              <FilterTabs counts={counts} defaultTab='todos'>
                {{
                  todos: renderOptionsList(searchFilteredItems.todos),
                  activos: renderOptionsList(searchFilteredItems.activos),
                  inactivos: renderOptionsList(searchFilteredItems.inactivos),
                }}
              </FilterTabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className='text-xs text-muted-foreground'>
          {getGroupSelection(group).length} de {group.values.length} fechas
          seleccionadas
        </div>
      </div>
    );
  };

  // Controlador específico para strings
  const renderStringController = (
    group: PrimitiveGroup,
    searchFilteredItems: any,
    counts: any,
    renderOptionsList: any
  ) => {
    const [exactMatch, setExactMatch] = useState(false);

    return (
      <div className='space-y-4'>
        {/* Toggle coincidencia exacta */}
        <div className='flex items-center justify-between'>
          <Label className='text-xs font-medium'>Coincidencia exacta</Label>
          <Switch checked={exactMatch} onCheckedChange={setExactMatch} />
        </div>

        <FilterTabs counts={counts} defaultTab='todos'>
          {{
            todos: renderOptionsList(searchFilteredItems.todos),
            activos: renderOptionsList(searchFilteredItems.activos),
            inactivos: renderOptionsList(searchFilteredItems.inactivos),
          }}
        </FilterTabs>

        <div className='text-xs text-muted-foreground'>
          {getGroupSelection(group).length} de {group.values.length}{" "}
          seleccionados
        </div>
      </div>
    );
  };

  // Controlador específico para booleanos
  const renderBooleanController = (
    group: PrimitiveGroup,
    searchFilteredItems: any,
    counts: any,
    renderOptionsList: any
  ) => {
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
          {getGroupSelection(group).length} de {group.values.length}{" "}
          seleccionados
        </div>
      </div>
    );
  };

  // Controlador básico para otros tipos
  const renderBasicController = (
    group: PrimitiveGroup,
    searchFilteredItems: any,
    counts: any,
    renderOptionsList: any
  ) => {
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
          {getGroupSelection(group).length} de {group.values.length}{" "}
          seleccionados
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

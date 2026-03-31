/**
 * AtomicPrimitiveArrayFilter V2 - Refactored to reuse existing filter components
 * This filter intelligently detects the type of data and uses the appropriate specialized filter
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FilterComponentProps, FilterCondition } from "./filter-types";
import { FilterFooter } from "./filter-footer";
import { getTypeStyle } from "../../core/constants/type-styles";
import type { ProcessedItem } from "../../core";
import {
  ColumnTypeDetector,
} from "./type-detector";
import { logger } from "../../core/services/logging-service";
import {
  EmbeddedArrayFilter,
  EmbeddedStringFilter,
  EmbeddedNumberFilter,
  EmbeddedDateFilter,
  getAvailableFilterTypes,
} from "./embedded-filter-components";
import { getTypeDescription, getFilterTypeDotColor } from "./primitive-array-filter-utils";

interface PrimitiveArrayFilterProps extends FilterComponentProps {
  arrayType?: string;
}

interface FilterState {
  selectedFilterType: string;
  activeFilters: Map<string, FilterCondition>;
}

export function AtomicPrimitiveArrayFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  columnName,
  uniqueValues,
}: PrimitiveArrayFilterProps) {
  // Enhanced type detection using the new detector
  const typeDetectionResult = useMemo(() => {
    return ColumnTypeDetector.detectColumnType(uniqueValues);
  }, [uniqueValues]);

  // Get available filter types
  const availableFilterTypes = useMemo(() => {
    return getAvailableFilterTypes(uniqueValues);
  }, [uniqueValues]);

  // State for the mixed filter
  const [filterState, setFilterState] = useState<FilterState>(() => ({
    selectedFilterType: "all",
    activeFilters: new Map(),
  }));

  // Handle filter changes from embedded components
  const handleFilterChange = useCallback(
    (filterType: string, condition: FilterCondition | null) => {
      logger.debug("AtomicPrimitiveArrayFilter - Filter change:", {
        filterType,
        condition,
      });

      setFilterState((prev) => {
        const newActiveFilters = new Map(prev.activeFilters);

        if (condition) {
          newActiveFilters.set(filterType, condition);
        } else {
          newActiveFilters.delete(filterType);
        }

        return {
          ...prev,
          activeFilters: newActiveFilters,
        };
      });
    },
    []
  );

  // Combine all active filters into a single condition
  const handleApply = useCallback(() => {
    logger.debug("AtomicPrimitiveArrayFilter applying combined filters:", {
      activeFilters: Array.from(filterState.activeFilters.entries()),
      selectedFilterType: filterState.selectedFilterType,
    });

    if (filterState.activeFilters.size === 0) {
      onClear();
      onClose?.();
      return;
    }

    // If only one filter is active, use it directly
    if (filterState.activeFilters.size === 1) {
      const [, condition] = Array.from(filterState.activeFilters.entries())[0];
      onApply(condition);
      onClose?.();
      return;
    }

    // For multiple filters, combine them
    const allValues: (string | number | boolean | Date)[] = [];
    const allConditions: FilterCondition[] = [];

    filterState.activeFilters.forEach((condition) => {
      if (Array.isArray(condition.value)) {
        const validValues = condition.value.filter(
          (v): v is string | number | boolean | Date =>
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean" ||
            v instanceof Date
        );
        allValues.push(...validValues);
      } else if (
        typeof condition.value === "string" ||
        typeof condition.value === "number" ||
        typeof condition.value === "boolean" ||
        condition.value instanceof Date
      ) {
        allValues.push(condition.value);
      }
      allConditions.push(condition);
    });

    const combinedCondition: FilterCondition = {
      field: columnId,
      operator: "arrIncludesSome",
      value: allValues,
      additionalValue: allConditions.find((c) => c.additionalValue)
        ?.additionalValue,
      exactMatch: allConditions.some((c) => c.exactMatch),
    };

    onApply(combinedCondition);
    onClose?.();
  }, [filterState.activeFilters, columnId, onApply, onClear, onClose]);

  const handleClear = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      activeFilters: new Map(),
    }));
    onClear();
  }, [onClear]);

  // Handle select all functionality
  const handleSelectAll = useCallback(() => {
    logger.debug("Selecting all available filters");

    const newActiveFilters = new Map<string, FilterCondition>();

    availableFilterTypes
      .filter((type) => type.type !== "all" && type.available && type.count > 0)
      .forEach((type) => {
        const allValuesOfType = uniqueValues
          .filter((option) => {
            const processedItem = option.original as ProcessedItem;
            const value = processedItem?.value;

            switch (type.type) {
              case "array":
                return Array.isArray(value);
              case "string":
                return typeof value === "string";
              case "number":
                return (
                  typeof value === "number" ||
                  (typeof value === "string" && !isNaN(Number(value)))
                );
              case "date":
                return (
                  typeof value === "string" &&
                  /^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}$/.test(value)
                );
              default:
                return false;
            }
          })
          .map((option) => (option.original as ProcessedItem).value)
          .filter(
            (value): value is string | number | boolean | Date =>
              value !== null && value !== undefined
          );

        if (allValuesOfType.length > 0) {
          newActiveFilters.set(type.type, {
            field: columnId,
            operator: "arrIncludesSome",
            value: allValuesOfType,
          });
        }
      });

    setFilterState((prev) => ({
      ...prev,
      activeFilters: newActiveFilters,
    }));
  }, [availableFilterTypes, uniqueValues, columnId]);

  // Update filter type selection
  const handleFilterTypeChange = useCallback(
    (newType: string) => {
      logger.debug("Changing filter type:", {
        from: filterState.selectedFilterType,
        to: newType,
      });

      setFilterState((prev) => ({
        ...prev,
        selectedFilterType: newType,
        activeFilters: newType === "all" ? prev.activeFilters : new Map(),
      }));
    },
    [filterState.selectedFilterType]
  );

  // Get recommended filter based on detection
  const recommendedFilter = useMemo(() => {
    return ColumnTypeDetector.getRecommendedFilter(typeDetectionResult);
  }, [typeDetectionResult]);

  // Get active filter count for display
  const activeFilterCount = filterState.activeFilters.size;

  // Base props for embedded filters
  const baseProps = {
    columnId,
    columnName,
    columnType: "primitiveArray" as const,
    uniqueValues,
    initialValue,
  };

  // Render the appropriate embedded filter based on selected type
  const renderEmbeddedFilter = useCallback(() => {
    const { selectedFilterType } = filterState;

    logger.debug("Rendering embedded filter:", {
      selectedFilterType,
      typeDetectionResult: typeDetectionResult.primaryType,
      availableTypes: availableFilterTypes.map((t) => t.type),
    });

    switch (selectedFilterType) {
      case "array":
        return (
          <EmbeddedArrayFilter
            {...baseProps}
            onFilterChange={(condition) =>
              handleFilterChange("array", condition)
            }
          />
        );

      case "string":
        return (
          <EmbeddedStringFilter
            {...baseProps}
            autoDetectedSeparator={
              typeDetectionResult.metadata.detectedSeparator
            }
            onFilterChange={(condition) =>
              handleFilterChange("string", condition)
            }
          />
        );

      case "number":
        return (
          <EmbeddedNumberFilter
            {...baseProps}
            onFilterChange={(condition) =>
              handleFilterChange("number", condition)
            }
          />
        );

      case "date":
        return (
          <EmbeddedDateFilter
            {...baseProps}
            onFilterChange={(condition) =>
              handleFilterChange("date", condition)
            }
          />
        );

      case "all":
      default:
        // Show all available types in accordions
        return (
          <div className='space-y-4'>
            {availableFilterTypes
              .filter((type) => type.type !== "all" && type.available)
              .map((type) => (
                <Accordion key={type.type} type='single' collapsible>
                  <AccordionItem value={type.type}>
                    <AccordionTrigger className='text-sm'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${getFilterTypeDotColor(type.type)}`}
                        />
                        {type.label} ({type.count})
                        {filterState.activeFilters.has(type.type) && (
                          <span className='ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5'>
                            Activo
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {type.type === "array" && (
                        <EmbeddedArrayFilter
                          {...baseProps}
                          onFilterChange={(condition) =>
                            handleFilterChange("array", condition)
                          }
                        />
                      )}
                      {type.type === "string" && (
                        <EmbeddedStringFilter
                          {...baseProps}
                          autoDetectedSeparator={
                            typeDetectionResult.metadata.detectedSeparator
                          }
                          onFilterChange={(condition) =>
                            handleFilterChange("string", condition)
                          }
                        />
                      )}
                      {type.type === "number" && (
                        <EmbeddedNumberFilter
                          {...baseProps}
                          onFilterChange={(condition) =>
                            handleFilterChange("number", condition)
                          }
                        />
                      )}
                      {type.type === "date" && (
                        <EmbeddedDateFilter
                          {...baseProps}
                          onFilterChange={(condition) =>
                            handleFilterChange("date", condition)
                          }
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
          </div>
        );
    }
  }, [
    filterState.selectedFilterType,
    availableFilterTypes,
    typeDetectionResult,
    baseProps,
    handleFilterChange,
    filterState.activeFilters,
  ]);

  return (
    <div className='w-full h-full min-h-[350px] flex flex-col'>
      {/* Header with enhanced type information */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex flex-col'>
          <h3 className='font-medium'>
            Filtro para{" "}
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                getTypeStyle("primitiveArray").bg
              }`}
            />{" "}
            {columnName}
          </h3>
          <div className='text-xs text-muted-foreground mt-1'>
            {getTypeDescription(typeDetectionResult)}
            {recommendedFilter.useMultiFilter &&
              " - Filtro múltiple recomendado"}
          </div>
        </div>
        {activeFilterCount > 0 && (
          <div className='text-xs bg-primary text-primary-foreground rounded-full px-2 py-1'>
            {activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""}{" "}
            activo{activeFilterCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div className='space-y-4 flex-grow flex flex-col'>
        {/* Type filter selector - only show if we have multiple types */}
        {availableFilterTypes.length > 2 && (
          <div>
            <Label htmlFor='type-select' className='text-sm font-medium'>
              Filtrar por tipo de dato
            </Label>
            <Select
              value={filterState.selectedFilterType}
              onValueChange={handleFilterTypeChange}
            >
              <SelectTrigger id='type-select'>
                <SelectValue placeholder='Seleccionar tipo' />
              </SelectTrigger>
              <SelectContent>
                {availableFilterTypes.map((type) => (
                  <SelectItem key={type.type} value={type.type}>
                    <div className='flex items-center gap-2'>
                      {type.type !== "all" && (
                        <div
                          className={`w-2 h-2 rounded-full ${getFilterTypeDotColor(type.type)}`}
                        />
                      )}
                      {type.label}
                      {type.type !== "all" && ` (${type.count})`}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Embedded filter content */}
        <div className='flex-grow'>{renderEmbeddedFilter()}</div>

        {/* Show recommendation if applicable */}
        {recommendedFilter.primary !== "AtomicPrimitiveArrayFilter" && (
          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm'>
            <div className='font-medium text-blue-900'>Recomendación</div>
            <div className='text-blue-700 mt-1'>
              Para este tipo de datos ({typeDetectionResult.primaryType}), se
              recomienda usar{" "}
              <span className='font-medium'>{recommendedFilter.primary}</span>
              {recommendedFilter.useMultiFilter && " o este filtro múltiple"}
            </div>
          </div>
        )}
      </div>

      <FilterFooter
        onClear={handleClear}
        onClose={onClose}
        onApply={handleApply}
        onSelectAll={handleSelectAll}
        showClear={true}
        showSelectAll={true}
      />
    </div>
  );
}

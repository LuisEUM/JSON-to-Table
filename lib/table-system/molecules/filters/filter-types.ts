export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "between"
  | "notBetween"
  | "in"
  | "notIn"
  | "isNull"
  | "isNotNull"
  | "exactMatch"
  | "exactMatchAny"
  | "arrIncludesSome"
  | "includesString"
  | "exactWordMatch"
  | "notExactWordMatch"
  | "objectPropertyFilter";

export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | FilterValue[]
  | null
  | undefined;

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
  additionalValue?: FilterValue;
  exactMatch?: boolean; // Para controlar coincidencia exacta en filtros de texto
}

export type DateRangePreset =
  | "custom"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "last7Days"
  | "last30Days"
  | "last90Days"
  | "last12Months"
  | "quarter1"
  | "quarter2"
  | "quarter3"
  | "quarter4";

export type DateRange = {
  start: Date | undefined;
  end: Date | undefined;
};

export interface FilterOption {
  value: unknown; // Cambiado de string a unknown para soportar objetos y arrays
  count: number;
  original: unknown;
}

export interface FilterComponentProps {
  columnId: string;
  onApply: (condition: FilterCondition) => void;
  onClear: () => void;
  initialValue?: FilterCondition;
  onClose: () => void;
  columnName: string;
  columnType: string;
  uniqueValues: FilterOption[];
}

export const isValidDate = (d: unknown): d is Date => {
  if (!(d instanceof Date)) return false;
  return !Number.isNaN(d.getTime());
};

// Re-export filter functions for backward compatibility
export { filterFns, dateBetweenFilterFn } from "./filter-fns";
export type { FilterFunctions } from "./filter-fns";

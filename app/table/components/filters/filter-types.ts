import type { ProcessedRow, ProcessedItem } from "../../data-processor";

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
  | "arrIncludesSome"
  | "includesString";

export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | FilterValue[]
  | null;

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
  additionalValue?: FilterValue;
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

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOption {
  value: string;
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

// Custom filter functions con tipos más específicos
export const filterFns = {
  includesString: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) return false;
    const value = String(processedValue.value);
    return value.toLowerCase().includes(String(filterValue).toLowerCase());
  },

  includesStringSensitive: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = String(processedValue?.value ?? "");
    return value.includes(String(filterValue));
  },

  equalsString: (row: ProcessedRow, columnId: string, filterValue: string) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = String(processedValue?.value ?? "");
    return value.toLowerCase() === String(filterValue).toLowerCase();
  },

  equalsStringSensitive: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = String(processedValue?.value ?? "");
    return value === String(filterValue);
  },

  arrIncludes: (row: ProcessedRow, columnId: string, filterValue: unknown) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value;
    return Array.isArray(value) && value.includes(filterValue);
  },

  arrIncludesAll: (
    row: ProcessedRow,
    columnId: string,
    filterValue: unknown[]
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value;
    return (
      Array.isArray(value) &&
      Array.isArray(filterValue) &&
      filterValue.every((val) => value.includes(val))
    );
  },

  arrIncludesSome: (
    row: ProcessedRow,
    columnId: string,
    filterValue: unknown[]
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) return false;

    const value = String(processedValue.value).toLowerCase();
    return (
      Array.isArray(filterValue) &&
      filterValue.some((val) => value === String(val).toLowerCase())
    );
  },

  equals: (row: ProcessedRow, columnId: string, filterValue: unknown) => {
    const processedValue = row[columnId] as ProcessedItem;
    return Object.is(processedValue?.value, filterValue);
  },

  weakEquals: (row: ProcessedRow, columnId: string, filterValue: unknown) => {
    const processedValue = row[columnId] as ProcessedItem;
    return processedValue?.value == filterValue;
  },

  inNumberRange: (
    row: ProcessedRow,
    columnId: string,
    filterValue: [number, number]
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value as number;
    return value >= filterValue[0] && value <= filterValue[1];
  },

  processedValueFilter: (
    row: ProcessedRow,
    columnId: string,
    filterValue: FilterCondition
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) return false;

    const rawValue = processedValue.value;

    switch (filterValue.operator) {
      case "includesString":
        return String(rawValue)
          .toLowerCase()
          .includes(String(filterValue.value).toLowerCase());

      case "arrIncludesSome":
        if (!Array.isArray(filterValue.value)) {
          return (
            String(rawValue).toLowerCase() ===
            String(filterValue.value).toLowerCase()
          );
        }
        return filterValue.value.some(
          (val) => String(rawValue).toLowerCase() === String(val).toLowerCase()
        );

      // ... resto de los casos ...
    }
    return false;
  },
};

// Definir el tipo como un registro indexado
export interface FilterFunctions {
  [key: string]: (
    row: ProcessedRow,
    columnId: string,
    filterValue:
      | FilterValue
      | FilterCondition
      | [number, number]
      | [Date, Date]
      | string[]
  ) => boolean;
}

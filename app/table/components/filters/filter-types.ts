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
  | "isNotNull";

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
    const value = processedValue?.value as string;
    return value.toLowerCase().includes(String(filterValue).toLowerCase());
  },
  inArray: (row: ProcessedRow, columnId: string, filterValue: string[]) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value as string;
    return filterValue.includes(value);
  },
  between: (
    row: ProcessedRow,
    columnId: string,
    filterValue: [number, number]
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value as number;
    return value >= filterValue[0] && value <= filterValue[1];
  },
  equals: (row: ProcessedRow, columnId: string, filterValue: FilterValue) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value as FilterValue;
    return value === filterValue;
  },
  dateRange: (
    row: ProcessedRow,
    columnId: string,
    filterValue: [Date, Date]
  ) => {
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value as string | number | Date;
    const date = new Date(value);
    return date >= filterValue[0] && date <= filterValue[1];
  },
  processedValueFilter: (
    row: ProcessedRow,
    columnId: string,
    filterValue: FilterCondition
  ) => {
    if (
      !filterValue ||
      typeof filterValue !== "object" ||
      !("operator" in filterValue)
    ) {
      return true;
    }
    const processedValue = row[columnId] as ProcessedItem;
    const value = processedValue?.value as FilterValue;

    switch (filterValue.operator) {
      case "equals":
        return value === filterValue.value;
      case "between":
        return (
          (value as number) >= (filterValue.value as number) &&
          (value as number) <= (filterValue.additionalValue as number)
        );
      default:
        return true;
    }
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

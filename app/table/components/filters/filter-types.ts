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
  | "arrIncludesSome";

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
    const value = String(processedValue?.value ?? "");
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
    const value = processedValue?.value;
    return (
      Array.isArray(value) &&
      Array.isArray(filterValue) &&
      filterValue.some((val) => value.includes(val))
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
    if (
      !filterValue ||
      typeof filterValue !== "object" ||
      !("operator" in filterValue)
    ) {
      return true;
    }
    const processedValue = row[columnId] as ProcessedItem;

    // Si no hay valor procesado, retornar false
    if (!processedValue) return false;

    const value = processedValue.value;

    // Para operaciones numéricas, asegurarse de que los valores sean números válidos
    const isNumericOperation = [
      "greaterThan",
      "lessThan",
      "between",
      "notBetween",
    ].includes(filterValue.operator);

    if (isNumericOperation) {
      const numericValue = Number(value);
      const numericFilterValue = Number(filterValue.value);

      if (isNaN(numericValue) || isNaN(numericFilterValue)) {
        return false;
      }

      switch (filterValue.operator) {
        case "greaterThan":
          return numericValue > numericFilterValue;
        case "lessThan":
          return numericValue < numericFilterValue;
        case "between":
          const numericAdditionalValue = Number(filterValue.additionalValue);
          return (
            !isNaN(numericAdditionalValue) &&
            numericValue >= numericFilterValue &&
            numericValue <= numericAdditionalValue
          );
        case "notBetween":
          const numericAddValue = Number(filterValue.additionalValue);
          return (
            !isNaN(numericAddValue) &&
            (numericValue < numericFilterValue ||
              numericValue > numericAddValue)
          );
      }
    }

    // Para operaciones no numéricas, usar el valor original
    switch (filterValue.operator) {
      case "equals":
        return value === filterValue.value;
      case "notEquals":
        return value !== filterValue.value;
      case "in":
        return (
          Array.isArray(filterValue.value) &&
          filterValue.value.includes(String(value))
        );
      case "notIn":
        return (
          Array.isArray(filterValue.value) &&
          !filterValue.value.includes(String(value))
        );
      case "contains":
        return String(value)
          .toLowerCase()
          .includes(String(filterValue.value).toLowerCase());
      case "notContains":
        return !String(value)
          .toLowerCase()
          .includes(String(filterValue.value).toLowerCase());
      case "startsWith":
        return String(value)
          .toLowerCase()
          .startsWith(String(filterValue.value).toLowerCase());
      case "endsWith":
        return String(value)
          .toLowerCase()
          .endsWith(String(filterValue.value).toLowerCase());
      case "isNull":
        return value === null;
      case "isNotNull":
        return value !== null;
      case "arrIncludesSome":
        return (
          Array.isArray(value) &&
          Array.isArray(filterValue.value) &&
          filterValue.value.some((item) => value.includes(item))
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

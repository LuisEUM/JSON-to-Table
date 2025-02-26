import type { ProcessedRow, ProcessedItem } from "../../data-processor";
import type { FilterFn } from "@tanstack/react-table";
import { formatDate } from "@/app/utils/date-formatter";

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
  | null
  | undefined;

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

export type DateRange = {
  start: Date | undefined;
  end: Date | undefined;
};

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
    console.log("🔍 Ejecutando filtro de texto:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      console.log("⚠️ Valor no encontrado para la columna:", { columnId });
      return false;
    }

    const value = String(processedValue.value).toLowerCase();
    const searchTerm = String(filterValue).toLowerCase();

    const result = value.includes(searchTerm);
    console.log("📝 Comparación texto:", { value, searchTerm, result });
    return result;
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
    console.log("🔢 Ejecutando filtro de número:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      console.log("⚠️ Valor no encontrado para la columna:", { columnId });
      return false;
    }

    const value = Number(processedValue.value);
    if (isNaN(value)) {
      console.log("⚠️ Valor no es un número válido:", { value });
      return false;
    }

    const [min, max] = filterValue;
    const result = value >= min && value <= max;
    console.log("🔢 Comparación número:", { value, min, max, result });
    return result;
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

  dateBetweenFilterFn: (
    row: ProcessedRow,
    columnId: string,
    filterValue: string[]
  ) => {
    console.log("📅 Ejecutando filtro de fecha:", {
      columnId,
      filterValue,
      rowValue: row[columnId],
    });

    const processedValue = row[columnId] as ProcessedItem;
    if (!processedValue?.value) {
      console.log("⚠️ Valor no encontrado para la columna:", { columnId });
      return false;
    }

    // Convertir el valor de la celda a fecha y formato YYYY-MM-DD
    const date =
      processedValue.value instanceof Date
        ? processedValue.value
        : new Date(processedValue.value as string | number);

    if (!isValidDate(date)) {
      console.log("⚠️ Fecha inválida:", { value: processedValue.value });
      return false;
    }

    const dateStr = formatDate(date, "yyyy-MM-dd");
    const result = filterValue.includes(dateStr);

    console.log("📅 Comparación fecha:", {
      date: dateStr,
      filterDates: filterValue,
      result,
    });

    return result;
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

export const isValidDate = (d: unknown): d is Date => {
  if (!(d instanceof Date)) return false;
  return !Number.isNaN(d.getTime());
};

// Exportar dateBetweenFilterFn por separado
export const dateBetweenFilterFn: FilterFn<ProcessedRow> = (
  row,
  columnId,
  filterValue
) => {
  console.log("📅 Ejecutando filtro de fecha:", {
    columnId,
    filterValue,
    rowValue: row.getValue(columnId),
  });

  const processedValue = row.getValue(columnId) as ProcessedItem;
  if (!processedValue?.value) {
    console.log("⚠️ Valor no encontrado para la columna:", { columnId });
    return false;
  }

  const date =
    processedValue.value instanceof Date
      ? processedValue.value
      : new Date(processedValue.value as string | number);

  if (!isValidDate(date)) {
    console.log("⚠️ Fecha inválida:", { value: processedValue.value });
    return false;
  }

  const [start, end] = filterValue as [Date | undefined, Date | undefined];

  if (start && !end) {
    const result = date.getTime() >= start.getTime();
    console.log("📅 Comparación fecha inicio:", {
      date: date.toISOString(),
      start: start.toISOString(),
      result,
    });
    return result;
  } else if (!start && end) {
    const result = date.getTime() <= end.getTime();
    console.log("📅 Comparación fecha fin:", {
      date: date.toISOString(),
      end: end.toISOString(),
      result,
    });
    return result;
  } else if (start && end) {
    const result =
      date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
    console.log("📅 Comparación rango fecha:", {
      date: date.toISOString(),
      start: start.toISOString(),
      end: end.toISOString(),
      result,
    });
    return result;
  }

  return true;
};

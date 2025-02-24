import type { FilterFn } from "@tanstack/react-table";

declare module "@tanstack/table-core" {
  interface FilterFns {
    processedValueFilter: FilterFn<ProcessedRow>;
  }
}

export const isDate = (value: unknown): boolean => {
  return (
    typeof value === "string" &&
    !isNaN(Date.parse(value)) &&
    value.includes("T")
  );
};

export const getDetailedType = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (isDate(value)) {
    return "fecha";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "array vacío";
    const elementTypes = new Set(value.map((item) => getDetailedType(item)));
    return `array[${Array.from(elementTypes).join(", ")}]`;
  }

  if (typeof value === "object") {
    return "objeto";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? "número entero" : "número decimal";
  }

  return typeof value;
};

/**
 * Aplana recursivamente todos los objetos, sin detenerse en ninguna clave.
 * De esta manera, cada propiedad anidada tendrá su propio campo "dot notation".
 */
export const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> => {
  return Object.keys(obj).reduce(
    (acc: Record<string, unknown>, key: string) => {
      const pre = prefix.length ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !isDate(value)
      ) {
        Object.assign(
          acc,
          flattenObject(value as Record<string, unknown>, pre)
        );
      } else {
        acc[pre] = value;
      }
      return acc;
    },
    {}
  );
};

export const processValue = (
  value: unknown,
  parentId?: string
): ProcessedValue => {
  if (value === null) return { value: "null", type: "null" };
  if (value === undefined) return { value: "undefined", type: "undefined" };

  if (typeof value === "string") {
    if (!isNaN(Date.parse(value)) && value.includes("T")) {
      return {
        value: new Date(value).toLocaleString(),
        type: "fecha",
        rawValue: value,
      };
    }
    return { value: value, type: "string" };
  }

  if (typeof value === "number") {
    return {
      value: value,
      type: Number.isInteger(value) ? "número entero" : "número decimal",
    };
  }

  if (typeof value === "boolean") {
    return { value: String(value), type: "boolean" };
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => processValue(item));
    return {
      value: value,
      type: "array",
      items,
      parentId,
    };
  }

  if (typeof value === "object" && value !== null) {
    return {
      value: value,
      type: "objeto",
    };
  }

  return { value: String(value), type: "string" };
};

export interface ProcessedValue {
  value: unknown;
  type: string;
  items?: ProcessedValue[];
  parentId?: string;
  rawValue?: unknown;
}

export interface ProcessedItem extends ProcessedValue {
  id: string;
  path: string[];
  groups?: string[];
}

export type ProcessedRow = Record<string, ProcessedItem>;

export const inferColumnType = (
  columnName: string,
  value: ProcessedValue
): string => {
  const lowerName = columnName.toLowerCase();

  if (
    lowerName.includes("fecha") ||
    lowerName.includes("date") ||
    lowerName.includes("time") ||
    value.type === "fecha"
  ) {
    return "fecha";
  }

  if (
    lowerName.includes("is") ||
    lowerName.includes("has") ||
    lowerName.includes("activo") ||
    lowerName.includes("completado") ||
    value.type === "boolean"
  ) {
    return "boolean";
  }

  if (
    lowerName.includes("cantidad") ||
    lowerName.includes("numero") ||
    lowerName.includes("total") ||
    lowerName.includes("precio") ||
    value.type.includes("número")
  ) {
    return value.type.includes("entero") ? "número entero" : "número decimal";
  }

  return value.type;
};

export const processData = (data: Record<string, unknown>): ProcessedItem[] => {
  const processed: ProcessedItem[] = [];
  const flattenedData = flattenObject(data);

  for (const [key, value] of Object.entries(flattenedData)) {
    const path = key.split(".");
    const processedValue = processValue(value);
    const inferredType = inferColumnType(key, processedValue);

    processed.push({
      id: key,
      path,
      ...processedValue,
      type: inferredType,
    });
  }

  return processed;
};

export interface GroupedColumns {
  id: string;
  header: string;
  level: number;
  items?: ProcessedItem[];
  children?: GroupedColumns[];
}

export const groupColumns = (data: ProcessedItem[]) => {
  if (!data?.length) {
    return { rootItems: [], groups: [] };
  }

  const rootItems: ProcessedItem[] = [];
  const groupTree: { [key: string]: GroupedColumns } = {};

  data.forEach((item) => {
    if (!item.groups || item.groups.length === 0) {
      rootItems.push(item);
    } else {
      item.groups.forEach((group, index) => {
        const level = index + 1;
        if (!groupTree[group]) {
          const path = group.split(".");
          groupTree[group] = {
            id: group,
            header: path[path.length - 1],
            level,
            items: [],
            children: [],
          };
        }
      });
    }
  });

  return {
    rootItems,
    groups: Object.values(groupTree).filter((group) => group.level === 1),
  };
};

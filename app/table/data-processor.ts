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
    return "número";
  }

  const lowerName = String(value).toLowerCase();

  if (
    value === true ||
    value === false ||
    value === 1 ||
    value === 0 ||
    value === "1" ||
    value === "0" ||
    lowerName.includes("activo") ||
    lowerName.includes("completado") ||
    (typeof value === "object" &&
      value !== null &&
      "type" in value &&
      value.type === "boolean")
  ) {
    return "boolean";
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

// Función para detectar si un campo es un ID
export const isIdField = (fieldName: string): boolean => {
  const idPatterns = [
    /^id$/i, // id, ID, Id
    /^_id$/i, // _id, _ID
    /Id$/, // userId, customerId
    /ID$/, // userID, customerID
    /^id[A-Z]/, // idUser, idCustomer
    /^ID[A-Z]/, // IDUser, IDCustomer
  ];

  return idPatterns.some((pattern) => pattern.test(fieldName));
};

// Actualizar el tipo ValueType
export type ValueType =
  | "string"
  | "número" // Unificado
  | "boolean"
  | "fecha"
  | "array"
  | "objeto"
  | "referencia"
  | "null"
  | "undefined";

interface ReferenceObject {
  __parentId?: unknown;
  __parentTable?: unknown;
}

export const processValue = (
  value: unknown,
  fieldName: string = "",
  parentId?: string
): ProcessedValue => {
  // Detectar si es un campo de referencia
  const isReference =
    fieldName === "__parentId" || fieldName === "__parentTable";

  console.log("🔄 Procesando valor:", {
    fieldName,
    value,
    isReference,
    parentId,
    type: typeof value,
  });

  if (isReference) {
    console.log("🔗 Campo de referencia detectado:", {
      fieldName,
      value,
      parentId,
    });
    return {
      value: String(value), // Convertir a string
      type: "string", // Cambiar tipo a string
      path: [fieldName],
      label: fieldName,
      isReference: true, // Mantener la información de que es una referencia
    };
  }

  // Procesar objetos con referencias
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const refObj = value as ReferenceObject;
    if ("__parentId" in refObj || "__parentTable" in refObj) {
      const refValue = {
        value: String(refObj.__parentId || refObj.__parentTable),
        type: "string",
        path: [fieldName],
        label: fieldName,
        isReference: true,
      };
      console.log("🔗 Procesando referencia como string:", refValue);
      return refValue;
    }
  }

  if (value === null) return { value: "null", type: "null" };
  if (value === undefined) return { value: "undefined", type: "undefined" };

  const baseProcessedValue = { value };

  if (typeof value === "string") {
    if (!isNaN(Date.parse(value)) && value.includes("T")) {
      return {
        ...baseProcessedValue,
        value: new Date(value).toLocaleString(),
        type: "fecha",
        rawValue: value,
      };
    }
    return { ...baseProcessedValue, type: "string" };
  }

  if (typeof value === "number") {
    // Detectar si el número es un timestamp
    if (String(value).length === 10 || String(value).length === 13) {
      const date = new Date(value * (String(value).length === 10 ? 1000 : 1));
      if (date.getTime() > 0) {
        return {
          value: date.toLocaleString(),
          type: "fecha",
          rawValue: value,
        };
      }
    }
    return {
      value: value,
      type: "número",
    };
  }

  if (typeof value === "boolean") {
    return { value: String(value), type: "boolean" };
  }

  if (Array.isArray(value)) {
    console.log("📦 Procesando array en campo:", fieldName, {
      items: value.length,
      firstItem: value[0],
      parentId,
    });
    const items = value.map((item) => processValue(item, fieldName, parentId));
    return {
      value,
      type: "array",
      items,
      parentId,
      path: [fieldName],
    };
  }

  if (typeof value === "object" && value !== null) {
    return {
      value: value,
      type: "objeto",
      __parentId: parentId,
    };
  }

  return { value: String(value), type: "string" };
};

export interface ProcessedValue {
  value: unknown;
  type: string;
  items?: ProcessedValue[];
  parentId?: string;
  __parentId?: string;
  rawValue?: unknown;
  label?: string;
  title?: string;
  isReference?: boolean;
  path?: string[];
}

export interface ProcessedItem extends ProcessedValue {
  id: string;
  path: string[];
  groups?: string[];
  isId?: boolean;
}

export type ProcessedRow = Record<string, ProcessedItem>;

// Actualizar inferColumnType
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
    lowerName.includes("isperson") ||
    value.type === "boolean" ||
    (typeof value.value === "number" &&
      (value.value === 0 || value.value === 1))
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
    return "número";
  }

  return value.type;
};

export const processData = (data: Record<string, unknown>): ProcessedItem[] => {
  const processed: ProcessedItem[] = [];
  const flattenedData = flattenObject(data);
  let keyFound = false;
  let currentId: string | undefined;

  // Primero buscamos el ID principal
  for (const [key, value] of Object.entries(flattenedData)) {
    if (isIdField(key) && !keyFound) {
      keyFound = true;
      currentId = String(value);
      console.log("🔑 ID Principal encontrado:", {
        key,
        value: currentId,
      });
      break;
    }
  }

  // Luego procesamos todos los campos
  for (const [key, value] of Object.entries(flattenedData)) {
    const path = key.split(".");
    const processedValue = processValue(value, key, currentId);
    const inferredType = inferColumnType(key, processedValue);
    const shouldBeKey = isIdField(key) && !keyFound;

    processed.push({
      id: key,
      path,
      ...processedValue,
      type: inferredType,
      isId: shouldBeKey,
      __parentId: currentId,
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

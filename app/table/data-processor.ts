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

// Función auxiliar para formatear fechas de manera consistente
const formatDate = (date: Date): string => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
};

export const processValue = (value: unknown): ProcessedValue => {
  if (value === null) return { value: "null", type: "null" };
  if (value === undefined) return { value: "undefined", type: "undefined" };

  if (typeof value === "string") {
    if (isDate(value)) {
      // Usar el formato consistente para fechas
      return {
        value: formatDate(new Date(value)),
        type: "fecha",
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
    return {
      value: value,
      type: "array",
      items: value.map(processValue),
    };
  }

  if (typeof value === "object" && value !== null) {
    const processed: Record<string, ProcessedValue> = {};
    for (const [key, val] of Object.entries(value)) {
      processed[key] = processValue(val);
    }
    return { value: processed, type: "objeto" };
  }

  return { value: String(value), type: "unknown" };
};

export interface ProcessedValue {
  value: unknown;
  type: string;
  items?: ProcessedValue[];
}

export interface ProcessedItem extends ProcessedValue {
  id: string;
  path: string[];
  groups: string[];
  isObjectField?: boolean;
}

export type ProcessedRow = Record<string, ProcessedItem>;

export const processData = (data: Record<string, unknown>): ProcessedItem[] => {
  const processed: ProcessedItem[] = [];
  const objectPaths = new Set<string>();

  // 1) Identificamos todas las rutas que son objetos
  const identifyObjects = (obj: Record<string, unknown>, prefix = ""): void => {
    Object.entries(obj).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !isDate(value)
      ) {
        objectPaths.add(path);
        identifyObjects(value as Record<string, unknown>, path);
      }
    });
  };
  identifyObjects(data);

  // 2) Aplanamos y procesamos
  const flattenedData = flattenObject(data);

  for (const [key, value] of Object.entries(flattenedData)) {
    const path = key.split(".");
    const groups: string[] = [];
    let currentPath = "";

    // Construimos el array de grupos para cada propiedad
    for (let i = 0; i < path.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}.${path[i]}` : path[i];
      if (objectPaths.has(currentPath)) {
        groups.push(currentPath);
      }
    }

    const processedValue = processValue(value);
    processed.push({
      id: key,
      path,
      groups,
      ...processedValue,
      isObjectField: objectPaths.has(key),
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
  const rootItems: ProcessedItem[] = [];
  const groupTree: { [key: string]: GroupedColumns } = {};

  // Identificamos root items y creamos un "árbol" de grupos
  data.forEach((item) => {
    if (item.groups.length === 0 && !item.isObjectField) {
      // Propiedades que no pertenecen a ningún objeto
      rootItems.push(item);
    } else {
      item.groups.forEach((group, index) => {
        // IMPORTANTE: Ajustamos el "level" para que los grupos top-level empiecen en 1
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

  // Asignamos los items a su último grupo
  data.forEach((item) => {
    if (item.groups.length > 0) {
      const lastGroup = item.groups[item.groups.length - 1];
      if (groupTree[lastGroup]) {
        if (!groupTree[lastGroup].items) {
          groupTree[lastGroup].items = [];
        }
        groupTree[lastGroup].items!.push(item);
      }
    }
  });

  // Construimos la estructura jerárquica
  Object.values(groupTree).forEach((group) => {
    const parentGroup = group.id.split(".").slice(0, -1).join(".");
    if (parentGroup && groupTree[parentGroup]) {
      if (!groupTree[parentGroup].children) {
        groupTree[parentGroup].children = [];
      }
      groupTree[parentGroup].children!.push(group);
    }
  });

  return {
    rootItems,
    groups: Object.values(groupTree).filter((group) => group.level === 1),
  };
};

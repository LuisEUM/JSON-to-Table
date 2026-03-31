import type { FilterFn } from "@tanstack/react-table";
import type { ProcessedItem, ProcessedRow } from "../utils/data-processor";
import { logger } from "../services/logging-service";

export const globalFilterFn: FilterFn<ProcessedRow> = (
  row,
  columnId,
  filterValue
) => {
  const searchTerm = String(filterValue).toLowerCase();
  if (!searchTerm) return true;

  logger.debug("Buscando en la fila:", {
    searchTerm,
    rowId: row.id,
    originalLength: Object.keys(row.original).length,
  });

  // Buscar en todos los valores de la fila
  const searchInObject = (obj: unknown): boolean => {
    if (!obj) return false;

    // Si es un ProcessedItem, buscar en su valor
    if (
      typeof obj === "object" &&
      obj !== null &&
      "value" in obj &&
      "type" in obj
    ) {
      const processedItem = obj as ProcessedItem;

      // Para string, buscar directamente
      if (typeof processedItem.value === "string") {
        const value = processedItem.value.toLowerCase();
        if (value.includes(searchTerm)) return true;
      }
      // Para números, convertir a string y buscar
      else if (typeof processedItem.value === "number") {
        const value = String(processedItem.value).toLowerCase();
        if (value.includes(searchTerm)) return true;
      }
      // Para fechas, buscar en el formato legible
      else if (processedItem.type === "date") {
        const value = String(processedItem.value).toLowerCase();
        if (value.includes(searchTerm)) return true;
      }
      // Para booleanos, buscar por 'verdadero' o 'falso'
      else if (processedItem.type === "boolean") {
        const boolString = processedItem.value ? "verdadero" : "falso";
        if (boolString.includes(searchTerm)) return true;
      }

      // Si es un array, buscar en sus items
      if (
        processedItem.type.includes("array") &&
        Array.isArray(processedItem.items)
      ) {
        return processedItem.items.some((item: unknown) =>
          searchInObject(item)
        );
      }
    }

    // Si es un objeto, buscar recursivamente
    if (typeof obj === "object" && obj !== null) {
      return Object.values(obj).some((value) => searchInObject(value));
    }

    // Para valores primitivos
    if (obj !== undefined && obj !== null) {
      return String(obj).toLowerCase().includes(searchTerm);
    }

    return false;
  };

  // Buscar en toda la fila
  const found = searchInObject(row.original);
  logger.debug("Resultado de busqueda:", {
    rowId: row.id,
    found,
  });
  return found;
};

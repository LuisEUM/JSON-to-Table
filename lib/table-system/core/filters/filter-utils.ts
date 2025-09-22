/**
 * Utilidades para el sistema de filtros
 */

export type SeparatorType =
  | "none"
  | "tab"
  | "semicolon"
  | "comma"
  | "space"
  | "multispace"
  | "newline";

/**
 * Obtiene la expresión regular correspondiente al tipo de separador
 */
export function getSeparatorRegex(separator: SeparatorType): RegExp | null {
  switch (separator) {
    case "tab":
      return /\t/g;
    case "semicolon":
      return /;/g;
    case "comma":
      return /,/g;
    case "space":
      return / /g;
    case "multispace":
      return /\s+/g;
    case "newline":
      return /\n/g;
    case "none":
    default:
      return null;
  }
}

/**
 * Divide una cadena por el separador especificado
 * @param value - El valor a dividir
 * @param separator - El tipo de separador a usar
 * @returns Array de valores divididos y limpios
 */
export function splitBySeparator(
  value: string,
  separator: SeparatorType
): string[] {
  const regex = getSeparatorRegex(separator);

  if (!regex) {
    return [value];
  }

  return value
    .split(regex)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Verifica si un valor de campo coincide con los valores del filtro
 * considerando separadores y coincidencia exacta
 */
export function matchesFilterWithSeparator(
  fieldValue: string,
  filterValues: string[],
  separator: SeparatorType,
  exactMatch: boolean
): boolean {
  // Si no hay separador, comparación directa
  if (!separator || separator === "none") {
    return filterValues.includes(fieldValue);
  }

  // Dividir el valor del campo por el separador
  const fieldParts = splitBySeparator(fieldValue, separator);

  if (exactMatch) {
    // Coincidencia exacta: los valores del campo deben ser exactamente los mismos que los filtros
    // (mismo número y mismos valores)
    if (fieldParts.length !== filterValues.length) {
      return false;
    }
    return (
      fieldParts.every((part) => filterValues.includes(part)) &&
      filterValues.every((val) => fieldParts.includes(val))
    );
  } else {
    // Coincidencia parcial: al menos uno de los valores del campo debe estar en los filtros
    return fieldParts.some((part) => filterValues.includes(part));
  }
}

/**
 * Verifica si un texto contiene los términos de búsqueda
 * considerando coincidencia exacta de palabra
 */
export function matchesTextSearch(
  text: string,
  searchTerms: string[],
  exactWordMatch: boolean
): boolean {
  const textLower = text.toLowerCase();

  return searchTerms.some((term) => {
    const termLower = term.toLowerCase();

    if (exactWordMatch) {
      // Coincidencia exacta de palabra usando límites de palabra
      const regex = new RegExp(`\\b${escapeRegExp(termLower)}\\b`);
      return regex.test(textLower);
    } else {
      // Contiene el texto
      return textLower.includes(termLower);
    }
  });
}

/**
 * Escapa caracteres especiales para usar en RegExp
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Procesa un valor de filtro para operadores de array
 * Asegura que siempre devuelva un array de strings
 */
export function normalizeFilterValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [String(value)];
}

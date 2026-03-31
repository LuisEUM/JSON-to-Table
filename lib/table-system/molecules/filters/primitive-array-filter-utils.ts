import type { TypeDetectionResult } from "./type-detector";

/**
 * Get a human-readable type description for the UI header.
 */
export function getTypeDescription(typeDetectionResult: TypeDetectionResult): string {
  const { primaryType, confidence, metadata } = typeDetectionResult;

  switch (primaryType) {
    case "realArray":
      return `Arrays reales detectados (${Math.round(
        confidence * 100
      )}% confianza)`;
    case "stringWithSeparators": {
      const separator = metadata.detectedSeparator;
      const separatorName =
        separator === ","
          ? "coma"
          : separator === ";"
          ? "punto y coma"
          : separator === "|"
          ? "pipe"
          : separator || "desconocido";
      return `Strings con separadores detectados (${separatorName}, ${Math.round(
        confidence * 100
      )}% confianza)`;
    }
    case "mixedContent":
      return `Contenido mixto detectado (${metadata.arrayCount} arrays, ${metadata.stringCount} strings, ${metadata.numberCount} números, ${metadata.dateCount} fechas)`;
    case "pureString":
      return `Columna de texto puro (${Math.round(
        confidence * 100
      )}% confianza)`;
    case "pureNumber":
      return `Columna numérica pura (${Math.round(
        confidence * 100
      )}% confianza)`;
    case "pureDate":
      return `Columna de fechas pura (${Math.round(
        confidence * 100
      )}% confianza)`;
    default:
      return `Tipo no determinado`;
  }
}

/**
 * Get the color class for a filter type dot indicator.
 */
export function getFilterTypeDotColor(type: string): string {
  switch (type) {
    case "array":
      return "bg-blue-500";
    case "string":
      return "bg-green-500";
    case "number":
      return "bg-orange-500";
    case "date":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

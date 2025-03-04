/**
 * Convierte un array de objetos a formato CSV
 */
export function convertToCSV(data: Record<string, unknown>[]): string {
  if (!data || data.length === 0) return "";

  // Obtener todas las claves únicas de todos los objetos
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys);

  // Crear la fila de encabezados
  let csv = headers.join(",") + "\n";

  // Crear las filas de datos
  data.forEach((item) => {
    const row = headers.map((header) => {
      const value = item[header];

      // Manejar diferentes tipos de datos
      if (value === null || value === undefined) {
        return "";
      } else if (typeof value === "object") {
        // Convertir objetos a JSON string y escapar comillas
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        // Escapar comillas en strings
        return typeof value === "string"
          ? `"${value.replace(/"/g, '""')}"`
          : String(value);
      }
    });

    csv += row.join(",") + "\n";
  });

  return csv;
}

/**
 * Descarga un archivo con el contenido proporcionado
 */
export function downloadFile(
  content: string,
  fileName: string,
  contentType: string
): void {
  // Crear un blob con el contenido
  const blob = new Blob([content], { type: contentType });

  // Crear una URL para el blob
  const url = URL.createObjectURL(blob);

  // Crear un elemento de enlace para descargar
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  // Añadir el enlace al documento, hacer clic y luego eliminarlo
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar la URL del objeto
  URL.revokeObjectURL(url);
}

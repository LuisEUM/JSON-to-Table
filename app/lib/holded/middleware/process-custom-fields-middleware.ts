/**
 * Función middleware que garantiza que todos los objetos de cliente tengan
 * un campo customFields inicializado como array.
 *
 * Esta función detecta si hay campos de customFields en formato no estándar
 * y los normaliza para que las funciones de procesamiento puedan trabajar con ellos.
 */
export function ensureCustomFieldsMiddleware(data: any): any {
  console.log("🔄 Middleware: Asegurando customFields en datos", {
    length: Array.isArray(data) ? data.length : "objeto único",
    tipo: typeof data,
  });

  // Si es un array, procesar cada elemento
  if (Array.isArray(data)) {
    return data.map((item) => processCustomFields(item));
  }

  // Si es un objeto, procesarlo directamente
  if (data && typeof data === "object") {
    return processCustomFields(data);
  }

  // Si no es un array ni un objeto, devolverlo sin cambios
  return data;
}

/**
 * Procesa un objeto individual para asegurar que tiene customFields como array
 */
function processCustomFields(item: any): any {
  // Si no es un objeto o es null, devolverlo sin cambios
  if (!item || typeof item !== "object") {
    return item;
  }

  // Si ya tiene customFields como array, no hay que hacer nada
  if (Array.isArray(item.customFields)) {
    return item;
  }

  // Crear copia para no modificar el original
  const result = { ...item };

  // Inicializar customFields como array vacío por defecto
  result.customFields = [];

  // Si customFields existe pero no es un array, intentar convertirlo
  if (item.customFields !== undefined) {
    console.log(
      "⚠️ customFields encontrado pero no es un array:",
      item.customFields
    );

    if (typeof item.customFields === "object" && item.customFields !== null) {
      // Convertir objeto a array de { field, value }
      result.customFields = Object.entries(item.customFields).map(
        ([field, value]) => ({
          field,
          value: String(value),
        })
      );

      console.log(
        "✅ customFields convertido de objeto a array con",
        result.customFields.length,
        "elementos"
      );
    }
  }

  // Buscar campos específicos relacionados con estado y añadirlos a customFields si no existen
  for (const [key, value] of Object.entries(item)) {
    // Ignorar campos que ya están en customFields o que son objetos complejos
    if (key === "customFields" || value === null || value === undefined) {
      continue;
    }

    // Si el campo parece relacionado con estado o cliente, añadirlo a customFields
    if (
      key.toLowerCase().includes("estado") ||
      key.toLowerCase().includes("cliente") ||
      key.toLowerCase().includes("status") ||
      (typeof key === "string" && key.includes(" - "))
    ) {
      // Verificar si ya existe un campo similar en customFields
      const fieldExists = result.customFields.some(
        (cf: any) => cf.field === key || cf.field.includes(key)
      );

      if (!fieldExists) {
        result.customFields.push({
          field: key,
          value: String(value),
        });

        console.log(
          `🔍 Campo relacionado añadido a customFields: ${key} = ${value}`
        );
      }
    }
  }

  // Detectar si encontramos el campo específico "CLIENTE INSIDERS - Estado del Cliente"
  const estadoClienteField = result.customFields.find(
    (cf: any) =>
      cf.field === "CLIENTE INSIDERS - Estado del Cliente" ||
      cf.field.includes("Estado del Cliente")
  );

  if (estadoClienteField) {
    console.log(
      "✅ Campo de estado del cliente encontrado:",
      estadoClienteField
    );
  } else {
    console.log("⚠️ No se encontró campo específico de estado del cliente");
  }

  return result;
}

// Exportar función como default para facilitar su importación
export default ensureCustomFieldsMiddleware;

// Manual Test Script for Holded Status Columns Integration
// This script can be run in the browser console when on the table page with Holded contacts

function testHoldedStatusColumnsIntegration() {
  console.log("=== INICIO DIAGNÓSTICO COLUMNAS HOLDED ===");

  // 1. Verificar parámetros de URL
  try {
    const url = new URL(window.location.href);
    console.log("URL completa:", url.href);

    const params = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    console.log("Todos los parámetros de URL:", params);

    const source = url.searchParams.get("source");
    const dataType = url.searchParams.get("dataType");

    console.log(`Parámetros clave: source='${source}', dataType='${dataType}'`);

    // 2. Verificar si se cumplen las condiciones para la extensión de procesamiento
    const shouldAddStatusColumns =
      source === "holded" && dataType === "contacts";
    console.log(
      `¿Condiciones para añadir columnas de estado cumplen? ${
        shouldAddStatusColumns ? "✅ SÍ" : "❌ NO"
      }`
    );

    if (!shouldAddStatusColumns) {
      console.warn(
        "Las columnas de estado solo se añaden cuando source='holded' y dataType='contacts'"
      );
      console.log(
        "URL esperada debe contener: ?source=holded&dataType=contacts"
      );

      // Sugerir la URL correcta
      const fixedUrl = new URL(url.href);
      fixedUrl.searchParams.set("source", "holded");
      fixedUrl.searchParams.set("dataType", "contacts");
      console.log("URL correcta sería:", fixedUrl.href);

      console.log("Para corregir la URL, ejecuta:");
      console.log(`window.location.href = "${fixedUrl.href}"`);

      // Proporcionar una función para corregir la URL
      window.fixHoldedUrl = function () {
        window.location.href = fixedUrl.href;
        return "Redirigiendo a la URL correcta...";
      };

      console.log("O simplemente ejecuta: fixHoldedUrl()");

      return {
        success: false,
        message: "Parámetros URL incorrectos",
        expectedUrl: fixedUrl.href,
      };
    }

    // 3. Verificar si los datos se han procesado por la extensión
    // Verificar si existe _customerData o _customerStatus en alguna fila
    const table = document.querySelector('[role="table"]');
    if (!table) {
      console.error("❌ No se encontró la tabla en la página");
      return { success: false, message: "No se encontró la tabla" };
    }

    console.log("🔍 Analizando tabla de datos...");

    // Buscar si existe la columna de estado del cliente
    const headerCells = table.querySelectorAll("th");
    let statusColumnExists = false;
    headerCells.forEach((cell) => {
      if (cell.textContent.includes("Estado del Cliente")) {
        statusColumnExists = true;
        console.log("✅ Columna 'Estado del Cliente' encontrada");
      }
    });

    if (!statusColumnExists) {
      console.error("❌ No se encontró la columna 'Estado del Cliente'");
      console.log("Esto puede indicar que:");
      console.log("1. La columna no se añadió correctamente");
      console.log("2. La extensión del procesador no se registró");
      console.log("3. Los datos no pasaron por el procesador con extensiones");

      return {
        success: false,
        message: "Columna de estado no encontrada",
      };
    }

    // 4. Verificar los valores de las celdas de estado
    const statusCells = Array.from(table.querySelectorAll("td")).filter(
      (cell) => {
        // Buscar celdas que contengan elementos con estado (círculo de color + texto)
        const hasCircle = cell.querySelector(".rounded-full") !== null;
        const hasStatusText =
          cell.textContent.includes("Servicio Activo") ||
          cell.textContent.includes("Servicio Desactivado") ||
          cell.textContent.includes("Va a ser Alta") ||
          cell.textContent.includes("Va a ser Baja") ||
          cell.textContent.includes("Sin Estado");

        return hasCircle && hasStatusText;
      }
    );

    console.log(`Se encontraron ${statusCells.length} celdas con estado`);

    if (statusCells.length === 0) {
      console.error(
        "❌ No se encontraron celdas con estado. Todas muestran N/A"
      );
      return {
        success: false,
        message: "No se encontraron celdas con estado válido",
      };
    }

    // Contar los diferentes estados para verificar variedad
    const statusCounts = {};
    statusCells.forEach((cell) => {
      const status = cell.textContent.trim();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log("Estados encontrados:", statusCounts);

    // 5. Verificar colores de los indicadores de estado
    const colorClasses = {
      "text-green-500": "Activo",
      "text-red-500": "Desactivado",
      "text-yellow-500": "Por activar",
      "text-orange-500": "Por desactivar",
      "text-gray-400": "Sin estado",
    };

    const coloredIndicators = {};
    Object.keys(colorClasses).forEach((colorClass) => {
      const indicators = table.querySelectorAll(
        `.${colorClass.replace("text-", "")}`
      );
      coloredIndicators[colorClasses[colorClass]] = indicators.length;
    });

    console.log("Indicadores de color encontrados:", coloredIndicators);

    // 6. Verificar si los datos contienen customFields
    console.log(
      "💻 Intenta ejecutar esto en la consola para ver los datos procesados:"
    );
    console.log(
      "const tableComponent = Array.from(document.querySelectorAll('*')).find(el => el._reactFiber$?._debugOwner?.elementType?.name === 'JsonTable');"
    );
    console.log("const rawData = tableComponent?._reactProps?.data || [];");
    console.log(
      "const info = { rowCount: rawData.length, firstRow: rawData[0] };"
    );
    console.log("console.log('Datos brutos de la tabla:', info);");

    return {
      success: true,
      statusColumnExists,
      statusCellsCount: statusCells.length,
      statusCounts,
      coloredIndicators,
    };
  } catch (error) {
    console.error("❌ Error durante la prueba:", error);
    return { success: false, error: error.message };
  }
}

// Función auxiliar para redirigir a la URL correcta
function fixHoldedUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("source", "holded");
  url.searchParams.set("dataType", "contacts");
  window.location.href = url.href;
  return "Redirigiendo a la URL correcta...";
}

// Ejecuta automáticamente la prueba al cargar el script
const testResult = testHoldedStatusColumnsIntegration();
console.log("Resultado de la prueba:", testResult);

// Exponer la función para uso manual
window.testHoldedStatusColumnsIntegration = testHoldedStatusColumnsIntegration;
window.fixHoldedUrl = fixHoldedUrl;

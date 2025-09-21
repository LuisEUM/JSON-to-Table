// TODO: Migrar sistema de extensiones al atomic system
// import {
//   DataProcessorExtension,
//   ProcessedItem,
//   ProcessedRow,
//   registerDataProcessorExtension,
// } from "@/lib/table-system/core/utils/data-processor";
import {
  ProcessedItem,
  ProcessedRow,
} from "@/lib/table-system/core/utils/data-processor";
import { Customer, CustomField } from "../interfaces/customer";
import { getCustomerStatus } from "../utils/holded-customer-status-utils";
import { withHoldedStatusColumns } from "../components/holded-status-columns";
import { ensureCustomFieldsMiddleware } from "../middleware/process-custom-fields-middleware";

/**
 * Adaptador que convierte los datos procesados (ProcessedRow) a objetos Customer
 * para que puedan ser utilizados por las funciones de estado
 */
function adaptProcessedRowToCustomer(row: ProcessedRow): Customer {
  console.log("🔄 Adaptando fila procesada a Customer:", row.id?.value);

  // Extraer customFields de la fila procesada, si existe
  let customFields = [];

  if (row.customFields?.value) {
    // Si ya es un array, lo usamos directamente
    if (Array.isArray(row.customFields.value)) {
      customFields = row.customFields.value;
      console.log(
        "✅ customFields ya es un array con",
        customFields.length,
        "elementos"
      );
    }
    // Si es un objeto, intentamos convertirlo a array
    else if (typeof row.customFields.value === "object") {
      customFields = Object.entries(row.customFields.value).map(
        ([field, value]) => ({
          field,
          value: String(value),
        })
      );
      console.log(
        "🔄 customFields convertido de objeto a array con",
        customFields.length,
        "elementos"
      );
    }
  }

  // Si no hay customFields, buscar otros campos que puedan contener la información de estado
  if (!customFields.length) {
    console.log("⚠️ No se encontraron customFields, creando datos simulados");

    customFields = [];

    // Buscar específicamente campos que puedan contener información de estado
    Object.entries(row).forEach(([key, item]) => {
      if (!item) return;

      const fieldValue = item.value;
      if (fieldValue === undefined || fieldValue === null) return;

      // Convertir propiedades a customFields para que funcionen con la lógica existente
      if (
        key.includes("cliente") ||
        key.includes("status") ||
        key.includes("estado") ||
        key.includes("fecha")
      ) {
        customFields.push({
          field: key,
          value: String(fieldValue),
        });
        console.log(`🔍 Campo relacionado encontrado: ${key} = ${fieldValue}`);
      }

      // Si hay un campo específico para CLIENTE INSIDERS - Estado del Cliente
      if (
        key === "CLIENTE INSIDERS - Estado del Cliente" ||
        key.toLowerCase().includes("estado del cliente")
      ) {
        customFields.push({
          field: "CLIENTE INSIDERS - Estado del Cliente",
          value: String(fieldValue),
        });
        console.log(`✅ Campo de estado encontrado: ${key} = ${fieldValue}`);
      }
    });
  }

  // Crear el objeto Customer
  const customer: Customer = {
    id: String(row.id?.value || "unknown"),
    name: String(row.name?.value || row.tradeName?.value || ""),
    tradeName: String(row.tradeName?.value || row.name?.value || ""),
    email: String(row.email?.value || ""),
    customFields: customFields,
  };

  console.log("📊 Customer adaptado:", {
    id: customer.id,
    name: customer.name,
    customFieldsCount: customer.customFields.length,
  });

  // Diagnosticar si encontramos el campo crítico
  const estadoField = customer.customFields.find(
    (f) =>
      f.field === "CLIENTE INSIDERS - Estado del Cliente" ||
      f.field.includes("Estado del Cliente")
  );

  if (estadoField) {
    console.log("🎯 Campo de estado encontrado:", estadoField);
  } else {
    console.log("⚠️ No se encontró el campo específico de estado del cliente");
  }

  return customer;
}

// TODO: Migrar sistema de extensiones al atomic system
// Para ahora, comentamos la extensión hasta que se migre el sistema
// /**
//  * Extensión del procesador de datos para Holded que añade columnas de estado
//  * a las tablas de contactos
//  */
// const holdedDataProcessorExtension: DataProcessorExtension = {
//   name: "holded-status-columns",
//   shouldApply: (meta: any) => {
//     const result = meta.source === "holded" && meta.dataType === "contacts";
//     console.log(
//       `📊 Evaluando si aplicar extensión Holded: ${
//         result ? "Sí" : "No"
//       } (source=${meta.source}, dataType=${meta.dataType})`
//     );
//     return result;
//   },
//   process: (rows: ProcessedRow[]): ProcessedRow[] => {
//     console.log("📊 Procesando extensión Holded para", rows.length, "filas");

//     try {
//       // Aplicar middleware para normalizar customFields en cada fila
//       const preprocessedRows = rows.map((row) => {
//         // Extraer el valor real de cada campo ProcessedItem
//         const rawData: Record<string, any> = {};
//         Object.entries(row).forEach(([key, item]) => {
//           if (item && typeof item === "object" && "value" in item) {
//             rawData[key] = item.value;
//           }
//         });

//         // Normalizar customFields en los datos crudos
//         const processedData = ensureCustomFieldsMiddleware(rawData);

//         // Actualizar la fila con los customFields normalizados
//         if (processedData.customFields) {
//           row.customFields = {
//             id: "customFields",
//             path: ["customFields"],
//             value: processedData.customFields,
//             type: "array",
//             label: "customFields",
//           };
//         }

//         return row;
//       });

//       console.log("✅ Filas preprocesadas:", preprocessedRows.length);

//       // Devolver las filas procesadas
//       return preprocessedRows;
//     } catch (error) {
//       console.error("❌ Error al procesar la extensión Holded:", error);
//       return rows; // En caso de error, devolvemos los datos sin modificar
//     }
//   },
// };

// TODO: Migrar sistema de extensiones al atomic system
// Comentamos el registro hasta que se migre
// // Registro automático de la extensión
// (() => {
//   if (typeof window !== "undefined") {
//     // Solo ejecutar en el cliente
//     console.log("📊 Registrando extensión del procesador de datos para Holded");

//     // Importación dinámica para evitar problemas de SSR
//     import("@/lib/table-system/core/utils/data-processor").then(
//       ({ registerDataProcessorExtension }) => {
//         registerDataProcessorExtension(holdedDataProcessorExtension);
//       }
//     );
//   }
// })();

// export default holdedDataProcessorExtension;

// Exportar las funciones que sí funcionan por ahora
export { adaptProcessedRowToCustomer };

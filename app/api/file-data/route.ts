import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as fs from "fs";
import * as path from "path";

// Directorio donde se almacenan los archivos subidos
const UPLOAD_DIR = path.join(process.cwd(), "app/uploads");

// Tipos para los datos de ejemplo
type RecordItemValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, unknown>;

type RecordItem = Record<string, RecordItemValue>;

// Función para obtener datos de ejemplo según el tipo de archivo
function getMockDataByType(
  fileType: string | null,
  sheet: string | null
): RecordItem[] {
  switch (fileType) {
    case "json":
      return [
        {
          id: 1,
          name: "Producto A",
          category: "Electrónica",
          price: 299.99,
          stock: 45,
          available: true,
          features: ["Bluetooth", "WiFi", "USB-C"],
          dimensions: {
            width: 10,
            height: 5,
            depth: 2,
          },
        },
        {
          id: 2,
          name: "Producto B",
          category: "Hogar",
          price: 149.5,
          stock: 23,
          available: true,
          features: ["Ecológico", "Resistente al agua"],
          dimensions: {
            width: 30,
            height: 20,
            depth: 15,
          },
        },
        {
          id: 3,
          name: "Producto C",
          category: "Electrónica",
          price: 599.99,
          stock: 0,
          available: false,
          features: ["Pantalla táctil", "Bluetooth", "NFC"],
          dimensions: {
            width: 15,
            height: 8,
            depth: 0.5,
          },
        },
      ] as RecordItem[];
    case "csv":
      return [
        { id: 1, nombre: "Juan", edad: 25, ciudad: "Madrid", activo: true },
        { id: 2, nombre: "María", edad: 30, ciudad: "Barcelona", activo: true },
        { id: 3, nombre: "Luis", edad: 28, ciudad: "Valencia", activo: false },
        { id: 4, nombre: "Ana", edad: 22, ciudad: "Sevilla", activo: true },
        { id: 5, nombre: "Carlos", edad: 35, ciudad: "Bilbao", activo: false },
      ] as RecordItem[];
    case "xlsx":
    case "ods":
      // Para Excel/ODS podemos mostrar diferentes datos según la hoja seleccionada
      if (sheet === "Hoja2") {
        return [
          { id: 1, producto: "Laptop", ventas2022: 120, ventas2023: 150 },
          { id: 2, producto: "Smartphone", ventas2022: 300, ventas2023: 420 },
          { id: 3, producto: "Tablet", ventas2022: 80, ventas2023: 95 },
        ] as RecordItem[];
      } else {
        return [
          {
            id: 1,
            nombre: "Proyecto A",
            presupuesto: 15000,
            estado: "En progreso",
          },
          {
            id: 2,
            nombre: "Proyecto B",
            presupuesto: 8000,
            estado: "Completado",
          },
          {
            id: 3,
            nombre: "Proyecto C",
            presupuesto: 12000,
            estado: "Pendiente",
          },
          {
            id: 4,
            nombre: "Proyecto D",
            presupuesto: 5000,
            estado: "Cancelado",
          },
        ] as RecordItem[];
      }
    default:
      return [
        { id: 1, nombre: "Ejemplo 1", valor: 100 },
        { id: 2, nombre: "Ejemplo 2", valor: 200 },
      ] as RecordItem[];
  }
}

// Función para manejar solicitudes GET a /api/file-data
export async function GET(req: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);

    // Verificar la autenticación
    if (!session) {
      return NextResponse.json(
        {
          error:
            "No autenticado. Inicie sesión para acceder a esta funcionalidad.",
        },
        { status: 401 }
      );
    }

    // Obtener parámetros de la URL
    const fileId = req.nextUrl.searchParams.get("fileId");
    const fileType = req.nextUrl.searchParams.get("fileType");
    const sheet = req.nextUrl.searchParams.get("sheet");

    // Verificar si tenemos un ID de archivo
    if (!fileId) {
      // Si no hay ID de archivo, devolver datos de ejemplo según el tipo
      const mockData = getMockDataByType(fileType, sheet);

      return NextResponse.json({
        success: true,
        data: mockData,
        source: {
          type: fileType,
          ...(sheet && { sheet }),
          mock: true,
        },
      });
    }

    // Verificar si es un archivo Excel/ODS con múltiples hojas
    if ((fileType === "xlsx" || fileType === "ods") && sheet) {
      // Buscar archivo con todas las hojas
      const allSheetsFile = path.join(UPLOAD_DIR, `${fileId}.all-sheets.json`);

      if (fs.existsSync(allSheetsFile)) {
        try {
          // Leer el archivo con todas las hojas
          const fileContent = fs.readFileSync(allSheetsFile, "utf-8");
          const allSheets = JSON.parse(fileContent);

          // Verificar si la hoja solicitada existe
          if (allSheets[sheet]) {
            return NextResponse.json({
              success: true,
              data: allSheets[sheet],
              source: {
                type: fileType,
                fileId,
                sheet,
                mock: false,
              },
            });
          }
        } catch (error) {
          console.error("Error al leer archivo de hojas:", error);
        }
      }
    }

    // Buscar el archivo procesado correspondiente
    const processedFilePath = path.join(UPLOAD_DIR, `${fileId}.processed.json`);

    // Verificar si el archivo existe
    if (!fs.existsSync(processedFilePath)) {
      return NextResponse.json(
        {
          error: "Archivo no encontrado",
          details: "El archivo procesado no existe o ha sido eliminado",
        },
        { status: 404 }
      );
    }

    // Leer el archivo procesado
    const fileContent = fs.readFileSync(processedFilePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Devolver los datos
    return NextResponse.json({
      success: true,
      data,
      source: {
        type: fileType,
        fileId,
        ...(sheet && { sheet }),
        mock: false,
      },
    });
  } catch (error) {
    console.error("Error al obtener datos del archivo:", error);
    return NextResponse.json(
      {
        error: "Error al obtener datos del archivo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

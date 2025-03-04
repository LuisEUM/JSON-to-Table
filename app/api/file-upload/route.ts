import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

// Directorio para guardar los archivos subidos
const UPLOAD_DIR = path.join(process.cwd(), "app/uploads");

// Asegurarse de que el directorio existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Para evitar problemas con formData, usamos un enfoque diferente para archivos grandes
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const fileType = formData.get("fileType") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron archivos" },
        { status: 400 }
      );
    }

    // Procesar cada archivo
    const results = await Promise.all(
      files.map(async (file) => {
        const fileName = file.name;
        const fileExtension = path.extname(fileName).toLowerCase();

        // Validar extensión del archivo según el tipo seleccionado
        let isValidExtension = false;

        switch (fileType) {
          case "json":
            isValidExtension = fileExtension === ".json";
            break;
          case "csv":
            isValidExtension = fileExtension === ".csv";
            break;
          case "xlsx":
            isValidExtension = [".xlsx", ".xls"].includes(fileExtension);
            break;
          case "ods":
            isValidExtension = fileExtension === ".ods";
            break;
          default:
            isValidExtension = [
              ".json",
              ".csv",
              ".xlsx",
              ".xls",
              ".ods",
            ].includes(fileExtension);
        }

        if (!isValidExtension) {
          return {
            name: fileName,
            error: `Tipo de archivo no válido. Se esperaba ${fileType}`,
          };
        }

        // Generar nombre de archivo único
        const uniqueFileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(UPLOAD_DIR, uniqueFileName);

        // Guardar el archivo
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, fileBuffer);

        // Analizar el contenido según tipo de archivo
        let parsedData = [];
        let rowCount = 0;
        let sheetNames: string[] = [];
        let fileContent = "";
        let activeSheet = "";

        // Procesamos los datos según el tipo de archivo
        if (fileExtension === ".json") {
          try {
            fileContent = fs.readFileSync(filePath, "utf-8");
            const jsonData = JSON.parse(fileContent);
            parsedData = Array.isArray(jsonData) ? jsonData : [jsonData];
            rowCount = parsedData.length;
          } catch (error) {
            console.error("Error al procesar el archivo JSON:", error);
            return {
              name: fileName,
              error: "Error al procesar el archivo JSON",
            };
          }
        } else if (fileExtension === ".csv") {
          try {
            // Procesamiento básico de CSV para demostración
            fileContent = fs.readFileSync(filePath, "utf-8");
            const lines = fileContent
              .split("\n")
              .filter((line) => line.trim() !== "");
            if (lines.length > 0) {
              const headers = lines[0]
                .split(",")
                .map((h) => h.trim().replace(/"/g, ""));
              parsedData = lines.slice(1).map((line) => {
                const values = line
                  .split(",")
                  .map((v) => v.trim().replace(/"/g, ""));
                const row: Record<string, unknown> = {};
                headers.forEach((header, index) => {
                  // Intentar convertir a número si es posible
                  const value = values[index];
                  if (!isNaN(Number(value))) {
                    row[header] = Number(value);
                  } else if (value === "true" || value === "false") {
                    row[header] = value === "true";
                  } else {
                    row[header] = value;
                  }
                });
                return row;
              });
              rowCount = parsedData.length;
            }
          } catch (error: unknown) {
            console.error("Error al procesar el archivo CSV:", error);
            return {
              name: fileName,
              error: "Error al procesar el archivo CSV",
            };
          }
        } else if ([".xlsx", ".xls", ".ods"].includes(fileExtension)) {
          try {
            // Utilizar la biblioteca xlsx para procesar archivos Excel/ODS
            const workbook = XLSX.read(fileBuffer, { type: "buffer" });

            // Obtener nombres de hojas disponibles
            sheetNames = workbook.SheetNames;

            if (sheetNames.length === 0) {
              throw new Error("El archivo no contiene hojas de cálculo");
            }

            // Usar la primera hoja por defecto
            activeSheet = sheetNames[0];

            // Procesar la primera hoja
            const worksheet = workbook.Sheets[activeSheet];

            // Convertir la hoja a JSON con cabeceras
            const sheetData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
            }) as unknown[][];

            // La primera fila son los nombres de las columnas
            const headers = (sheetData[0] as unknown[]).map((h) => String(h));

            // Convertir filas restantes a objetos usando las cabeceras
            parsedData = sheetData.slice(1).map((row: unknown[]) => {
              const dataObj: Record<string, unknown> = {};
              headers.forEach((header, index) => {
                // Si el valor es undefined, lo dejamos como vacío
                dataObj[header] = row[index] !== undefined ? row[index] : "";
              });
              return dataObj;
            });

            rowCount = parsedData.length;

            // También podemos procesar todas las hojas y guardarlas por separado
            const allSheets: Record<string, unknown[]> = {};
            sheetNames.forEach((sheet) => {
              const ws = workbook.Sheets[sheet];
              allSheets[sheet] = XLSX.utils.sheet_to_json(ws) as unknown[];
            });

            // Guardar datos de todas las hojas en un archivo separado
            const allSheetsFilePath = path.join(
              UPLOAD_DIR,
              `${uniqueFileName}.all-sheets.json`
            );
            fs.writeFileSync(allSheetsFilePath, JSON.stringify(allSheets));
          } catch (error) {
            console.error("Error procesando Excel/ODS:", error);
            return {
              name: fileName,
              error: "Error al procesar el archivo de hoja de cálculo",
            };
          }
        }

        // Almacenar los datos procesados en el servidor
        const processedDataFile = path.join(
          UPLOAD_DIR,
          `${uniqueFileName}.processed.json`
        );
        fs.writeFileSync(processedDataFile, JSON.stringify(parsedData));

        return {
          name: fileName,
          savedAs: uniqueFileName,
          path: filePath,
          processedDataFile,
          size: file.size,
          type: file.type,
          rowCount,
          data: parsedData.slice(0, 3), // Una muestra para previsualización
          ...(sheetNames.length > 0 && { sheetNames }),
          ...(activeSheet && { activeSheet }),
        };
      })
    );

    return NextResponse.json({ success: true, files: results });
  } catch (error) {
    console.error("Error al procesar archivos:", error);
    return NextResponse.json(
      {
        error: "Error al procesar los archivos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

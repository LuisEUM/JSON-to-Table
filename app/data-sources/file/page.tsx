"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/app/components/ui/icons";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Upload,
  FileType,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos para los datos de archivo
interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  rowCount: number;
  sheetNames?: string[];
  data?: Record<string, unknown>[];
  error?: string;
  savedAs?: string;
  activeSheet?: string;
}

interface FileUploadResponse {
  files: FileData[];
}

interface PreviewData {
  count: number;
  sample: Record<string, unknown>[];
}

interface ProcessedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  rowCount: number;
  sheetNames?: string[];
}

// Tipos de archivo soportados
const FILE_TYPES = {
  ALL: {
    name: "Todos",
    extensions: [".json", ".csv", ".xlsx", ".xls", ".ods"],
    mimeTypes: [
      "application/json",
      "text/csv",
      "application/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.oasis.opendocument.spreadsheet",
    ] as SupportedMimeType[],
    icon: "Files",
  },
  JSON: {
    name: "JSON",
    extensions: [".json"],
    mimeTypes: ["application/json"] as SupportedMimeType[],
    icon: "FileJson",
  },
  CSV: {
    name: "CSV",
    extensions: [".csv"],
    mimeTypes: ["text/csv", "application/csv"] as SupportedMimeType[],
    icon: "FileSpreadsheet",
  },
  XLSX: {
    name: "Excel",
    extensions: [".xlsx", ".xls"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ] as SupportedMimeType[],
    icon: "FileSpreadsheet",
  },
  ODS: {
    name: "ODS",
    extensions: [".ods"],
    mimeTypes: [
      "application/vnd.oasis.opendocument.spreadsheet",
    ] as SupportedMimeType[],
    icon: "FileSpreadsheet",
  },
} as const;

type FileType = keyof typeof FILE_TYPES;

// Tipo para los MIME types soportados
type SupportedMimeType =
  | "application/json"
  | "text/csv"
  | "application/csv"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-excel"
  | "application/vnd.oasis.opendocument.spreadsheet";

export default function FileDataSourcePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<
    "none" | "validating" | "success" | "error"
  >("none");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [previewData, setPreviewData] = useState<PreviewData>({
    count: 0,
    sample: [],
  });
  const [activeFileType, setActiveFileType] = useState<FileType>("JSON");
  const [sheetOptions, setSheetOptions] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  // Obtener las extensiones aceptadas para todos los tipos de archivos
  const getAllowedExtensions = () => {
    if (activeFileType === "ALL") {
      return FILE_TYPES.ALL.extensions.join(",");
    }
    return FILE_TYPES[activeFileType].extensions.join(",");
  };

  // Verificar si un archivo es del tipo activo
  const isFileTypeValid = (file: File): boolean => {
    const fileType = activeFileType;
    const fileMimeType = file.type as SupportedMimeType;

    if (fileType === "ALL") {
      return (
        FILE_TYPES.ALL.extensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        ) || FILE_TYPES.ALL.mimeTypes.includes(fileMimeType)
      );
    }

    const validType = FILE_TYPES[fileType];
    return (
      validType.extensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      ) || validType.mimeTypes.includes(fileMimeType)
    );
  };

  // Manejar la selección de archivos
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Filtrar solo archivos del tipo seleccionado
    const validFiles = Array.from(files).filter(isFileTypeValid);

    if (validFiles.length === 0) {
      toast.error(
        `Solo se permiten archivos ${
          FILE_TYPES[activeFileType as keyof typeof FILE_TYPES].name
        }`
      );
      return;
    }

    setSelectedFiles(validFiles);
    validateFiles(validFiles);
  };

  // Manejar el drop de archivos
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    handleFileSelect(e.dataTransfer.files);
  };

  // Validar los archivos
  const validateFiles = async (files: File[]) => {
    setValidationStatus("validating");
    setValidationMessage("Validando archivos...");
    setPreviewData({ count: 0, sample: [] });
    setSheetOptions([]);
    setSelectedSheet("");

    try {
      // Preparar los archivos para la carga
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("fileType", activeFileType.toLowerCase());

      // Enviar los archivos a la API
      const response = await fetch("/api/file-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar los archivos");
      }

      const data: FileUploadResponse = await response.json();

      // Comprobar si hay errores en algún archivo
      const filesWithErrors = data.files.filter((file) => file.error);
      if (filesWithErrors.length > 0) {
        throw new Error(
          `Error en ${filesWithErrors.length} archivo(s): ${filesWithErrors[0].error}`
        );
      }

      // Guardar los IDs de los archivos procesados
      const processedFiles = data.files.map((file) => ({
        id: file.savedAs || file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        rowCount: file.rowCount || 0,
        ...(file.sheetNames && { sheetNames: file.sheetNames }),
      }));

      // Mostrar mensaje de éxito y datos
      const totalRows = data.files.reduce(
        (sum, file) => sum + (file.rowCount || 0),
        0
      );
      setValidationStatus("success");
      setValidationMessage(
        `${files.length} archivo(s) procesado(s) con éxito. ${totalRows} registros encontrados.`
      );

      // Si tenemos hojas de cálculo disponibles, mostrarlas
      if (data.files[0].sheetNames && data.files[0].sheetNames.length > 0) {
        setSheetOptions(data.files[0].sheetNames);
        // Si hay una hoja activa especificada, usarla
        setSelectedSheet(
          data.files[0].activeSheet || data.files[0].sheetNames[0]
        );
      }

      // Guardar los datos procesados en el estado local
      setProcessedFiles(processedFiles);

      // Mostrar datos de muestra
      if (data.files[0].data && data.files[0].data.length > 0) {
        setPreviewData({
          count: totalRows,
          sample: data.files[0].data,
        });
      } else {
        setPreviewData({
          count: totalRows,
          sample: [
            { id: 1, nombre: "Ejemplo 1", valor: 100 },
            { id: 2, nombre: "Ejemplo 2", valor: 200 },
          ],
        });
      }
    } catch (error) {
      setValidationStatus("error");
      setValidationMessage(
        error instanceof Error ? error.message : "Error al validar los archivos"
      );
      toast.error("Error de validación", {
        description:
          error instanceof Error
            ? error.message
            : `Error al validar los archivos ${FILE_TYPES[activeFileType].name}`,
      });
    }
  };

  // Continuar con la carga de datos
  const handleContinue = () => {
    // Verificar que tenemos archivos procesados
    if (processedFiles.length === 0) {
      toast.error("No hay archivos procesados para mostrar");
      return;
    }

    // Crear un objeto para almacenar los datos que pasaremos a la siguiente página
    const fileData = {
      source: "file",
      fileType: activeFileType.toLowerCase(),
      files: processedFiles,
      ...(selectedSheet && { sheet: selectedSheet }),
    };

    // Guardar los datos en localStorage para que estén disponibles en la página de tabla
    localStorage.setItem("fileUploadData", JSON.stringify(fileData));

    // Redirigir a la página de tabla con información básica en la URL
    const params = new URLSearchParams();
    params.append("source", "file");
    params.append("type", activeFileType.toLowerCase());

    // Añadir ID del primer archivo procesado
    if (processedFiles.length > 0) {
      params.append("fileId", processedFiles[0].id);
    }

    if (selectedSheet) {
      params.append("sheet", selectedSheet);
    }

    router.push(`/data-sources/table?${params.toString()}`);
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-6'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='container mx-auto py-8'>
          <Button
            variant='ghost'
            className='mb-6'
            onClick={() => router.push("/data-sources")}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a fuentes de datos
          </Button>

          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold mb-2'>Carga de archivos</h1>
            <p className='text-gray-500'>
              Arrastra o selecciona archivos para analizarlos y visualizarlos en
              formato tabla.
            </p>
          </div>

          <Card className='w-full max-w-3xl mx-auto'>
        <CardHeader>
          <div className='flex items-center space-x-4'>
            <div className='p-2 bg-primary/10 rounded-full'>
              <FileType className='h-6 w-6 text-primary' />
            </div>
            <div>
              <CardTitle>Selecciona tus archivos</CardTitle>
              <CardDescription>
                Puedes cargar archivos CSV, JSON, ODS o XLSX para analizarlos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Selección de tipo de archivo */}
          <Tabs
            defaultValue={activeFileType}
            onValueChange={(value) => setActiveFileType(value as FileType)}
          >
            <TabsList className='grid grid-cols-5 mb-4'>
              <TabsTrigger value='ALL'>Todos</TabsTrigger>
              <TabsTrigger value='JSON'>JSON</TabsTrigger>
              <TabsTrigger value='CSV'>CSV</TabsTrigger>
              <TabsTrigger value='XLSX'>Excel</TabsTrigger>
              <TabsTrigger value='ODS'>ODS</TabsTrigger>
            </TabsList>

            {Object.entries(FILE_TYPES).map(([key]) => (
              <TabsContent key={key} value={key} className='mt-0'>
                <div className='text-sm text-gray-500 mb-4'>
                  {key === "JSON" &&
                    "Archivos JSON con estructuras de datos en formato JavaScript Object Notation."}
                  {key === "CSV" &&
                    "Archivos de valores separados por comas para datos tabulares simples."}
                  {key === "XLSX" &&
                    "Hojas de cálculo de Microsoft Excel para datos tabulares con múltiples hojas."}
                  {key === "ODS" &&
                    "Archivos de OpenDocument Spreadsheet para hojas de cálculo."}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Drag and drop zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary/50"
              }
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              multiple
              accept={getAllowedExtensions()}
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            <Upload className='h-10 w-10 text-gray-400 mx-auto mb-2' />
            <h3 className='text-lg font-medium mb-1'>
              {isDragging
                ? "Suelta tus archivos aquí"
                : "Arrastra archivos aquí o haz clic para explorar"}
            </h3>
            <p className='text-gray-500 text-sm'>
              Acepta archivos{" "}
              {FILE_TYPES[activeFileType as keyof typeof FILE_TYPES].name}(
              {FILE_TYPES[
                activeFileType as keyof typeof FILE_TYPES
              ].extensions.join(", ")}
              )
            </p>
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-sm font-medium'>Archivos seleccionados:</h3>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between bg-gray-50 p-2 rounded'
                >
                  <div className='flex items-center space-x-2'>
                    <FileType className='h-4 w-4 text-primary' />
                    <span className='text-sm truncate max-w-[200px]'>
                      {file.name}
                    </span>
                  </div>
                  <span className='text-xs text-gray-500'>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Opciones para hojas de cálculo */}
          {validationStatus === "success" &&
            (activeFileType === "XLSX" || activeFileType === "ODS") &&
            sheetOptions.length > 0 && (
              <div className='p-4 border rounded-md bg-blue-50 border-blue-200 space-y-3'>
                <div className='flex items-center gap-2'>
                  <Icons.FileSpreadsheet className='h-5 w-5 text-blue-500' />
                  <h3 className='text-sm font-medium text-blue-700'>
                    El archivo contiene múltiples hojas
                  </h3>
                </div>

                <p className='text-sm text-blue-600'>
                  Se han detectado {sheetOptions.length} hojas en el archivo.
                  Selecciona la hoja que deseas visualizar:
                </p>

                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger className='bg-white'>
                    <SelectValue placeholder='Selecciona una hoja' />
                  </SelectTrigger>
                  <SelectContent>
                    {sheetOptions.map((sheet) => (
                      <SelectItem key={sheet} value={sheet}>
                        {sheet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Validation status */}
          {validationStatus === "validating" && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Validando archivos...</span>
                <span className='text-sm'>50%</span>
              </div>
              <Progress value={50} className='h-2' />
            </div>
          )}

          {validationStatus === "success" && (
            <Alert variant='default' className='bg-green-50 border-green-200'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <AlertTitle>Archivos válidos</AlertTitle>
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}

          {validationStatus === "error" && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error de validación</AlertTitle>
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}

          {/* Preview section */}
          {validationStatus === "success" && previewData.sample.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-sm font-medium'>Vista previa:</h3>
              <div className='bg-gray-50 p-3 rounded overflow-auto max-h-[200px]'>
                <pre className='text-xs'>
                  {JSON.stringify(previewData.sample, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className='flex justify-between'>
          <Button
            variant='outline'
            onClick={() => {
              setSelectedFiles([]);
              setValidationStatus("none");
              setPreviewData({ count: 0, sample: [] });
            }}
          >
            Limpiar
          </Button>
          <Button
            onClick={handleContinue}
            disabled={validationStatus !== "success"}
          >
            Continuar
          </Button>
        </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}

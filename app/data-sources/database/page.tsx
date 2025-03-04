"use client";

import React, { useState } from "react";
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
import { ArrowLeft, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Tipos para los datos de la base de datos
type PreviewData = Record<string, string | boolean | number | null>;

interface PreviewResponse {
  success: boolean;
  model: string;
  count: number;
  data: PreviewData[];
}

// Modelos disponibles en la base de datos
const DB_MODELS = [
  {
    id: "account",
    name: "Cuentas",
    description: "Cuentas de usuario para autenticación",
    fields: ["id", "userId", "type", "provider", "providerAccountId"],
  },
  {
    id: "session",
    name: "Sesiones",
    description: "Sesiones activas de usuarios",
    fields: ["id", "sessionToken", "userId", "expires"],
  },
  {
    id: "user",
    name: "Usuarios",
    description: "Usuarios registrados en el sistema",
    fields: ["id", "name", "email", "role", "createdAt", "updatedAt"],
  },
  {
    id: "view",
    name: "Vistas",
    description: "Vistas guardadas por los usuarios",
    fields: [
      "id",
      "name",
      "description",
      "userId",
      "isPublic",
      "createdAt",
      "updatedAt",
    ],
  },
] as const;

export default function DatabaseDataSourcePage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "connecting" | "success" | "error"
  >("none");
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);

  // Conectar con la base de datos y obtener datos de muestra
  const connectToDatabase = async () => {
    if (!selectedModel) {
      toast.error("Selecciona un modelo primero");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("connecting");

    try {
      // Obtener datos de muestra del modelo seleccionado
      const response = await fetch(
        `/api/database/preview?model=${selectedModel}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Error al conectar con la base de datos"
        );
      }

      const data: PreviewResponse = await response.json();

      setPreviewData(data.data || []);
      setConnectionStatus("success");
      toast.success("Conexión establecida", {
        description: `Se ha conectado correctamente a la colección ${selectedModel}`,
      });
    } catch (error) {
      console.error("Error conectando a la base de datos:", error);
      setConnectionStatus("error");
      toast.error("Error de conexión", {
        description:
          error instanceof Error
            ? error.message
            : "Error al conectar con la base de datos",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Continuar a la visualización de datos
  const handleContinue = () => {
    if (connectionStatus !== "success") {
      toast.error("Primero debes conectarte a la base de datos");
      return;
    }

    // Guardar la configuración de conexión en localStorage
    const databaseConfig = {
      source: "database",
      model: selectedModel,
    };

    localStorage.setItem("databaseConfig", JSON.stringify(databaseConfig));

    // Redirigir a la página de visualización de datos
    const params = new URLSearchParams();
    params.append("source", "database");
    params.append("model", selectedModel);

    router.push(`/table?${params.toString()}`);
  };

  return (
    <div className='container py-8 space-y-6'>
      <Button
        variant='ghost'
        className='mb-4'
        onClick={() => router.push("/data-sources")}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Volver a fuentes de datos
      </Button>

      <div className='flex flex-col space-y-4'>
        <h1 className='text-3xl font-bold'>Conexión a base de datos</h1>
        <p className='text-gray-500'>
          Conéctate a las tablas definidas en tu schema de Prisma para
          visualizarlas en formato tabla.
        </p>
      </div>

      <Card className='w-full max-w-3xl mx-auto'>
        <CardHeader>
          <div className='flex items-center space-x-4'>
            <div className='p-2 bg-primary/10 rounded-full'>
              <Database className='h-6 w-6 text-primary' />
            </div>
            <div>
              <CardTitle>Base de datos MongoDB</CardTitle>
              <CardDescription>
                Visualiza y trabaja con los datos de tus modelos definidos en
                Prisma
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Selección de modelo */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Selecciona un modelo:</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder='Selecciona un modelo' />
              </SelectTrigger>
              <SelectContent>
                {DB_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModel && (
              <p className='text-sm text-gray-500 mt-1'>
                {DB_MODELS.find((m) => m.id === selectedModel)?.description}
              </p>
            )}
          </div>

          {/* Botón de conexión */}
          <Button
            onClick={connectToDatabase}
            disabled={!selectedModel || isConnecting}
            className='w-full'
          >
            {isConnecting ? (
              <>
                <Icons.Spinner className='mr-2 h-4 w-4 animate-spin' />
                Conectando...
              </>
            ) : (
              "Conectar y previsualizar datos"
            )}
          </Button>

          {/* Estado de la conexión */}
          {connectionStatus === "error" && (
            <Alert variant='destructive'>
              <AlertTitle className='flex items-center'>
                <Icons.Close className='mr-2 h-4 w-4' />
                Error de conexión
              </AlertTitle>
              <AlertDescription>
                No se pudo conectar con la base de datos. Verifica la
                configuración y los permisos.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === "success" && (
            <Alert variant='default' className='bg-green-50 border-green-200'>
              <AlertTitle className='flex items-center text-green-700'>
                <Icons.Check className='mr-2 h-4 w-4' />
                Conexión exitosa
              </AlertTitle>
              <AlertDescription className='text-green-600'>
                La conexión a la base de datos se ha establecido correctamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Visualización de datos de muestra */}
          {previewData.length > 0 && (
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>Vista previa de datos:</h3>
              <div className='border rounded-md overflow-auto max-h-60'>
                <Table>
                  <TableCaption>
                    Mostrando {previewData.length} registros de muestra
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0]).map((key) => (
                        <TableHead key={key} className='whitespace-nowrap'>
                          {key}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            className='truncate max-w-[200px]'
                          >
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className='flex justify-between border-t p-4'>
          <Button variant='ghost' onClick={() => router.push("/data-sources")}>
            Cancelar
          </Button>
          <Button
            onClick={handleContinue}
            disabled={connectionStatus !== "success"}
          >
            Continuar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

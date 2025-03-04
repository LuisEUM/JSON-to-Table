"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoldedApiKeyForm } from "./holded-api-key-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Exportar el tipo para uso en otros componentes
export type DataSource =
  | "local"
  | "holded-api"
  | "pokemon-api"
  | "files"
  | "holded"
  | "file"
  | "pokemon"
  | "sample"
  | null;

interface DataSourceSelectorProps {
  onDataSourceSelected: (
    source: DataSource,
    data?: Record<string, unknown>[],
    apiKey?: string,
    files?: File[]
  ) => void;
}

export function DataSourceSelector({
  onDataSourceSelected,
}: DataSourceSelectorProps) {
  const { data: session } = useSession();
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setSelectedFiles(Array.from(files));
  };

  const handleFilesSelect = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Por favor, selecciona al menos un archivo");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(
      `Procesando ${selectedFiles.length} archivos...`,
      {
        duration: Infinity,
      }
    );

    try {
      onDataSourceSelected("files", undefined, undefined, selectedFiles);
      toast.dismiss(toastId);
      toast.success(
        `${selectedFiles.length} archivos seleccionados correctamente`
      );
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Error al procesar los archivos");
      console.error("Error al procesar archivos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceSelect = async (source: DataSource) => {
    setIsLoading(true);

    if (source === "holded-api" || source === "holded") {
      // Verificar si el usuario está autenticado
      if (!session) {
        toast.error("Necesitas iniciar sesión para acceder a Holded", {
          description: "Serás redirigido a la página de inicio de sesión",
        });

        // Redirigir al inicio de sesión y volver a esta página después
        signIn(undefined, { callbackUrl: window.location.href });
        setIsLoading(false);
        return;
      }

      // Si está autenticado, ahora muestra el formulario de API key
      setShowApiKeyForm(true);
      setIsLoading(false);
      return;
    }

    try {
      let response;
      const toastId = toast.loading(
        source === "pokemon-api" || source === "pokemon"
          ? "Conectando con la API de Pokémon..."
          : "Cargando datos locales...",
        {
          duration: Infinity,
        }
      );

      switch (source) {
        case "pokemon-api":
        case "pokemon":
          response = await fetch("/api/pokemon");
          break;
        case "local":
        case "sample":
          toast.dismiss(toastId);
          toast.error("Opción no disponible", {
            description: "Los datos de muestra locales han sido eliminados.",
          });
          setIsLoading(false);
          return;
      }

      if (!response?.ok) {
        throw new Error(`Error al obtener datos: ${response?.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast.dismiss(toastId);
      if (source === "pokemon-api" || source === "pokemon") {
        toast.success("Datos de Pokémon cargados", {
          description: `${data.length} Pokémon encontrados`,
        });
      }

      onDataSourceSelected(source, data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
    setIsLoading(false);
  };

  const handleApiKeySubmit = (apiKey: string) => {
    onDataSourceSelected("holded-api", undefined, apiKey);
  };

  const renderContent = () => {
    if (showApiKeyForm) {
      return (
        <HoldedApiKeyForm
          onApiKeySet={handleApiKeySubmit}
          onBack={() => setShowApiKeyForm(false)}
        />
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader>
            <CardTitle>API de Holded</CardTitle>
            <CardDescription>Conecta con tu cuenta de Holded</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Usa tus propios datos reales de clientes desde tu cuenta de
              Holded. Necesitarás proporcionar una clave API.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className='w-full'
              onClick={() => handleSourceSelect("holded-api")}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Cargando...
                </>
              ) : (
                "Seleccionar"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader>
            <CardTitle>API de Pokémon</CardTitle>
            <CardDescription>
              Datos de muestra de la API de Pokémon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Usa datos de la API pública de Pokémon para probar la
              funcionalidad sin datos reales.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className='w-full'
              onClick={() => handleSourceSelect("pokemon-api")}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Cargando...
                </>
              ) : (
                "Cargar datos de Pokémon"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader>
            <CardTitle>Cargar archivos JSON</CardTitle>
            <CardDescription>
              Carga múltiples archivos JSON para análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type='file'
              multiple
              accept='.json'
              onChange={handleFileUpload}
              className='w-full mb-4'
            />
            <p className='text-sm text-muted-foreground'>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} archivos seleccionados`
                : "Selecciona uno o más archivos JSON para analizar"}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className='w-full'
              onClick={handleFilesSelect}
              disabled={isLoading || selectedFiles.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Procesando...
                </>
              ) : (
                "Procesar archivos"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className='max-w-4xl mx-auto my-12 px-4'>
      <h1 className='text-3xl font-bold text-center mb-10'>
        Selecciona la fuente de datos
      </h1>
      {renderContent()}
    </div>
  );
}

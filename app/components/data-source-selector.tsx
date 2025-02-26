"use client";

import { useState } from "react";
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

type DataSource = "local" | "holded-api" | "pokemon-api" | null;

interface DataSourceSelectorProps {
  onDataSourceSelected: (
    source: DataSource,
    data?: Record<string, unknown>[],
    apiKey?: string
  ) => void;
}

export function DataSourceSelector({
  onDataSourceSelected,
}: DataSourceSelectorProps) {
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSourceSelect = async (source: DataSource) => {
    setIsLoading(true);

    if (source === "holded-api") {
      setShowApiKeyForm(true);
      setIsLoading(false);
      return;
    }

    try {
      let response;
      const toastId = toast.loading(
        source === "pokemon-api"
          ? "Conectando con la API de Pokémon..."
          : "Cargando datos locales...",
        {
          duration: Infinity,
        }
      );

      switch (source) {
        case "pokemon-api":
          response = await fetch("/api/pokemon");
          break;
        case "local":
          const { sampleData } = await import("@/app/data/sample-data");
          toast.dismiss(toastId);
          toast.success("Datos locales cargados", {
            description: `${sampleData.length} registros encontrados`,
          });
          onDataSourceSelected(source, sampleData);
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
      if (source === "pokemon-api") {
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
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='cursor-pointer hover:shadow-md transition-shadow'>
          <CardHeader>
            <CardTitle>Datos locales de Holded</CardTitle>
            <CardDescription>
              Utiliza datos de muestra de clientes de Holded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Usa datos predefinidos para probar la aplicación sin necesidad de
              credenciales.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className='w-full'
              onClick={() => handleSourceSelect("local")}
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

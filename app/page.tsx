"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonTable } from "./table/json-table";
import { DataSourceSelector } from "./components/data-source-selector";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type DataSource = "local" | "holded-api" | "pokemon-api" | null;

export default function JsonAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>(null);
  const [holdedApiKey, setHoldedApiKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Efecto para manejar el estado de carga de la tabla
  useEffect(() => {
    if (data.length > 0) {
      setIsTableLoading(true);
      const timer = setTimeout(() => {
        setIsTableLoading(false);
      }, 100); // Pequeño delay para asegurar que React tenga tiempo de procesar los datos
      return () => clearTimeout(timer);
    }
  }, [data]);

  // Función para manejar la selección de fuente de datos
  const handleDataSourceSelected = async (
    source: DataSource,
    initialData?: Record<string, unknown>[],
    apiKey?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setData([]); // Limpiar datos anteriores

      let newData: Record<string, unknown>[] = [];

      if (source === "holded-api" && apiKey) {
        setHoldedApiKey(apiKey);
        newData = await fetchHoldedData(apiKey);
      } else if (source === "pokemon-api") {
        newData = await fetchPokemonData();
      } else if (initialData) {
        newData = initialData;
        toast.success(
          `Datos locales cargados: ${initialData.length} registros`
        );
      }

      // Solo actualizar la fuente y los datos si todo fue exitoso
      if (newData && Array.isArray(newData)) {
        setDataSource(source);
        // Pequeño delay antes de establecer los datos para permitir que la UI se actualice
        setTimeout(() => {
          setData(newData);
        }, 100);
      } else {
        throw new Error("No se recibieron datos válidos");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(`Error al cargar datos: ${errorMessage}`);
      toast.error(`Error al cargar datos: ${errorMessage}`);
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener datos de Holded
  const fetchHoldedData = async (
    apiKey: string
  ): Promise<Record<string, unknown>[]> => {
    try {
      console.log("Obteniendo datos de Holded...");

      const response = await fetch("/api/holded-customers", {
        headers: {
          "X-Holded-Api-Key": apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener datos de Holded");
      }

      const holdedData = await response.json();

      if (!Array.isArray(holdedData)) {
        console.error("La respuesta de Holded no es un array:", holdedData);
        throw new Error(
          "Formato de respuesta inválido: se esperaba un array de clientes"
        );
      }

      if (holdedData.length === 0) {
        toast.warning("No se encontraron clientes en Holded");
      } else {
        toast.success(
          `Datos de Holded cargados: ${holdedData.length} clientes`
        );
      }

      return holdedData;
    } catch (error) {
      console.error("Error al obtener datos de Holded:", error);
      throw error;
    }
  };

  // Función para obtener datos de Pokémon
  const fetchPokemonData = async (): Promise<Record<string, unknown>[]> => {
    try {
      console.log("Obteniendo datos de Pokémon...");

      const response = await fetch("/api/pokemon");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener datos de Pokémon");
      }

      const pokemonData = await response.json();

      if (!Array.isArray(pokemonData)) {
        console.error("La respuesta de Pokémon no es un array:", pokemonData);
        throw new Error(
          "Formato de respuesta inválido: se esperaba un array de Pokémon"
        );
      }

      if (pokemonData.length === 0) {
        toast.warning("No se encontraron datos de Pokémon");
      } else {
        toast.success(
          `Datos de Pokémon cargados: ${pokemonData.length} registros`
        );
      }

      return pokemonData;
    } catch (error) {
      console.error("Error al obtener datos de Pokémon:", error);
      throw error;
    }
  };

  // Función para recargar datos según la fuente seleccionada
  const reloadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setData([]); // Limpiar datos anteriores

      let newData: Record<string, unknown>[] = [];

      if (dataSource === "holded-api") {
        newData = await fetchHoldedData(holdedApiKey);
      } else if (dataSource === "pokemon-api") {
        newData = await fetchPokemonData();
      } else if (dataSource === "local") {
        const { sampleData } = await import("./data/sample-data");
        newData = sampleData;
        toast.success(
          `Datos locales recargados: ${sampleData.length} registros`
        );
      }

      if (newData && Array.isArray(newData)) {
        // Pequeño delay antes de establecer los datos para permitir que la UI se actualice
        setTimeout(() => {
          setData(newData);
        }, 100);
      } else {
        throw new Error("No se recibieron datos válidos");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(`Error al recargar datos: ${errorMessage}`);
      toast.error(`Error al recargar datos: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el título según la fuente de datos
  const getDataSourceTitle = (source: DataSource): string => {
    switch (source) {
      case "local":
        return "Datos locales de Holded";
      case "holded-api":
        return holdedApiKey === "demo"
          ? "API de Holded (modo demo)"
          : "API de Holded";
      case "pokemon-api":
        return "API de Pokémon";
      default:
        return "JSON Analyzer";
    }
  };

  // Si no hay fuente de datos seleccionada, mostrar el selector
  if (!dataSource) {
    return (
      <DataSourceSelector onDataSourceSelected={handleDataSourceSelected} />
    );
  }

  return (
    <div className='py-10 px-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>
            JSON Analyzer - {getDataSourceTitle(dataSource)}
          </CardTitle>
          <div className='flex gap-2'>
            <Button onClick={reloadData} disabled={isLoading || isTableLoading}>
              {isLoading ? "Cargando..." : "Recargar datos"}
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                setDataSource(null);
                setData([]);
                setError(null);
              }}
              disabled={isLoading || isTableLoading}
            >
              Cambiar fuente
            </Button>
          </div>
        </CardHeader>

        {error && (
          <div className='px-6 pb-4'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {(isLoading || isTableLoading) && (
          <div className='p-6'>
            <div className='space-y-4'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-[90%]' />
              <Skeleton className='h-4 w-[80%]' />
              <Skeleton className='h-4 w-[70%]' />
            </div>
          </div>
        )}

        {!isLoading && !isTableLoading && (
          <JsonTable data={data} isLoading={isLoading || isTableLoading} />
        )}
      </Card>
    </div>
  );
}

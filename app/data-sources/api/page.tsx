"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ArrowLeft, ExternalLink, Database } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";

// Tipos de API disponibles
const apiOptions = [
  {
    id: "pokemon",
    name: "Pokémon API",
    description: "Datos de Pokémon de la API pública PokeAPI.",
    url: "https://pokeapi.co/",
    parameters: [
      {
        name: "limit",
        label: "Límite de Pokémon",
        type: "number",
        defaultValue: "50",
        placeholder: "50",
        description: "Número máximo de Pokémon a obtener.",
      },
    ],
  },
  {
    id: "rickandmorty",
    name: "Rick and Morty API",
    description: "Datos de personajes de la serie Rick and Morty.",
    url: "https://rickandmortyapi.com/",
    parameters: [
      {
        name: "page",
        label: "Página",
        type: "number",
        defaultValue: "1",
        placeholder: "1",
        description: "Número de página para la paginación.",
      },
    ],
  },
];

export default function ApiDataSourcePage() {
  const router = useRouter();
  const [selectedApiId, setSelectedApiId] = useState<string>("");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Obtener la configuración de la API seleccionada
  const selectedApi = apiOptions.find((api) => api.id === selectedApiId);

  // Manejar cambios en los parámetros
  const handleParameterChange = (name: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Inicializar parámetros cuando se selecciona una API
  const handleApiSelection = (apiId: string) => {
    setSelectedApiId(apiId);

    // Inicializar parámetros con valores predeterminados
    const api = apiOptions.find((a) => a.id === apiId);
    if (api) {
      const initialParams: Record<string, string> = {};
      api.parameters.forEach((param) => {
        initialParams[param.name] = param.defaultValue;
      });
      setParameters(initialParams);
    }
  };

  // Manejar la continuación al siguiente paso
  const handleContinue = () => {
    if (!selectedApiId) {
      toast.error("Selecciona una API para continuar");
      return;
    }

    setLoading(true);

    // Construir la URL con los parámetros
    const queryParams = new URLSearchParams();
    queryParams.append("source", `api-${selectedApiId}`);

    // Añadir parámetros específicos de la API
    Object.entries(parameters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    // Redireccionar a la página de tabla con los parámetros
    router.push(`/data-sources/table?${queryParams.toString()}`);
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
            <h1 className='text-3xl font-bold mb-2'>APIs Externas</h1>
            <p className='text-gray-500'>
              Selecciona una API externa para importar datos y visualizarlos en una tabla.
            </p>
          </div>

          <Card className='w-full max-w-2xl mx-auto'>
        <CardHeader>
          <div className='flex items-center space-x-4'>
            <div className='p-2 bg-primary/10 rounded-full'>
              <Database className='h-6 w-6 text-primary' />
            </div>
            <div>
              <CardTitle>Configurar API Externa</CardTitle>
              <CardDescription>
                Selecciona una API y configura los parámetros necesarios
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='api-select'>Selecciona una API</Label>
            <Select onValueChange={handleApiSelection} value={selectedApiId}>
              <SelectTrigger id='api-select'>
                <SelectValue placeholder='Selecciona una API' />
              </SelectTrigger>
              <SelectContent>
                {apiOptions.map((api) => (
                  <SelectItem key={api.id} value={api.id}>
                    {api.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedApi && (
            <>
              <div className='rounded-md bg-blue-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <ExternalLink
                      className='h-5 w-5 text-blue-400'
                      aria-hidden='true'
                    />
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-blue-800'>
                      {selectedApi.name}
                    </h3>
                    <div className='mt-2 text-sm text-blue-700'>
                      <p>{selectedApi.description}</p>
                      <p className='mt-1'>
                        <a
                          href={selectedApi.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          {selectedApi.url}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='text-sm font-medium'>Parámetros</h3>
                {selectedApi.parameters.map((param) => (
                  <div key={param.name} className='space-y-2'>
                    <Label htmlFor={param.name}>{param.label}</Label>
                    <Input
                      id={param.name}
                      type={param.type}
                      placeholder={param.placeholder}
                      value={parameters[param.name] || ""}
                      onChange={(e) =>
                        handleParameterChange(param.name, e.target.value)
                      }
                    />
                    {param.description && (
                      <p className='text-xs text-gray-500'>
                        {param.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className='flex justify-end'>
          <Button onClick={handleContinue} disabled={!selectedApiId || loading}>
            {loading ? "Cargando..." : "Continuar"}
          </Button>
        </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}

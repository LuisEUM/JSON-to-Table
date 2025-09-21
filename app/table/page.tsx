"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JsonTable } from "@/lib/table-system";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function TablePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = searchParams.get("source");
  const dataType = searchParams.get("dataType");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay fuente de datos, redirigir a la página de selección de fuentes
    if (!source) {
      router.push("/data-sources");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let endpoint = "";
        const headers: Record<string, string> = {};
        const params = new URLSearchParams();

        // Configurar el endpoint y los headers según la fuente de datos
        if (source.startsWith("api-")) {
          // Es una API externa
          const apiType = source.replace("api-", "");

          switch (apiType) {
            case "pokemon":
              endpoint = "/api/pokemon";
              const limit = searchParams.get("limit");
              if (limit) params.append("limit", limit);
              break;
            case "rickandmorty":
              endpoint = "/api/rickandmorty";
              const page = searchParams.get("page");
              if (page) params.append("page", page);
              break;
            default:
              throw new Error(`API no soportada: ${apiType}`);
          }
        } else {
          // Es una fuente de datos interna
          switch (source) {
            case "holded":
              // Verificar el tipo de datos de Holded seleccionado
              if (dataType) {
                endpoint = `/api/holded/${dataType}`;
              } else {
                // Si no hay tipo de datos específico, usar el endpoint predeterminado
                endpoint = "/api/holded/data";
              }

              // Si hay una API key almacenada, la usamos
              const holdedApiKey = localStorage.getItem("holded_api_key");
              if (holdedApiKey) {
                headers["X-Holded-Api-Key"] = holdedApiKey;
              }
              break;
            case "file":
              // Nueva fuente de datos unificada para archivos
              const fileType = searchParams.get("type");
              const fileId = searchParams.get("fileId");

              if (!fileType) {
                throw new Error("Tipo de archivo no especificado");
              }

              // Configurar endpoint y parámetros para obtener los datos del archivo
              endpoint = "/api/file-data";
              params.append("fileType", fileType);

              // Si tenemos un ID de archivo específico, lo usamos
              if (fileId) {
                params.append("fileId", fileId);
              }

              // Obtener los datos almacenados en localStorage como respaldo
              const fileDataStr = localStorage.getItem("fileUploadData");
              if (fileDataStr) {
                try {
                  const fileData = JSON.parse(fileDataStr);

                  // Si hay un sheet seleccionado (para Excel/ODS)
                  if (fileData.sheet) {
                    params.append("sheet", fileData.sheet);
                  }
                } catch {
                  // Si hay un error al leer localStorage, continuamos con los parámetros que ya tenemos
                  console.warn(
                    "Error al leer datos de localStorage para archivos"
                  );
                }
              }
              break;
            case "database":
              // Nueva fuente de datos para modelos de la base de datos
              const model = searchParams.get("model");
              const page = searchParams.get("page") || "1";
              const limit = searchParams.get("limit") || "50";
              const search = searchParams.get("search") || "";

              if (!model) {
                throw new Error("Modelo de base de datos no especificado");
              }

              // Configurar endpoint y parámetros
              endpoint = "/api/database/data";
              params.append("model", model);
              params.append("page", page);
              params.append("limit", limit);

              if (search) {
                params.append("search", search);
              }
              break;
            default:
              throw new Error(`Fuente de datos no soportada: ${source}`);
          }
        }

        // Añadir parámetros a la URL si existen
        const queryString = params.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        const response = await fetch(url, { headers });

        if (!response.ok) {
          const errorData = await response.json();
          // Mensaje de error personalizado según la fuente
          if (source === "file") {
            if (response.status === 404) {
              throw new Error(
                "Archivo no encontrado. Por favor, vuelva a cargar el archivo."
              );
            } else {
              throw new Error(
                errorData.error || "Error al cargar los datos del archivo"
              );
            }
          } else {
            throw new Error(errorData.error || "Error al cargar los datos");
          }
        }

        const jsonData = await response.json();

        // Manejar diferentes formatos de respuesta según la fuente de datos
        if (source.startsWith("api-")) {
          if (source === "api-rickandmorty") {
            setData(jsonData.data || []);
          } else {
            // Para Pokemon y otras APIs que devuelven directamente un array
            setData(jsonData || []);
          }
        } else if (source === "file") {
          // Para la fuente de datos unificada de archivos
          if (jsonData.data) {
            setData(jsonData.data);
          } else {
            setError("No se pudieron cargar los datos del archivo");
          }
        } else {
          // Para fuentes de datos internas que devuelven { data: [] }
          setData(jsonData.data || []);
        }
      } catch (err) {
        console.error("Error al cargar los datos:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");

        // Toast personalizado según la fuente
        if (source === "file") {
          toast.error("Error al cargar los datos del archivo", {
            description:
              err instanceof Error ? err.message : "Error desconocido",
            action: {
              label: "Cargar nuevo archivo",
              onClick: () => router.push("/data-sources/file"),
            },
          });
        } else {
          toast.error("Error al cargar los datos", {
            description:
              err instanceof Error ? err.message : "Error desconocido",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [source, dataType, searchParams, router]);

  const getSourceTitle = () => {
    if (source?.startsWith("api-")) {
      const apiType = source.replace("api-", "");
      switch (apiType) {
        case "pokemon":
          return "Datos de Pokémon";
        case "rickandmorty":
          return "Personajes de Rick and Morty";
        default:
          return "Datos de API";
      }
    } else if (source === "holded" && dataType) {
      switch (dataType) {
        case "contacts":
          return "Contactos de Holded";
        case "funnels":
          return "Embudos de Holded";
        case "leads":
          return "Leads de Holded";
        default:
          return "Datos de Holded";
      }
    } else if (source === "file") {
      const fileType = searchParams.get("type");
      const sheet = searchParams.get("sheet");

      switch (fileType) {
        case "json":
          return "Datos del archivo JSON";
        case "csv":
          return "Datos del archivo CSV";
        case "xlsx":
          return sheet
            ? `Datos del archivo Excel - Hoja: ${sheet}`
            : "Datos del archivo Excel";
        case "ods":
          return sheet
            ? `Datos del archivo ODS - Hoja: ${sheet}`
            : "Datos del archivo ODS";
        default:
          return "Datos del archivo";
      }
    } else if (source === "database") {
      const model = searchParams.get("model");

      switch (model) {
        case "user":
          return "Datos de Usuarios";
        case "account":
          return "Datos de Cuentas";
        case "session":
          return "Datos de Sesiones";
        case "view":
          return "Datos de Vistas";
        default:
          return "Datos de Base de Datos";
      }
    } else {
      switch (source) {
        case "holded":
          return "Datos de Holded";
        case "file":
          return "Datos del archivo JSON";
        default:
          return "Datos";
      }
    }
  };

  const getSourceDescription = () => {
    if (source?.startsWith("api-")) {
      return `Datos importados desde la API de ${source.replace("api-", "")}`;
    } else if (source === "holded" && dataType) {
      return `Datos de ${dataType} importados desde Holded`;
    } else if (source === "file") {
      const fileType = searchParams.get("type");
      const sheet = searchParams.get("sheet");
      let description = `Datos importados desde archivo`;

      if (fileType) {
        switch (fileType) {
          case "json":
            description += " JSON";
            break;
          case "csv":
            description += " CSV";
            break;
          case "xlsx":
            description += " Excel";
            break;
          case "ods":
            description += " ODS";
            break;
        }
      }

      if (sheet) {
        description += `, hoja: ${sheet}`;
      }

      return description;
    } else if (source === "database") {
      const model = searchParams.get("model");

      switch (model) {
        case "user":
          return "Datos de usuarios de la base de datos MongoDB";
        case "account":
          return "Datos de cuentas de autenticación de la base de datos MongoDB";
        case "session":
          return "Datos de sesiones activas de la base de datos MongoDB";
        case "view":
          return "Datos de vistas guardadas de la base de datos MongoDB";
        default:
          return "Datos importados desde la base de datos MongoDB";
      }
    } else {
      return `Datos importados desde ${source}`;
    }
  };

  return (
    <div className='container mx-auto py-6'>
      <Button
        variant='outline'
        className='mb-4'
        onClick={() => router.push("/data-sources")}
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Volver a fuentes de datos
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{getSourceTitle()}</CardTitle>
          <CardDescription>{getSourceDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
          ) : error ? (
            <div className='text-center p-6 text-destructive'>
              <p className='text-lg font-semibold mb-2'>Error</p>
              <p>{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className='text-center p-6 text-muted-foreground'>
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            <JsonTable data={data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TablePage() {
  return (
    <Suspense
      fallback={
        <div className='container mx-auto py-6'>
          <Card>
            <CardContent className='flex justify-center items-center h-64'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <TablePageContent />
    </Suspense>
  );
}

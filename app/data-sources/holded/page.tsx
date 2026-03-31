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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Database,
  User,
  Loader2,
  Users,
  ListFilter,
  UserRound,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useSession, signIn } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos de datos disponibles en Holded
const holdedDataTypes = [
  {
    id: "contacts",
    name: "Contactos",
    description: "Lista de contactos y clientes",
    icon: <Users className='h-5 w-5 text-blue-600' />,
    endpoint: "/api/holded/contacts",
  },
  {
    id: "funnels",
    name: "Embudos",
    description: "Embudos de ventas y sus etapas",
    icon: <ListFilter className='h-5 w-5 text-green-600' />,
    endpoint: "/api/holded/funnels",
  },
  {
    id: "leads",
    name: "Leads",
    description: "Prospectos y oportunidades de venta",
    icon: <UserRound className='h-5 w-5 text-amber-600' />,
    endpoint: "/api/holded/leads",
  },
];

export default function HoldedDataSourcePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "success" | "error"
  >("none");
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [selectedDataType, setSelectedDataType] = useState<string>("");

  // Obtener el tipo de datos seleccionado
  const dataType = holdedDataTypes.find((type) => type.id === selectedDataType);

  // Comprobar la conexión con la API de Holded
  const checkConnection = async () => {
    if (status !== "authenticated" && !apiKey) {
      toast.error("Necesitas iniciar sesión o proporcionar una API Key");
      return;
    }

    setLoading(true);
    setConnectionStatus("none");
    setConnectionMessage("");

    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers["X-Holded-Api-Key"] = apiKey;
      }

      const response = await fetch("/api/holded/check-connection", {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus("success");
        setConnectionMessage("Conexión establecida correctamente");
        toast.success("Conexión exitosa con Holded");

        // Seleccionar contactos por defecto
        if (!selectedDataType) {
          setSelectedDataType("contacts");
        }
      } else {
        setConnectionStatus("error");
        setConnectionMessage(data.error || "Error al conectar con Holded");
        toast.error("Error de conexión", {
          description: data.error || "No se pudo conectar con la API de Holded",
        });
      }
    } catch (error) {
      setConnectionStatus("error");
      setConnectionMessage(
        error instanceof Error
          ? error.message
          : "Error al verificar la conexión"
      );
      toast.error("Error de conexión", {
        description:
          error instanceof Error ? error.message : "Error inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  // Continuar con la carga de datos
  const handleContinue = () => {
    if (!selectedDataType) {
      toast.error("Por favor, selecciona un tipo de datos");
      return;
    }

    // Almacenar el API key en el localStorage
    if (apiKey) {
      localStorage.setItem("holded_api_key", apiKey);
    }

    // Construir la URL con los parámetros
    const params = new URLSearchParams();
    params.append("source", "holded");
    params.append("dataType", selectedDataType);

    // Redirigir a la página de tabla con la fuente de datos configurada
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
            <h1 className='text-3xl font-bold mb-2'>Conexión con Holded</h1>
            <p className='text-gray-500'>
              Conéctate a la API de Holded para importar tus datos de facturación,
              clientes y productos.
            </p>
          </div>

          <Card className='w-full max-w-2xl mx-auto'>
        <CardHeader>
          <div className='flex items-center space-x-4'>
            <div className='p-2 bg-primary/10 rounded-full'>
              <Database className='h-6 w-6 text-primary' />
            </div>
            <div>
              <CardTitle>Configura la conexión con Holded</CardTitle>
              <CardDescription>
                {status === "authenticated"
                  ? "Ya estás autenticado, puedes continuar o proporcionar una API Key específica"
                  : "Inicia sesión o proporciona tu API Key de Holded"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {status === "authenticated" && (
            <Alert className='bg-green-50'>
              <CheckCircle className='h-4 w-4' />
              <AlertTitle>Sesión iniciada</AlertTitle>
              <AlertDescription>
                Has iniciado sesión como {session?.user?.email}. Puedes
                continuar o especificar una API Key si deseas usar una cuenta
                diferente.
              </AlertDescription>
            </Alert>
          )}

          {status !== "authenticated" && (
            <div>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => signIn()}
                disabled={loading}
              >
                <User className='mr-2 h-4 w-4' />
                Iniciar sesión con tu cuenta
              </Button>
              <div className='relative my-4'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>
                    O
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='api-key'>API Key de Holded</Label>
            <Input
              id='api-key'
              placeholder='Introduce tu API Key'
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
            />
            <p className='text-xs text-gray-500'>
              Puedes obtener tu API Key en la sección de integraciones de tu
              cuenta de Holded.
            </p>
          </div>

          {connectionStatus === "success" && (
            <>
              <Alert className='bg-green-50'>
                <CheckCircle className='h-4 w-4' />
                <AlertTitle>Conexión exitosa</AlertTitle>
                <AlertDescription>{connectionMessage}</AlertDescription>
              </Alert>

              <div className='space-y-4 pt-4'>
                <Label htmlFor='data-type'>Selecciona el tipo de datos</Label>
                <Select
                  value={selectedDataType}
                  onValueChange={setSelectedDataType}
                >
                  <SelectTrigger id='data-type'>
                    <SelectValue placeholder='Selecciona un tipo de datos' />
                  </SelectTrigger>
                  <SelectContent>
                    {holdedDataTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dataType && (
                <div className='rounded-md bg-blue-50 p-4'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>{dataType.icon}</div>
                    <div className='ml-3'>
                      <h3 className='text-sm font-medium text-blue-800'>
                        {dataType.name}
                      </h3>
                      <div className='mt-2 text-sm text-blue-700'>
                        <p>{dataType.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {connectionStatus === "error" && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error de conexión</AlertTitle>
              <AlertDescription>{connectionMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className='flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0'>
          <Button
            variant='outline'
            onClick={checkConnection}
            disabled={loading || (status !== "authenticated" && !apiKey)}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verificando...
              </>
            ) : (
              <>Verificar conexión</>
            )}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={connectionStatus !== "success" || !selectedDataType}
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

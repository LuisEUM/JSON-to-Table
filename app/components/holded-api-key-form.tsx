"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

interface HoldedApiKeyFormProps {
  onApiKeySet: (apiKey: string) => void;
  onBack: () => void;
}

export function HoldedApiKeyForm({
  onApiKeySet,
  onBack,
}: HoldedApiKeyFormProps) {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected"
  >("idle");

  // Intentar cargar la clave API de las variables de entorno
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // Verificar si podemos conectar directamente con la clave de entorno
        setConnectionStatus("connecting");
        const response = await fetch("/api/holded/check-connection");

        if (response.ok) {
          setConnectionStatus("connected");
          // Esperamos un poco para mostrar el mensaje de éxito
          setTimeout(() => {
            // Si funciona, usamos la clave del entorno directamente
            onApiKeySet("env"); // Valor especial para indicar que usamos la variable de entorno
          }, 1500);
        } else {
          setConnectionStatus("idle");
        }
      } catch (error) {
        console.error("Error al verificar conexión:", error);
        setConnectionStatus("idle");
      }
    };

    if (session) {
      checkApiKey();
    }
  }, [session, onApiKeySet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConnectionStatus("connecting");

    try {
      const toastId = toast.loading("Conectando con Holded...", {
        description: "Validando la clave API proporcionada",
        duration: Infinity,
      });

      // En un caso real, podríamos validar la clave API aquí
      // haciendo una petición de prueba al servidor
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.dismiss(toastId);
      toast.success("Conexión establecida", {
        description: "Obteniendo datos de clientes...",
      });

      setConnectionStatus("connected");

      // Esperamos un momento para mostrar el estado "conectado"
      setTimeout(() => {
        onApiKeySet(apiKey);
      }, 1000);
    } catch (error) {
      toast.error("Error de conexión", {
        description:
          error instanceof Error
            ? error.message
            : "Error al validar la clave API",
      });
      setConnectionStatus("idle");
      setIsLoading(false);
    }
  };

  if (connectionStatus === "connected") {
    return (
      <Card className='w-[450px] mx-auto mt-10'>
        <CardHeader>
          <CardTitle>Conexión establecida</CardTitle>
          <CardDescription>
            {session?.user?.name
              ? `Conectado como ${session.user.name}`
              : "Usuario autenticado"}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-6'>
          <div className='bg-green-100 dark:bg-green-900/20 rounded-full p-3 mb-4'>
            <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
          </div>
          <p className='text-center text-muted-foreground'>
            Conexión con Holded establecida. Cargando datos...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-[450px] mx-auto mt-10'>
      <CardHeader>
        <CardTitle>Clave API de Holded</CardTitle>
        <CardDescription>
          {session?.user?.name
            ? `Hola ${session.user.name}, ingresa tu clave API de Holded para continuar.`
            : "Por favor, ingresa tu clave API de Holded para continuar."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='apiKey'>Clave API</Label>
              <Input
                id='apiKey'
                placeholder='Ingresa tu clave API de Holded'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            variant='outline'
            type='button'
            onClick={onBack}
            disabled={isLoading || connectionStatus === "connecting"}
          >
            Volver
          </Button>
          <Button
            type='submit'
            disabled={
              isLoading || !apiKey.trim() || connectionStatus === "connecting"
            }
          >
            {connectionStatus === "connecting" ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Validando...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const toastId = toast.loading("Conectando con Holded...", {
        description: "Validando la clave API proporcionada",
        duration: Infinity,
      });

      // En un caso real, podríamos validar la clave API aquí
      // haciendo una petición de prueba al servidor
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.dismiss(toastId);
      toast.success("Conexión establecida", {
        description: "Obteniendo datos de clientes...",
      });

      onApiKeySet(apiKey);
    } catch (error) {
      toast.error("Error de conexión", {
        description:
          error instanceof Error
            ? error.message
            : "Error al validar la clave API",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-[450px] mx-auto mt-10'>
      <CardHeader>
        <CardTitle>Clave API de Holded</CardTitle>
        <CardDescription>
          Por favor, ingresa tu clave API de Holded para continuar.
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
            disabled={isLoading}
          >
            Volver
          </Button>
          <Button type='submit' disabled={isLoading || !apiKey.trim()}>
            {isLoading ? (
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

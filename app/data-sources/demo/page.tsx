"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/ui/card";
import { ArrowLeft, TableProperties, Network, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_OPTIONS = [
  {
    id: "simple",
    name: "Tabla Simple",
    description:
      "25 contactos de salones de belleza con datos planos. Ideal para explorar filtros de texto, número, fecha y booleano.",
    records: 25,
    icon: TableProperties,
    fields: ["Nombre", "Email", "Ciudad", "Rol", "Estado", "Fecha", "Valor", "Satisfacción", "Activo"],
    accent: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    id: "complex",
    name: "Tabla Compleja",
    description:
      "15 salones con datos anidados: empleados, servicios, membresías, métricas y objetos nested. Perfecto para explorar todo el potencial de la tabla.",
    records: 15,
    icon: Network,
    fields: ["Nombre", "Dirección (objeto)", "Empleados (array)", "Servicios (array)", "Membresías (array)", "Métricas (objeto)", "URLs", "Fechas"],
    accent: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
];

export default function DemoDataSourcePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("");

  const handleContinue = () => {
    if (!selectedId) return;
    router.push(`/data-sources/table?source=demo&type=${selectedId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="container mx-auto py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push("/data-sources")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a fuentes de datos
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Datos de Demostración</h1>
            <p className="text-gray-500">
              Explora las capacidades de la tabla con datos de ejemplo listos para usar, sin ninguna configuración.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {DEMO_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedId === option.id;

              return (
                <Card
                  key={option.id}
                  className={cn(
                    "cursor-pointer border-2 transition-all",
                    isSelected
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-muted-foreground/30 hover:shadow-sm"
                  )}
                  onClick={() => setSelectedId(option.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", option.iconBg)}>
                          <Icon className={cn("h-6 w-6", option.iconColor)} />
                        </div>
                        <CardTitle>{option.name}</CardTitle>
                      </div>
                      {isSelected && (
                        <div className="p-1 bg-primary rounded-full">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {option.description}
                    </CardDescription>

                    <div className={cn("rounded-md border p-3", option.accent)}>
                      <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                        {option.records} registros · Campos incluidos
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {option.fields.map((field) => (
                          <span
                            key={field}
                            className="text-xs bg-background border rounded px-2 py-0.5"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedId}
            >
              Ver tabla →
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

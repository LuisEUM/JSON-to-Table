"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

// Interface para describir una fase
interface PhaseDescription {
  name: string;
  color: string;
  description: string;
  icon: React.ReactNode;
}

// Props del componente
interface PhaseLegendProps {
  title?: string;
}

// Componente para mostrar la leyenda de fases
export function PhaseLegend({
  title = "Fases del Ciclo de Vida",
}: PhaseLegendProps) {
  // Definición de las fases generales
  const phases: PhaseDescription[] = [
    {
      name: "Fase de Inicio",
      color: "#2563eb", // Azul
      description:
        "Representa el comienzo del ciclo de vida. Incluye clientes nuevos, procesos de onboarding, servicios programados y formaciones pendientes. Requiere especial seguimiento para garantizar una correcta adopción.",
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='w-4 h-4'
        >
          <circle cx='12' cy='12' r='10'></circle>
          <polyline points='12 6 12 12 16 14'></polyline>
        </svg>
      ),
    },
    {
      name: "Fase de Desarrollo",
      color: "#4ade80", // Verde
      description:
        "Representa la etapa de uso activo y crecimiento. Incluye clientes leales, formaciones en progreso, servicios en ejecución y clientes con posibilidad de renovación. El objetivo es maximizar el valor y preparar para la siguiente fase.",
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='w-4 h-4'
        >
          <polyline points='23 6 13.5 15.5 8.5 10.5 1 18'></polyline>
          <polyline points='17 6 23 6 23 12'></polyline>
        </svg>
      ),
    },
    {
      name: "Fase de Cierre",
      color: "#8b5cf6", // Morado
      description:
        "Representa la conclusión del ciclo. Incluye clientes de larga duración, formaciones completadas, servicios entregados y clientes inactivos. Es crucial para evaluar resultados, obtener retroalimentación y planificar futuras acciones.",
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='w-4 h-4'
        >
          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path>
          <polyline points='22 4 12 14.01 9 11.01'></polyline>
        </svg>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <Card className='p-4 mb-4 shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <h3 className='font-medium text-lg'>{title}</h3>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Info size={16} className='text-muted-foreground cursor-help' />
            </TooltipTrigger>
            <TooltipContent className='max-w-xs'>
              <p>
                Información sobre las diferentes fases del ciclo de vida que se
                utilizan para clasificar los estados de clientes, antigüedad,
                formaciones y servicios.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {phases.map((phase) => (
            <div
              key={phase.name}
              className='flex flex-col p-3 border rounded-lg'
            >
              <div className='flex items-center gap-2 mb-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{ backgroundColor: phase.color }}
                />
                <span className='font-medium'>{phase.name}</span>
                <div className='text-muted-foreground ml-auto'>
                  {phase.icon}
                </div>
              </div>
              <p className='text-sm text-muted-foreground'>
                {phase.description}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </TooltipProvider>
  );
}

export default PhaseLegend;

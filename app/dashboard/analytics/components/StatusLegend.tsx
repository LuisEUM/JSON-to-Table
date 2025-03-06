"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

export interface StatusDescription {
  name: string;
  color: string;
  description: string;
  phase?: "inicio" | "desarrollo" | "cierre";
}

export interface StatusLegendProps {
  statusDescriptions: StatusDescription[];
  tenureDescriptions: StatusDescription[];
  trainingDescriptions: StatusDescription[];
  serviceDescriptions: StatusDescription[];
  membershipDescriptions: StatusDescription[];
  consultingDescriptions: StatusDescription[];
}

function groupByPhase(items: StatusDescription[]) {
  const phaseGroups = {
    inicio: items.filter((item) => item.phase === "inicio"),
    desarrollo: items.filter((item) => item.phase === "desarrollo"),
    cierre: items.filter((item) => item.phase === "cierre"),
    other: items.filter((item) => !item.phase),
  };

  return phaseGroups;
}

function PhaseGroup({
  title,
  items,
}: {
  title: string;
  items: StatusDescription[];
}) {
  if (items.length === 0) return null;

  return (
    <div className='mb-4'>
      <h4 className='text-sm font-medium mb-2 text-muted-foreground'>
        {title}
      </h4>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
        {items.map((item) => (
          <div key={item.name} className='flex items-center gap-2'>
            <div
              className='w-4 h-4 rounded-full'
              style={{ backgroundColor: item.color }}
            />
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className='text-sm cursor-help flex items-center gap-1'>
                  {item.name}
                  <Info size={12} className='text-muted-foreground' />
                </div>
              </TooltipTrigger>
              <TooltipContent className='max-w-xs'>
                <p>{item.description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusLegend({
  statusDescriptions,
  tenureDescriptions,
  trainingDescriptions,
  serviceDescriptions,
  membershipDescriptions,
  consultingDescriptions,
}: StatusLegendProps) {
  const statusWithPhases = statusDescriptions.map((status) => {
    if (status.phase) return status;

    if (["Activos", "Próximos a activar"].includes(status.name)) {
      return { ...status, phase: "inicio" as const };
    } else if (["Próximos a inactivar"].includes(status.name)) {
      return { ...status, phase: "desarrollo" as const };
    } else if (
      [
        "Desactivados",
        "Inactivos satisfechos",
        "Inactivos insatisfechos",
      ].includes(status.name)
    ) {
      return { ...status, phase: "cierre" as const };
    }
    return { ...status, phase: "desarrollo" as const };
  });

  const tenureWithPhases = tenureDescriptions.map((tenure) => {
    if (tenure.phase) return tenure;

    if (["Nuevos"].includes(tenure.name)) {
      return { ...tenure, phase: "inicio" as const, color: "#38bdf8" };
    } else if (["En Onboarding"].includes(tenure.name)) {
      return { ...tenure, phase: "inicio" as const, color: "#2563eb" };
    } else if (["Leales"].includes(tenure.name)) {
      return { ...tenure, phase: "desarrollo" as const, color: "#4ade80" };
    } else if (["Leyendas"].includes(tenure.name)) {
      return { ...tenure, phase: "cierre" as const, color: "#8b5cf6" };
    }
    return { ...tenure, phase: "desarrollo" as const };
  });

  const trainingWithPhases = trainingDescriptions.map((training) => {
    if (training.phase) return training;

    if (["Pendientes"].includes(training.name)) {
      return { ...training, phase: "inicio" as const, color: "#f97316" };
    } else if (
      ["En Progreso", "Próximas a finalizar"].includes(training.name)
    ) {
      return {
        ...training,
        phase: "desarrollo" as const,
        color: training.name === "En Progreso" ? "#60a5fa" : "#eab308",
      };
    } else if (
      ["Completadas con certificado", "Completadas sin certificado"].includes(
        training.name
      )
    ) {
      return {
        ...training,
        phase: "cierre" as const,
        color:
          training.name === "Completadas con certificado"
            ? "#4ade80"
            : training.name === "Completadas sin certificado"
            ? "#a3e635"
            : "#8b5cf6",
      };
    }
    return { ...training, phase: "desarrollo" as const };
  });

  const serviceWithPhases = serviceDescriptions.map((service) => {
    if (service.phase) return service;

    if (["Programado"].includes(service.name)) {
      return { ...service, phase: "inicio" as const, color: "#f97316" };
    } else if (["En proceso"].includes(service.name)) {
      return { ...service, phase: "desarrollo" as const, color: "#60a5fa" };
    } else if (
      ["Entregado exitosamente", "No se pudo entregar"].includes(service.name)
    ) {
      return {
        ...service,
        phase: "cierre" as const,
        color:
          service.name === "Entregado exitosamente" ? "#4ade80" : "#ef4444",
      };
    }
    return { ...service, phase: "desarrollo" as const };
  });

  const membershipWithPhases = membershipDescriptions.map((membership) => {
    if (membership.phase) return membership;

    if (["Pendientes por iniciar"].includes(membership.name)) {
      return { ...membership, phase: "inicio" as const, color: "#2563eb" };
    } else if (["Activas", "Próximas a inactivar"].includes(membership.name)) {
      return {
        ...membership,
        phase: "desarrollo" as const,
        color: membership.name === "Activas" ? "#4ade80" : "#eab308",
      };
    } else if (
      [
        "Inactivas",
        "Inactivas por satisfacción",
        "Inactivas por insatisfacción",
      ].includes(membership.name)
    ) {
      return {
        ...membership,
        phase: "cierre" as const,
        color:
          membership.name === "Inactivas"
            ? "#ef4444"
            : membership.name === "Inactivas por satisfacción"
            ? "#06b6d4"
            : "#d946ef",
      };
    }
    return { ...membership, phase: "desarrollo" as const };
  });

  const consultingWithPhases = consultingDescriptions.map((consulting) => {
    if (consulting.phase) return consulting;

    if (["Pendientes"].includes(consulting.name)) {
      return { ...consulting, phase: "inicio" as const, color: "#f97316" };
    } else if (
      ["En Progreso", "Próximas a finalizar"].includes(consulting.name)
    ) {
      return {
        ...consulting,
        phase: "desarrollo" as const,
        color: consulting.name === "En Progreso" ? "#60a5fa" : "#eab308",
      };
    } else if (
      ["Completadas con certificado", "Completadas sin certificado"].includes(
        consulting.name
      )
    ) {
      return {
        ...consulting,
        phase: "cierre" as const,
        color:
          consulting.name === "Completadas con certificado"
            ? "#4ade80"
            : consulting.name === "Completadas sin certificado"
            ? "#a3e635"
            : "#8b5cf6",
      };
    }
    return { ...consulting, phase: "desarrollo" as const };
  });

  const statusGroups = groupByPhase(statusWithPhases);
  const tenureGroups = groupByPhase(tenureWithPhases);
  const trainingGroups = groupByPhase(trainingWithPhases);
  const serviceGroups = groupByPhase(serviceWithPhases);
  const membershipGroups = groupByPhase(membershipWithPhases);
  const consultingGroups = groupByPhase(consultingWithPhases);

  return (
    <TooltipProvider>
      <Card className='p-4 mb-4 shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <h3 className='font-medium text-lg'>
            Estados y Categorías de Contactos
          </h3>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Info size={16} className='text-muted-foreground cursor-help' />
            </TooltipTrigger>
            <TooltipContent className='max-w-xs'>
              <p>
                Información sobre los diferentes estados operativos,
                segmentación por antigüedad, estado de formaciones y servicios
                de los contactos. Cada categoría se organiza por fases: Inicio,
                Desarrollo y Cierre del ciclo de vida.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tabs defaultValue='estados'>
          <TabsList className='mb-4'>
            <TabsTrigger value='estados'>Estados Operativos</TabsTrigger>
            <TabsTrigger value='membresias'>Membresía</TabsTrigger>
            <TabsTrigger value='formacion'>Formación</TabsTrigger>
            <TabsTrigger value='servicios'>Servicio</TabsTrigger>
            <TabsTrigger value='antiguedad'>Antigüedad</TabsTrigger>
            <TabsTrigger value='consultoria'>Consultoría</TabsTrigger>
          </TabsList>

          <TabsContent value='estados'>
            <PhaseGroup title='Fase de Inicio' items={statusGroups.inicio} />
            <PhaseGroup
              title='Fase de Ejecución'
              items={statusGroups.desarrollo}
            />
            <PhaseGroup title='Fase de Cierre' items={statusGroups.cierre} />
            {statusGroups.other.length > 0 && (
              <PhaseGroup title='Otros Estados' items={statusGroups.other} />
            )}
            <div className='mt-4 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground'>
              <p className='flex items-center gap-2'>
                <Info size={14} />
                <strong>Nota:</strong> Los clientes con inactivos
                (independientemente de su estado de inactividad) mantendrán
                acceso a sus formaciones hasta un año después de la culminación
                de las mismas.
              </p>
            </div>
          </TabsContent>

          <TabsContent value='membresias'>
            <PhaseGroup
              title='Fase de Inicio'
              items={membershipGroups.inicio}
            />
            <PhaseGroup
              title='Fase de Ejecución'
              items={membershipGroups.desarrollo}
            />
            <PhaseGroup
              title='Fase de Cierre'
              items={membershipGroups.cierre}
            />
            {membershipGroups.other.length > 0 && (
              <PhaseGroup
                title='Otros Estados'
                items={membershipGroups.other}
              />
            )}
          </TabsContent>

          <TabsContent value='antiguedad'>
            <PhaseGroup title='Fase de Adopción' items={tenureGroups.inicio} />
            <PhaseGroup
              title='Fase de Consolidación'
              items={tenureGroups.desarrollo}
            />
            <PhaseGroup title='Fase de Madurez' items={tenureGroups.cierre} />
            {tenureGroups.other.length > 0 && (
              <PhaseGroup title='Otros Segmentos' items={tenureGroups.other} />
            )}
          </TabsContent>

          <TabsContent value='formacion'>
            <PhaseGroup title='Fase de Inicio' items={trainingGroups.inicio} />
            <PhaseGroup
              title='Fase de Ejecución'
              items={trainingGroups.desarrollo}
            />
            <PhaseGroup title='Fase de Cierre' items={trainingGroups.cierre} />
            {trainingGroups.other.length > 0 && (
              <PhaseGroup title='Otros Estados' items={trainingGroups.other} />
            )}
            <div className='mt-4 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground'>
              <p className='flex items-center gap-2'>
                <Info size={14} />
                <strong>Nota:</strong> Los clientes con inactivos
                (independientemente de su estado de inactividad) mantendrán
                acceso a sus formaciones hasta un año después de la culminación
                de las mismas.
              </p>
            </div>
          </TabsContent>

          <TabsContent value='servicios'>
            <PhaseGroup
              title='Fase de Programación'
              items={serviceGroups.inicio}
            />
            <PhaseGroup
              title='Fase de Ejecución'
              items={serviceGroups.desarrollo}
            />
            <PhaseGroup title='Fase de Cierre' items={serviceGroups.cierre} />
            {serviceGroups.other.length > 0 && (
              <PhaseGroup title='Otros Estados' items={serviceGroups.other} />
            )}
          </TabsContent>

          <TabsContent value='consultoria'>
            <PhaseGroup
              title='Fase de Inicio'
              items={consultingGroups.inicio}
            />
            <PhaseGroup
              title='Fase de Ejecución'
              items={consultingGroups.desarrollo}
            />
            <PhaseGroup
              title='Fase de Cierre'
              items={consultingGroups.cierre}
            />
            {consultingGroups.other.length > 0 && (
              <PhaseGroup
                title='Otros Estados'
                items={consultingGroups.other}
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </TooltipProvider>
  );
}

export default StatusLegend;

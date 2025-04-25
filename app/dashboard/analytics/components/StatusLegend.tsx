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
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 text-muted-foreground">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="text-sm cursor-help flex items-center gap-1">
                  {item.name}
                  <Info size={12} className="text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
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
  // Unificar todas las referencias a "Desactivado" como "Incidencia"
  const unifyStatus = (items: StatusDescription[]) => {
    return items.map((item) => {
      if (item.name === "Desactivado" || item.name === "Desactivados") {
        return { ...item, name: "Incidencia", color: "#ef4444" };
      }
      return item;
    });
  };

  // Aplicar la unificación a todas las listas de estados
  const unifiedStatusDescriptions = unifyStatus(statusDescriptions);
  const unifiedTrainingDescriptions = unifyStatus(trainingDescriptions);
  const unifiedServiceDescriptions = unifyStatus(serviceDescriptions);
  const unifiedMembershipDescriptions = unifyStatus(membershipDescriptions);
  const unifiedConsultingDescriptions = unifyStatus(consultingDescriptions);

  const statusWithPhases = unifiedStatusDescriptions.map((status) => {
    if (status.phase) return status;

    if (["Activos", "Próximos a activar"].includes(status.name)) {
      return { ...status, phase: "inicio" as const };
    } else if (["Próximos a inactivar"].includes(status.name)) {
      return { ...status, phase: "desarrollo" as const };
    } else if (
      [
        "Incidencia",
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

  const trainingWithPhases = unifiedTrainingDescriptions.map((training) => {
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
      [
        "Completadas con certificado",
        "Completadas sin certificado",
        "Incidencia",
      ].includes(training.name)
    ) {
      return {
        ...training,
        phase: "cierre" as const,
        color:
          training.name === "Completadas con certificado"
            ? "#4ade80"
            : training.name === "Completadas sin certificado"
            ? "#a3e635"
            : "#ef4444",
      };
    }
    return { ...training, phase: "desarrollo" as const };
  });

  const serviceWithPhases = unifiedServiceDescriptions.map((service) => {
    if (service.phase) return service;

    if (["Programado"].includes(service.name)) {
      return { ...service, phase: "inicio" as const, color: "#f97316" };
    } else if (["En proceso"].includes(service.name)) {
      return { ...service, phase: "desarrollo" as const, color: "#60a5fa" };
    } else if (
      ["Entregado exitosamente", "No se pudo entregar", "Incidencia"].includes(
        service.name
      )
    ) {
      return {
        ...service,
        phase: "cierre" as const,
        color:
          service.name === "Entregado exitosamente"
            ? "#4ade80"
            : service.name === "Incidencia"
            ? "#ef4444"
            : "#ef4444",
      };
    }
    return { ...service, phase: "desarrollo" as const };
  });

  const membershipWithPhases = unifiedMembershipDescriptions.map(
    (membership) => {
      if (membership.phase) return membership;

      if (["Pendientes por iniciar"].includes(membership.name)) {
        return { ...membership, phase: "inicio" as const, color: "#2563eb" };
      } else if (
        ["Activas", "Próximas a inactivar"].includes(membership.name)
      ) {
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
          "Incidencia",
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
              : membership.name === "Incidencia"
              ? "#ef4444"
              : "#d946ef",
        };
      }
      return { ...membership, phase: "desarrollo" as const };
    }
  );

  const consultingWithPhases = unifiedConsultingDescriptions.map(
    (consulting) => {
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
        [
          "Completadas con certificado",
          "Completadas sin certificado",
          "Incidencia",
        ].includes(consulting.name)
      ) {
        return {
          ...consulting,
          phase: "cierre" as const,
          color:
            consulting.name === "Completadas con certificado"
              ? "#4ade80"
              : consulting.name === "Completadas sin certificado"
              ? "#a3e635"
              : "#ef4444",
        };
      }
      return { ...consulting, phase: "desarrollo" as const };
    }
  );

  const statusGroups = groupByPhase(statusWithPhases);
  const tenureGroups = groupByPhase(tenureWithPhases);
  const trainingGroups = groupByPhase(trainingWithPhases);
  const serviceGroups = groupByPhase(serviceWithPhases);
  const membershipGroups = groupByPhase(membershipWithPhases);
  const consultingGroups = groupByPhase(consultingWithPhases);

  return (
    <TooltipProvider>
      <Card className="p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-medium text-lg">
            Estados y Categorías de Contactos
          </h3>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Info size={16} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Información sobre los diferentes estados operativos,
                segmentación por antigüedad, estado de formaciones y servicios
                de los contactos. Cada categoría se organiza por fases: Inicio,
                Desarrollo y Cierre del ciclo de vida.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tabs defaultValue="cliente" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="cliente" className="flex-1">
              Estado del Cliente
            </TabsTrigger>
            <TabsTrigger value="productos" className="flex-1">
              Productos y Servicios
            </TabsTrigger>
            <TabsTrigger value="incidencias" className="flex-1">
              Detalles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cliente">
            <Tabs defaultValue="estados" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="estados">Estados Operativos</TabsTrigger>
                <TabsTrigger value="antiguedad">Antigüedad</TabsTrigger>
              </TabsList>

              <TabsContent value="estados">
                <PhaseGroup
                  title="Fase de Inicio"
                  items={statusGroups.inicio}
                />
                <PhaseGroup
                  title="Fase de Ejecución"
                  items={statusGroups.desarrollo}
                />
                <PhaseGroup
                  title="Fase de Cierre"
                  items={statusGroups.cierre}
                />
                {statusGroups.other.length > 0 && (
                  <PhaseGroup
                    title="Otros Estados"
                    items={statusGroups.other}
                  />
                )}
                <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Info size={14} />
                    <strong>Nota:</strong> Los clientes con inactivos
                    (independientemente de su estado de inactividad) mantendrán
                    acceso a sus formaciones hasta un año después de la
                    culminación de las mismas.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="antiguedad">
                <PhaseGroup
                  title="Fase de Adopción"
                  items={tenureGroups.inicio}
                />
                <PhaseGroup
                  title="Fase de Consolidación"
                  items={tenureGroups.desarrollo}
                />
                <PhaseGroup
                  title="Fase de Madurez"
                  items={tenureGroups.cierre}
                />
                {tenureGroups.other.length > 0 && (
                  <PhaseGroup
                    title="Otros Segmentos"
                    items={tenureGroups.other}
                  />
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="productos">
            <Tabs defaultValue="membresias" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="membresias">Membresía</TabsTrigger>
                <TabsTrigger value="formacion">Formación</TabsTrigger>
                <TabsTrigger value="servicios">Servicio</TabsTrigger>
                <TabsTrigger value="consultoria">Consultoría</TabsTrigger>
              </TabsList>

              <TabsContent value="membresias">
                <PhaseGroup
                  title="Fase de Inicio"
                  items={membershipGroups.inicio}
                />
                <PhaseGroup
                  title="Fase de Ejecución"
                  items={membershipGroups.desarrollo}
                />
                <PhaseGroup
                  title="Fase de Cierre"
                  items={membershipGroups.cierre}
                />
                {membershipGroups.other.length > 0 && (
                  <PhaseGroup
                    title="Otros Estados"
                    items={membershipGroups.other}
                  />
                )}
              </TabsContent>

              <TabsContent value="formacion">
                <PhaseGroup
                  title="Fase de Inicio"
                  items={trainingGroups.inicio}
                />
                <PhaseGroup
                  title="Fase de Ejecución"
                  items={trainingGroups.desarrollo}
                />
                <PhaseGroup
                  title="Fase de Cierre"
                  items={trainingGroups.cierre}
                />
                {trainingGroups.other.length > 0 && (
                  <PhaseGroup
                    title="Otros Estados"
                    items={trainingGroups.other}
                  />
                )}
                <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Info size={14} />
                    <strong>Nota:</strong> Los clientes con inactivos
                    (independientemente de su estado de inactividad) mantendrán
                    acceso a sus formaciones hasta un año después de la
                    culminación de las mismas.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="servicios">
                <PhaseGroup
                  title="Fase de Inicio"
                  items={serviceGroups.inicio}
                />
                <PhaseGroup
                  title="Fase de Ejecución"
                  items={serviceGroups.desarrollo}
                />
                <PhaseGroup
                  title="Fase de Cierre"
                  items={serviceGroups.cierre}
                />
                {serviceGroups.other.length > 0 && (
                  <PhaseGroup
                    title="Otros Estados"
                    items={serviceGroups.other}
                  />
                )}
              </TabsContent>

              <TabsContent value="consultoria">
                <PhaseGroup
                  title="Fase de Inicio"
                  items={consultingGroups.inicio}
                />
                <PhaseGroup
                  title="Fase de Ejecución"
                  items={consultingGroups.desarrollo}
                />
                <PhaseGroup
                  title="Fase de Cierre"
                  items={consultingGroups.cierre}
                />
                {consultingGroups.other.length > 0 && (
                  <PhaseGroup
                    title="Otros Estados"
                    items={consultingGroups.other}
                  />
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="incidencias">
            <Tabs defaultValue="estados" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="estados">Estados</TabsTrigger>
                <TabsTrigger value="incidencias">Incidencias</TabsTrigger>
                <TabsTrigger value="fases">Ciclo de vida</TabsTrigger>
                <TabsTrigger value="instrucciones">
                  Instrucciones en Holded
                </TabsTrigger>
              </TabsList>

              <TabsContent value="estados">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                      <div>
                        <p className="font-medium text-sm">Por iniciar</p>
                        <p className="text-xs text-gray-600">
                          Contactos que han mostrado interés pero aún no han
                          contratado servicios.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mt-1.5"></div>
                      <div>
                        <p className="font-medium text-sm">Sin estado</p>
                        <p className="text-xs text-gray-600">
                          Contactos sin información suficiente para determinar
                          su estado.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-indigo-50 p-3 rounded-md border border-indigo-200">
                      <div className="w-3 h-3 rounded-full bg-[#0A4D8C] mt-1.5"></div>
                      <div>
                        <p className="font-medium text-sm">Activo</p>
                        <p className="text-xs text-gray-600">
                          Clientes con productos o servicios activos en uso.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-md border border-amber-200">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5"></div>
                      <div>
                        <p className="font-medium text-sm">Por finalizar</p>
                        <p className="text-xs text-gray-600">
                          Servicios próximos a vencer (menos de 30 días).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="w-3 h-3 rounded-full bg-[#00C851] mt-1.5"></div>
                      <div>
                        <p className="font-medium text-sm">Completado</p>
                        <p className="text-xs text-gray-600">
                          Servicios finalizados exitosamente con objetivos
                          cumplidos.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-red-50 p-3 rounded-md border border-red-200">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                      <div>
                        <p className="font-medium text-sm">Incidencia</p>
                        <p className="text-xs text-gray-600">
                          Servicios con problemas que requieren gestión
                          específica.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="w-3 h-3 rounded-full bg-black mt-1.5"></div>
                      <div>
                        <p className="font-medium text-sm">Error</p>
                        <p className="text-xs text-gray-600">
                          Error en el procesamiento de datos del contacto.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Info size={14} />
                      <strong>Nota:</strong> Los clientes con inactivos
                      mantendrán acceso a sus formaciones hasta un año después
                      de la culminación de las mismas.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="incidencias">
                <div className="space-y-4">
                  <div className="p-3 rounded-md bg-red-50 border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">
                      Tipos de Incidencias
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">
                            Falta de pago del cliente
                          </p>
                          <p className="text-xs text-gray-600">
                            El cliente no ha efectuado los pagos
                            correspondientes por el servicio contratado.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">
                            Requisitos de formación incompletos
                          </p>
                          <p className="text-xs text-gray-600">
                            El cliente no ha completado todos los requisitos
                            necesarios para finalizar la formación.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">
                            Interrupción de servicio
                          </p>
                          <p className="text-xs text-gray-600">
                            El servicio ha sido interrumpido por razones
                            técnicas o administrativas.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">
                            Incumplimiento de contrato
                          </p>
                          <p className="text-xs text-gray-600">
                            El cliente o la empresa ha incumplido alguna
                            cláusula del contrato establecido.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Info size={14} />
                      <strong>Nota:</strong> Todas las incidencias deben ser
                      gestionadas según el protocolo de resolución de
                      incidencias establecido.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fases">
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-blue-800 mb-3">
                      Fase de Inicio
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Representa la adquisición y activación de clientes.
                      Incluye contactos sin estado asignado, clientes en
                      pre-activación, clientes nuevos en onboarding, servicios
                      programados pendientes de iniciar, formaciones pendientes
                      de comenzar y consultorías agendadas.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">Por iniciar</p>
                          <p className="text-xs text-gray-600">
                            Contactos que han mostrado interés pero aún no han
                            contratado servicios. En fase de captación y
                            negociación.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">Va a ser Alta</p>
                          <p className="text-xs text-gray-600">
                            Servicios que comenzarán próximamente. El cliente ya
                            ha contratado pero el servicio aún no está activo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                    <h4 className="font-medium text-indigo-800 mb-3">
                      Fase de Ejecución
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Representa la etapa de operación activa. Incluye clientes
                      con membresías activas, servicios en ejecución o entrega,
                      formaciones en progreso, consultorías en curso y clientes
                      con antigüedad media que están recibiendo valor
                      continuamente.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#0A4D8C] mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">En progreso</p>
                          <p className="text-xs text-gray-600">
                            Clientes que tienen productos o servicios activos y
                            están haciendo uso de ellos regularmente.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">Va a ser Baja</p>
                          <p className="text-xs text-gray-600">
                            Clientes con productos o servicios próximos a vencer
                            (menos de 30 días) y que requieren seguimiento para
                            su renovación.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="font-medium text-green-800 mb-3">
                      Fase de Cierre
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Representa la finalización del ciclo. Incluye clientes en
                      pre-desactivación, clientes inactivos (satisfechos o
                      insatisfechos), clientes inactivos con servicios
                      pendientes, formaciones completadas, servicios entregados
                      o finalizados y consultorías concluidas.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#00C851] mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">Completado</p>
                          <p className="text-xs text-gray-600">
                            Clientes que finalizaron su relación comercial
                            habiendo cumplido sus objetivos, con experiencia
                            positiva.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                        <div>
                          <p className="font-medium text-sm">Incidencia</p>
                          <p className="text-xs text-gray-600">
                            Servicios finalizados con problemas o interrumpidos
                            antes de su culminación natural. Requieren una
                            evaluación detallada.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Info size={14} />
                      <strong>Nota:</strong> El ciclo de vida del cliente es un
                      proceso continuo donde cada fase representa un momento
                      específico de la relación comercial. Es fundamental
                      entender en qué fase se encuentra cada cliente para
                      ofrecer el servicio más adecuado.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instrucciones">
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-blue-800 mb-3">
                      Nomenclatura de Campos Personalizados
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      El sistema agrupa automáticamente los campos
                      personalizados en Holded según su estructura de
                      nomenclatura. Es esencial seguir estas convenciones para
                      garantizar que los datos se procesen correctamente.
                    </p>

                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded-md border border-blue-100">
                        <h5 className="font-medium text-sm mb-2">
                          Estructura Básica
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          <code className="bg-gray-100 px-1 py-0.5 rounded">
                            CATEGORÍA Subcategoría - Propiedad
                          </code>
                        </p>
                        <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                          <li>
                            <strong>CATEGORÍA</strong>: En mayúsculas, define el
                            grupo principal (MEMBRESÍA, FORMACIÓN, SERVICIO,
                            etc.)
                          </li>
                          <li>
                            <strong>Subcategoría</strong>: Opcional, define un
                            subgrupo (nombre del servicio específico)
                          </li>
                          <li>
                            <strong>Propiedad</strong>: Después del guión,
                            define el atributo (Fecha de Inicio, Estado, etc.)
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded-md border border-blue-100">
                        <h5 className="font-medium text-sm mb-2">
                          Ejemplos de Campos
                        </h5>
                        <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              MEMBRESÍA Insiders - Fecha de Inicio
                            </code>
                          </li>
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              MEMBRESÍA Insiders - Fecha de Fin
                            </code>
                          </li>
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              FORMACIÓN Marketing - Edición
                            </code>
                          </li>
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              SERVICIO Legal - Estado
                            </code>
                          </li>
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              CONSULTORÍA Estratégica - Responsable
                            </code>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded-md border border-blue-100">
                        <h5 className="font-medium text-sm mb-2">
                          Campos de Fechas
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          Para fechas, usar específicamente estos formatos:
                        </p>
                        <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              Fecha de Inicio
                            </code>
                            : Indica cuándo comienza el servicio
                          </li>
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              Fecha de Fin
                            </code>
                            : Indica cuándo termina el servicio
                          </li>
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              Fecha de Alta
                            </code>
                            : Alternativa a Fecha de Inicio
                          </li>
                          <li>
                            <code className="bg-gray-100 px-1 py-0.5 rounded">
                              Fecha de Baja
                            </code>
                            : Alternativa a Fecha de Fin
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded-md border border-blue-100">
                        <h5 className="font-medium text-sm mb-2">
                          Estados Esperados
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          Cuando se usan campos de tipo Estado o Status, se
                          reconocen estos valores:
                        </p>
                        <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                          <li>
                            <strong>Activo</strong>: Servicio en uso actualmente
                          </li>
                          <li>
                            <strong>Desactivado</strong>: Servicio interrumpido
                            (ahora se muestra como &quot;Incidencia&quot;)
                          </li>
                          <li>
                            <strong>Próximo</strong>: Servicio pendiente de
                            iniciar
                          </li>
                          <li>
                            <strong>Pendiente</strong>: Alternativa a
                            &quot;Próximo&quot;
                          </li>
                          <li>
                            <strong>Finaliza</strong>: Servicio a punto de
                            terminar
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                    <h4 className="font-medium text-indigo-800 mb-3">
                      Procesamiento de Datos
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      El sistema procesa los datos de la siguiente manera para
                      determinar el estado de los servicios:
                    </p>

                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-md border border-indigo-100">
                        <h5 className="font-medium text-sm mb-2">
                          Prioridad de Detección
                        </h5>
                        <ol className="list-decimal pl-4 text-xs text-gray-600 space-y-1">
                          <li>
                            Primero se buscan campos de <strong>edición</strong>{" "}
                            (si existe y tiene valor, el servicio está activo)
                          </li>
                          <li>
                            Luego se buscan pares de <strong>fechas</strong> de
                            inicio/fin para calcular el estado según el día
                            actual
                          </li>
                          <li>
                            Finalmente se buscan campos de{" "}
                            <strong>estado</strong> explícitos
                          </li>
                        </ol>
                      </div>

                      <div className="bg-white p-3 rounded-md border border-indigo-100">
                        <h5 className="font-medium text-sm mb-2">
                          Agrupación de Servicios
                        </h5>
                        <p className="text-xs text-gray-600">
                          El nombre del servicio se extrae de la primera parte
                          del campo (después de la categoría principal). Si hay
                          un guión adicional, se toma el texto antes de ese
                          guión como nombre del servicio.
                        </p>
                        <p className="text-xs mt-2 bg-yellow-50 p-2 rounded-md">
                          <strong>Ejemplo:</strong> De &quot;SERVICIO Legal -
                          Estado, se extrae &quot;Legal&quot; como nombre del
                          servicio.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <h4 className="font-medium text-amber-800 mb-3">
                      Recomendaciones Importantes
                    </h4>
                    <ul className="list-disc pl-4 text-sm text-gray-700 space-y-2">
                      <li>
                        Mantener consistencia en la nomenclatura para que el
                        sistema pueda agrupar correctamente los servicios
                      </li>
                      <li>
                        Siempre incluir fechas de inicio y fin para servicios
                        con duración determinada
                      </li>
                      <li>
                        Para múltiples servicios del mismo tipo, diferenciar con
                        una subcategoría clara
                      </li>
                      <li>
                        Usar &quot;N/A&quot; para fechas no aplicables en lugar de
                        dejarlas vacías
                      </li>
                      <li>
                        No usar caracteres especiales en los nombres de los
                        campos personalizados
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Info size={14} />
                      <strong>Nota:</strong> Para más información sobre la
                      estructura de datos y su procesamiento, consulte la
                      documentación técnica o contacte con el administrador del
                      sistema.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </Card>
    </TooltipProvider>
  );
}

export default StatusLegend;

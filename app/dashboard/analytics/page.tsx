"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Filter, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getStartOfCurrentMonth,
  getEndOfCurrentMonth,
  getStartOfPreviousMonth,
  getEndOfPreviousMonth,
  getStartOfCurrentYear,
  getEndOfCurrentYear,
  getDateMonthsAgo,
} from "../../lib/holded/utils/analytics-date-utils";
import { toast } from "sonner";

// Importar componentes de gráficos
import MembershipTrendsChart from "./components/MembershipTrendsChart";
import TrainingsByYearChart from "./components/TrainingsByYearChart";
import StatusPieChart from "./components/StatusPieChart";
import TenurePieChart from "./components/TenurePieChart";
import StatusLegend from "./components/StatusLegend";

// Importar componentes nuevos
import TodosView from "./components/TodosView";
import LeadsView from "./components/LeadsView";
import ContactosView from "./components/ClientsView";
import { Contact as ModalContact } from "./components/ContactDetailModal";
import ResponsibleCountsView from "./components/ResponsibleCountsView";

// Definir interfaces para los datos
interface Contact {
  id: string;
  name: string;
  status?: string;
}

// ChartContact type to match what MembershipTrendsChart expects
type ChartContact = Contact & {
  [key: string]: string | number | boolean | undefined;
};

// Type for contacts with index signature used by components
type ComponentContact = {
  id: string;
  name: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
};

interface AnalyticsData {
  stats: {
    totalContacts: number;
    activeContacts: number;
    inactiveContacts: number;
    totalMemberships: number;
    totalTrainings: number;
    totalServices: number;
    averageTenure: number;
    totalConsultorias: number;
  };
  contactCountByType: {
    client?: number;
    lead?: number;
    supplier?: number;
    creditor?: number;
    debtor?: number;
  };
  distribution?: {
    byContactType: {
      client: number;
      lead: number;
      supplier: number;
      creditor: number;
      debtor: number;
    };
    byMemberships: {
      active: number;
      inactive: number;
    };
    byTrainings: {
      completed: number;
      inprogress: number;
    };
  };
  membershipTrends: {
    date: string;
    active: number;
    expiringSoon: number;
    inactive: number;
  }[];
  trainingsByYear: {
    year: string;
    completed: number;
    inProgress: number;
    pending: number;
  }[];
  statusCounts: {
    name: string;
    value: number;
    color: string;
    description: string;
  }[];
  tenureCounts: {
    name: string;
    value: number;
    color: string;
    description: string;
  }[];
  trainingStatusCounts: {
    name: string;
    value: number;
    color: string;
    description: string;
  }[];
  serviceStatusCounts: {
    name: string;
    value: number;
    color: string;
    description: string;
  }[];
  membershipStatusCounts: {
    name: string;
    value: number;
    color: string;
    description: string;
  }[];
  consultingStatusCounts: {
    name: string;
    value: number;
    color: string;
    description: string;
  }[];
  contactsByCategory: {
    active: Contact[];
    expiringSoon: Contact[];
    inactive: Contact[];
    status: Record<string, Contact[]>;
    tenure: Record<string, Contact[]>;
    completed: Record<string, Contact[]>;
    inProgress: Record<string, Contact[]>;
    pending: Record<string, Contact[]>;
    deliveredSuccess: Record<string, Contact[]>;
    deliveredFailed: Record<string, Contact[]>;
  };
  dateRange: {
    minDate: string | null;
    maxDate: string | null;
  };
  responsibleCounts: {
    name: string;
    subcategory: string;
    count: number;
  }[];
}

// Definir los tipos de contactos disponibles
const contactTypes = [
  { value: "all", label: "Todos" },
  { value: "client", label: "Clientes" },
  { value: "lead", label: "Leads" },
  { value: "supplier", label: "Proveedores" },
  { value: "creditor", label: "Acreedores" },
  { value: "debtor", label: "Deudores" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [showFullJson, setShowFullJson] = useState<boolean>(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchAnalyticsData("all");
  }, []);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    fetchAnalyticsData(value, startDate, endDate);
  };

  // Función para obtener los datos del endpoint
  const fetchAnalyticsData = async (
    type?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Construir URL con parámetros
      let url = `/api/holded/analytics?type=${type || "all"}`;

      // Añadir parámetros de fecha si están presentes
      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }

      console.log("Fetching from URL:", url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(
          "API Response Error:",
          response.status,
          response.statusText
        );
        // Try to get more error details if available
        let errorDetails = "";
        try {
          const errorText = await response.text();
          errorDetails = errorText.substring(0, 100); // Get first 100 chars for debugging
          console.error("Error response details:", errorDetails);
        } catch (e) {
          console.error("Could not read error response:", e);
        }

        throw new Error(
          `Error al obtener datos: ${response.statusText || response.status}`
        );
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al obtener datos"
      );
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de fecha de inicio
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    fetchAnalyticsData(
      selectedType === "all" ? undefined : selectedType,
      date,
      endDate
    );
  };

  // Manejar cambio de fecha de fin
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    fetchAnalyticsData(
      selectedType === "all" ? undefined : selectedType,
      startDate,
      date
    );
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSelectedType("all");
    setStartDate(undefined);
    setEndDate(undefined);
    fetchAnalyticsData("all");
  };

  // Aplicar filtro predefinido de fecha
  const applyDatePreset = (preset: string) => {
    let newStartDate: Date | undefined;
    let newEndDate: Date | undefined;

    switch (preset) {
      case "current-month":
        newStartDate = getStartOfCurrentMonth();
        newEndDate = getEndOfCurrentMonth();
        console.log(
          `Mes actual: ${newStartDate.toISOString()} - ${newEndDate.toISOString()}`
        );
        break;
      case "previous-month":
        newStartDate = getStartOfPreviousMonth();
        newEndDate = getEndOfPreviousMonth();
        console.log(
          `Mes anterior: ${newStartDate.toISOString()} - ${newEndDate.toISOString()}`
        );
        break;
      case "last-3-months":
        newStartDate = getDateMonthsAgo(3);
        newEndDate = new Date();
        console.log(
          `Últimos 3 meses: ${newStartDate.toISOString()} - ${newEndDate.toISOString()}`
        );
        break;
      case "last-6-months":
        newStartDate = getDateMonthsAgo(6);
        newEndDate = new Date();
        console.log(
          `Últimos 6 meses: ${newStartDate.toISOString()} - ${newEndDate.toISOString()}`
        );
        break;
      case "current-year":
        newStartDate = getStartOfCurrentYear();
        newEndDate = getEndOfCurrentYear();
        console.log(
          `Año actual: ${newStartDate.toISOString()} - ${newEndDate.toISOString()}`
        );
        break;
      case "all-time":
        newStartDate = undefined;
        newEndDate = undefined;
        break;
      default:
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchAnalyticsData(
      selectedType === "all" ? undefined : selectedType,
      newStartDate,
      newEndDate
    );
  };

  // Función para diagnosticar problemas con fechas
  const runDateDiagnosis = async () => {
    setDiagnosisResult("Ejecutando diagnóstico...");
    try {
      const response = await fetch("/api/holded/analytics/diagnosis");
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setDiagnosisResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setDiagnosisResult(
        `Error en diagnóstico: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
    }
  };

  // Función para mostrar/ocultar JSON completo
  const toggleJsonView = () => {
    setShowFullJson(!showFullJson);
  };

  // Renderizar estado de carga
  if (loading && !data) {
    return (
      <div className="container mx-auto py-10 space-y-8 ">
        <h1 className="text-3xl font-bold">Análisis de Contactos</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[150px] w-full" />
            ))}
        </div>
        <Tabs defaultValue="membership">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="membership">Membresías</TabsTrigger>
            <TabsTrigger value="trainings">Formaciones</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
          </TabsList>
          <TabsContent value="membership" className="mt-6">
            <Skeleton className="h-[400px] w-full" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Renderizar estado de error
  if (error && !data) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Renderizar datos
  return (
    <div className="container mx-auto py-6 md:py-10 space-y-4 md:space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold">
          Análisis de Contactos
        </h1>

        <Card className="w-full md:w-auto">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              {/* Selector de tipo */}
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo de contacto" />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtros predefinidos de fecha */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[180px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Período</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem
                    onClick={() => applyDatePreset("current-month")}
                  >
                    Mes actual
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => applyDatePreset("previous-month")}
                  >
                    Mes anterior
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => applyDatePreset("last-3-months")}
                  >
                    Últimos 3 meses
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => applyDatePreset("last-6-months")}
                  >
                    Últimos 6 meses
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => applyDatePreset("current-year")}
                  >
                    Año actual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyDatePreset("all-time")}>
                    Todo el tiempo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Selector de fecha de inicio */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[180px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Fecha creación desde</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                    disabled={(date) => (endDate ? date > endDate : false)}
                  />
                </PopoverContent>
              </Popover>

              {/* Selector de fecha de fin */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[180px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Fecha creación hasta</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>

              {/* Botón para limpiar filtros */}
              {(selectedType !== "all" || startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto"
                >
                  Limpiar filtros
                </Button>
              )}

              {/* Botón de diagnóstico */}
              <Button
                variant="outline"
                onClick={runDateDiagnosis}
                className="w-full sm:w-auto"
              >
                Diagnosticar fechas
              </Button>

              {/* Nuevo botón para ver JSON completo */}
              <Button
                variant="outline"
                onClick={toggleJsonView}
                className="w-full sm:w-auto"
              >
                {showFullJson ? "Ocultar JSON" : "Ver JSON completo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cargando</AlertTitle>
          <AlertDescription>Actualizando datos de análisis...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mostrar resultado del diagnóstico si existe */}
      {diagnosisResult && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">
            Resultado del diagnóstico
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs sm:text-sm">
            {diagnosisResult}
          </pre>
        </div>
      )}

      {/* Mostrar JSON completo cuando showFullJson es true */}
      {showFullJson && data && (
        <div className="p-4 bg-white rounded-lg shadow mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">JSON completo de datos</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                toast.success("JSON copiado al portapapeles");
              }}
            >
              Copiar JSON
            </Button>
          </div>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px] text-xs sm:text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 md:gap-8 mt-4">
            {/* Renderiza el componente adecuado según el tipo seleccionado */}
            {selectedType === "all" && data && (
              <TodosView
                totalContacts={data.stats.totalContacts}
                clientsCount={data.contactCountByType?.client || 0}
                leadsCount={data.contactCountByType?.lead || 0}
                suppliersCount={data.contactCountByType?.supplier || 0}
                creditorsCount={data.contactCountByType?.creditor || 0}
                debtorsCount={data.contactCountByType?.debtor || 0}
              />
            )}

            {selectedType === "lead" && data && (
              <LeadsView totalLeads={data.contactCountByType?.lead || 0} />
            )}

            {selectedType === "client" && data && (
              <>
                <ContactosView
                  totalClients={data.contactCountByType?.client || 0}
                  activeClients={data.stats.activeContacts}
                  inactiveClients={data.stats.inactiveContacts}
                  averageTenure={data.stats.averageTenure}
                  totalMemberships={data.stats.totalMemberships}
                  totalServices={data.stats.totalServices}
                  totalTrainings={data.stats.totalTrainings}
                  totalConsultorias={data.stats.totalConsultorias}
                />

                {/* Sección de KPIs y Gráficos */}
                <section className="space-y-6">
                  {/* Leyendas de estados y fases del ciclo de vida */}
                  <StatusLegend
                    statusDescriptions={data.statusCounts}
                    tenureDescriptions={data.tenureCounts}
                    trainingDescriptions={data.trainingStatusCounts}
                    serviceDescriptions={data.serviceStatusCounts}
                    membershipDescriptions={data.membershipStatusCounts}
                    consultingDescriptions={data.consultingStatusCounts}
                  />
                </section>

                {/* Análisis de Contactos por Estado */}
                <Card className="shadow-sm">
                  {/* ... resto del código ... */}
                </Card>

                {/* Solo mostrar las pestañas de gráficas para la vista de Clientes */}
                <Tabs defaultValue="membership" className="w-full">
                  <TabsList className="w-full justify-start overflow-auto">
                    <TabsTrigger value="membership">Membresías</TabsTrigger>
                    <TabsTrigger value="training">Formaciones</TabsTrigger>
                    <TabsTrigger value="consultoria">Consultoría</TabsTrigger>
                    <TabsTrigger value="distribution">Distribución</TabsTrigger>
                    <TabsTrigger value="responsible">Responsables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="membership" className="pt-4">
                    <MembershipTrendsChart
                      data={data.membershipTrends}
                      contactsByCategory={{
                        active: data.contactsByCategory
                          .active as unknown as ChartContact[],
                        expiringSoon: data.contactsByCategory
                          .expiringSoon as unknown as ChartContact[],
                        inactive: data.contactsByCategory
                          .inactive as unknown as ChartContact[],
                      }}
                      dateRange={data.dateRange}
                      statusDescriptions={{
                        active:
                          data.statusCounts.find((s) => s.name === "Activos")
                            ?.description || "",
                        expiringSoon:
                          data.statusCounts.find(
                            (s) => s.name === "Próximos a inactivar"
                          )?.description || "",
                        inactive:
                          data.statusCounts.find((s) => s.name === "Inactivos")
                            ?.description || "",
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="training" className="pt-4">
                    <TrainingsByYearChart
                      data={data.trainingsByYear}
                      contactsByCategory={{
                        completed: data.contactsByCategory
                          .completed as unknown as Record<
                          string,
                          ModalContact[]
                        >,
                        inProgress: data.contactsByCategory
                          .inProgress as unknown as Record<
                          string,
                          ModalContact[]
                        >,
                        pending: data.contactsByCategory
                          .pending as unknown as Record<string, ModalContact[]>,
                      }}
                      trainingDescriptions={{
                        completed:
                          data.trainingStatusCounts.find(
                            (s) => s.name === "Completadas"
                          )?.description ||
                          "Formación finalizada: El contacto ha completado todas las sesiones y requisitos del curso.",
                        inProgress:
                          data.trainingStatusCounts.find(
                            (s) => s.name === "En Progreso"
                          )?.description ||
                          "Formación en curso: El contacto está participando activamente en el programa formativo.",
                        pending:
                          data.trainingStatusCounts.find(
                            (s) => s.name === "Pendientes"
                          )?.description ||
                          "Formación pendiente: El contacto tiene asignada la formación pero aún no ha iniciado ninguna sesión.",
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="consultoria">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Consultorías</CardTitle>
                          <CardDescription>
                            Número total de consultorías activas
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {data.stats.totalConsultorias}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="distribution" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatusPieChart
                        data={data.statusCounts}
                        contactsByCategory={
                          data.contactsByCategory.status as unknown as Record<
                            string,
                            ComponentContact[]
                          >
                        }
                      />
                      <TenurePieChart
                        data={data.tenureCounts}
                        contactsByCategory={
                          data.contactsByCategory.tenure as unknown as Record<
                            string,
                            ComponentContact[]
                          >
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="responsible">
                    <ResponsibleCountsView
                      responsibleCounts={data.responsibleCounts}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

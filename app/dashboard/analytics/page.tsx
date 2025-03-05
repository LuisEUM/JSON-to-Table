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
import { Card, CardContent } from "@/components/ui/card";
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
  toISODateString,
} from "../../lib/holded/utils/analytics-date-utils";

// Importar componentes de gráficos
import MembershipTrendsChart from "./components/MembershipTrendsChart";
import TrainingsByYearChart from "./components/TrainingsByYearChart";
import StatusPieChart from "./components/StatusPieChart";
import TenurePieChart from "./components/TenurePieChart";
import StatsCards from "./components/StatsCards";

// Definir interfaces para los datos
interface AnalyticsData {
  stats: {
    totalContacts: number;
    activeContacts: number;
    inactiveContacts: number;
    totalMemberships: number;
    totalTrainings: number;
    averageTenure: string;
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
  }[];
  tenureCounts: {
    name: string;
    value: number;
    color: string;
  }[];
}

// Tipos de contacto disponibles
const contactTypes = [
  { value: "all", label: "Todos" },
  { value: "client", label: "Clientes" },
  { value: "creditor", label: "Acreedores" },
  { value: "debtor", label: "Deudores" },
  { value: "lead", label: "Leads" },
  { value: "supplier", label: "Proveedores" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

  const fetchAnalyticsData = async (
    type?: string,
    start?: Date,
    end?: Date
  ) => {
    setLoading(true);
    setError(null);

    try {
      let url = "/api/holded/analytics";
      const params = new URLSearchParams();

      if (type && type !== "all") {
        params.append("type", type);
      }

      if (start) {
        const startStr = toISODateString(start);
        params.append("startDate", startStr);
        console.log(`Añadiendo startDate a URL: ${startStr}`);
      }

      if (end) {
        const endStr = toISODateString(end);
        params.append("endDate", endStr);
        console.log(`Añadiendo endDate a URL: ${endStr}`);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`Realizando petición a: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        `Datos recibidos: ${data.stats.totalContacts} contactos totales`
      );
      setData(data);
    } catch (err) {
      console.error("Error al cargar datos de análisis:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Manejar cambio de tipo
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    fetchAnalyticsData(value === "all" ? undefined : value, startDate, endDate);
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

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSelectedType("all");
    setStartDate(undefined);
    setEndDate(undefined);
    fetchAnalyticsData();
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

  // Renderizar estado de carga
  if (loading && !data) {
    return (
      <div className='container mx-auto py-10 space-y-8'>
        <h1 className='text-3xl font-bold'>Análisis de Contactos</h1>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className='h-[150px] w-full' />
            ))}
        </div>
        <Tabs defaultValue='membership'>
          <TabsList className='w-full justify-start'>
            <TabsTrigger value='membership'>Membresías</TabsTrigger>
            <TabsTrigger value='trainings'>Formaciones</TabsTrigger>
            <TabsTrigger value='distribution'>Distribución</TabsTrigger>
          </TabsList>
          <TabsContent value='membership' className='mt-6'>
            <Skeleton className='h-[400px] w-full' />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Renderizar estado de error
  if (error && !data) {
    return (
      <div className='container mx-auto py-10'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Renderizar datos
  return (
    <div className='container mx-auto py-10 space-y-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h1 className='text-3xl font-bold'>Análisis de Contactos</h1>

        <Card className='w-full md:w-auto'>
          <CardContent className='p-4'>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4' />
                <span className='text-sm font-medium'>Filtros:</span>
              </div>

              {/* Selector de tipo */}
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Tipo de contacto' />
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
                  <Button variant='outline' className='w-[180px]'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    <span>Período</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
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
                    variant='outline'
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {startDate ? (
                      format(startDate, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Fecha inicio</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
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
                    variant='outline'
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {endDate ? (
                      format(endDate, "dd/MM/yyyy", { locale: es })
                    ) : (
                      <span>Fecha fin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
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
                  variant='outline'
                  size='sm'
                  onClick={handleClearFilters}
                >
                  Limpiar filtros
                </Button>
              )}

              {/* Botón de diagnóstico */}
              <Button variant='outline' onClick={runDateDiagnosis}>
                Diagnosticar fechas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Cargando</AlertTitle>
          <AlertDescription>Actualizando datos de análisis...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mostrar resultado del diagnóstico si existe */}
      {diagnosisResult && (
        <div className='p-4 bg-white rounded-lg shadow'>
          <h2 className='text-xl font-semibold mb-2'>
            Resultado del diagnóstico
          </h2>
          <pre className='bg-gray-100 p-4 rounded overflow-auto max-h-96'>
            {diagnosisResult}
          </pre>
        </div>
      )}

      {data && (
        <>
          <StatsCards
            totalContacts={data.stats.totalContacts}
            activeContacts={data.stats.activeContacts}
            inactiveContacts={data.stats.inactiveContacts}
            totalMemberships={data.stats.totalMemberships}
            totalTrainings={data.stats.totalTrainings}
            averageTenure={data.stats.averageTenure}
          />

          <Tabs defaultValue='membership'>
            <TabsList className='w-full justify-start'>
              <TabsTrigger value='membership'>Membresías</TabsTrigger>
              <TabsTrigger value='trainings'>Formaciones</TabsTrigger>
              <TabsTrigger value='distribution'>Distribución</TabsTrigger>
            </TabsList>

            <TabsContent value='membership' className='mt-6'>
              <MembershipTrendsChart data={data.membershipTrends} />
            </TabsContent>

            <TabsContent value='trainings' className='mt-6'>
              <TrainingsByYearChart data={data.trainingsByYear} />
            </TabsContent>

            <TabsContent value='distribution' className='mt-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <StatusPieChart data={data.statusCounts} />
                <TenurePieChart data={data.tenureCounts} />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

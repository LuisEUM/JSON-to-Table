"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

export default function TrendsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("last30days");
  const [dataType, setDataType] = useState("contacts");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Datos simulados para las gráficas
  const mockData = {
    contacts: {
      labels: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ],
      values: [120, 132, 145, 162, 178, 195, 210, 228, 245, 263, 280, 302],
      growth: 12.5,
    },
    memberships: {
      labels: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ],
      values: [85, 92, 98, 105, 112, 120, 128, 135, 142, 150, 158, 165],
      growth: 8.2,
    },
    trainings: {
      labels: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ],
      values: [45, 52, 58, 65, 72, 80, 88, 95, 102, 110, 118, 125],
      growth: 15.3,
    },
    revenue: {
      labels: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ],
      values: [
        15000, 16200, 17500, 18800, 20100, 21500, 23000, 24500, 26000, 27500,
        29000, 30500,
      ],
      growth: 9.8,
    },
  };

  // Simular carga de datos
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [timeRange, dataType]);

  // Función para obtener el crecimiento con el signo correcto
  const getGrowthDisplay = (growth: number) => {
    if (growth > 0) {
      return (
        <div className='flex items-center text-green-500'>
          <ArrowUpRight className='h-4 w-4 mr-1' />
          <span>+{growth}%</span>
        </div>
      );
    } else if (growth < 0) {
      return (
        <div className='flex items-center text-red-500'>
          <ArrowDownRight className='h-4 w-4 mr-1' />
          <span>{growth}%</span>
        </div>
      );
    } else {
      return <span>0%</span>;
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Tendencias</h1>

      <div className='grid gap-6 mb-8'>
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle>Filtros</CardTitle>
              <Button
                variant='outline'
                onClick={() => {
                  setTimeRange("last30days");
                  setDataType("contacts");
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Restablecer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-2'>
                <Label>Tipo de datos</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='contacts'>Contactos</SelectItem>
                    <SelectItem value='memberships'>Membresías</SelectItem>
                    <SelectItem value='trainings'>Formaciones</SelectItem>
                    <SelectItem value='revenue'>Ingresos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Periodo predefinido</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar periodo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='last7days'>Últimos 7 días</SelectItem>
                    <SelectItem value='last30days'>Últimos 30 días</SelectItem>
                    <SelectItem value='last90days'>Últimos 90 días</SelectItem>
                    <SelectItem value='lastYear'>Último año</SelectItem>
                    <SelectItem value='custom'>Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Fecha inicio</Label>
                <DatePicker selected={startDate} onSelect={setStartDate} />
              </div>

              <div className='space-y-2'>
                <Label>Fecha fin</Label>
                <DatePicker selected={endDate} onSelect={setEndDate} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='overview'>Resumen</TabsTrigger>
          <TabsTrigger value='detailed'>Detallado</TabsTrigger>
          <TabsTrigger value='comparison'>Comparativa</TabsTrigger>
          <TabsTrigger value='forecast'>Proyección</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {/* KPI Cards */}
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Total Contactos</CardDescription>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-2xl'>302</CardTitle>
                  {getGrowthDisplay(mockData.contacts.growth)}
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='text-xs text-muted-foreground'>
                  Comparado con periodo anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Membresías Activas</CardDescription>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-2xl'>165</CardTitle>
                  {getGrowthDisplay(mockData.memberships.growth)}
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='text-xs text-muted-foreground'>
                  Comparado con periodo anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Formaciones Completadas</CardDescription>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-2xl'>125</CardTitle>
                  {getGrowthDisplay(mockData.trainings.growth)}
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='text-xs text-muted-foreground'>
                  Comparado con periodo anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Ingresos Totales</CardDescription>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-2xl'>30.500€</CardTitle>
                  {getGrowthDisplay(mockData.revenue.growth)}
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='text-xs text-muted-foreground'>
                  Comparado con periodo anterior
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>
                  Evolución{" "}
                  {dataType === "contacts"
                    ? "de Contactos"
                    : dataType === "memberships"
                    ? "de Membresías"
                    : dataType === "trainings"
                    ? "de Formaciones"
                    : "de Ingresos"}
                </CardTitle>
                <CardDescription>
                  Tendencia durante los últimos 12 meses
                </CardDescription>
              </CardHeader>
              <CardContent className='h-80'>
                {isLoading ? (
                  <div className='flex h-full items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                  </div>
                ) : (
                  <div className='h-full flex items-center justify-center'>
                    <p className='text-muted-foreground'>
                      [Aquí se renderizaría el gráfico de líneas con los datos
                      de {dataType}]
                    </p>
                    {/* Aquí se integraría una librería de gráficos como Chart.js, Recharts, etc. */}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='detailed'>
          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado</CardTitle>
              <CardDescription>
                Desglose detallado por categorías y periodos
              </CardDescription>
            </CardHeader>
            <CardContent className='h-96'>
              {isLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>
                    [Aquí se renderizaría un gráfico de barras detallado]
                  </p>
                  {/* Aquí se integraría una librería de gráficos como Chart.js, Recharts, etc. */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='comparison'>
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Periodos</CardTitle>
              <CardDescription>
                Comparación entre periodos seleccionados
              </CardDescription>
            </CardHeader>
            <CardContent className='h-96'>
              {isLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>
                    [Aquí se renderizaría un gráfico comparativo entre periodos]
                  </p>
                  {/* Aquí se integraría una librería de gráficos como Chart.js, Recharts, etc. */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='forecast'>
          <Card>
            <CardHeader>
              <CardTitle>Proyección Futura</CardTitle>
              <CardDescription>
                Estimación de tendencias para los próximos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent className='h-96'>
              {isLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </div>
              ) : (
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>
                    [Aquí se renderizaría un gráfico de proyección con líneas de
                    tendencia]
                  </p>
                  {/* Aquí se integraría una librería de gráficos como Chart.js, Recharts, etc. */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Award,
  Briefcase,
  Bookmark,
  Lightbulb,
} from "lucide-react";

interface ClientsViewProps {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  averageTenure: number | string;
  totalMemberships?: number;
  totalServices?: number;
  totalTrainings?: number;
  totalConsultorias?: number;
}

export default function ClientsView({
  totalClients,
  activeClients,
  inactiveClients,
  averageTenure,
  totalMemberships = 0,
  totalServices = 0,
  totalTrainings = 0,
  totalConsultorias = 0,
}: ClientsViewProps) {
  // Calculate percentages
  const getPercentage = (value: number) =>
    totalClients > 0 ? ((value / totalClients) * 100).toFixed(1) : "0.0";

  // Format average tenure display
  const formattedTenure =
    typeof averageTenure === "number"
      ? `${averageTenure} meses`
      : averageTenure;

  return (
    <div className='space-y-8'>
      {/* Stats Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Clients Card */}
        <Card className='shadow-md border-t-4 border-t-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>Total Clientes</CardTitle>
            <Users className='h-5 w-5 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalClients}</div>
            <p className='text-xs text-muted-foreground'>
              Clientes registrados en el sistema
            </p>
          </CardContent>
        </Card>

        {/* Active Clients Card */}
        <Card className='shadow-md border-t-4 border-t-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>
              Clientes Activos
            </CardTitle>
            <UserCheck className='h-5 w-5 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{activeClients}</div>
            <p className='text-xs text-muted-foreground'>
              {getPercentage(activeClients)}% del total
            </p>
          </CardContent>
        </Card>

        {/* Inactive Clients Card */}
        <Card className='shadow-md border-t-4 border-t-red-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>
              Clientes Inactivos
            </CardTitle>
            <UserX className='h-5 w-5 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{inactiveClients}</div>
            <p className='text-xs text-muted-foreground'>
              {getPercentage(inactiveClients)}% del total
            </p>
          </CardContent>
        </Card>

        {/* Average Tenure Card */}
        <Card className='shadow-md border-t-4 border-t-amber-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>
              Antigüedad Media
            </CardTitle>
            <Clock className='h-5 w-5 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formattedTenure}</div>
            <p className='text-xs text-muted-foreground'>
              Tiempo promedio como cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Client Services Information */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Memberships Card */}
        <Card className='shadow-md border-t-4 border-t-purple-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>Membresías</CardTitle>
            <Award className='h-5 w-5 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalMemberships}</div>
            <p className='text-xs text-muted-foreground'>
              Total de membresías activas
            </p>
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card className='shadow-md border-t-4 border-t-cyan-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>Servicios</CardTitle>
            <Briefcase className='h-5 w-5 text-cyan-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalServices}</div>
            <p className='text-xs text-muted-foreground'>
              Total de servicios asignados
            </p>
          </CardContent>
        </Card>

        {/* Trainings Card */}
        <Card className='shadow-md border-t-4 border-t-emerald-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>Formaciones</CardTitle>
            <Bookmark className='h-5 w-5 text-emerald-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalTrainings}</div>
            <p className='text-xs text-muted-foreground'>
              Total de formaciones programadas
            </p>
          </CardContent>
        </Card>

        {/* Consultorías Card */}
        <Card className='shadow-md border-t-4 border-t-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-lg font-bold'>Consultorías</CardTitle>
            <Lightbulb className='h-5 w-5 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalConsultorias}</div>
            <p className='text-xs text-muted-foreground'>
              Total de consultorías activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Coming Soon Section */}
      <Card className='shadow-md p-6'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold'>
            Visualizaciones (Próximamente)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4 text-muted-foreground'>
            En esta sección estarán disponibles pronto visualizaciones gráficas
            para analizar los clientes.
          </p>
          <div className='space-y-2'>
            <h3 className='font-medium'>Ideas para visualizaciones:</h3>
            <ul className='list-disc pl-5 space-y-1 text-sm text-muted-foreground'>
              <li>Distribución de clientes por antigüedad</li>
              <li>Evolución de la base de clientes en el tiempo</li>
              <li>Tasa de retención de clientes</li>
              <li>Distribución geográfica de clientes</li>
              <li>Valor promedio por cliente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

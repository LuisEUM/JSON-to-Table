import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface ContactosViewProps {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  averageTenure: number;
}

export default function ContactosView({
  totalClients,
  activeClients,
  inactiveClients,
  averageTenure,
}: ContactosViewProps) {
  // Calculate percentages
  const getPercentage = (value: number) =>
    ((value / totalClients) * 100).toFixed(1);

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
              Clientes registrados en Holded
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
            <div className='text-2xl font-bold'>{averageTenure} meses</div>
            <p className='text-xs text-muted-foreground'>
              Tiempo promedio como cliente
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

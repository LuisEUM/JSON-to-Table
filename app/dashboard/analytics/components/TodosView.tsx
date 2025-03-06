import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Lightbulb,
  Building,
  Coins,
  Truck,
} from "lucide-react";

interface TodosViewProps {
  totalContacts: number;
  clientsCount: number;
  leadsCount: number;
  suppliersCount: number;
  creditorsCount: number;
  debtorsCount: number;
}

export default function TodosView({
  totalContacts,
  clientsCount,
  leadsCount,
  suppliersCount,
  creditorsCount,
  debtorsCount,
}: TodosViewProps) {
  // Calculate percentages
  const getPercentage = (value: number) =>
    ((value / totalContacts) * 100).toFixed(1);

  return (
    <div className='space-y-8'>
      {/* Total Contacts Card */}
      <Card className='shadow-md border-t-4 border-t-blue-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-xl font-bold'>Total Contactos</CardTitle>
          <Users className='h-6 w-6 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{totalContacts}</div>
          <p className='text-sm text-muted-foreground'>
            Contactos registrados en Holded
          </p>
        </CardContent>
      </Card>

      {/* Contact Types Grid */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Segmentación por Tipo</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Clients Card */}
          <Card className='shadow border-l-4 border-l-orange-400'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-lg font-bold'>Clientes</CardTitle>
              <Building className='h-5 w-5 text-orange-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{clientsCount}</div>
              <p className='text-xs text-muted-foreground'>
                {getPercentage(clientsCount)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Leads Card */}
          <Card className='shadow border-l-4 border-l-purple-400'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-lg font-bold'>Leads</CardTitle>
              <Lightbulb className='h-5 w-5 text-purple-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{leadsCount}</div>
              <p className='text-xs text-muted-foreground'>
                {getPercentage(leadsCount)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Suppliers Card */}
          <Card className='shadow border-l-4 border-l-blue-400'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-lg font-bold'>Proveedores</CardTitle>
              <Truck className='h-5 w-5 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{suppliersCount}</div>
              <p className='text-xs text-muted-foreground'>
                {getPercentage(suppliersCount)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Creditors Card */}
          <Card className='shadow border-l-4 border-l-green-400'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-lg font-bold'>Acreedores</CardTitle>
              <Coins className='h-5 w-5 text-green-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{creditorsCount}</div>
              <p className='text-xs text-muted-foreground'>
                {getPercentage(creditorsCount)}% del total
              </p>
            </CardContent>
          </Card>

          {/* Debtors Card */}
          <Card className='shadow border-l-4 border-l-red-400'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-lg font-bold'>Deudores</CardTitle>
              <Coins className='h-5 w-5 text-red-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{debtorsCount}</div>
              <p className='text-xs text-muted-foreground'>
                {getPercentage(debtorsCount)}% del total
              </p>
            </CardContent>
          </Card>
        </div>
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
            para analizar los datos.
          </p>
          <div className='space-y-2'>
            <h3 className='font-medium'>Ideas para visualizaciones:</h3>
            <ul className='list-disc pl-5 space-y-1 text-sm text-muted-foreground'>
              <li>Distribución de contactos por tipo (gráfico circular)</li>
              <li>Evolución temporal de los contactos (línea de tiempo)</li>
              <li>Comparativa de estado activo/inactivo por tipo (barras)</li>
              <li>Mapa de distribución geográfica de contactos</li>
              <li>Distribución por industria o sector</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

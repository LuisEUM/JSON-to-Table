import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface LeadsViewProps {
  totalLeads: number;
}

export default function LeadsView({ totalLeads }: LeadsViewProps) {
  return (
    <div className='space-y-8'>
      {/* Total Leads Card */}
      <Card className='shadow-md border-t-4 border-t-purple-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-xl font-bold'>Total Leads</CardTitle>
          <Lightbulb className='h-6 w-6 text-purple-500' />
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{totalLeads}</div>
          <p className='text-sm text-muted-foreground'>
            Leads registrados en Holded
          </p>
        </CardContent>
      </Card>

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
            para analizar los leads.
          </p>
          <div className='space-y-2'>
            <h3 className='font-medium'>Ideas para visualizaciones:</h3>
            <ul className='list-disc pl-5 space-y-1 text-sm text-muted-foreground'>
              <li>Tasa de conversión de leads a clientes</li>
              <li>Origen de los leads (canales de adquisición)</li>
              <li>Tiempo promedio de conversión</li>
              <li>Leads por etapa del embudo de ventas</li>
              <li>Distribución geográfica de leads</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Calendar,
  Bell,
  BarChart,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Bienvenido al panel de control de INSIDE
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Link href='/dashboard/analytics'>
          <Card className='hover:bg-muted/50 transition-colors cursor-pointer'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Análisis y KPIs
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-sm text-muted-foreground'>
                Visualiza métricas y tendencias de contactos y servicios
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href='/dashboard/contacts'>
          <Card className='hover:bg-muted/50 transition-colors cursor-pointer'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Gestión de Contactos
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-sm text-muted-foreground'>
                Administra y visualiza la información de tus contactos
              </div>
            </CardContent>
          </Card>
        </Link>


   

        <Link href='/dashboard/calendar'>
          <Card className='hover:bg-muted/50 transition-colors cursor-pointer'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Calendario</CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-sm text-muted-foreground'>
                Visualiza eventos y fechas importantes
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href='/dashboard/notifications'>
          <Card className='hover:bg-muted/50 transition-colors cursor-pointer'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Notificaciones
              </CardTitle>
              <Bell className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-sm text-muted-foreground'>
                Configura alertas y notificaciones automáticas
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
            <CardDescription>
              Actividad reciente en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <div className='mr-4 rounded-full bg-primary/10 p-2'>
                  <Users className='h-4 w-4 text-primary' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    Nuevos contactos añadidos
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    3 nuevos contactos en los últimos 7 días
                  </p>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='mr-4 rounded-full bg-primary/10 p-2'>
                  <BarChart className='h-4 w-4 text-primary' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    Cambios en membresías
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    5 renovaciones y 2 cancelaciones este mes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos y fechas importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <div className='mr-4 rounded-full bg-primary/10 p-2'>
                  <Calendar className='h-4 w-4 text-primary' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    Renovaciones de membresía
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    8 renovaciones programadas para el próximo mes
                  </p>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='mr-4 rounded-full bg-primary/10 p-2'>
                  <Bell className='h-4 w-4 text-primary' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    Alertas de servicio
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    3 servicios están a punto de finalizar
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

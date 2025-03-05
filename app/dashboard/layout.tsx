import { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Home,
  TrendingUp,
  Calendar,
  Bell,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col'>
      <div className='border-b'>
        <div className='flex h-16 items-center px-4'>
          <Link href='/' className='flex items-center font-bold'>
            <Home className='mr-2 h-5 w-5' />
            <span>INSIDE</span>
          </Link>
          <nav className='ml-auto flex items-center space-x-4'>
            <Link
              href='/dashboard'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Dashboard
            </Link>
            <Link
              href='/dashboard/analytics'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Análisis
            </Link>
            <Link
              href='/dashboard/contacts'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Contactos
            </Link>
            <Link
              href='/dashboard/settings'
              className='text-sm font-medium transition-colors hover:text-primary'
            >
              Configuración
            </Link>
          </nav>
        </div>
      </div>
      <div className='flex flex-1'>
        <div className='hidden border-r bg-muted/40 md:block md:w-64'>
          <div className='flex h-full flex-col gap-2 p-4'>
            <Link
              href='/dashboard'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <Home className='h-5 w-5' />
              <span>Inicio</span>
            </Link>
            <Link
              href='/dashboard/analytics'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <BarChart3 className='h-5 w-5' />
              <span>Análisis</span>
            </Link>
            <Link
              href='/dashboard/trends'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <TrendingUp className='h-5 w-5' />
              <span>Tendencias</span>
            </Link>
            <Link
              href='/dashboard/contacts'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <Users className='h-5 w-5' />
              <span>Contactos</span>
            </Link>
            <Link
              href='/dashboard/calendar'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <Calendar className='h-5 w-5' />
              <span>Calendario</span>
            </Link>
            <Link
              href='/dashboard/reports'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <FileText className='h-5 w-5' />
              <span>Informes</span>
            </Link>
            <Link
              href='/dashboard/notifications'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <Bell className='h-5 w-5' />
              <span>Notificaciones</span>
            </Link>
            <Link
              href='/dashboard/settings'
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground'
            >
              <Settings className='h-5 w-5' />
              <span>Configuración</span>
            </Link>
          </div>
        </div>
        <main className='flex-1 p-6 md:p-8'>{children}</main>
      </div>
    </div>
  );
}

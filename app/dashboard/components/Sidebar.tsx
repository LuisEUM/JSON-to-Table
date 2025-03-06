import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Panel",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contactos",
    href: "/dashboard/contacts",
    icon: Users,
  },
  {
    title: "Analíticas",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Documentos",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className='flex flex-col h-full bg-white border-r'>
      <div className='p-6'>
        <h1 className='text-2xl font-bold text-gray-800'>INSIDE</h1>
      </div>
      <nav className='flex-1 px-3 py-2 space-y-1'>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className='w-5 h-5 mr-3' />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className='p-4 border-t'>
        <button
          className='flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900'
          onClick={() => {
            // Aquí iría la lógica de cierre de sesión
            console.log("Cerrar sesión");
          }}
        >
          <LogOut className='w-5 h-5 mr-3' />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

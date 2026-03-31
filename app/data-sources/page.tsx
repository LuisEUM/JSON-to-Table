import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitives/ui/card";
import { Button } from "@/components/primitives/ui/button";
import { Icons } from "@/components/primitives/ui/icons";

// Enum para los tipos de fuentes de datos
enum DataSourceType {
  FILE = "file",
  HOLDED = "holded",
  API = "api",
  DATABASE = "database",
  DEMO = "demo",
}

// Datos de las fuentes disponibles
const DATA_SOURCES = [
  {
    id: DataSourceType.DEMO,
    name: "Demostración",
    description: "Explora tablas simple y compleja con datos de ejemplo listos para usar, sin configuración",
    icon: "Database",
    path: "/data-sources/demo",
  },
  {
    id: DataSourceType.FILE,
    name: "Archivos",
    description: "Cargar datos desde archivos locales (CSV, JSON, ODS, XLSX)",
    icon: "File",
    path: "/data-sources/file",
  },
  {
    id: DataSourceType.HOLDED,
    name: "Holded API",
    description: "Conectar con Holded para obtener datos en tiempo real",
    icon: "Database",
    path: "/data-sources/holded",
  },
  {
    id: DataSourceType.API,
    name: "API Externa",
    description: "Conectar con una API externa",
    icon: "Globe",
    path: "/data-sources/api",
  },
  {
    id: DataSourceType.DATABASE,
    name: "Base de Datos",
    description: "Conectar con una base de datos",
    icon: "Database",
    path: "/data-sources/database",
  },
];

// Interfaz para la fuente de datos
interface DataSource {
  id: DataSourceType | string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

// Componente para cada tarjeta de fuente de datos
interface DataSourceCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
}

function DataSourceCard({
  title,
  description,
  path,
}: Omit<DataSourceCardProps, "icon">) {
  // Usamos un icono por defecto
  const IconComponent = Icons.Database;

  return (
    <Card className='hover:shadow-lg transition-shadow'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-primary/10 rounded-full'>
            <IconComponent className='h-6 w-6 text-primary' />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>

      <CardFooter>
        <Link href={path} passHref className='w-full'>
          <Button className='w-full'>Seleccionar</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Página principal
export default function DataSourcesPage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-6'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='container mx-auto py-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold mb-2'>
              Selecciona una fuente de datos
            </h1>
            <p className='text-gray-500'>
              Elige entre las siguientes opciones para importar tus datos
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {DATA_SOURCES.map((source: DataSource) => (
              <DataSourceCard
                key={source.id}
                title={source.name}
                description={source.description}
                path={source.path}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

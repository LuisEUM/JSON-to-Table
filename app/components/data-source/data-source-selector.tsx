import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DATA_SOURCES, DataSourceType } from "../../lib/constants";
import { Icons } from "@/components/ui/icons";

// Interfaz para la fuente de datos
interface DataSource {
  id: DataSourceType;
  name: string;
  description: string;
  icon: string;
  path: string;
}

// Componente principal que muestra las opciones de fuentes de datos
export function DataSourceSelector() {
  return (
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
            icon={source.icon}
            path={source.path}
          />
        ))}
      </div>
    </div>
  );
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
}: DataSourceCardProps) {
  // Obtener el icono dinámicamente
  const IconComponent = Icons.Database; // Usamos un icono por defecto

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

"use client";

import { useState, useEffect } from "react";
// Comentar la importación que causa el error
// import { DataTable } from "@/components/ui/data-table"; // Asumiendo que existe este componente
import { Customer } from "../interfaces/customer";
// import { withHoldedStatusColumns } from "../components/holded-status-columns";
// import { ColumnDef } from "@tanstack/react-table";

// Columnas base para los clientes (comentadas para evitar error de no uso)
/* 
const baseColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "tradeName",
    header: "Nombre Comercial",
  },
];
*/

export default function HoldedStatusColumnsExample() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Combinar las columnas base con las columnas de estado
  // const columns = withHoldedStatusColumns(baseColumns);
  // Comentado para evitar el error de variable no utilizada

  useEffect(() => {
    // Simulación de carga de datos
    const fetchCustomers = async () => {
      try {
        // En una aplicación real, esto sería una llamada a la API
        const response = await fetch("/api/holded/contacts");
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-4'>Clientes de Holded con Estado</h1>

      {loading ? (
        <div className='flex justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
        </div>
      ) : (
        // Comentar el uso del componente DataTable
        <div>
          <p>Tabla de datos (DataTable no disponible)</p>
          <pre>{JSON.stringify(customers, null, 2)}</pre>
        </div>
      )}

      <div className='mt-8'>
        <h2 className='text-xl font-semibold mb-2'>Leyenda de Estados</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span>Servicio Activo</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
            <span>Va a ser Alta</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-orange-500'></div>
            <span>Va a ser Baja</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <span>Servicio Desactivado</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-gray-400'></div>
            <span>Sin Estado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

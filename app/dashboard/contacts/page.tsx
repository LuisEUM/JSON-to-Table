"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Search, Filter, Download } from "lucide-react";

interface Membership {
  id: string;
  name: string;
  status: "active" | "pending" | "expiring-soon" | "inactive";
  startDate: string;
  endDate: string;
  type: "monthly" | "quarterly" | "biannual" | "annual";
}

interface Training {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "ending-soon" | "completed" | "extended";
  startDate: string;
  endDate: string;
  extendedEndDate?: string;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive" | "pre-deactivation" | "inactive-with-services";
  tenure: "new" | "onboarding" | "loyal" | "legend";
  memberships: Membership[];
  trainings: Training[];
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    // Evitar múltiples solicitudes
    if (dataFetched) return;

    setDataFetched(true);

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/holded/contacts");

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setContacts(data);
        setFilteredContacts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar contactos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [dataFetched]);

  // Filtrar contactos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(term) ||
          (contact.email && contact.email.toLowerCase().includes(term)) ||
          (contact.phone && contact.phone.toLowerCase().includes(term))
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  // Función para obtener el color de la insignia según el estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pre-deactivation":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "inactive-with-services":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "pre-deactivation":
        return "Pre-desactivación";
      case "inactive":
        return "Inactivo";
      case "inactive-with-services":
        return "Inactivo con servicios";
      default:
        return status;
    }
  };

  // Función para obtener el color de la insignia según la antigüedad
  const getTenureBadgeColor = (tenure: string) => {
    switch (tenure) {
      case "new":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "onboarding":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "loyal":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "legend":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Función para obtener el texto de la antigüedad
  const getTenureText = (tenure: string) => {
    switch (tenure) {
      case "new":
        return "Nuevo";
      case "onboarding":
        return "En onboarding";
      case "loyal":
        return "Leal";
      case "legend":
        return "Leyenda";
      default:
        return tenure;
    }
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='text-3xl font-bold mb-6'>Contactos</h1>
        <div className='flex justify-between mb-6'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-10 w-32' />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Contactos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className='h-16 w-full' />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className='container mx-auto py-10'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Contactos</h1>

      {/* Barra de búsqueda y filtros */}
      <div className='flex flex-col sm:flex-row justify-between gap-4 mb-6'>
        <div className='relative w-full sm:w-64'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar contactos...'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <Filter className='h-4 w-4 mr-2' />
            Filtros
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabla de contactos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contactos ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Antigüedad</TableHead>
                  <TableHead>Membresías</TableHead>
                  <TableHead>Formaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-center py-6 text-muted-foreground'
                    >
                      No se encontraron contactos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.slice(0, 10).map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className='font-medium'>
                        {contact.name}
                      </TableCell>
                      <TableCell>{contact.email || "-"}</TableCell>
                      <TableCell>{contact.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeColor(contact.status)}
                          variant='outline'
                        >
                          {getStatusText(contact.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getTenureBadgeColor(contact.tenure)}
                          variant='outline'
                        >
                          {getTenureText(contact.tenure)}
                        </Badge>
                      </TableCell>
                      <TableCell>{contact.memberships?.length || 0}</TableCell>
                      <TableCell>{contact.trainings?.length || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredContacts.length > 10 && (
            <div className='flex justify-center mt-4'>
              <Button variant='outline' size='sm'>
                Cargar más
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

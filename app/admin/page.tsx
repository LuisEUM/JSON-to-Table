"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./components/user-management";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("users");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Verificar si está cargando o si el usuario no está autenticado
    if (status === "loading") return;

    if (status !== "authenticated") {
      redirect("/auth/signin?callbackUrl=/admin");
    }

    // Verificar si el usuario tiene rol de administrador o empleado
    const userRole = session?.user.role;
    if (userRole === "ADMIN" || userRole === "EMPLOYEE") {
      setIsAuthorized(true);
    } else {
      redirect("/");
    }
  }, [session, status]);

  if (status === "loading" || !isAuthorized) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='container py-10'>
      <h1 className='text-3xl font-bold mb-6'>Panel de Administración</h1>

      <div className='mb-6'>
        <p className='text-muted-foreground'>
          Bienvenido, {session?.user.name} (
          {session?.user.role === "ADMIN" ? "Administrador" : "Empleado"})
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='users'>Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value='views'>Vistas Guardadas</TabsTrigger>
          <TabsTrigger value='stats'>Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios y sus roles. Solo los administradores
                pueden cambiar roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement canEditRoles={session?.user.role === "ADMIN"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='views' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Vistas Guardadas</CardTitle>
              <CardDescription>
                Administra las vistas guardadas por los usuarios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funcionalidad en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='stats' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>
                Visualiza estadísticas de uso de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funcionalidad en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

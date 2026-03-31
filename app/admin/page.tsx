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
} from "@/components/primitives/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/primitives/ui/tabs";
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
    <main className='flex min-h-screen flex-col items-center justify-between p-6'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='container mx-auto py-10'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold mb-2'>Panel de Administración</h1>
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


          </Tabs>
        </div>
      </div>
    </main>
  );
}

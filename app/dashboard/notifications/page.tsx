"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Settings,
  User,
  RefreshCw,
  Filter,
} from "lucide-react";

// Tipos para las notificaciones
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  date: Date;
  read: boolean;
  category: "system" | "contact" | "membership" | "training" | "task";
}

export default function NotificationsPage() {
  // Estado para las notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Sincronización completada",
      message:
        "La sincronización con Holded se ha completado correctamente. Se han actualizado 25 contactos.",
      type: "success",
      date: new Date(2023, 6, 15, 10, 30),
      read: false,
      category: "system",
    },
    {
      id: "2",
      title: "Membresía a punto de vencer",
      message:
        "La membresía de Juan Pérez vence en 7 días. Contacta para renovación.",
      type: "warning",
      date: new Date(2023, 6, 14, 9, 15),
      read: false,
      category: "membership",
    },
    {
      id: "3",
      title: "Nuevo contacto añadido",
      message:
        "Se ha añadido un nuevo contacto: María López. Revisa sus datos para completar la información.",
      type: "info",
      date: new Date(2023, 6, 13, 15, 45),
      read: true,
      category: "contact",
    },
    {
      id: "4",
      title: "Error en la sincronización",
      message:
        "Ha ocurrido un error durante la sincronización. Verifica la conexión con la API de Holded.",
      type: "error",
      date: new Date(2023, 6, 12, 11, 20),
      read: true,
      category: "system",
    },
    {
      id: "5",
      title: "Formación completada",
      message:
        "Carlos Rodríguez ha completado la formación 'Introducción a Holded'. Actualiza su estado.",
      type: "success",
      date: new Date(2023, 6, 11, 16, 30),
      read: true,
      category: "training",
    },
    {
      id: "6",
      title: "Tarea asignada",
      message:
        "Se te ha asignado una nueva tarea: 'Revisar contactos inactivos'. Fecha límite: 20/07/2023.",
      type: "info",
      date: new Date(2023, 6, 10, 14, 0),
      read: false,
      category: "task",
    },
  ]);

  // Estado para las preferencias de notificaciones
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    desktop: false,
    contactUpdates: true,
    membershipAlerts: true,
    trainingNotifications: true,
    systemAlerts: true,
  });

  // Filtros activos
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "info",
    "warning",
    "success",
    "error",
    "system",
    "contact",
    "membership",
    "training",
    "task",
  ]);

  // Función para marcar una notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Función para eliminar una notificación
  const deleteNotification = (id: string) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  // Función para alternar un filtro
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Función para obtener el icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className='h-5 w-5 text-blue-500' />;
      case "warning":
        return <AlertCircle className='h-5 w-5 text-amber-500' />;
      case "success":
        return <CheckCircle2 className='h-5 w-5 text-green-500' />;
      case "error":
        return <AlertCircle className='h-5 w-5 text-red-500' />;
      default:
        return <Bell className='h-5 w-5 text-gray-500' />;
    }
  };

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return (
        "Hoy, " +
        date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffInDays === 1) {
      return (
        "Ayer, " +
        date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString("es-ES");
    }
  };

  // Filtrar notificaciones según los filtros activos
  const filteredNotifications = notifications.filter(
    (notification) =>
      activeFilters.includes(notification.type) &&
      activeFilters.includes(notification.category)
  );

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Notificaciones</h1>

      <Tabs defaultValue='all' className='space-y-6'>
        <div className='flex justify-between items-center'>
          <TabsList>
            <TabsTrigger value='all'>
              Todas{" "}
              <span className='ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'>
                {notifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value='unread'>
              No leídas{" "}
              <span className='ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'>
                {unreadCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value='preferences'>Preferencias</TabsTrigger>
          </TabsList>
          <div className='flex space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todo como leído
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setActiveFilters([
                  "info",
                  "warning",
                  "success",
                  "error",
                  "system",
                  "contact",
                  "membership",
                  "training",
                  "task",
                ])
              }
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Restablecer filtros
            </Button>
          </div>
        </div>

        <TabsContent value='all'>
          <div className='grid gap-6 md:grid-cols-4'>
            {/* Filtros */}
            <Card className='md:col-span-1'>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Filter className='h-5 w-5 mr-2' />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <h3 className='text-sm font-medium'>Tipo</h3>
                  <div className='space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("info") ? "default" : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("info")}
                      >
                        <Info className='h-4 w-4 mr-2 text-blue-500' />
                        Información
                      </Button>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("warning")
                            ? "default"
                            : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("warning")}
                      >
                        <AlertCircle className='h-4 w-4 mr-2 text-amber-500' />
                        Advertencias
                      </Button>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("success")
                            ? "default"
                            : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("success")}
                      >
                        <CheckCircle2 className='h-4 w-4 mr-2 text-green-500' />
                        Éxitos
                      </Button>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("error")
                            ? "default"
                            : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("error")}
                      >
                        <AlertCircle className='h-4 w-4 mr-2 text-red-500' />
                        Errores
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <h3 className='text-sm font-medium'>Categoría</h3>
                  <div className='space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("system")
                            ? "default"
                            : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("system")}
                      >
                        <Settings className='h-4 w-4 mr-2' />
                        Sistema
                      </Button>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("contact")
                            ? "default"
                            : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("contact")}
                      >
                        <User className='h-4 w-4 mr-2' />
                        Contactos
                      </Button>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("membership")
                            ? "default"
                            : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("membership")}
                      >
                        <Calendar className='h-4 w-4 mr-2' />
                        Membresías
                      </Button>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("training")
                            ? "default"
                            : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("training")}
                      >
                        <Calendar className='h-4 w-4 mr-2' />
                        Formaciones
                      </Button>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant={
                          activeFilters.includes("task") ? "default" : "outline"
                        }
                        size='sm'
                        className='w-full justify-start'
                        onClick={() => toggleFilter("task")}
                      >
                        <Clock className='h-4 w-4 mr-2' />
                        Tareas
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de notificaciones */}
            <Card className='md:col-span-3'>
              <CardHeader>
                <CardTitle>Todas las notificaciones</CardTitle>
                <CardDescription>
                  {filteredNotifications.length} notificaciones encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length > 0 ? (
                  <div className='space-y-4'>
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          !notification.read ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className='flex items-start'>
                          <div className='mr-4 mt-0.5'>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className='flex-1'>
                            <div className='flex justify-between items-start'>
                              <h3 className='font-medium'>
                                {notification.title}
                              </h3>
                              <div className='flex items-center space-x-2'>
                                <span className='text-xs text-muted-foreground'>
                                  {formatDate(notification.date)}
                                </span>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-6 w-6'
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>
                            <p className='text-sm text-muted-foreground mt-1'>
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <Button
                                variant='ghost'
                                size='sm'
                                className='mt-2 h-8'
                                onClick={() => markAsRead(notification.id)}
                              >
                                Marcar como leída
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-muted-foreground'>
                    <p>
                      No hay notificaciones que coincidan con los filtros
                      seleccionados
                    </p>
                  </div>
                )}
              </CardContent>
              {filteredNotifications.length > 0 && (
                <CardFooter className='flex justify-center border-t pt-6'>
                  <Button variant='outline'>Cargar más</Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='unread'>
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones no leídas</CardTitle>
              <CardDescription>
                {notifications.filter((n) => !n.read).length} notificaciones sin
                leer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.filter((n) => !n.read).length > 0 ? (
                <div className='space-y-4'>
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className='p-4 rounded-lg border bg-muted/50'
                      >
                        <div className='flex items-start'>
                          <div className='mr-4 mt-0.5'>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className='flex-1'>
                            <div className='flex justify-between items-start'>
                              <h3 className='font-medium'>
                                {notification.title}
                              </h3>
                              <div className='flex items-center space-x-2'>
                                <span className='text-xs text-muted-foreground'>
                                  {formatDate(notification.date)}
                                </span>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-6 w-6'
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>
                            <p className='text-sm text-muted-foreground mt-1'>
                              {notification.message}
                            </p>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='mt-2 h-8'
                              onClick={() => markAsRead(notification.id)}
                            >
                              Marcar como leída
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No tienes notificaciones sin leer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='preferences'>
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Canales de notificación</h3>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='email-notifications'>
                        Notificaciones por email
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Recibe un resumen diario de notificaciones por email
                      </p>
                    </div>
                    <Switch
                      id='email-notifications'
                      checked={preferences.email}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, email: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='push-notifications'>
                        Notificaciones push
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Recibe notificaciones push en tiempo real
                      </p>
                    </div>
                    <Switch
                      id='push-notifications'
                      checked={preferences.push}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, push: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='desktop-notifications'>
                        Notificaciones de escritorio
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Recibe notificaciones en el escritorio mientras usas la
                        aplicación
                      </p>
                    </div>
                    <Switch
                      id='desktop-notifications'
                      checked={preferences.desktop}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, desktop: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Tipos de notificaciones</h3>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='contact-updates'>
                        Actualizaciones de contactos
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones sobre nuevos contactos y actualizaciones
                      </p>
                    </div>
                    <Switch
                      id='contact-updates'
                      checked={preferences.contactUpdates}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          contactUpdates: checked,
                        })
                      }
                    />
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='membership-alerts'>
                        Alertas de membresías
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones sobre vencimientos y renovaciones
                      </p>
                    </div>
                    <Switch
                      id='membership-alerts'
                      checked={preferences.membershipAlerts}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          membershipAlerts: checked,
                        })
                      }
                    />
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='training-notifications'>
                        Notificaciones de formaciones
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Actualizaciones sobre formaciones y cursos
                      </p>
                    </div>
                    <Switch
                      id='training-notifications'
                      checked={preferences.trainingNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          trainingNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='system-alerts'>Alertas del sistema</Label>
                      <p className='text-sm text-muted-foreground'>
                        Notificaciones sobre sincronización y estado del sistema
                      </p>
                    </div>
                    <Switch
                      id='system-alerts'
                      checked={preferences.systemAlerts}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          systemAlerts: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end space-x-2'>
              <Button variant='outline'>Cancelar</Button>
              <Button>Guardar preferencias</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

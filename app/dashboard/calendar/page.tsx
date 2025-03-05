"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Clock,
  Users,
  Tag,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

// Tipos para los eventos
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: "meeting" | "training" | "renewal" | "task" | "other";
  description?: string;
  contacts?: string[];
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTypes, setEventTypes] = useState<string[]>([
    "meeting",
    "training",
    "renewal",
    "task",
  ]);

  // Datos simulados de eventos
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Reunión con Cliente A",
      date: new Date(2023, 6, 15, 10, 0),
      startTime: "10:00",
      endTime: "11:30",
      type: "meeting",
      description: "Revisión de progreso y discusión de próximos pasos",
      contacts: ["Juan Pérez", "María López"],
    },
    {
      id: "2",
      title: "Formación Avanzada",
      date: new Date(2023, 6, 18, 14, 0),
      startTime: "14:00",
      endTime: "17:00",
      type: "training",
      description: "Sesión de formación sobre nuevas funcionalidades",
      contacts: ["Grupo A", "Grupo B"],
    },
    {
      id: "3",
      title: "Renovación Membresía",
      date: new Date(2023, 6, 22),
      type: "renewal",
      description: "Recordatorio de renovación de membresía para Cliente C",
      contacts: ["Carlos Rodríguez"],
    },
    {
      id: "4",
      title: "Seguimiento de Tareas",
      date: new Date(2023, 6, 25, 9, 0),
      startTime: "09:00",
      endTime: "10:00",
      type: "task",
      description: "Revisión de tareas pendientes del equipo",
      contacts: ["Equipo de Desarrollo"],
    },
  ];

  // Función para obtener el color según el tipo de evento
  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500";
      case "training":
        return "bg-green-500";
      case "renewal":
        return "bg-amber-500";
      case "task":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para obtener eventos del día seleccionado
  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  // Función para manejar la selección de un evento
  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventForm(false);
  };

  // Función para crear un nuevo evento
  const handleNewEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  // Función para cambiar el mes
  const changeMonth = (increment: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + increment);
    setDate(newDate);
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Calendario</h1>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Panel lateral izquierdo */}
        <div className='md:col-span-1 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex justify-between items-center mb-4'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => changeMonth(-1)}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <h2 className='text-lg font-medium'>
                  {date.toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => changeMonth(1)}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
              <Calendar
                mode='single'
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className='rounded-md border'
              />
              <div className='mt-4'>
                <Button onClick={handleNewEvent} className='w-full'>
                  <Plus className='mr-2 h-4 w-4' /> Nuevo Evento
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <Label>Tipo de eventos</Label>
                  <div className='mt-2 space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='meeting'
                        checked={eventTypes.includes("meeting")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEventTypes([...eventTypes, "meeting"]);
                          } else {
                            setEventTypes(
                              eventTypes.filter((t) => t !== "meeting")
                            );
                          }
                        }}
                      />
                      <Label htmlFor='meeting' className='flex items-center'>
                        <div className='w-3 h-3 rounded-full bg-blue-500 mr-2'></div>
                        Reuniones
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='training'
                        checked={eventTypes.includes("training")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEventTypes([...eventTypes, "training"]);
                          } else {
                            setEventTypes(
                              eventTypes.filter((t) => t !== "training")
                            );
                          }
                        }}
                      />
                      <Label htmlFor='training' className='flex items-center'>
                        <div className='w-3 h-3 rounded-full bg-green-500 mr-2'></div>
                        Formaciones
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='renewal'
                        checked={eventTypes.includes("renewal")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEventTypes([...eventTypes, "renewal"]);
                          } else {
                            setEventTypes(
                              eventTypes.filter((t) => t !== "renewal")
                            );
                          }
                        }}
                      />
                      <Label htmlFor='renewal' className='flex items-center'>
                        <div className='w-3 h-3 rounded-full bg-amber-500 mr-2'></div>
                        Renovaciones
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='task'
                        checked={eventTypes.includes("task")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEventTypes([...eventTypes, "task"]);
                          } else {
                            setEventTypes(
                              eventTypes.filter((t) => t !== "task")
                            );
                          }
                        }}
                      />
                      <Label htmlFor='task' className='flex items-center'>
                        <div className='w-3 h-3 rounded-full bg-purple-500 mr-2'></div>
                        Tareas
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel principal */}
        <div className='md:col-span-2'>
          <Card className='h-full'>
            <CardHeader className='pb-3'>
              <div className='flex justify-between items-center'>
                <CardTitle>{formatDate(date)}</CardTitle>
                <div className='flex space-x-2'>
                  <Tabs
                    value={view}
                    onValueChange={(v) =>
                      setView(v as "month" | "week" | "day")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value='month'>Mes</TabsTrigger>
                      <TabsTrigger value='week'>Semana</TabsTrigger>
                      <TabsTrigger value='day'>Día</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showEventForm ? (
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Nuevo Evento</h3>
                  <div className='space-y-2'>
                    <Label htmlFor='event-title'>Título</Label>
                    <Input id='event-title' placeholder='Título del evento' />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='event-date'>Fecha</Label>
                      <div className='flex'>
                        <Input
                          id='event-date'
                          type='date'
                          defaultValue={date.toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='event-type'>Tipo</Label>
                      <Select defaultValue='meeting'>
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar tipo' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='meeting'>Reunión</SelectItem>
                          <SelectItem value='training'>Formación</SelectItem>
                          <SelectItem value='renewal'>Renovación</SelectItem>
                          <SelectItem value='task'>Tarea</SelectItem>
                          <SelectItem value='other'>Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='start-time'>Hora inicio</Label>
                      <Input id='start-time' type='time' />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='end-time'>Hora fin</Label>
                      <Input id='end-time' type='time' />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='event-description'>Descripción</Label>
                    <Input
                      id='event-description'
                      placeholder='Descripción del evento'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='event-contacts'>Contactos</Label>
                    <Input id='event-contacts' placeholder='Añadir contactos' />
                  </div>
                  <div className='flex justify-end space-x-2'>
                    <Button
                      variant='outline'
                      onClick={() => setShowEventForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button>Guardar</Button>
                  </div>
                </div>
              ) : selectedEvent ? (
                <div className='space-y-4'>
                  <div className='flex justify-between items-start'>
                    <h3 className='text-xl font-medium'>
                      {selectedEvent.title}
                    </h3>
                    <Button variant='ghost' size='icon'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='flex items-center text-muted-foreground'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    <span>
                      {selectedEvent.date.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {selectedEvent.startTime && (
                    <div className='flex items-center text-muted-foreground'>
                      <Clock className='mr-2 h-4 w-4' />
                      <span>
                        {selectedEvent.startTime} -{" "}
                        {selectedEvent.endTime || "Sin hora de fin"}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center'>
                    <Tag className='mr-2 h-4 w-4 text-muted-foreground' />
                    <span
                      className={`px-2 py-1 rounded-full text-xs text-white ${getEventColor(
                        selectedEvent.type
                      )}`}
                    >
                      {selectedEvent.type === "meeting"
                        ? "Reunión"
                        : selectedEvent.type === "training"
                        ? "Formación"
                        : selectedEvent.type === "renewal"
                        ? "Renovación"
                        : selectedEvent.type === "task"
                        ? "Tarea"
                        : "Otro"}
                    </span>
                  </div>
                  {selectedEvent.description && (
                    <div className='pt-2 border-t'>
                      <p className='text-sm'>{selectedEvent.description}</p>
                    </div>
                  )}
                  {selectedEvent.contacts &&
                    selectedEvent.contacts.length > 0 && (
                      <div className='pt-2 border-t'>
                        <div className='flex items-start'>
                          <Users className='mr-2 h-4 w-4 text-muted-foreground mt-0.5' />
                          <div>
                            <p className='text-sm font-medium'>Contactos</p>
                            <ul className='text-sm text-muted-foreground'>
                              {selectedEvent.contacts.map((contact, index) => (
                                <li key={index}>{contact}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  <div className='flex justify-end space-x-2 pt-4'>
                    <Button
                      variant='outline'
                      onClick={() => setSelectedEvent(null)}
                    >
                      Cerrar
                    </Button>
                    <Button>Editar</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className='text-lg font-medium mb-4'>Eventos para hoy</h3>
                  {getEventsForDate(date).length > 0 ? (
                    <div className='space-y-3'>
                      {getEventsForDate(date)
                        .filter((event) => eventTypes.includes(event.type))
                        .map((event) => (
                          <div
                            key={event.id}
                            className='flex items-center p-3 rounded-lg border hover:bg-muted/50 cursor-pointer'
                            onClick={() => handleEventSelect(event)}
                          >
                            <div
                              className={`w-4 h-4 rounded-full ${getEventColor(
                                event.type
                              )} mr-3`}
                            ></div>
                            <div className='flex-1'>
                              <h4 className='font-medium'>{event.title}</h4>
                              {event.startTime && (
                                <p className='text-sm text-muted-foreground'>
                                  {event.startTime} -{" "}
                                  {event.endTime || "Sin hora de fin"}
                                </p>
                              )}
                            </div>
                            <Button variant='ghost' size='icon'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <p>No hay eventos programados para este día</p>
                      <Button
                        variant='outline'
                        className='mt-4'
                        onClick={handleNewEvent}
                      >
                        <Plus className='mr-2 h-4 w-4' /> Añadir evento
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

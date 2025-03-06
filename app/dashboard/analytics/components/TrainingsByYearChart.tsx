"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import ContactDetailModal, { Contact } from "./ContactDetailModal";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrainingsByYearChartProps {
  data: {
    year: string;
    completed: number;
    inProgress: number;
    pending: number;
  }[];
  contactsByCategory?: {
    completed: Record<string, Contact[]>;
    inProgress: Record<string, Contact[]>;
    pending: Record<string, Contact[]>;
  };
  title?: string;
  trainingDescriptions?: {
    completed?: string;
    inProgress?: string;
    pending?: string;
  };
}

export default function TrainingsByYearChart({
  data,
  contactsByCategory = { completed: {}, inProgress: {}, pending: {} },
  title = "Formaciones por Año",
  trainingDescriptions = {
    completed: "Formaciones que han sido completadas por los contactos.",
    inProgress: "Formaciones que están siendo realizadas actualmente.",
    pending: "Formaciones que aún no han sido iniciadas por los contactos.",
  },
}: TrainingsByYearChartProps) {
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({
    completed: true,
    inProgress: true,
    pending: true,
  });
  const [chartHeight, setChartHeight] = useState(400);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para controlar si todas las leyendas están visibles o no
  const [allLegendsVisible, setAllLegendsVisible] = useState(true);

  // Ajustar la altura del gráfico según el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setChartHeight(300);
      } else if (window.innerWidth < 1024) {
        setChartHeight(350);
      } else {
        setChartHeight(400);
      }
    };

    // Configurar la altura inicial
    handleResize();

    // Añadir listener para cambios de tamaño
    window.addEventListener("resize", handleResize);

    // Limpiar listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLegendClick = (dataKey: string) => {
    setActiveLines({
      ...activeLines,
      [dataKey]: !activeLines[dataKey as keyof typeof activeLines],
    });
  };

  // Función para mostrar/ocultar todas las leyendas
  const toggleAllLegends = () => {
    const newVisibility = !allLegendsVisible;
    setAllLegendsVisible(newVisibility);

    setActiveLines({
      completed: newVisibility,
      inProgress: newVisibility,
      pending: newVisibility,
    });
  };

  // Obtener años únicos para los acordeones
  const years = [...new Set(data.map((item) => item.year))];

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  // Función personalizada para el tooltip del gráfico
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltipContent = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border rounded-md shadow-md'>
          <p className='text-gray-700 font-medium mb-1'>Año: {label}</p>
          {payload.map((entry, index: number) => {
            const trainingKey =
              entry.dataKey as keyof typeof trainingDescriptions;
            return (
              <div key={`item-${index}`} className='flex flex-col mb-1'>
                <div className='flex items-center'>
                  <div
                    className='w-2 h-2 rounded-full mr-2'
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span
                    className='text-sm font-medium'
                    style={{ color: entry.color }}
                  >
                    {entry.name}: {entry.value}
                  </span>
                </div>
                {trainingDescriptions[trainingKey] && (
                  <p className='text-xs text-gray-500 ml-4 mt-1 max-w-xs'>
                    {trainingDescriptions[trainingKey]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 px-4 py-4 sm:px-6'>
        <CardTitle className='text-lg sm:text-xl'>{title}</CardTitle>
        <Button
          variant='outline'
          size='sm'
          onClick={toggleAllLegends}
          className='w-full sm:w-auto'
        >
          {Object.values(activeLines).every(Boolean) ? (
            <>
              <EyeOff className='h-4 w-4 mr-2' />
              <span>Ocultar series</span>
            </>
          ) : (
            <>
              <Eye className='h-4 w-4 mr-2' />
              <span>Mostrar series</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className='px-2 sm:px-6 pb-6'>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
              barGap={window.innerWidth < 640 ? 2 : 4}
              barSize={window.innerWidth < 640 ? 15 : 20}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='year'
                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                tickMargin={8}
              />
              <YAxis
                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                width={window.innerWidth < 640 ? 25 : 35}
              />
              <Tooltip content={<CustomTooltipContent />} />
              <Legend
                onClick={(e) => {
                  if (e.dataKey) {
                    handleLegendClick(e.dataKey.toString());
                  }
                }}
                formatter={(value) => {
                  return <span className='text-xs sm:text-sm'>{value}</span>;
                }}
                wrapperStyle={{
                  paddingTop: 10,
                  fontSize: window.innerWidth < 640 ? 10 : 12,
                }}
              />
              {activeLines.completed && (
                <Bar
                  dataKey='completed'
                  name='Completadas'
                  fill='#4ade80'
                  radius={[4, 4, 0, 0]}
                />
              )}
              {activeLines.inProgress && (
                <Bar
                  dataKey='inProgress'
                  name='En Progreso'
                  fill='#60a5fa'
                  radius={[4, 4, 0, 0]}
                />
              )}
              {activeLines.pending && (
                <Bar
                  dataKey='pending'
                  name='Pendientes'
                  fill='#f97316'
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='mt-4 md:mt-6'>
          <div className='bg-muted/30 p-3 rounded-md mb-4'>
            <h4 className='font-medium mb-2'>Leyenda de estados:</h4>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='flex items-center'>
                <div className='w-3 h-3 rounded-full bg-[#4ade80] mr-2'></div>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span className='text-sm cursor-help'>Completadas</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        {trainingDescriptions.completed}
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className='flex items-center'>
                <div className='w-3 h-3 rounded-full bg-[#60a5fa] mr-2'></div>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span className='text-sm cursor-help'>En Progreso</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        {trainingDescriptions.inProgress}
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className='flex items-center'>
                <div className='w-3 h-3 rounded-full bg-[#f97316] mr-2'></div>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span className='text-sm cursor-help'>Pendientes</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>{trainingDescriptions.pending}</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <Accordion type='single' collapsible className='w-full'>
            {years.map((year) => (
              <AccordionItem key={year} value={year}>
                <AccordionTrigger className='py-3 px-2 sm:px-4 hover:no-underline hover:bg-gray-50 rounded-md'>
                  <div className='flex items-center'>
                    <span className='text-sm sm:text-base'>
                      Formaciones {year}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-2 sm:px-4'>
                  <div className='space-y-4 mt-2'>
                    {/* Completadas */}
                    <div>
                      <div className='flex items-center mb-2'>
                        <div className='w-3 h-3 rounded-full bg-[#4ade80] mr-2'></div>
                        <span className='font-medium text-sm sm:text-base'>
                          Completadas
                        </span>
                        <Badge className='ml-2 bg-[#4ade80] text-xs'>
                          {contactsByCategory.completed[year]?.length || 0}
                        </Badge>
                      </div>
                      <div className='space-y-2 pl-3 sm:pl-5'>
                        {contactsByCategory.completed[year]?.length > 0 ? (
                          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                            {contactsByCategory.completed[year].map(
                              (contact) => (
                                <div
                                  key={contact.id}
                                  className='p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors'
                                  onClick={() => handleContactClick(contact)}
                                >
                                  <div className='font-medium truncate'>
                                    {contact.name}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {contact.status || "N/A"}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className='text-sm text-gray-500 p-2'>
                            No hay contactos con formaciones completadas
                          </div>
                        )}
                      </div>
                    </div>

                    {/* En Progreso */}
                    <div>
                      <div className='flex items-center mb-2'>
                        <div className='w-3 h-3 rounded-full bg-[#60a5fa] mr-2'></div>
                        <span className='font-medium text-sm sm:text-base'>
                          En Progreso
                        </span>
                        <Badge className='ml-2 bg-[#60a5fa] text-xs'>
                          {contactsByCategory.inProgress[year]?.length || 0}
                        </Badge>
                      </div>
                      <div className='space-y-2 pl-3 sm:pl-5'>
                        {contactsByCategory.inProgress[year]?.length > 0 ? (
                          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                            {contactsByCategory.inProgress[year].map(
                              (contact) => (
                                <div
                                  key={contact.id}
                                  className='p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors'
                                  onClick={() => handleContactClick(contact)}
                                >
                                  <div className='font-medium truncate'>
                                    {contact.name}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {contact.status || "N/A"}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className='text-sm text-gray-500 p-2'>
                            No hay contactos con formaciones en progreso
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pendientes */}
                    <div>
                      <div className='flex items-center mb-2'>
                        <div className='w-3 h-3 rounded-full bg-[#f97316] mr-2'></div>
                        <span className='font-medium text-sm sm:text-base'>
                          Pendientes
                        </span>
                        <Badge className='ml-2 bg-[#f97316] text-xs'>
                          {contactsByCategory.pending[year]?.length || 0}
                        </Badge>
                      </div>
                      <div className='space-y-2 pl-3 sm:pl-5'>
                        {contactsByCategory.pending[year]?.length > 0 ? (
                          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                            {contactsByCategory.pending[year].map((contact) => (
                              <div
                                key={contact.id}
                                className='p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors'
                                onClick={() => handleContactClick(contact)}
                              >
                                <div className='font-medium truncate'>
                                  {contact.name}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {contact.status || "N/A"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='text-sm text-gray-500 p-2'>
                            No hay contactos con formaciones pendientes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>

      <ContactDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contact={selectedContact}
      />
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
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
import { Info } from "lucide-react";
import ContactDetailModal, { Contact } from "./ContactDetailModal";
import {
  TooltipProvider,
  Tooltip as CustomTooltip,
} from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Payload } from "recharts/types/component/DefaultLegendContent";

interface TenurePieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
    key?: string;
    description?: string;
  }[];
  contactsByCategory?: Record<string, Contact[]>;
  title?: string;
}

// Define reusable interfaces for the chart
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      color: string;
      key?: string;
      description?: string;
    };
  }>;
}

export default function TenurePieChart({
  data,
  contactsByCategory = {},
  title = "Distribución por Antigüedad",
}: TenurePieChartProps) {
  const [activeSegments, setActiveSegments] = useState<Record<string, boolean>>(
    data.reduce((acc, item) => ({ ...acc, [item.name]: true }), {})
  );

  // Estado para controlar si todas las leyendas están visibles o no
  const [allLegendsVisible, setAllLegendsVisible] = useState(true);

  // Estado para controlar el tamaño del gráfico en dispositivos móviles
  const [chartSize, setChartSize] = useState({ height: 400, outerRadius: 150 });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ajustar el tamaño del gráfico según el tamaño de la pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setChartSize({ height: 300, outerRadius: 100 });
      } else if (window.innerWidth < 1024) {
        setChartSize({ height: 350, outerRadius: 130 });
      } else {
        setChartSize({ height: 400, outerRadius: 150 });
      }
    };

    // Configurar el tamaño inicial
    handleResize();

    // Añadir listener para cambios de tamaño
    window.addEventListener("resize", handleResize);

    // Limpiar listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLegendClick = (entry: Payload) => {
    if (entry && entry.value) {
      setActiveSegments({
        ...activeSegments,
        [entry.value]: !activeSegments[entry.value],
      });
    }
  };

  // Función para mostrar/ocultar todas las leyendas
  const toggleAllLegends = () => {
    const newVisibility = !allLegendsVisible;
    setAllLegendsVisible(newVisibility);

    const updatedSegments = { ...activeSegments };
    Object.keys(updatedSegments).forEach((key) => {
      updatedSegments[key] = newVisibility;
    });

    setActiveSegments(updatedSegments);
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const filteredData = data.filter((item) => activeSegments[item.name]);

  // Función personalizada para el renderizado del contenido del tooltip
  const CustomTooltipContent = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-3 border rounded-md shadow-md'>
          <p className='font-semibold'>{data.name}</p>
          <p className='text-gray-600'>{`${data.value} contactos`}</p>
          {data.description && (
            <p className='text-xs mt-1 max-w-xs text-gray-500'>
              {data.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className='w-full h-full'>
      <CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 px-4 py-4 sm:px-6'>
        <CardTitle className='text-lg sm:text-xl'>{title}</CardTitle>
        <Button
          variant='outline'
          size='sm'
          onClick={toggleAllLegends}
          className='w-full sm:w-auto'
        >
          {Object.values(activeSegments).every(Boolean)
            ? "Ocultar series"
            : "Mostrar series"}
        </Button>
      </CardHeader>
      <CardContent className='px-2 sm:px-6 pb-6'>
        <div style={{ height: chartSize.height }}>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={filteredData}
                cx='50%'
                cy='50%'
                labelLine={window.innerWidth >= 640}
                outerRadius={chartSize.outerRadius}
                fill='#8884d8'
                dataKey='value'
                nameKey='name'
                label={({ name, percent }) =>
                  window.innerWidth < 640
                    ? `${(percent * 100).toFixed(0)}%`
                    : `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipContent />} />
              <Legend
                onClick={handleLegendClick}
                formatter={(value) => {
                  return <span className='text-xs sm:text-sm'>{value}</span>;
                }}
                layout={window.innerWidth < 640 ? "horizontal" : "vertical"}
                verticalAlign={window.innerWidth < 640 ? "bottom" : "middle"}
                align={window.innerWidth < 640 ? "center" : "right"}
                wrapperStyle={{
                  fontSize: window.innerWidth < 640 ? 10 : 12,
                  paddingLeft: window.innerWidth < 640 ? 0 : 20,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='mt-4 md:mt-6'>
          <Accordion type='single' collapsible className='w-full'>
            {data.map((item) => {
              const categoryKey = item.key || item.name;
              const contacts = contactsByCategory[categoryKey] || [];

              return (
                <AccordionItem key={item.name} value={item.name}>
                  <AccordionTrigger className='py-3 px-2 sm:px-4 hover:no-underline hover:bg-gray-50 rounded-md'>
                    <div className='flex items-center'>
                      <div
                        className='w-3 h-3 rounded-full mr-2'
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className='text-sm sm:text-base'>{item.name}</span>
                      <Badge
                        className='ml-2 text-xs'
                        style={{ backgroundColor: item.color }}
                      >
                        {contacts.length}
                      </Badge>
                      {item.description && (
                        <TooltipProvider>
                          <CustomTooltip>
                            <TooltipTrigger asChild>
                              <Info className='h-4 w-4 ml-2 text-gray-400 cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className='max-w-xs text-xs'>
                                {item.description}
                              </p>
                            </TooltipContent>
                          </CustomTooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-2 sm:px-4'>
                    <div className='space-y-2 mt-2'>
                      {contacts.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                          {contacts.map((contact) => (
                            <div
                              key={contact.id}
                              className='p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors'
                              onClick={() => handleContactClick(contact)}
                            >
                              <div className='font-medium truncate'>
                                {contact.name}
                              </div>
                              {contact.status && (
                                <div className='text-xs text-gray-500 truncate'>
                                  {contact.status}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-sm text-gray-500 p-2'>
                          No hay contactos en esta categoría
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
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

"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Info } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ContactDetailModal, {
  Contact as ModalContact,
} from "./ContactDetailModal";

interface ChartContact {
  id: string;
  name: string;
  status?: string;
  [key: string]: string | number | boolean | undefined; // More specific than any
}

interface MembershipTrendsChartProps {
  data: {
    date: string;
    active: number;
    expiringSoon: number;
    inactive: number;
  }[];
  contactsByCategory?: {
    active: ChartContact[];
    expiringSoon: ChartContact[];
    inactive: ChartContact[];
  };
  title?: string;
  dateRange?: {
    minDate: string | null;
    maxDate: string | null;
  };
  statusDescriptions?: {
    active?: string;
    expiringSoon?: string;
    inactive?: string;
  };
}

export default function MembershipTrendsChart({
  data,
  contactsByCategory = { active: [], expiringSoon: [], inactive: [] },
  title = "Tendencia de Membresías",
  dateRange,
  statusDescriptions = {
    active: "Contactos con servicios activos dentro del periodo contratado.",
    expiringSoon:
      "Contactos con servicios activos próximos a expirar (menos de 30 días).",
    inactive: "Contactos sin servicios activos o con servicios expirados.",
  },
}: MembershipTrendsChartProps) {
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({
    active: true,
    expiringSoon: true,
    inactive: true,
  });

  // Estado para controlar si todas las leyendas están visibles o no
  const [allLegendsVisible, setAllLegendsVisible] = useState(true);

  // Estado para controlar la altura del gráfico en dispositivos móviles
  const [chartHeight, setChartHeight] = useState(400);

  const [selectedContact, setSelectedContact] = useState<ChartContact | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formatear el rango de fechas para mostrar
  const formattedDateRange = React.useMemo(() => {
    if (!dateRange) return null;

    const { minDate, maxDate } = dateRange;
    if (!minDate || !maxDate) return null;

    try {
      const minDateObj = parseISO(minDate);
      const maxDateObj = parseISO(maxDate);

      if (!isValid(minDateObj) || !isValid(maxDateObj)) return null;

      return {
        start: format(minDateObj, "dd 'de' MMMM 'de' yyyy", { locale: es }),
        end: format(maxDateObj, "dd 'de' MMMM 'de' yyyy", { locale: es }),
      };
    } catch (error) {
      console.error("Error al formatear fechas:", error);
      return null;
    }
  }, [dateRange]);

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
      active: newVisibility,
      expiringSoon: newVisibility,
      inactive: newVisibility,
    });
  };

  const handleContactClick = (contact: ChartContact) => {
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
          <p className='text-gray-700 font-medium mb-1'>{label}</p>
          {payload.map((entry, index: number) => {
            const statusKey = entry.dataKey as keyof typeof statusDescriptions;
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
                {statusDescriptions[statusKey] && (
                  <p className='text-xs text-gray-500 ml-4 mt-1 max-w-xs'>
                    {statusDescriptions[statusKey]}
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
      <CardHeader className='flex flex-col space-y-2 px-4 py-4 sm:px-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between w-full'>
          <CardTitle className='text-lg sm:text-xl'>{title}</CardTitle>
          <Button
            variant='outline'
            size='sm'
            onClick={toggleAllLegends}
            className='w-full sm:w-auto mt-2 sm:mt-0'
          >
            {allLegendsVisible ? (
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
        </div>
        {formattedDateRange && (
          <CardDescription className='flex items-center'>
            <Info className='h-4 w-4 mr-1 text-muted-foreground' />
            <span>
              Mostrando datos desde {formattedDateRange.start} hasta{" "}
              {formattedDateRange.end}
            </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className='px-2 sm:px-6 pb-6'>
        <div className={`h-[${chartHeight}px]`} style={{ height: chartHeight }}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
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
              {activeLines.active && (
                <Line
                  type='monotone'
                  dataKey='active'
                  stroke='#4ade80'
                  name='Activas'
                  strokeWidth={2}
                  activeDot={{ r: window.innerWidth < 640 ? 6 : 8 }}
                />
              )}
              {activeLines.expiringSoon && (
                <Line
                  type='monotone'
                  dataKey='expiringSoon'
                  stroke='#FB923C'
                  name='Por Expirar'
                  strokeWidth={2}
                  activeDot={{ r: window.innerWidth < 640 ? 6 : 8 }}
                />
              )}
              {activeLines.inactive && (
                <Line
                  type='monotone'
                  dataKey='inactive'
                  stroke='#f87171'
                  name='Inactivas'
                  strokeWidth={2}
                  activeDot={{ r: window.innerWidth < 640 ? 6 : 8 }}
                />
              )}
            </LineChart>
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
                      <span className='text-sm cursor-help'>Activas</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>{statusDescriptions.active}</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className='flex items-center'>
                <div className='w-3 h-3 rounded-full bg-[#FB923C] mr-2'></div>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span className='text-sm cursor-help'>Por Expirar</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        {statusDescriptions.expiringSoon}
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <div className='flex items-center'>
                <div className='w-3 h-3 rounded-full bg-[#f87171] mr-2'></div>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span className='text-sm cursor-help'>Inactivas</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>{statusDescriptions.inactive}</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='active'>
              <AccordionTrigger className='py-3 px-2 sm:px-4 hover:no-underline hover:bg-gray-50 rounded-md'>
                <div className='flex items-center'>
                  <div className='w-3 h-3 rounded-full bg-[#4ade80] mr-2'></div>
                  <span className='text-sm sm:text-base'>
                    Membresías Activas
                  </span>
                  <Badge className='ml-2 bg-[#4ade80] text-xs'>
                    {contactsByCategory.active.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-2 sm:px-4'>
                <div className='space-y-2 mt-2'>
                  {contactsByCategory.active.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                      {contactsByCategory.active.map((contact) => (
                        <div
                          key={contact.id}
                          className='p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors'
                          onClick={() => handleContactClick(contact)}
                        >
                          <div className='font-medium truncate'>
                            {contact.name}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {contact.status || "active"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-sm text-gray-500 p-2'>
                      No hay contactos con membresías activas
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='expiringSoon'>
              <AccordionTrigger className='py-3 px-2 sm:px-4 hover:no-underline hover:bg-gray-50 rounded-md'>
                <div className='flex items-center'>
                  <div className='w-3 h-3 rounded-full bg-[#FB923C] mr-2'></div>
                  <span className='text-sm sm:text-base'>
                    Membresías Por Expirar
                  </span>
                  <Badge className='ml-2 bg-[#FB923C] text-xs'>
                    {contactsByCategory.expiringSoon.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-2 sm:px-4'>
                <div className='space-y-2 mt-2'>
                  {contactsByCategory.expiringSoon.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                      {contactsByCategory.expiringSoon.map((contact) => (
                        <div
                          key={contact.id}
                          className='p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors'
                          onClick={() => handleContactClick(contact)}
                        >
                          <div className='font-medium truncate'>
                            {contact.name}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {contact.status || "pre-deactivation"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-sm text-gray-500 p-2'>
                      No hay contactos con membresías por expirar
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='inactive'>
              <AccordionTrigger className='py-3 px-2 sm:px-4 hover:no-underline hover:bg-gray-50 rounded-md'>
                <div className='flex items-center'>
                  <div className='w-3 h-3 rounded-full bg-[#f87171] mr-2'></div>
                  <span className='text-sm sm:text-base'>
                    Membresías Inactivas
                  </span>
                  <Badge className='ml-2 bg-[#f87171] text-xs'>
                    {contactsByCategory.inactive.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-2 sm:px-4'>
                <div className='space-y-2 mt-2'>
                  {contactsByCategory.inactive.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'>
                      {contactsByCategory.inactive.map((contact) => (
                        <div
                          key={contact.id}
                          className='p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors'
                          onClick={() => handleContactClick(contact)}
                        >
                          <div className='font-medium truncate'>
                            {contact.name}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {contact.status || "inactive"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-sm text-gray-500 p-2'>
                      No hay contactos con membresías inactivas
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>

      <ContactDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contact={selectedContact as unknown as ModalContact}
      />
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Download,
  FileText,
  BarChart,
  PieChart,
  Calendar,
  Users,
} from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("contacts");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [reportName, setReportName] = useState("");
  const [reportFormat, setReportFormat] = useState("pdf");

  // Opciones de campos según el tipo de informe
  const fieldOptions = {
    contacts: [
      { id: "name", label: "Nombre" },
      { id: "email", label: "Email" },
      { id: "phone", label: "Teléfono" },
      { id: "status", label: "Estado" },
      { id: "tenure", label: "Antigüedad" },
      { id: "memberships", label: "Membresías" },
      { id: "trainings", label: "Formaciones" },
    ],
    memberships: [
      { id: "name", label: "Nombre" },
      { id: "status", label: "Estado" },
      { id: "startDate", label: "Fecha de inicio" },
      { id: "endDate", label: "Fecha de fin" },
      { id: "type", label: "Tipo" },
      { id: "contactName", label: "Nombre de contacto" },
    ],
    trainings: [
      { id: "name", label: "Nombre" },
      { id: "status", label: "Estado" },
      { id: "startDate", label: "Fecha de inicio" },
      { id: "endDate", label: "Fecha de fin" },
      { id: "contactName", label: "Nombre de contacto" },
    ],
  };

  // Manejar cambio en la selección de campos
  const handleFieldChange = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldId]);
    } else {
      setSelectedFields(selectedFields.filter((id) => id !== fieldId));
    }
  };

  // Manejar generación de informe
  const handleGenerateReport = () => {
    // Aquí iría la lógica para generar el informe
    console.log({
      type: reportType,
      dateRange,
      fields: selectedFields,
      name: reportName,
      format: reportFormat,
    });
    alert("Informe generado con éxito");
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Informes</h1>

      <Tabs defaultValue='generate' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='generate'>Generar Informe</TabsTrigger>
          <TabsTrigger value='saved'>Informes Guardados</TabsTrigger>
          <TabsTrigger value='scheduled'>Informes Programados</TabsTrigger>
        </TabsList>

        <TabsContent value='generate'>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Configuración del informe */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Informe</CardTitle>
                <CardDescription>
                  Personaliza los parámetros para generar tu informe
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Nombre del informe */}
                <div className='space-y-2'>
                  <Label htmlFor='report-name'>Nombre del informe</Label>
                  <Input
                    id='report-name'
                    placeholder='Ej: Informe mensual de contactos'
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>

                {/* Tipo de informe */}
                <div className='space-y-2'>
                  <Label>Tipo de informe</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecciona un tipo' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='contacts'>Contactos</SelectItem>
                      <SelectItem value='memberships'>Membresías</SelectItem>
                      <SelectItem value='trainings'>Formaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rango de fechas */}
                <div className='space-y-2'>
                  <Label>Rango de fechas</Label>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <div className='flex-1'>
                      <Label htmlFor='from-date' className='text-xs'>
                        Desde
                      </Label>
                      <DatePicker
                        selected={dateRange.from}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, from: date })
                        }
                      />
                    </div>
                    <div className='flex-1'>
                      <Label htmlFor='to-date' className='text-xs'>
                        Hasta
                      </Label>
                      <DatePicker
                        selected={dateRange.to}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, to: date })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Formato del informe */}
                <div className='space-y-2'>
                  <Label>Formato</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecciona un formato' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='pdf'>PDF</SelectItem>
                      <SelectItem value='excel'>Excel</SelectItem>
                      <SelectItem value='csv'>CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Selección de campos */}
            <Card>
              <CardHeader>
                <CardTitle>Campos a incluir</CardTitle>
                <CardDescription>
                  Selecciona los campos que deseas incluir en el informe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {fieldOptions[reportType as keyof typeof fieldOptions].map(
                    (field) => (
                      <div
                        key={field.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={(checked) =>
                            handleFieldChange(field.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={field.id}>{field.label}</Label>
                      </div>
                    )
                  )}
                </div>

                <div className='mt-6'>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={selectedFields.length === 0 || !reportName}
                  >
                    Generar Informe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='saved'>
          <Card>
            <CardHeader>
              <CardTitle>Informes Guardados</CardTitle>
              <CardDescription>
                Accede a los informes que has generado anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {/* Informe guardado 1 */}
                <Card>
                  <CardHeader className='pb-2'>
                    <div className='flex justify-between items-start'>
                      <CardTitle className='text-base'>
                        Informe de Contactos Activos
                      </CardTitle>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <CardDescription>Generado el 15/05/2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center text-sm text-muted-foreground'>
                        <Users className='h-4 w-4 mr-1' />
                        <span>352 contactos</span>
                      </div>
                      <Button variant='ghost' size='sm'>
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Informe guardado 2 */}
                <Card>
                  <CardHeader className='pb-2'>
                    <div className='flex justify-between items-start'>
                      <CardTitle className='text-base'>
                        Membresías por Vencer
                      </CardTitle>
                      <BarChart className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <CardDescription>Generado el 01/06/2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center text-sm text-muted-foreground'>
                        <Calendar className='h-4 w-4 mr-1' />
                        <span>Último trimestre</span>
                      </div>
                      <Button variant='ghost' size='sm'>
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Informe guardado 3 */}
                <Card>
                  <CardHeader className='pb-2'>
                    <div className='flex justify-between items-start'>
                      <CardTitle className='text-base'>
                        Formaciones Completadas
                      </CardTitle>
                      <PieChart className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <CardDescription>Generado el 10/06/2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center text-sm text-muted-foreground'>
                        <Calendar className='h-4 w-4 mr-1' />
                        <span>Año 2023</span>
                      </div>
                      <Button variant='ghost' size='sm'>
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='scheduled'>
          <Card>
            <CardHeader>
              <CardTitle>Informes Programados</CardTitle>
              <CardDescription>
                Gestiona los informes que se generan automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-6'>
                <p className='text-muted-foreground'>
                  No tienes informes programados actualmente.
                </p>
                <Button className='mt-4'>Programar un informe</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

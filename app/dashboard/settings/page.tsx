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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  CheckCircle2,
  Key,
  User,
  Bell,
  Database,
  Shield,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  // Estados para las diferentes configuraciones
  const [apiKey, setApiKey] = useState("");
  const [testApiStatus, setTestApiStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [syncFrequency, setSyncFrequency] = useState("daily");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [language, setLanguage] = useState("es");
  const [theme, setTheme] = useState("light");
  const [dataRetention, setDataRetention] = useState("90");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Función para probar la conexión con la API de Holded
  const testApiConnection = async () => {
    if (!apiKey.trim()) {
      setTestApiStatus("error");
      return;
    }

    setTestApiStatus("loading");

    // Simular una petición a la API
    setTimeout(() => {
      // En un caso real, aquí se haría una petición a la API
      const success = Math.random() > 0.3; // Simular éxito o error
      setTestApiStatus(success ? "success" : "error");
    }, 1500);
  };

  // Función para guardar la configuración
  const saveSettings = () => {
    // Aquí iría la lógica para guardar la configuración
    alert("Configuración guardada con éxito");
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Configuración</h1>

      <Tabs defaultValue='api' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='api'>API de Holded</TabsTrigger>
          <TabsTrigger value='sync'>Sincronización</TabsTrigger>
          <TabsTrigger value='notifications'>Notificaciones</TabsTrigger>
          <TabsTrigger value='preferences'>Preferencias</TabsTrigger>
        </TabsList>

        {/* Configuración de la API de Holded */}
        <TabsContent value='api'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Key className='h-5 w-5 mr-2' />
                Configuración de la API de Holded
              </CardTitle>
              <CardDescription>
                Configura la conexión con la API de Holded para sincronizar los
                datos
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='api-key'>Clave de API</Label>
                <div className='flex gap-2'>
                  <Input
                    id='api-key'
                    type='password'
                    placeholder='Introduce tu clave de API de Holded'
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button
                    onClick={testApiConnection}
                    disabled={testApiStatus === "loading"}
                  >
                    {testApiStatus === "loading"
                      ? "Probando..."
                      : "Probar conexión"}
                  </Button>
                </div>

                {testApiStatus === "success" && (
                  <Alert
                    variant='default'
                    className='bg-green-50 border-green-200'
                  >
                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                    <AlertTitle className='text-green-600'>
                      Conexión exitosa
                    </AlertTitle>
                    <AlertDescription className='text-green-600'>
                      La conexión con la API de Holded se ha establecido
                      correctamente.
                    </AlertDescription>
                  </Alert>
                )}

                {testApiStatus === "error" && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Error de conexión</AlertTitle>
                    <AlertDescription>
                      No se ha podido establecer conexión con la API de Holded.
                      Verifica tu clave de API.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className='space-y-2'>
                <Label>Información de la API</Label>
                <div className='rounded-md bg-muted p-4 text-sm'>
                  <p>Para obtener tu clave de API de Holded:</p>
                  <ol className='list-decimal list-inside space-y-1 mt-2'>
                    <li>Inicia sesión en tu cuenta de Holded</li>
                    <li>Ve a Configuración &gt; Integraciones &gt; API</li>
                    <li>Genera una nueva clave de API</li>
                    <li>Copia la clave y pégala en el campo de arriba</li>
                  </ol>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Guardar configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de sincronización */}
        <TabsContent value='sync'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Database className='h-5 w-5 mr-2' />
                Configuración de sincronización
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo se sincronizan los datos con Holded
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='sync-frequency'>
                  Frecuencia de sincronización
                </Label>
                <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                  <SelectTrigger id='sync-frequency'>
                    <SelectValue placeholder='Selecciona la frecuencia' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='hourly'>Cada hora</SelectItem>
                    <SelectItem value='daily'>Diariamente</SelectItem>
                    <SelectItem value='weekly'>Semanalmente</SelectItem>
                    <SelectItem value='manual'>Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='data-retention'>Retención de datos</Label>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger id='data-retention'>
                    <SelectValue placeholder='Selecciona el período' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='30'>30 días</SelectItem>
                    <SelectItem value='90'>90 días</SelectItem>
                    <SelectItem value='180'>6 meses</SelectItem>
                    <SelectItem value='365'>1 año</SelectItem>
                    <SelectItem value='unlimited'>Ilimitado</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-sm text-muted-foreground'>
                  Los datos más antiguos que el período seleccionado se
                  eliminarán automáticamente.
                </p>
              </div>

              <Separator />

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='sync-now'>Sincronización manual</Label>
                  <Button id='sync-now' variant='outline'>
                    Sincronizar ahora
                  </Button>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Última sincronización: 15/06/2023 10:45
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Guardar configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Configuración de notificaciones */}
        <TabsContent value='notifications'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Bell className='h-5 w-5 mr-2' />
                Configuración de notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='email-notifications'>
                    Notificaciones por email
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Recibe notificaciones importantes por email
                  </p>
                </div>
                <Switch
                  id='email-notifications'
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='browser-notifications'>
                    Notificaciones del navegador
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Recibe notificaciones en el navegador mientras usas la
                    aplicación
                  </p>
                </div>
                <Switch
                  id='browser-notifications'
                  checked={browserNotifications}
                  onCheckedChange={setBrowserNotifications}
                />
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label>Eventos de notificación</Label>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox id='notify-sync' />
                    <Label htmlFor='notify-sync'>
                      Sincronización completada
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox id='notify-membership' defaultChecked />
                    <Label htmlFor='notify-membership'>
                      Membresías por vencer
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox id='notify-training' defaultChecked />
                    <Label htmlFor='notify-training'>
                      Formaciones por completar
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Checkbox id='notify-error' defaultChecked />
                    <Label htmlFor='notify-error'>
                      Errores de sincronización
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Guardar configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Preferencias generales */}
        <TabsContent value='preferences'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <User className='h-5 w-5 mr-2' />
                Preferencias generales
              </CardTitle>
              <CardDescription>
                Configura tus preferencias de usuario y seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='language'>Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id='language'>
                    <SelectValue placeholder='Selecciona el idioma' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='es'>Español</SelectItem>
                    <SelectItem value='en'>English</SelectItem>
                    <SelectItem value='ca'>Català</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='theme'>Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id='theme'>
                    <SelectValue placeholder='Selecciona el tema' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='light'>Claro</SelectItem>
                    <SelectItem value='dark'>Oscuro</SelectItem>
                    <SelectItem value='system'>Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='two-factor'>
                    Autenticación de dos factores
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    Añade una capa extra de seguridad a tu cuenta
                  </p>
                </div>
                <Switch
                  id='two-factor'
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>

              {twoFactorAuth && (
                <div className='rounded-md bg-muted p-4 text-sm'>
                  <p className='font-medium'>Configuración de 2FA</p>
                  <p className='mt-1'>
                    Para configurar la autenticación de dos factores, escanea el
                    código QR con tu aplicación de autenticación.
                  </p>
                  <div className='mt-2 flex justify-center'>
                    <div className='bg-white p-2 rounded'>
                      {/* Aquí iría un código QR */}
                      <div className='w-32 h-32 bg-gray-200 flex items-center justify-center'>
                        <Shield className='h-10 w-10 text-gray-400' />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Guardar configuración</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, User, Trash, RefreshCw } from "lucide-react";

// Tipo para una vista
interface View {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ViewsToolbarProps {
  // La configuración actual de la vista (filtros, etc.) para guardar
  currentConfig: Record<string, unknown>;
  // Callback para cargar una configuración guardada
  onLoadView: (config: Record<string, unknown>) => void;
}

export default function ViewsToolbar({
  currentConfig,
  onLoadView,
}: ViewsToolbarProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [views, setViews] = useState<View[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el diálogo de guardar
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewName, setViewName] = useState("");
  const [viewDescription, setViewDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Estado para el diálogo de administrar vistas
  const [showManageDialog, setShowManageDialog] = useState(false);
  
  // Verificar si hay filtros aplicados
  const hasFilters = Boolean(
    (currentConfig.columnFilters && Array.isArray(currentConfig.columnFilters) && currentConfig.columnFilters.length > 0) ||
    (currentConfig.globalFilter && String(currentConfig.globalFilter).trim() !== "")
  );

  // Cargar la lista de vistas del usuario
  const loadViews = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/views");
      const data = await response.json();

      if (response.ok) {
        setViews(data.views);
      } else {
        throw new Error(data.error || "Error al cargar las vistas");
      }
    } catch (error) {
      console.error("Error al cargar vistas:", error);
      toast.error("No se pudieron cargar las vistas");
    } finally {
      setIsLoading(false);
    }
  }, [session, setIsLoading]);

  // Cargar vistas cuando cambie el usuario
  useEffect(() => {
    if (session?.user) {
      loadViews();
    }
  }, [session, loadViews]);

  // Guardar una nueva vista
  const saveView = async () => {
    if (!session?.user?.email) {
      toast.error("Debes iniciar sesión para guardar vistas");
      return;
    }

    if (!viewName.trim()) {
      toast.error("Debes proporcionar un nombre para la vista");
      return;
    }

    // Validar que haya filtros aplicados
    const hasFilters = 
      (currentConfig.columnFilters && Array.isArray(currentConfig.columnFilters) && currentConfig.columnFilters.length > 0) ||
      (currentConfig.globalFilter && String(currentConfig.globalFilter).trim() !== "");
    
    if (!hasFilters) {
      toast.error("Debes aplicar al menos un filtro antes de guardar la vista");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: viewName,
          description: viewDescription,
          isPublic,
          configuration: currentConfig,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`"${viewName}" se ha guardado correctamente.`);
        setShowSaveDialog(false);
        setViewName("");
        setViewDescription("");
        setIsPublic(false);
        loadViews(); // Recargar la lista de vistas
      } else {
        throw new Error(data.error || "Error al guardar la vista");
      }
    } catch (error) {
      console.error("Error al guardar vista:", error);
      toast.error("No se pudo guardar la vista");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar una vista específica
  const loadView = async (viewId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/views/${viewId}`);
      const data = await response.json();

      if (response.ok) {
        // El campo en la DB es 'config', no 'configuration'
        const viewConfig = data.view.config || data.view.configuration;
        
        // Validar que la configuración existe
        if (!viewConfig) {
          throw new Error("La vista no tiene configuración válida");
        }
        
        onLoadView(viewConfig);
        toast.success(`"${data.view.name}" se ha cargado correctamente.`);
      } else {
        throw new Error(data.error || "Error al cargar la vista");
      }
    } catch (error) {
      console.error("Error al cargar vista:", error);
      toast.error("No se pudo cargar la vista");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar una vista
  const deleteView = async (viewId: string, viewName: string) => {
    if (
      !confirm(`¿Estás seguro de que deseas eliminar la vista "${viewName}"?`)
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/views/${viewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizar la lista de vistas después de eliminar
        setViews(views.filter((view) => view.id !== viewId));
        toast.success(`"${viewName}" se ha eliminado correctamente.`);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar la vista");
      }
    } catch (error) {
      console.error("Error al eliminar vista:", error);
      toast.error("No se pudo eliminar la vista");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center space-x-2'>
      {session?.user ? (
        <>
          <DropdownMenu onOpenChange={(open) => open && loadViews()}>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <span>Mis vistas</span>
                {isLoading && <RefreshCw className='h-4 w-4 animate-spin' />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>Vistas guardadas</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {views.length === 0 ? (
                <DropdownMenuItem disabled>
                  No tienes vistas guardadas
                </DropdownMenuItem>
              ) : (
                views.map((view) => (
                  <DropdownMenuItem
                    key={view.id}
                    onClick={() => loadView(view.id)}
                    className='flex justify-between'
                  >
                    <span>{view.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteView(view.id, view.name);
                      }}
                      className='text-destructive hover:text-destructive-foreground'
                    >
                      <Trash className='h-4 w-4' />
                    </button>
                  </DropdownMenuItem>
                ))
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setShowManageDialog(true)}>
                Administrar vistas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button 
                className='gap-2' 
                disabled={!hasFilters}
                variant={hasFilters ? "default" : "outline"}
                title={!hasFilters ? "Aplica al menos un filtro antes de guardar una vista" : "Guardar la configuración actual como una vista"}
              >
                <Save className='h-4 w-4' />
                <span>Guardar vista</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Guardar vista actual</DialogTitle>
                <DialogDescription>
                  Guarda la configuración actual para acceder a ella más tarde.
                  {!hasFilters && (
                    <span className="text-destructive block mt-2">
                      Nota: Debes aplicar al menos un filtro antes de guardar la vista.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Nombre de la vista</Label>
                  <Input
                    id='name'
                    placeholder='Mi vista personalizada'
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='description'>Descripción (opcional)</Label>
                  <Textarea
                    id='description'
                    placeholder='Esta vista muestra...'
                    value={viewDescription}
                    onChange={(e) => setViewDescription(e.target.value)}
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='public'
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked === true)}
                  />
                  <Label htmlFor='public'>Hacer pública esta vista</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveView}
                  disabled={isLoading || !hasFilters || !viewName.trim()}
                  className='gap-2'
                  title={!hasFilters ? "Aplica filtros primero" : !viewName.trim() ? "Ingresa un nombre" : "Guardar vista"}
                >
                  {isLoading && <RefreshCw className='h-4 w-4 animate-spin' />}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo para administrar vistas */}
          <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
            <DialogContent className='max-w-lg'>
              <DialogHeader>
                <DialogTitle>Administrar vistas guardadas</DialogTitle>
                <DialogDescription>
                  Gestiona tus vistas personalizadas.
                </DialogDescription>
              </DialogHeader>

              <div className='max-h-[60vh] overflow-y-auto'>
                {views.length === 0 ? (
                  <p className='text-center py-4 text-muted-foreground'>
                    No tienes vistas guardadas
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {views.map((view) => (
                      <div
                        key={view.id}
                        className='flex items-center justify-between border p-3 rounded-md'
                      >
                        <div>
                          <h4 className='font-medium'>{view.name}</h4>
                          {view.description && (
                            <p className='text-sm text-muted-foreground'>
                              {view.description}
                            </p>
                          )}
                          <div className='flex items-center mt-1'>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                view.isPublic
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {view.isPublic ? "Pública" : "Privada"}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => loadView(view.id)}
                          >
                            Cargar
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => deleteView(view.id, view.name)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Button
          variant='outline'
          onClick={() => router.push("/auth/signin")}
          className='gap-2'
        >
          <User className='h-4 w-4' />
          Iniciar sesión para guardar vistas
        </Button>
      )}
    </div>
  );
}

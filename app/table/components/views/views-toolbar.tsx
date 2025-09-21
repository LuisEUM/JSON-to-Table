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

// Tipo para un filtro guardado
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
  // La configuración actual del filtro para guardar
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

  // Estado para el diálogo de administrar filtros
  const [showManageDialog, setShowManageDialog] = useState(false);

  // Verificar si hay filtros aplicados
  const hasFilters = Boolean(
    (currentConfig.columnFilters &&
      Array.isArray(currentConfig.columnFilters) &&
      currentConfig.columnFilters.length > 0) ||
      (currentConfig.globalFilter &&
        String(currentConfig.globalFilter).trim() !== "")
  );

  // Cargar la lista de filtros del usuario (solo los compatibles con la tabla actual)
  const loadViews = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      // Generar hash de compatibilidad y lista de columnas de la tabla actual
      const currentColumns = Object.keys(currentConfig.columnVisibility || {});
      const compatibilityHash = generateTableCompatibilityHash(currentColumns);
      const columnsParam = currentColumns.join(",");

      // Solicitar solo vistas compatibles
      const response = await fetch(
        `/api/views?compatibilityHash=${compatibilityHash}&columns=${columnsParam}`
      );
      const data = await response.json();

      if (response.ok) {
        setViews(data.views);

        // Mostrar información de filtrado si es relevante
        if (data.filtered && data.totalViews > data.compatibleViews) {
          console.log(
            `📊 Filtros filtrados: ${data.compatibleViews}/${data.totalViews} compatibles con esta tabla`
          );
        }
      } else {
        throw new Error(data.error || "Error al cargar las vistas");
      }
    } catch (error) {
      console.error("Error al cargar filtros:", error);
      toast.error("No se pudieron cargar los filtros");
    } finally {
      setIsLoading(false);
    }
  }, [session, setIsLoading, currentConfig]);

  // Función auxiliar para generar hash de compatibilidad (misma lógica que en la API)
  const generateTableCompatibilityHash = (columns: string[]): string => {
    const sortedColumns = [...columns].sort();
    const coreColumns = sortedColumns.filter(
      (col) => !["index", "selection", "actions"].includes(col)
    );
    return Buffer.from(coreColumns.join("|")).toString("base64").slice(0, 16);
  };

  // Función auxiliar para extraer tipos de columnas de la configuración actual
  const extractColumnTypes = (
    config: Record<string, unknown>
  ): Record<string, string> => {
    // Esta función intentará extraer los tipos de columnas de la configuración
    // En el futuro, esto podría mejorarse para obtener tipos reales de las columnas
    const columnTypes: Record<string, string> = {};

    // Si hay información de filtros, podemos inferir algunos tipos
    if (config.columnFilters && Array.isArray(config.columnFilters)) {
      config.columnFilters.forEach(
        (filter: { id?: string; value?: unknown }) => {
          if (filter.id && filter.value) {
            // Inferir tipo basado en el valor del filtro
            if (
              typeof filter.value === "object" &&
              filter.value !== null &&
              "operator" in filter.value
            ) {
              // Es un filtro complejo, intentar inferir del operador
              const filterValue = filter.value as { operator: string };
              switch (filterValue.operator) {
                case "greaterThan":
                case "lessThan":
                case "between":
                  columnTypes[filter.id] = "número";
                  break;
                case "dateBetween":
                  columnTypes[filter.id] = "fecha";
                  break;
                default:
                  columnTypes[filter.id] = "string";
              }
            }
          }
        }
      );
    }

    return columnTypes;
  };

  // Cargar vistas cuando cambie el usuario
  useEffect(() => {
    if (session?.user) {
      loadViews();
    }
  }, [session, loadViews]);

  // Guardar un nuevo filtro
  const saveView = async () => {
    if (!session?.user?.email) {
      toast.error("Debes iniciar sesión para guardar filtros");
      return;
    }

    if (!viewName.trim()) {
      toast.error("Debes proporcionar un nombre para el filtro");
      return;
    }

    // Validar que haya filtros aplicados
    const hasFilters =
      (currentConfig.columnFilters &&
        Array.isArray(currentConfig.columnFilters) &&
        currentConfig.columnFilters.length > 0) ||
      (currentConfig.globalFilter &&
        String(currentConfig.globalFilter).trim() !== "");

    if (!hasFilters) {
      toast.error("Debes aplicar al menos un filtro antes de guardarlo");
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
          configuration: {
            ...currentConfig,
            // Agregar información adicional para mejorar la compatibilidad
            columnTypes: extractColumnTypes(currentConfig),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`"${viewName}" se ha guardado correctamente.`);
        setShowSaveDialog(false);
        setViewName("");
        setViewDescription("");
        setIsPublic(false);
        loadViews(); // Recargar la lista de filtros
      } else {
        throw new Error(data.error || "Error al guardar el filtro");
      }
    } catch (error) {
      console.error("Error al guardar filtro:", error);
      toast.error("No se pudo guardar el filtro");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar un filtro específico
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
          throw new Error("El filtro no tiene configuración válida");
        }

        onLoadView(viewConfig);
        toast.success(`"${data.view.name}" se ha cargado correctamente.`);
      } else {
        throw new Error(data.error || "Error al cargar el filtro");
      }
    } catch (error) {
      console.error("Error al cargar filtro:", error);
      toast.error("No se pudo cargar el filtro");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un filtro
  const deleteView = async (viewId: string, viewName: string) => {
    if (
      !confirm(`¿Estás seguro de que deseas eliminar el filtro "${viewName}"?`)
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/views/${viewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizar la lista de filtros después de eliminar
        setViews(views.filter((view) => view.id !== viewId));
        toast.success(`"${viewName}" se ha eliminado correctamente.`);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el filtro");
      }
    } catch (error) {
      console.error("Error al eliminar filtro:", error);
      toast.error("No se pudo eliminar el filtro");
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
                <span>Mis filtros</span>
                {isLoading && <RefreshCw className='h-4 w-4 animate-spin' />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>Filtros guardados</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {views.length === 0 ? (
                <DropdownMenuItem disabled>
                  No tienes filtros guardados
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
                Administrar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button
                className='gap-2'
                disabled={!hasFilters}
                variant={hasFilters ? "default" : "outline"}
                title={
                  !hasFilters
                    ? "Aplica al menos un filtro antes de guardarlo"
                    : "Guardar la configuración actual como un filtro"
                }
              >
                <Save className='h-4 w-4' />
                <span>Guardar filtro</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Guardar filtro actual</DialogTitle>
                <DialogDescription>
                  Guarda la configuración actual para acceder a ella más tarde.
                  {!hasFilters && (
                    <span className='text-destructive block mt-2'>
                      Nota: Debes aplicar al menos un filtro antes de guardarlo.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Nombre del filtro</Label>
                  <Input
                    id='name'
                    placeholder='Mi filtro personalizado'
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='description'>Descripción (opcional)</Label>
                  <Textarea
                    id='description'
                    placeholder='Este filtro muestra...'
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
                  <Label htmlFor='public'>Hacer público este filtro</Label>
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
                  title={
                    !hasFilters
                      ? "Aplica filtros primero"
                      : !viewName.trim()
                      ? "Ingresa un nombre"
                      : "Guardar filtro"
                  }
                >
                  {isLoading && <RefreshCw className='h-4 w-4 animate-spin' />}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo para administrar filtros */}
          <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
            <DialogContent className='max-w-lg'>
              <DialogHeader>
                <DialogTitle>Administrar filtros guardados</DialogTitle>
                <DialogDescription>
                  Gestiona tus filtros personalizados.
                </DialogDescription>
              </DialogHeader>

              <div className='max-h-[60vh] overflow-y-auto'>
                {views.length === 0 ? (
                  <p className='text-center py-4 text-muted-foreground'>
                    No tienes filtros guardados
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
          Iniciar sesión para guardar filtros
        </Button>
      )}
    </div>
  );
}

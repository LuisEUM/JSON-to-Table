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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Save,
  User,
  Trash,
  RefreshCw,
  Filter,
  Settings,
  ChevronDown
} from "lucide-react";
import { FilterHoverCard } from "./filter-hover-card";

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

interface FilterComboboxProps {
  // La configuración actual del filtro para guardar
  currentConfig: Record<string, unknown>;
  // Callback para cargar una configuración guardada
  onLoadView: (config: Record<string, unknown>) => void;
}

export function FilterCombobox({
  currentConfig,
  onLoadView,
}: FilterComboboxProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [views, setViews] = useState<View[]>([]);
  const [filteredViews, setFilteredViews] = useState<View[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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

  // Filtrar vistas basado en la búsqueda
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredViews(views);
    } else {
      const filtered = views.filter(view =>
        view.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (view.description && view.description.toLowerCase().includes(searchValue.toLowerCase()))
      );
      setFilteredViews(filtered);
    }
  }, [views, searchValue]);

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
        setOpen(false); // Cerrar el combobox
        setSearchValue(""); // Limpiar búsqueda
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

  if (!session?.user) {
    return (
      <Button
        variant='outline'
        onClick={() => router.push("/auth/signin")}
        className='gap-2'
        size="sm"
      >
        <User className='h-4 w-4' />
        Iniciar sesión para filtros
      </Button>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      {/* Combobox principal */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between gap-2"
            size="sm"
            onClick={() => {
              if (!open) loadViews();
            }}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="truncate">
                {views.length > 0 ? `${views.length} filtros` : "Mis filtros"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar filtros..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {views.length === 0 ? "No tienes filtros guardados" : "No se encontraron filtros"}
              </CommandEmpty>

              {filteredViews.length > 0 && (
                <CommandGroup heading="Filtros guardados">
                  {filteredViews.map((view) => (
                    <FilterHoverCard key={view.id} view={view} currentConfig={currentConfig}>
                      <CommandItem
                        onSelect={() => loadView(view.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="truncate">{view.name}</span>
                          {view.isPublic && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                              Público
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteView(view.id, view.name);
                            }}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </CommandItem>
                    </FilterHoverCard>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />

              <CommandGroup>
                <CommandItem onSelect={() => setShowSaveDialog(true)} disabled={!hasFilters}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Guardar filtro actual</span>
                  {!hasFilters && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Sin filtros
                    </span>
                  )}
                </CommandItem>
                <CommandItem onSelect={() => setShowManageDialog(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Administrar filtros
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Diálogo de guardar filtro (ahora accesible desde dentro del combobox) */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
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
    </div>
  );
}
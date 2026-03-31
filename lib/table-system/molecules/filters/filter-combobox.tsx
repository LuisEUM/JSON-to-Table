"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Save,
  User,
  Trash,
  Filter,
  Settings,
  ChevronDown
} from "lucide-react";
import { FilterHoverCard } from "./filter-hover-card";
import { FilterSaveDialog } from "./filter-save-dialog";
import { FilterManageDialog } from "./filter-manage-dialog";
import { logger } from "../../core/services/logging-service";

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
  currentConfig: Record<string, unknown>;
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

  // Función auxiliar para generar hash de compatibilidad
  const generateTableCompatibilityHash = (columns: string[]): string => {
    const sortedColumns = [...columns].sort();
    const coreColumns = sortedColumns.filter(
      (col) => !["index", "selection", "actions"].includes(col)
    );
    return Buffer.from(coreColumns.join("|")).toString("base64").slice(0, 16);
  };

  // Función auxiliar para extraer tipos de columnas
  const extractColumnTypes = (
    config: Record<string, unknown>
  ): Record<string, string> => {
    const columnTypes: Record<string, string> = {};

    if (config.columnFilters && Array.isArray(config.columnFilters)) {
      config.columnFilters.forEach(
        (filter: { id?: string; value?: unknown }) => {
          if (filter.id && filter.value) {
            if (
              typeof filter.value === "object" &&
              filter.value !== null &&
              "operator" in filter.value
            ) {
              const filterValue = filter.value as { operator: string };
              switch (filterValue.operator) {
                case "greaterThan":
                case "lessThan":
                case "between":
                  columnTypes[filter.id] = "number";
                  break;
                case "dateBetween":
                  columnTypes[filter.id] = "date";
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

  // Cargar la lista de filtros del usuario
  const loadViews = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const currentColumns = Object.keys(currentConfig.columnVisibility || {});
      const compatibilityHash = generateTableCompatibilityHash(currentColumns);
      const columnsParam = currentColumns.join(",");

      const response = await fetch(
        `/api/views?compatibilityHash=${compatibilityHash}&columns=${columnsParam}`
      );
      const data = await response.json();

      if (response.ok) {
        setViews(data.views);

        if (data.filtered && data.totalViews > data.compatibleViews) {
          logger.debug(
            `Filtros filtrados: ${data.compatibleViews}/${data.totalViews} compatibles con esta tabla`
          );
        }
      } else {
        throw new Error(data.error || "Error al cargar las vistas");
      }
    } catch (error) {
      logger.error("Error al cargar filtros:", error);
      toast.error("No se pudieron cargar los filtros");
    } finally {
      setIsLoading(false);
    }
  }, [session, setIsLoading, currentConfig]);

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
        loadViews();
      } else {
        throw new Error(data.error || "Error al guardar el filtro");
      }
    } catch (error) {
      logger.error("Error al guardar filtro:", error);
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
        const viewConfig = data.view.config || data.view.configuration;

        if (!viewConfig) {
          throw new Error("El filtro no tiene configuración válida");
        }

        onLoadView(viewConfig);
        toast.success(`"${data.view.name}" se ha cargado correctamente.`);
        setOpen(false);
        setSearchValue("");
      } else {
        throw new Error(data.error || "Error al cargar el filtro");
      }
    } catch (error) {
      logger.error("Error al cargar filtro:", error);
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
        setViews(views.filter((view) => view.id !== viewId));
        toast.success(`"${viewName}" se ha eliminado correctamente.`);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el filtro");
      }
    } catch (error) {
      logger.error("Error al eliminar filtro:", error);
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

      {/* Diálogo de guardar filtro */}
      <FilterSaveDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        viewName={viewName}
        onViewNameChange={setViewName}
        viewDescription={viewDescription}
        onViewDescriptionChange={setViewDescription}
        isPublic={isPublic}
        onIsPublicChange={setIsPublic}
        hasFilters={hasFilters}
        isLoading={isLoading}
        onSave={saveView}
      />

      {/* Diálogo para administrar filtros */}
      <FilterManageDialog
        open={showManageDialog}
        onOpenChange={setShowManageDialog}
        views={views}
        onLoadView={loadView}
        onDeleteView={deleteView}
      />
    </div>
  );
}

"use client";

import { ReactNode } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Filter,
  Hash,
  Clock,
  Globe,
  Lock,
  Play,
  Edit,
  Trash,
} from "lucide-react";
// import { format } from "date-fns";
// import { es } from "date-fns/locale";

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

interface FilterHoverCardProps {
  view: View;
  currentConfig?: Record<string, unknown>;
  children: ReactNode;
  onLoad?: (viewId: string) => void;
  onEdit?: (viewId: string) => void;
  onDelete?: (viewId: string, viewName: string) => void;
}

export function FilterHoverCard({
  view,
  currentConfig,
  children,
  onLoad,
  onEdit,
  onDelete,
}: FilterHoverCardProps) {
  // Analizar los filtros del currentConfig para mostrar información relevante
  const analyzeFilters = (config: Record<string, unknown>) => {
    const filters: Array<{
      type: string;
      column: string;
      value: string;
      operator?: string;
    }> = [];

    // Analizar filtros de columna
    if (config.columnFilters && Array.isArray(config.columnFilters)) {
      config.columnFilters.forEach((filter: {id?: string; value?: unknown}) => {
        if (filter.id && filter.value !== undefined) {
          if (typeof filter.value === "object" && filter.value !== null) {
            // Filtro complejo con operador
            const complexFilter = filter.value as {operator?: string; value?: unknown; from?: unknown};
            if (complexFilter.operator) {
              let operatorText = "";
              switch (complexFilter.operator) {
                case "greaterThan":
                  operatorText = "mayor que";
                  break;
                case "lessThan":
                  operatorText = "menor que";
                  break;
                case "between":
                  operatorText = "entre";
                  break;
                case "dateBetween":
                  operatorText = "fecha entre";
                  break;
                case "contains":
                  operatorText = "contiene";
                  break;
                case "equals":
                  operatorText = "igual a";
                  break;
                default:
                  operatorText = complexFilter.operator;
              }

              filters.push({
                type: "column",
                column: filter.id,
                value: `${operatorText} ${complexFilter.value || complexFilter.from || ""}`,
                operator: complexFilter.operator,
              });
            }
          } else {
            // Filtro simple
            filters.push({
              type: "column",
              column: filter.id,
              value: String(filter.value),
            });
          }
        }
      });
    }

    // Analizar filtro global
    if (config.globalFilter && String(config.globalFilter).trim() !== "") {
      filters.push({
        type: "global",
        column: "Búsqueda global",
        value: String(config.globalFilter),
      });
    }

    return filters;
  };

  // Estimar número de registros (simulado para la demo)
  const estimateRecordCount = () => {
    // En una implementación real, esto podría hacer una consulta rápida a la API
    // Por ahora, simularemos basado en el número de filtros
    const baseCount = 1000;
    const filterCount = currentConfig ? analyzeFilters(currentConfig).length : 0;
    return Math.max(50, Math.floor(baseCount / (filterCount + 1)));
  };

  const filters = currentConfig ? analyzeFilters(currentConfig) : [];
  const estimatedRecords = estimateRecordCount();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" side="right" align="start">
        <div className="p-4">
          {/* Header con nombre y estado */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <h4 className="text-sm font-semibold leading-none truncate">
                  {view.name}
                </h4>
                {view.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {view.description}
                  </p>
                )}
              </div>
              <Badge
                variant={view.isPublic ? "default" : "secondary"}
                className="ml-2 text-xs"
              >
                {view.isPublic ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Público
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Privado
                  </>
                )}
              </Badge>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Información de filtros aplicados */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros aplicados</span>
            </div>

            {filters.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filters.slice(0, 4).map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded"
                  >
                    <Badge variant="outline" className="text-xs">
                      {filter.column}
                    </Badge>
                    <span className="text-muted-foreground truncate">
                      {filter.value}
                    </span>
                  </div>
                ))}
                {filters.length > 4 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{filters.length - 4} filtros más
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Sin información de filtros disponible
              </p>
            )}

            {/* Estimación de registros */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>~{estimatedRecords.toLocaleString()} registros estimados</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Metadatos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Creado: {formatDate(view.createdAt)}</span>
            </div>
            {view.createdAt !== view.updatedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Modificado: {formatDateTime(view.updatedAt)}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {/* Acciones rápidas */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onLoad?.(view.id);
              }}
            >
              <Play className="h-3 w-3" />
              Cargar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(view.id);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(view.id, view.name);
              }}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
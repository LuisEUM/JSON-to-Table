"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypeDot } from "../../atoms/indicators/TypeDot";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProcessedValue } from "../../core/utils/data-processor";
import { Button } from "@/components/ui/button";
import { Code2, Table2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTypeStyle } from "../../core/constants/type-styles";
import React from "react";

interface DetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: ProcessedValue;
  title?: string;
}

const groupFields = (data: Record<string, ProcessedValue>) => {
  // Crear grupos dinámicamente basados en los paths
  const groups: Record<string, ProcessedValue[]> = {};

  Object.entries(data).forEach(([, value]) => {
    // Obtener el grupo base del path
    const groupName = value.path?.[0] || "otros";

    // Inicializar el grupo si no existe
    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    // Añadir el valor al grupo
    groups[groupName].push(value);
  });

  // Ordenar los campos dentro de cada grupo
  Object.keys(groups).forEach((groupName) => {
    groups[groupName].sort((a, b) => {
      const aPath = a.path?.join(".") || "";
      const bPath = b.path?.join(".") || "";
      return aPath.localeCompare(bPath);
    });
  });

  return groups;
};

const formatTitle = (text: string): string => {
  return (
    text
      // Separar camelCase
      .replace(/([A-Z])/g, " $1")
      // Convertir primera letra a mayúscula
      .replace(/^./, (str) => str.toUpperCase())
      // Reemplazar puntos y guiones bajos por espacios
      .replace(/[._]/g, " ")
      // Eliminar espacios extras
      .trim()
  );
};

const getGroupTitle = (groupName: string, items: ProcessedValue[]): string => {
  // Si todos los items del grupo comparten un path común más largo, usamos ese
  const commonPath = items.reduce((common, item) => {
    if (!item.path) return common;

    // Si aún no tenemos un path común, usar el primero
    if (!common.length) return item.path.slice(0, -1);

    // Encontrar la parte común del path
    return common.filter((part, index) => item.path?.[index] === part);
  }, [] as string[]);

  // Si encontramos un path común más largo que solo el grupo base, lo usamos
  if (commonPath.length > 1) {
    return formatTitle(commonPath.join(" "));
  }

  // Si no, formateamos el nombre del grupo base
  return formatTitle(groupName);
};

const renderPrimitiveArray = (item: ProcessedValue) => {
  if (!Array.isArray(item.value)) return String(item.value || "-");

  return (
    <div className='flex flex-wrap gap-2'>
      {item.value.map((value, idx) => {
        // Determinar el tipo del valor primitivo
        const valueType =
          typeof value === "number"
            ? "number"
            : typeof value === "boolean"
            ? "boolean"
            : "string";

        return (
          <Badge
            key={idx}
            variant='outline'
            className={`${getTypeStyle(valueType).bg} text-xs font-mono`}
          >
            {String(value)}
          </Badge>
        );
      })}
    </div>
  );
};

const renderGroup = (groupName: string, items: ProcessedValue[]) => {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getGroupTitle(groupName, items)}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {items.map((item, index) => (
          <div key={index} className='flex items-start gap-2'>
            <TypeDot type={item.type} />
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium text-muted-foreground'>
                {item.path?.[item.path.length - 1] || `Campo ${index + 1}`}
              </div>
              <div className='font-mono text-sm'>
                {item.type === "boolean" ? (
                  item.value ? (
                    "Sí"
                  ) : (
                    "No"
                  )
                ) : item.type === "date" ? (
                  String(item.value)
                ) : item.type === "objectArray" ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                    {item.items?.map((subItem, idx) => {
                      const subItemValue = subItem.value as {
                        field: string;
                        value: string;
                      };
                      return (
                        <Card key={idx}>
                          <CardHeader>
                            <CardTitle className='text-sm'>
                              {subItemValue.field}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <span className='text-sm'>
                              {subItemValue.value || "-"}
                            </span>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : item.type === "primitiveArray" ? (
                  renderPrimitiveArray(item)
                ) : (
                  String(item.value || "-")
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export function DetailsModal({
  open,
  onOpenChange,
  data,
  title = "Detalles",
}: DetailsModalProps) {
  const [showJson, setShowJson] = React.useState(false);

  if (!data?.value || typeof data.value !== "object") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl h-[80vh] flex flex-col'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle className='flex items-center gap-2'>
              <span>{title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className='p-4 text-center text-muted-foreground'>
            No hay datos disponibles
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const groups = groupFields(data.value as Record<string, ProcessedValue>);

  // Ordenar los grupos para tener un orden consistente
  const sortedGroupNames = Object.keys(groups).sort((a, b) => {
    // Priorizar algunos grupos específicos
    const priority = ["id", "name", "customFields"];
    const aIndex = priority.indexOf(a);
    const bIndex = priority.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.localeCompare(b);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl h-[80vh] flex flex-col overflow-hidden'>
        <DialogHeader className='flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='flex items-center gap-2'>
              <TypeDot type={data.type} />
              <span>{title}</span>
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowJson(!showJson)}
              title={showJson ? "Ver vista procesada" : "Ver JSON"}
            >
              {showJson ? (
                <Table2 className='h-4 w-4' />
              ) : (
                <Code2 className='h-4 w-4' />
              )}
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className='flex-1 overflow-auto'>
          <div className='p-4 space-y-6'>
            {showJson ? (
              <pre className='whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-auto'>
                {JSON.stringify(data.value, null, 2)}
              </pre>
            ) : (
              <>
                {sortedGroupNames.map((groupName) =>
                  renderGroup(groupName, groups[groupName])
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
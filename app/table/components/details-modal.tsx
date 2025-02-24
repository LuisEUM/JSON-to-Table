"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ObjectCard } from "./object-card";
import { TypeDot } from "./type-dot";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProcessedValue } from "../data-processor";

interface DetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: ProcessedValue;
  title?: string;
}

export function DetailsModal({
  open,
  onOpenChange,
  data,
  title = "Detalles",
}: DetailsModalProps) {
  if (!data) {
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

  const type = data.type || "undefined";
  const value = data.value;

  const renderArrayItem = (item: ProcessedValue, index: number) => {
    if (item.type === "objeto") {
      return (
        <div
          key={index}
          className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'
        >
          <div className='flex items-center gap-2 mb-2'>
            <TypeDot type={item.type} />
            <span className='text-sm font-medium'>Item {index + 1}</span>
          </div>
          <ObjectCard value={item} showLabels compact={false} />
        </div>
      );
    }

    return (
      <div
        key={index}
        className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'
      >
        <div className='flex items-center gap-2'>
          <TypeDot type={item.type || "undefined"} />
          <span className='font-mono'>
            {item.type === "string"
              ? `"${String(item.value)}"`
              : item.type === "boolean"
              ? item.value
                ? "verdadero"
                : "falso"
              : item.type === "número"
              ? Number(item.value).toLocaleString()
              : item.type === "fecha"
              ? new Date(item.value as string).toLocaleString()
              : String(item.value)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl h-[80vh] flex flex-col overflow-hidden'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='flex items-center gap-2'>
            <TypeDot type={type} />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className='flex-1 overflow-auto'>
          <div className='p-4'>
            {type === "array" ? (
              <div className='flex flex-col gap-4'>
                {data.items?.map((item, index) => renderArrayItem(item, index))}
              </div>
            ) : type === "objeto" ? (
              <ObjectCard value={data} showLabels compact={false} />
            ) : (
              <div className='flex items-center gap-2'>
                <TypeDot type={type} />
                <span className='font-mono'>
                  {type === "string"
                    ? `"${String(value)}"`
                    : type === "boolean"
                    ? value
                      ? "verdadero"
                      : "falso"
                    : type === "número"
                    ? Number(value).toLocaleString()
                    : type === "fecha"
                    ? new Date(value as string).toLocaleString()
                    : String(value)}
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

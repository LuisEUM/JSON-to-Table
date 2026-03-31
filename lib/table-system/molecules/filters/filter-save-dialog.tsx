"use client";

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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";

interface FilterSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewName: string;
  onViewNameChange: (name: string) => void;
  viewDescription: string;
  onViewDescriptionChange: (description: string) => void;
  isPublic: boolean;
  onIsPublicChange: (isPublic: boolean) => void;
  hasFilters: boolean;
  isLoading: boolean;
  onSave: () => void;
}

export function FilterSaveDialog({
  open,
  onOpenChange,
  viewName,
  onViewNameChange,
  viewDescription,
  onViewDescriptionChange,
  isPublic,
  onIsPublicChange,
  hasFilters,
  isLoading,
  onSave,
}: FilterSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onViewNameChange(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='description'>Descripción (opcional)</Label>
            <Textarea
              id='description'
              placeholder='Este filtro muestra...'
              value={viewDescription}
              onChange={(e) => onViewDescriptionChange(e.target.value)}
            />
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='public'
              checked={isPublic}
              onCheckedChange={(checked) => onIsPublicChange(checked === true)}
            />
            <Label htmlFor='public'>Hacer público este filtro</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
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
  );
}

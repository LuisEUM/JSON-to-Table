"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface View {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  views: View[];
  onLoadView: (viewId: string) => void;
  onDeleteView: (viewId: string, viewName: string) => void;
}

export function FilterManageDialog({
  open,
  onOpenChange,
  views,
  onLoadView,
  onDeleteView,
}: FilterManageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                      onClick={() => onLoadView(view.id)}
                    >
                      Cargar
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => onDeleteView(view.id, view.name)}
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
  );
}

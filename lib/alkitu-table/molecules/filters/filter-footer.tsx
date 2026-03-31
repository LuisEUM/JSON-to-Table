import { useCallback } from "react";
import { Button } from "@/components/primitives/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/primitives/ui/tooltip";
import { Check, Trash2, X, CheckSquare } from "lucide-react";

interface FilterFooterProps {
  onClear: () => void;
  onClose: () => void;
  onApply: () => void;
  onSelectAll?: () => void;
  showClear?: boolean;
  showSelectAll?: boolean;
}

export function FilterFooter({
  onClear,
  onClose,
  onApply,
  onSelectAll,
  showClear = true,
  showSelectAll = false,
}: FilterFooterProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onApply();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onApply, onClose]
  );

  return (
    <TooltipProvider>
      <div
        className='flex items-center justify-end border-t pt-4 mt-4'
        role='toolbar'
        aria-label='Acciones de filtro'
        onKeyDown={handleKeyDown}
      >
        <div className='flex gap-2'>
          {onSelectAll && showSelectAll && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={onSelectAll}
                  className='h-8 w-8'
                  aria-label='Seleccionar todo'
                >
                  <CheckSquare className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Seleccionar todo</p>
              </TooltipContent>
            </Tooltip>
          )}
          {showClear && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  className='h-8 w-8'
                  aria-label='Limpiar filtro'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpiar filtro</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={onClose}
                className='h-8 w-8'
                aria-label='Cerrar'
              >
                <X className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancelar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='default'
                size='icon'
                onClick={onApply}
                className='h-8 w-8'
                aria-label='Aplicar filtro'
              >
                <Check className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aplicar filtro</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

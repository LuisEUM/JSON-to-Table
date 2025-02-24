"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Copy, Trash2, FileSearch } from "lucide-react";
import { useState } from "react";
import type { ProcessedRow } from "../data-processor";
import { DetailsModal } from "./details-modal";

interface ActionButtonsProps {
  row: ProcessedRow;
  onDelete: () => void;
}

export function ActionButtons({ row, onDelete }: ActionButtonsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const idField = Object.values(row).find((item) => item.isId);
  const hasId = Boolean(idField);

  const handleCopy = () => {
    if (idField) {
      navigator.clipboard.writeText(String(idField.value));
    }
  };

  const rowAsProcessedValue = {
    type: "objeto",
    value: row,
    items: Object.entries(row).map(([key, value]) => ({
      ...value,
      label: key,
    })),
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {hasId && (
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className='mr-2 h-4 w-4' />
              <span>Copiar ID</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowDetailsModal(true)}>
            <FileSearch className='mr-2 h-4 w-4' />
            <span>Ver detalles</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className='text-destructive'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              este registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        data={rowAsProcessedValue}
        title='Detalles del registro'
      />
    </>
  );
}

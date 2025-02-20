"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProcessedRow } from "../data-processor"
import { ObjectCard } from "./object-card"

interface DetailsModalProps {
  row: ProcessedRow
  isOpen: boolean
  onClose: () => void
}

export function DetailsModal({ row, isOpen, onClose }: DetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>Detalles</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-auto rounded-md border p-4">
          <div className="space-y-4">
            {Object.entries(row).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">{key}</h3>
                <ObjectCard value={value} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


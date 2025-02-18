"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { Table } from "@tanstack/react-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ColumnManagerModalProps<TData> {
  table: Table<TData>
}

export function ColumnManagerModal<TData>({ table }: ColumnManagerModalProps<TData>) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
    .sort((a, b) => {
      const aIndex = table.getState().columnOrder.indexOf(a.id)
      const bIndex = table.getState().columnOrder.indexOf(b.id)
      if (aIndex === -1 && bIndex === -1) return 0
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })

  const moveColumn = (columnId: string, targetIndex: number) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column) return

    const currentIndex = columns.indexOf(column)
    const newOrder = [...columns]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, column)

    // Update column order
    table.setColumnOrder(newOrder.map((col) => col.id))
  }

  const moveColumnToStart = (columnId: string) => {
    moveColumn(columnId, 0)
  }

  const moveColumnToEnd = (columnId: string) => {
    moveColumn(columnId, columns.length - 1)
  }

  const moveColumnUp = (columnId: string) => {
    const currentIndex = columns.findIndex((col) => col.id === columnId)
    if (currentIndex > 0) {
      moveColumn(columnId, currentIndex - 1)
    }
  }

  const moveColumnDown = (columnId: string) => {
    const currentIndex = columns.findIndex((col) => col.id === columnId)
    if (currentIndex < columns.length - 1) {
      moveColumn(columnId, currentIndex + 1)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings className="h-4 w-4 mr-2" />
          Gestionar Columnas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gestionar Columnas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="border rounded-md">
            <div className="grid grid-cols-[1fr,180px] items-center gap-4 p-4 border-b">
              <div className="font-medium">Columna</div>
              <div className="text-right font-medium">Visible Ordenar</div>
            </div>
            <div className="max-h-[400px] overflow-auto">
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  className="grid grid-cols-[1fr,180px] items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span>{column.id}</span>
                    <span className="text-sm text-muted-foreground">
                      {index + 1} de {columns.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    />
                    <div className="flex items-center gap-0.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => moveColumnToStart(column.id)}
                            >
                              <ChevronsUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mover &quot;{column.id}&quot; al inicio</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => moveColumnUp(column.id)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mover &quot;{column.id}&quot; arriba</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => moveColumnDown(column.id)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mover &quot;{column.id}&quot; abajo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => moveColumnToEnd(column.id)}
                            >
                              <ChevronsDown className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mover &quot;{column.id}&quot; al final</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


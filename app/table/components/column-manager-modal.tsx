"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Table } from "@tanstack/react-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"

interface ColumnManagerModalProps<TData> {
  table: Table<TData>
  useFixedColumn: boolean
  onFixedColumnChange: (value: boolean) => void
  fixedColumnId: string | null
  onFixedColumnIdChange: (value: string | null) => void
  originalColumnOrder: string[]
}

export function ColumnManagerModal<TData>({
  table,
  useFixedColumn,
  onFixedColumnChange,
  fixedColumnId,
  onFixedColumnIdChange,
  originalColumnOrder,
}: ColumnManagerModalProps<TData>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [columns, setColumns] = useState(table.getAllLeafColumns())

  useEffect(() => {
    const allColumns = table.getAllLeafColumns()
    const indexColumn = allColumns.find((col) => col.id === "index")
    const fixedColumn = allColumns.find((col) => col.id === fixedColumnId)
    const otherColumns = allColumns.filter(
      (col) =>
        col.id !== "index" &&
        col.id !== "actions" &&
        col.id !== fixedColumnId &&
        typeof col.accessorFn !== "undefined" &&
        col.getCanHide(),
    )

    const orderedColumns = [
      ...(indexColumn ? [indexColumn] : []),
      ...(fixedColumn ? [fixedColumn] : []),
      ...otherColumns,
    ]

    setColumns(orderedColumns)

    // Ensure index column is visible when there's no fixed column
    if (indexColumn && !useFixedColumn) {
      indexColumn.toggleVisibility(true)
    }
  }, [table, fixedColumnId, useFixedColumn])

  const filteredColumns = columns.filter((column) => column.id.toLowerCase().includes(searchTerm.toLowerCase()))

  const moveColumn = (columnId: string, targetIndex: number) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column) return

    const currentIndex = columns.indexOf(column)
    const newOrder = [...columns]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, column)

    const updatedOrder = newOrder.map((col) => col.id)
    table.setColumnOrder(updatedOrder)
    setColumns(newOrder)
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
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>Gestionar Columnas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Usar columna fija</span>
                <Switch checked={useFixedColumn} onCheckedChange={onFixedColumnChange} />
              </div>
              {useFixedColumn && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Seleccionar columna fija</span>
                  <Select value={fixedColumnId || ""} onValueChange={onFixedColumnIdChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una columna" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns
                        .filter((column) => column.id !== "index")
                        .map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.id}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Input
              placeholder="Buscar columnas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />

            <div className="border rounded-md">
              <div className="grid grid-cols-[minmax(200px,1fr),200px] items-center gap-4 p-4 border-b bg-muted/50">
                <div className="font-medium">Columna</div>
                <div className="text-right font-medium">Visible Ordenar</div>
              </div>
              <div className="max-h-[60vh] overflow-auto">
                {filteredColumns.map((column, index) => (
                  <div
                    key={column.id}
                    className={`grid grid-cols-[minmax(200px,1fr),200px] items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50 ${
                      column.id === fixedColumnId || column.id === "index" ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{column.id}</span>
                      {column.id === fixedColumnId && (
                        <span className="text-xs text-muted-foreground">(Columna Fija)</span>
                      )}
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {index} de {filteredColumns.length - 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        disabled={column.id === "index" || column.id === fixedColumnId}
                        className={column.id === "index" || column.id === fixedColumnId ? "opacity-50" : ""}
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
                                disabled={index <= 1 || column.id === "index" || column.id === fixedColumnId}
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
                                disabled={index <= 1 || column.id === "index" || column.id === fixedColumnId}
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
                                disabled={
                                  index >= filteredColumns.length - 1 ||
                                  column.id === "index" ||
                                  column.id === fixedColumnId
                                }
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
                                disabled={
                                  index >= filteredColumns.length - 1 ||
                                  column.id === "index" ||
                                  column.id === fixedColumnId
                                }
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
        </div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import type { ProcessedRow } from "../data-processor"
import * as XLSX from "xlsx"

interface ExportDropdownProps {
  selectedRows: Row<ProcessedRow>[]
  allRows: Row<ProcessedRow>[]
}

export function ExportDropdown({ selectedRows, allRows }: ExportDropdownProps) {
  const getExportData = () => {
    const rows = selectedRows.length > 0 ? selectedRows : allRows
    return rows.map((row) => {
      const flatData: Record<string, unknown> = {}
      Object.entries(row.original).forEach(([key, value]) => {
        flatData[key] = value.value
      })
      return flatData
    })
  }

  const exportToJson = () => {
    const data = getExportData()
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exported_data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToCsv = () => {
    const data = getExportData()
    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exported_data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToXlsx = () => {
    const data = getExportData()
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exported_data.xlsx"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Datos
          {selectedRows.length > 0 && <span className="ml-1 text-xs">({selectedRows.length})</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={exportToJson}>Exportar a JSON</DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCsv}>Exportar a CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={exportToXlsx}>Exportar a XLSX</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { useState } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"

interface TableSearchProps<TData> {
  table: Table<TData>
}

export function TableSearch<TData>({ table }: TableSearchProps<TData>) {
  const [value, setValue] = useState("")

  const debouncedValue = useDebounce(value, 500)

  const onSearchChange = (searchValue: string) => {
    setValue(searchValue)
    table.setGlobalFilter(debouncedValue)
  }

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Buscar..." value={value} onChange={(e) => onSearchChange(e.target.value)} className="pl-8" />
    </div>
  )
}


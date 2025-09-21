# 🧬 Atomic Design Implementation Plan - Detailed Roadmap

## 📋 Resumen Ejecutivo

Este documento presenta un plan detallado de implementación para migrar el sistema de tablas JSON a una arquitectura Atomic Design, con ejemplos específicos, cronogramas y consideraciones técnicas.

---

## 🎯 Enfoque Recomendado: **Opción 3 - Híbrida Progresiva**

Elegimos este enfoque porque:
- ✅ **Riesgo Controlado**: Migración gradual sin breaking changes
- ✅ **Flexibilidad**: Permite experimentar y ajustar durante el proceso
- ✅ **Business Continuity**: Mantiene funcionalidad actual
- ✅ **Team Learning**: Curva de aprendizaje progresiva

---

## 📅 Cronograma de Implementación

### FASE 1: Fundación (Sprint 1-2) - 4 semanas
**Objetivo**: Establecer base atómica y preparar infraestructura

#### Week 1-2: Setup & Atoms
```bash
# Crear estructura base
mkdir -p lib/table-system/{atoms,molecules,organisms,templates,core}
mkdir -p lib/table-system/atoms/{primitives,controls,indicators}
mkdir -p lib/table-system/core/{hooks,providers,types,utils}
```

**Deliverables:**
- [ ] Estructura de carpetas
- [ ] Base types y interfaces
- [ ] Primeros 5 átomos críticos
- [ ] Documentation setup
- [ ] Storybook configuration

#### Week 3-4: Core Hooks & Providers
**Deliverables:**
- [ ] `useTableData` hook
- [ ] `useTableFilters` hook
- [ ] `useTableSorting` hook
- [ ] `TableProvider` context
- [ ] Type detection utilities

---

### FASE 2: Moléculas Básicas (Sprint 3-4) - 4 semanas

#### Week 5-6: Column System
**Deliverables:**
- [ ] `SmartHeader` molecule
- [ ] `SmartCell` molecule
- [ ] `ColumnManager` molecule
- [ ] Basic filtering molecules

#### Week 7-8: Row & Navigation
**Deliverables:**
- [ ] `SmartRow` molecule
- [ ] `Pagination` molecule
- [ ] `SearchBar` molecule
- [ ] `FilterPanel` molecule

---

### FASE 3: Organismos Core (Sprint 5-6) - 4 semanas

#### Week 9-10: Smart Table
**Deliverables:**
- [ ] `SmartTable` organism (nueva implementación)
- [ ] `TableShell` organism
- [ ] Legacy adapter para compatibilidad

#### Week 11-12: Specialized Tables
**Deliverables:**
- [ ] `JsonTableV2` organism
- [ ] `NestedTableSystem` organism
- [ ] Migration utilities

---

### FASE 4: Templates & Integration (Sprint 7-8) - 4 semanas

#### Week 13-14: Templates
**Deliverables:**
- [ ] `TableWorkspace` template
- [ ] `DataExplorer` template
- [ ] `AnalyticsDashboard` template

#### Week 15-16: Migration & Cleanup
**Deliverables:**
- [ ] Complete migration tools
- [ ] Legacy code cleanup
- [ ] Performance optimization
- [ ] Final documentation

---

## 🔧 Implementación Detallada

### 1. Átomos Base (Semana 1-2)

#### Atom: Table Cell
```tsx
// lib/table-system/atoms/primitives/table-cell.tsx
import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"

const cellVariants = cva(
  "p-4 border-x border-y border-zinc-200 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background",
        selected: "bg-muted",
        error: "bg-destructive/10",
        loading: "bg-muted animate-pulse"
      },
      size: {
        sm: "p-2 text-sm",
        default: "p-4",
        lg: "p-6 text-lg"
      },
      alignment: {
        left: "text-left",
        center: "text-center",
        right: "text-right"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      alignment: "left"
    }
  }
)

interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof cellVariants> {
  isLoading?: boolean
  hasError?: boolean
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, variant, size, alignment, isLoading, hasError, ...props }, ref) => {
    const computedVariant = isLoading
      ? "loading"
      : hasError
      ? "error"
      : variant

    return (
      <td
        ref={ref}
        className={cn(cellVariants({ variant: computedVariant, size, alignment }), className)}
        {...props}
      />
    )
  }
)
```

#### Atom: Sort Control
```tsx
// lib/table-system/atoms/controls/sort-control.tsx
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type SortDirection = "asc" | "desc" | false
export type SortType = "text" | "numeric" | "datetime" | "none"

interface SortControlProps {
  direction: SortDirection
  sortType: SortType
  disabled?: boolean
  onSort: (direction: SortDirection) => void
  className?: string
}

const getSortTooltip = (direction: SortDirection, sortType: SortType) => {
  if (sortType === "none") return "No se puede ordenar este tipo de dato"

  if (!direction) {
    return `Ordenar ${
      sortType === "datetime" ? "por fecha" :
      sortType === "numeric" ? "numéricamente" :
      "alfabéticamente"
    }`
  }

  if (direction === "asc") {
    return `Ordenado ${
      sortType === "datetime" ? "de más antiguo a más reciente" :
      sortType === "numeric" ? "de menor a mayor" :
      "de A a Z"
    } - Click para invertir`
  }

  return `Ordenado ${
    sortType === "datetime" ? "de más reciente a más antiguo" :
    sortType === "numeric" ? "de mayor a menor" :
    "de Z a A"
  } - Click para quitar ordenamiento`
}

export const SortControl = ({
  direction,
  sortType,
  disabled = false,
  onSort,
  className
}: SortControlProps) => {
  const handleClick = () => {
    if (disabled) return

    // Three-state cycle: none → asc → desc → none
    if (!direction) {
      onSort("asc")
    } else if (direction === "asc") {
      onSort("desc")
    } else {
      onSort(false)
    }
  }

  const icon = !direction
    ? <ArrowUpDown className="h-4 w-4" />
    : direction === "asc"
    ? <ArrowUp className="h-4 w-4" />
    : <ArrowDown className="h-4 w-4" />

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            direction ? "text-primary" : "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={handleClick}
          disabled={disabled}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{getSortTooltip(direction, sortType)}</p>
      </TooltipContent>
    </Tooltip>
  )
}
```

### 2. Core Hooks (Semana 3-4)

#### Hook: useTableData
```tsx
// lib/table-system/core/hooks/use-table-data.ts
import { useState, useMemo, useCallback } from "react"
import { ProcessedRow, ProcessedItem } from "../types"
import { processBatchData } from "../utils/data-processing"

interface UseTableDataProps {
  data: Record<string, unknown>[]
  processingOptions?: ProcessingOptions
}

interface ProcessingOptions {
  sampleSize?: number
  enableTypeDetection?: boolean
  enableNesting?: boolean
}

export const useTableData = ({
  data,
  processingOptions = {}
}: UseTableDataProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState<Error | null>(null)

  const processedData = useMemo(() => {
    if (!data?.length) return []

    try {
      setIsProcessing(true)
      setProcessingError(null)

      const result = processBatchData(data, {
        sampleSize: 100,
        ...processingOptions
      })

      return result
    } catch (error) {
      setProcessingError(error as Error)
      return []
    } finally {
      setIsProcessing(false)
    }
  }, [data, processingOptions])

  const tableData = useMemo(() => {
    return processedData.map((items: ProcessedItem[]) => {
      return items.reduce<ProcessedRow>((acc, item) => {
        acc[item.id] = item
        return acc
      }, {})
    })
  }, [processedData])

  const columns = useMemo(() => {
    if (!processedData[0]) return []
    return processedData[0]
  }, [processedData])

  const refetch = useCallback(() => {
    // Trigger re-processing
    setIsProcessing(true)
  }, [])

  return {
    data: tableData,
    columns,
    isProcessing,
    processingError,
    refetch,
    rawData: data,
    processedData
  }
}
```

#### Hook: useTableSorting
```tsx
// lib/table-system/core/hooks/use-table-sorting.ts
import { useState, useCallback, useMemo } from "react"
import { SortDirection, SortType } from "../types"

interface SortState {
  columnId: string
  direction: SortDirection
  sortType: SortType
}

export const useTableSorting = (initialSort?: SortState[]) => {
  const [sorting, setSorting] = useState<SortState[]>(initialSort || [])

  const getSortState = useCallback((columnId: string) => {
    return sorting.find(sort => sort.columnId === columnId)
  }, [sorting])

  const handleSort = useCallback((columnId: string, direction: SortDirection, sortType: SortType) => {
    setSorting(prevSorting => {
      // Remove existing sort for this column
      const filtered = prevSorting.filter(sort => sort.columnId !== columnId)

      // Add new sort if direction is not false
      if (direction) {
        return [{ columnId, direction, sortType }, ...filtered]
      }

      return filtered
    })
  }, [])

  const clearSorting = useCallback(() => {
    setSorting([])
  }, [])

  const clearColumnSort = useCallback((columnId: string) => {
    setSorting(prevSorting =>
      prevSorting.filter(sort => sort.columnId !== columnId)
    )
  }, [])

  // Generate sort function for tanstack table
  const sortingFn = useMemo(() => {
    return (rowA: any, rowB: any, columnId: string) => {
      const sortState = getSortState(columnId)
      if (!sortState) return 0

      const valueA = rowA.getValue(columnId)
      const valueB = rowB.getValue(columnId)

      // Handle null/undefined
      if (valueA?.value == null && valueB?.value == null) return 0
      if (valueA?.value == null) return 1
      if (valueB?.value == null) return -1

      const rawA = valueA.value
      const rawB = valueB.value

      switch (sortState.sortType) {
        case "datetime":
          const dateA = valueA.dateValue || new Date(String(rawA))
          const dateB = valueB.dateValue || new Date(String(rawB))
          return dateA.getTime() - dateB.getTime()

        case "numeric":
          const numA = typeof rawA === 'number' ? rawA : parseFloat(String(rawA))
          const numB = typeof rawB === 'number' ? rawB : parseFloat(String(rawB))

          if (isNaN(numA) && isNaN(numB)) return 0
          if (isNaN(numA)) return 1
          if (isNaN(numB)) return -1

          return numA - numB

        case "text":
        default:
          return String(rawA).localeCompare(String(rawB), 'es', {
            numeric: true,
            sensitivity: 'base'
          })
      }
    }
  }, [getSortState])

  return {
    sorting,
    getSortState,
    handleSort,
    clearSorting,
    clearColumnSort,
    sortingFn,
    hasSorting: sorting.length > 0
  }
}
```

### 3. Moléculas Avanzadas (Semana 5-8)

#### Molecule: Smart Header
```tsx
// lib/table-system/molecules/table-parts/smart-header.tsx
import { TableHead } from "@/components/ui/table"
import { SortControl } from "../../atoms/controls/sort-control"
import { FilterControl } from "../../atoms/controls/filter-control"
import { TypeIndicator } from "../../atoms/indicators/type-indicator"
import { ProcessedItem } from "../../core/types"
import { getSortableInfo } from "../../core/utils/sort-utils"

interface SmartHeaderProps {
  column: ProcessedItem
  sortState?: { direction: SortDirection; sortType: SortType }
  filterState?: any
  onSort?: (direction: SortDirection) => void
  onFilter?: (filterValue: any) => void
  className?: string
  style?: React.CSSProperties
}

export const SmartHeader = ({
  column,
  sortState,
  filterState,
  onSort,
  onFilter,
  className,
  style
}: SmartHeaderProps) => {
  const isReferenceColumn = column.id === "__parentId" || column.id === "__parentTable"
  const sortInfo = getSortableInfo(isReferenceColumn ? "string" : column.type)
  const displayName = column.path.length > 1 ? column.id : column.path[column.path.length - 1]

  return (
    <TableHead
      className={cn("px-4 bg-background border-x border-y border-zinc-200 text-center font-black", className)}
      style={style}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TypeIndicator type={isReferenceColumn ? "string" : column.type} />
          <span className="truncate max-w-[200px]" title={column.id}>
            {displayName}
          </span>
        </div>

        <div className="flex items-center">
          {onSort && (
            <SortControl
              direction={sortState?.direction || false}
              sortType={sortInfo.sortType}
              disabled={!sortInfo.sortable}
              onSort={onSort}
            />
          )}

          {onFilter && (
            <FilterControl
              columnId={column.id}
              columnType={isReferenceColumn ? "string" : column.type}
              isActive={!!filterState}
              onFilter={onFilter}
            />
          )}
        </div>
      </div>
    </TableHead>
  )
}
```

### 4. Organismo Principal (Semana 9-12)

#### Organism: Smart Table
```tsx
// lib/table-system/organisms/tables/smart-table.tsx
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table"
import { Table, TableBody, TableHeader } from "@/components/ui/table"
import { SmartHeader } from "../../molecules/table-parts/smart-header"
import { SmartCell } from "../../molecules/table-parts/smart-cell"
import { SmartRow } from "../../molecules/table-parts/smart-row"
import { useTableData } from "../../core/hooks/use-table-data"
import { useTableSorting } from "../../core/hooks/use-table-sorting"
import { useTableFilters } from "../../core/hooks/use-table-filters"

interface SmartTableProps {
  data: Record<string, unknown>[]
  features?: {
    sorting?: boolean
    filtering?: boolean
    pagination?: boolean
    selection?: boolean
    export?: boolean
  }
  className?: string
  onDataChange?: (data: any[]) => void
}

export const SmartTable = ({
  data,
  features = {
    sorting: true,
    filtering: true,
    pagination: true,
    selection: false,
    export: false
  },
  className,
  onDataChange
}: SmartTableProps) => {
  const {
    data: tableData,
    columns: rawColumns,
    isProcessing
  } = useTableData({ data })

  const {
    sorting,
    getSortState,
    handleSort,
    sortingFn
  } = useTableSorting()

  const {
    filters,
    getFilterState,
    handleFilter,
    filterFn
  } = useTableFilters()

  // Generate column definitions
  const columns = useMemo(() => {
    if (!rawColumns.length) return []

    return rawColumns.map(column => ({
      id: column.id,
      accessorFn: (row: any) => row[column.id],
      header: ({ column: tableColumn }) => (
        <SmartHeader
          column={column}
          sortState={getSortState(column.id)}
          filterState={getFilterState(column.id)}
          onSort={features.sorting ? (direction) => handleSort(column.id, direction, getSortableInfo(column.type).sortType) : undefined}
          onFilter={features.filtering ? (filterValue) => handleFilter(column.id, filterValue) : undefined}
        />
      ),
      cell: ({ getValue }) => (
        <SmartCell
          value={getValue()}
          type={column.type}
          interactive={features.selection}
        />
      ),
      enableSorting: features.sorting && getSortableInfo(column.type).sortable,
      sortingFn: sortingFn,
      filterFn: filterFn
    }))
  }, [rawColumns, features, getSortState, getFilterState, handleSort, handleFilter, sortingFn, filterFn])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting: sorting.map(s => ({ id: s.columnId, desc: s.direction === "desc" })),
      columnFilters: filters
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSorting: features.sorting,
    enableFilters: features.filtering
  })

  if (isProcessing) {
    return <TableSkeleton />
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                flexRender(header.column.columnDef.header, header.getContext())
              ))}
            </tr>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map(row => (
            <SmartRow
              key={row.id}
              row={row}
              selectable={features.selection}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### 5. Legacy Adapter (Semana 11-12)

```tsx
// lib/table-system/adapters/legacy-adapter.tsx
import { SmartTable } from "../organisms/tables/smart-table"
import { JsonTableProps } from "../../table/json-table" // Old component

/**
 * Legacy adapter to maintain compatibility with existing JsonTable usage
 * This allows gradual migration without breaking changes
 */
export const JsonTableV2 = (props: JsonTableProps) => {
  // Map old props to new SmartTable props
  const mappedProps = {
    data: props.data,
    features: {
      sorting: true,
      filtering: true,
      pagination: true,
      selection: false,
      export: false
    },
    onDataChange: props.onArrayColumnsChange ?
      (data: any[]) => {
        // Convert data back to array columns format if needed
        // This is where we handle the nested tables logic
      } : undefined
  }

  return <SmartTable {...mappedProps} />
}

// Re-export with same interface for drop-in replacement
export { JsonTableV2 as JsonTable }
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// __tests__/atoms/sort-control.test.tsx
import { render, fireEvent, screen } from '@testing-library/react'
import { SortControl } from '../atoms/controls/sort-control'

describe('SortControl', () => {
  it('cycles through sort states correctly', () => {
    const onSort = jest.fn()

    render(
      <SortControl
        direction={false}
        sortType="text"
        onSort={onSort}
      />
    )

    const button = screen.getByRole('button')

    // First click: none → asc
    fireEvent.click(button)
    expect(onSort).toHaveBeenCalledWith('asc')

    // Second click: asc → desc
    onSort.mockClear()
    render(
      <SortControl
        direction="asc"
        sortType="text"
        onSort={onSort}
      />
    )
    fireEvent.click(button)
    expect(onSort).toHaveBeenCalledWith('desc')
  })
})
```

### Integration Tests
```typescript
// __tests__/organisms/smart-table.test.tsx
import { render, screen } from '@testing-library/react'
import { SmartTable } from '../organisms/tables/smart-table'

const mockData = [
  { id: 1, name: 'John', age: 30, date: '2023-01-01' },
  { id: 2, name: 'Jane', age: 25, date: '2023-02-01' }
]

describe('SmartTable', () => {
  it('renders data correctly', async () => {
    render(<SmartTable data={mockData} />)

    await screen.findByText('John')
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('handles sorting correctly', async () => {
    render(<SmartTable data={mockData} features={{ sorting: true }} />)

    const sortButton = screen.getByLabelText(/ordenar/i)
    fireEvent.click(sortButton)

    // Verify sorting behavior
  })
})
```

---

## 📚 Documentation Plan

### Storybook Stories
```typescript
// stories/atoms/SortControl.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { SortControl } from '../lib/table-system/atoms/controls/sort-control'

const meta: Meta<typeof SortControl> = {
  title: 'Table System/Atoms/SortControl',
  component: SortControl,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    direction: false,
    sortType: 'text',
    onSort: (direction) => console.log('Sort:', direction)
  }
}

export const Ascending: Story = {
  args: {
    direction: 'asc',
    sortType: 'text',
    onSort: (direction) => console.log('Sort:', direction)
  }
}

export const Numeric: Story = {
  args: {
    direction: false,
    sortType: 'numeric',
    onSort: (direction) => console.log('Sort:', direction)
  }
}

export const Disabled: Story = {
  args: {
    direction: false,
    sortType: 'none',
    disabled: true,
    onSort: (direction) => console.log('Sort:', direction)
  }
}
```

### Usage Guidelines
```markdown
# Table System Usage Guide

## Quick Start

\`\`\`tsx
import { SmartTable } from '@/lib/table-system'

const MyComponent = () => {
  const data = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 }
  ]

  return (
    <SmartTable
      data={data}
      features={{
        sorting: true,
        filtering: true,
        pagination: true
      }}
    />
  )
}
\`\`\`

## Migration from Legacy

\`\`\`tsx
// Before
import { JsonTable } from '@/app/table/json-table'

// After
import { JsonTable } from '@/lib/table-system/adapters/legacy-adapter'
// Or for new implementations:
import { SmartTable } from '@/lib/table-system'
\`\`\`
```

---

## 🚀 Migration Script

```bash
#!/bin/bash
# migration-script.sh

echo "🧬 Starting Atomic Design Migration..."

# Phase 1: Create structure
echo "📁 Creating folder structure..."
mkdir -p lib/table-system/{atoms,molecules,organisms,templates,core}
mkdir -p lib/table-system/atoms/{primitives,controls,indicators}
mkdir -p lib/table-system/molecules/{table-parts,filters,navigation}
mkdir -p lib/table-system/organisms/{tables,panels}
mkdir -p lib/table-system/core/{hooks,providers,types,utils}

# Phase 2: Setup package.json for internal package
echo "📦 Setting up internal package..."
cat > lib/table-system/package.json << EOF
{
  "name": "@internal/table-system",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "exports": {
    ".": "./index.ts",
    "./atoms": "./atoms/index.ts",
    "./molecules": "./molecules/index.ts",
    "./organisms": "./organisms/index.ts",
    "./templates": "./templates/index.ts"
  }
}
EOF

# Phase 3: Create index files
echo "📄 Creating index files..."
touch lib/table-system/{atoms,molecules,organisms,templates,core}/index.ts
touch lib/table-system/index.ts

echo "✅ Migration structure ready!"
echo "🎯 Next steps:"
echo "1. Run: npm run storybook"
echo "2. Start implementing atoms"
echo "3. Follow the phase timeline"
```

---

## 📊 Success Metrics

### Development Metrics
- [ ] **Migration Speed**: Each phase completed on time
- [ ] **Code Coverage**: >90% for atoms, >85% for molecules
- [ ] **Bundle Size**: No increase >10% from current
- [ ] **Performance**: Table rendering <100ms for 1000 rows

### Team Metrics
- [ ] **Learning Curve**: Team comfortable with new system in 2 weeks
- [ ] **Adoption Rate**: 100% of new features use atomic components
- [ ] **Developer Experience**: Storybook stories for all components
- [ ] **Documentation**: Complete usage guide and examples

### Business Metrics
- [ ] **Zero Regressions**: No functional loss during migration
- [ ] **Feature Velocity**: Maintain current development speed
- [ ] **Reusability**: 3+ projects using the new table system
- [ ] **Maintenance**: 50% reduction in table-related bugs

---

## 🎯 Next Steps

1. **Review & Approval**: Get stakeholder buy-in on this plan
2. **Team Preparation**: Setup tooling (Storybook, testing, linting)
3. **Phase 1 Kickoff**: Start with atoms and core infrastructure
4. **Weekly Reviews**: Track progress and adjust timeline as needed
5. **Gradual Rollout**: Use feature flags for safe deployment

---

¿Te parece bien este plan? ¿Hay algún aspecto que quieras ajustar o profundizar? 🤔
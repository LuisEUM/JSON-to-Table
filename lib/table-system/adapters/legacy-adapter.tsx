/**
 * Legacy Adapter - Compatibility Layer
 *
 * This adapter maintains 100% compatibility with the existing JsonTable component
 * while using the new Atomic Design architecture underneath.
 *
 * IMPORTANT: This is a transitional component. Do not modify the original
 * app/table/json-table.tsx until this adapter is fully tested and approved.
 */

import React from 'react'
import { JsonTable as AtomicJsonTable } from '../organisms/tables/json-table'

// Re-export the exact same interface as the original
export interface JsonTableProps {
  data: Record<string, unknown>[]
  isLoading?: boolean
  isSecondaryTable?: boolean
  onArrayColumnsChange?: (
    columns: {
      id: string
      label: string
      data: Record<string, unknown>[]
    }[]
  ) => void
  parentTableInfo?: {
    id: string
    name: string
  }
}

/**
 * Legacy JsonTable adapter
 *
 * This component acts as a drop-in replacement for the original JsonTable.
 * It forwards all props to the new atomic implementation without any changes.
 *
 * Usage:
 * 1. Import from this adapter instead of the original
 * 2. All existing props and functionality work exactly the same
 * 3. No code changes needed in consuming components
 */
export const JsonTable: React.FC<JsonTableProps> = (props) => {
  // For now, we simply forward to the copied atomic version
  // In the future, this could include prop transformation or additional logic
  return <AtomicJsonTable {...props} />
}

// Re-export other commonly used types and components for compatibility
export { FilterContext } from '../organisms/tables/json-table'

// Convenience exports for components that might be imported directly
export { CellFactory } from '../molecules/table-parts/cell-factory'
export { TypeDot } from '../atoms/indicators/TypeDot'
export { TypeLegend } from '../atoms/indicators/TypeLegend'

/**
 * Migration Guide:
 *
 * OLD:
 * import { JsonTable } from '@/app/table/json-table'
 *
 * NEW (with adapter):
 * import { JsonTable } from '@/lib/table-system/adapters/legacy-adapter'
 *
 * FUTURE (direct atomic):
 * import { JsonTable } from '@/lib/table-system'
 */
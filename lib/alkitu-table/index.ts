// Table System - Atomic Design Architecture
//
// This is the main entry point for the table system following Atomic Design principles:
// - Atoms: Basic building blocks (cells, indicators)
// - Molecules: Functional combinations (filters, navigation)
// - Organisms: Complex components (full tables, panels)
// - Core: Shared utilities and business logic

// Atomic Design Levels
export * from './atoms'
export * from './molecules'
export * from './organisms'
export * from './core'

// Convenience re-exports for common use cases
export { JsonTable } from './organisms/tables/json-table'
export { CellFactory } from './molecules/table-parts/cell-factory'
export { FilterFactory } from './molecules/filters/filter-factory'
export { TypeDot } from './atoms/indicators/TypeDot'

// Legacy compatibility (will be marked as deprecated in future versions)
export { JsonTable as TableSystemJsonTable } from './organisms/tables/json-table'
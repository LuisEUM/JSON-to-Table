// Core utilities - Business logic and data processing
// Main data processor exports
export {
  processValue,
  processData,
  groupColumns,
  flattenObject,
  isIdField,
  inferColumnType,
  analyzeColumnTypes,
  type ProcessedItem,
  type ProcessedRow,
  type ProcessedValue,
  type ValueType,
} from './data-processor';

// Core table utilities
export * from './export-utils';

// Direct re-exports for utilities that exist but have compilation issues
// Re-export with explicit naming to avoid conflicts
export { TypeDetector, typeDetector } from './type-detector';
export { isDateColumnName, isStrongDateColumn, cleanStringValue } from './date-utils';
export { formatDateString, toUTCDate } from './date-formatter';

// Type inference engine
export {
  inferTypeFromSample,
  detectDateType,
  detectNumberType,
  detectBooleanType,
  detectArrayType,
  detectObjectType,
  setTypeInferenceLogger,
  type DetectionResult,
  type ColumnTypeInfo,
} from './type-inference';

// Type cache utilities
export { getCached, setCache, clearTypeCache, generateCacheKey } from './type-cache';

// Error handling utilities (explicit names to avoid conflicts with date-formatter)
export {
  AppError,
  DataProcessingError,
  DateProcessingError,
  TypeDetectionError,
  ValidationError,
  withErrorHandling,
  logError,
  isError,
  toError,
} from './error-handling';
// Core constants - Type styles and configurations
export * from './type-styles';
export * from './regex-patterns';
export * from './field-patterns';

export const TABLE_DEFAULTS = {
  PAGE_SIZE: 50,
  SAMPLE_SIZE: 100,
  MAX_UNIQUE_VALUES: 5000,
  DEBOUNCE_MS: 300,
  MIN_TABLE_HEIGHT: 300,
  MAX_TABLE_HEIGHT: 800,
} as const;

export const TYPE_THRESHOLDS = {
  DATE_DETECTION: 0.7,
  DATE_NAME_HINT: 0.3,
  BOOLEAN_DETECTION: 0.95,
  NUMERIC_DETECTION: 0.7,
  OBJECT_DETECTION: 0.1,
} as const;
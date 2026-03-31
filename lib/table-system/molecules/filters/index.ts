// Filter components - Atomic Design Level 2

// Filter components
export { FilterFactory } from "./filter-factory";
export { StringFilter } from "./string-filter";
export { NumberFilter } from "./number-filter";
export { DateFilter } from "./date-filter";
export { ArrayFilter } from "./array-filter";
export { AtomicPrimitiveArrayFilter } from "./atomic-primitive-array-filter";
export { ObjectPropertyFilter } from "./object-property-filter";

// Filter UI components
export { FilterCombobox } from "./filter-combobox";
export { FilterFooter } from "./filter-footer";
export { FilterHoverCard } from "./filter-hover-card";
export { FilterTabs } from "./filter-tabs";

// Embedded filter components (used by AtomicPrimitiveArrayFilter)
export {
  EmbeddedArrayFilter,
  EmbeddedStringFilter,
  EmbeddedNumberFilter,
  EmbeddedDateFilter,
  getAvailableFilterTypes,
} from "./embedded-filter-components";

// Utilities
export { DataPatternAnalyzer } from "./pattern-analyzer";
export { ColumnTypeDetector, TypeDetectionUtils } from "./type-detector";

// Filter function implementations
export { filterFns, dateBetweenFilterFn } from "./filter-fns";
export type { FilterFunctions } from "./filter-fns";

// Types
export type {
  FilterComponentProps,
  FilterCondition,
  FilterOperator,
  FilterValue,
  FilterOption,
} from "./filter-types";

export type {
  TypeDetectionResult,
  DetectedColumnType,
  SeparatorDetectionResult,
} from "./type-detector";

export type { FilterTypeOption } from "./embedded-filter-components";

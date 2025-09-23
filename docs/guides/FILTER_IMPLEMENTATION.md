# Filter Implementation Guide

## Overview

The filter system in JSON-to-Table provides type-specific filtering capabilities with an adaptive UI that adjusts based on data patterns. This guide explains how filters work and how to implement new filter types.

## Filter Architecture

### Component Hierarchy

```
FilterFactory (Orchestrator)
├── StringFilter
├── NumberFilter
├── DateFilter
├── ArrayFilter
│   ├── PrimitiveArrayFilter
│   └── ObjectArrayFilter
├── ObjectPropertyFilter
└── AdaptiveFilterFactory (Pattern-based selection)
```

## Filter Types

### 1. String Filter

**Location**: `lib/table-system/molecules/filters/string-filter.tsx`

**Features**:
- Text search with multiple operators
- Separator detection for multi-value fields
- Exact match toggle
- Quick filter checkboxes for common values

**Operators**:
- `equals`: Exact string match
- `contains`: Substring search
- `in`: Value in list (with separator support)
- `not_equals`: Inverse of equals

**Usage Example**:
```typescript
<StringFilter
  columnId="name"
  onApply={(filter) => applyFilter(filter)}
  uniqueValues={['Apple', 'Banana', 'Cherry']}
/>
```

### 2. Number Filter

**Location**: `lib/table-system/molecules/filters/number-filter.tsx`

**Features**:
- Range selection with min/max
- Dynamic presets based on data distribution
- Statistical calculations (avg, median, quartiles)
- Visual slider for range selection

**Operators**:
- `equals`: Exact number match
- `between`: Range inclusive
- `gte`: Greater than or equal
- `lte`: Less than or equal

**Preset Logic**:
```typescript
// Automatic presets based on data
- "Low Values": Below 25th percentile
- "Medium Values": 25th-75th percentile
- "High Values": Above 75th percentile
- "Above Average": Greater than mean
- "Below Average": Less than mean
```

### 3. Date Filter

**Location**: `lib/table-system/molecules/filters/date-filter.tsx`

**Features**:
- Date range picker
- Quick selections (Today, This Week, This Month, etc.)
- Multiple date format support
- Timezone handling

**Quick Selections**:
- Today
- Yesterday
- This Week
- Last Week
- This Month
- Last Month
- This Year
- Last 30 Days
- Last 90 Days

### 4. Array Filter

**Location**: `lib/table-system/molecules/filters/array-filter.tsx`

**Features**:
- Automatic detection of array content type
- Different UI for primitive vs object arrays
- Length-based filtering
- Content-based filtering

**Sub-types**:

#### Primitive Array Filter
**Location**: `lib/table-system/molecules/filters/primitive-array-filter.tsx`

Groups primitive values by type:
- Strings group
- Numbers group
- Dates group
- Booleans group

#### Atomic Primitive Array Filter
**Location**: `lib/table-system/molecules/filters/atomic-primitive-array-filter.tsx`

Enhanced version with:
- Type-based grouping with visual indicators
- Search within groups
- Accordion organization
- Tab navigation between filter modes

### 5. Object Property Filter

**Location**: `lib/table-system/molecules/filters/object-property-filter.tsx`

**Features**:
- Property selection dropdown
- Nested property support
- Type-specific filtering per property
- Schema analysis for consistent objects

## Implementation Guide

### Adding a New Filter Type

#### Step 1: Create Filter Component

```typescript
// lib/table-system/molecules/filters/custom-filter.tsx
import { FilterComponentProps, FilterValue } from "./filter-types";
import { FilterFooter } from "./filter-footer";

export function CustomFilter({
  columnId,
  onApply,
  onClear,
  onClose,
  initialValue,
  uniqueValues
}: FilterComponentProps) {
  const [filterValue, setFilterValue] = useState<FilterValue>({
    column: columnId,
    operator: "equals",
    value: null
  });

  const handleApply = () => {
    onApply(filterValue);
    onClose?.();
  };

  return (
    <div className="p-4 space-y-4">
      {/* Filter UI Implementation */}

      <FilterFooter
        onApply={handleApply}
        onClear={onClear}
        onClose={onClose}
      />
    </div>
  );
}
```

#### Step 2: Register in Filter Factory

```typescript
// lib/table-system/molecules/filters/filter-factory.tsx
import { CustomFilter } from "./custom-filter";

export function FilterFactory({ dataType, ...props }: FilterFactoryProps) {
  switch (dataType) {
    // ... existing cases
    case "custom":
      return <CustomFilter {...props} />;
    default:
      return <StringFilter {...props} />;
  }
}
```

#### Step 3: Add Filter Logic

```typescript
// lib/table-system/organisms/tables/json-table.tsx
// In the filter application function

case "custom":
  switch (filterValue.operator) {
    case "special_op":
      // Custom filter logic
      return customComparison(rawValue, filterValue.value);
  }
  break;
```

#### Step 4: Update Type Detection

```typescript
// lib/table-system/core/utils/type-detector.ts
export function detectType(value: unknown): string {
  if (isCustomType(value)) return "custom";
  // ... existing type checks
}

export function isCustomType(value: unknown): boolean {
  // Custom type detection logic
  return false;
}
```

### Filter Value Structure

All filters must produce a `FilterValue` object:

```typescript
interface FilterValue {
  column: string;           // Column identifier
  operator: string;          // Filter operator
  value: unknown;           // Filter value(s)
  additionalValue?: unknown; // Optional: for ranges, separators, etc.
  exactMatch?: boolean;      // Optional: for exact matching
  metadata?: Record<string, unknown>; // Optional: additional data
}
```

### Filter Operators

Common operators across filter types:

| Operator | Description | Supported Types |
|----------|-------------|-----------------|
| equals | Exact match | All |
| not_equals | Not equal | All |
| contains | Substring/includes | String, Array |
| in | Value in list | String, Array |
| between | Range (inclusive) | Number, Date |
| gte | Greater than or equal | Number, Date |
| lte | Less than or equal | Number, Date |
| is_empty | Null or empty | All |
| is_not_empty | Has value | All |

### Best Practices

#### 1. Performance

```typescript
// Use memoization for expensive calculations
const processedValues = useMemo(() => {
  return expensiveProcessing(uniqueValues);
}, [uniqueValues]);

// Debounce search inputs
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  [handleSearch]
);
```

#### 2. User Experience

```typescript
// Provide loading states
if (isProcessing) {
  return <FilterSkeleton />;
}

// Show helpful empty states
if (uniqueValues.length === 0) {
  return <EmptyFilterState />;
}

// Limit displayed options for performance
const displayValues = uniqueValues.slice(0, 100);
```

#### 3. Type Safety

```typescript
// Use type guards
function isValidFilterValue(value: unknown): value is FilterValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "column" in value &&
    "operator" in value
  );
}

// Validate inputs
if (!isValidFilterValue(filter)) {
  throw new Error("Invalid filter value");
}
```

### Testing Filters

#### Unit Test Example

```typescript
// lib/table-system/molecules/filters/__tests__/custom-filter.test.tsx
describe("CustomFilter", () => {
  it("should apply filter with correct value", () => {
    const onApply = jest.fn();
    const { getByText, getByRole } = render(
      <CustomFilter
        columnId="test"
        onApply={onApply}
        uniqueValues={[1, 2, 3]}
      />
    );

    // Interact with filter
    fireEvent.change(getByRole("textbox"), { target: { value: "2" } });
    fireEvent.click(getByText("Apply"));

    // Verify filter application
    expect(onApply).toHaveBeenCalledWith({
      column: "test",
      operator: "equals",
      value: "2"
    });
  });
});
```

#### Integration Test Example

```typescript
// lib/table-system/core/filters/__tests__/custom-filter-logic.test.ts
describe("Custom Filter Logic", () => {
  const testData = generateTestData();

  it("should filter data correctly", () => {
    const filter: FilterValue = {
      column: "custom",
      operator: "special_op",
      value: "test"
    };

    const result = applyFilter(testData, filter);
    expect(result).toHaveLength(expectedCount);
    expect(result.every(item =>
      validateCustomFilter(item.custom, "test")
    )).toBe(true);
  });
});
```

## Advanced Features

### Pattern Analysis

The system can analyze data patterns to suggest appropriate filters:

```typescript
// lib/table-system/molecules/filters/pattern-analyzer.ts
export function analyzePattern(values: unknown[]): PatternInfo {
  // Detect separators (comma, semicolon, pipe)
  // Identify date formats
  // Find numeric ranges
  // Detect enumerated values
}
```

### Adaptive Filters

Filters that change UI based on data:

```typescript
// lib/table-system/molecules/filters/adaptive-filter-factory.tsx
export function AdaptiveFilterFactory({ columnData, ...props }) {
  const pattern = analyzePattern(columnData);

  if (pattern.hasSeparator) {
    return <StringFilter separator={pattern.separator} {...props} />;
  }

  if (pattern.isEnum && pattern.uniqueCount < 10) {
    return <CheckboxFilter options={pattern.values} {...props} />;
  }

  // Fall back to standard filter
  return <FilterFactory {...props} />;
}
```

### Filter Composition

Combine multiple filters:

```typescript
// Composite filter for complex scenarios
function CompositeFilter({ filters }: { filters: FilterValue[] }) {
  return data.filter(item => {
    return filters.every(filter =>
      applyFilter([item], filter).length > 0
    );
  });
}
```

## Troubleshooting

### Common Issues

1. **Filter not appearing**
   - Check type detection is returning correct type
   - Verify filter is registered in FilterFactory

2. **Filter not working**
   - Check filter logic in json-table.tsx
   - Verify operator implementation
   - Check data type compatibility

3. **Performance issues**
   - Limit unique values displayed
   - Implement virtual scrolling for long lists
   - Use memoization for expensive operations

4. **Type mismatches**
   - Ensure proper type conversion
   - Validate filter values before applying
   - Handle edge cases (null, undefined)

## Future Enhancements

### Planned Features

1. **Saved Filter Presets**
   - User-defined filter combinations
   - Quick apply from saved presets

2. **Filter Expressions**
   - Complex boolean expressions
   - AND/OR combinations
   - Nested conditions

3. **Smart Suggestions**
   - ML-based filter recommendations
   - Usage pattern learning
   - Context-aware suggestions

4. **Performance Optimizations**
   - Indexed filtering for large datasets
   - Server-side filtering option
   - Filter result caching
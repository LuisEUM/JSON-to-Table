# Development Guide - JSON-to-Table

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (optional, for persistence features)

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables (if using persistence)
cp .env.example .env.local

# Run development server
npm run dev
```

## Development Workflow

### 1. Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bug fix branch
git checkout -b fix/bug-description

# Create documentation branch
git checkout -b docs/documentation-topic
```

### 2. Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Run tests in watch mode during development
npm run test:watch

# Check types continuously
npm run type-check

# Lint code
npm run lint

# Full pre-deployment check
npm run predeploy
```

### 3. Testing During Development

#### Run Specific Test File
```bash
npm test -- path/to/test.test.ts
```

#### Run Tests for a Module
```bash
npm test -- lib/table-system/core/filters
```

#### Check Coverage
```bash
npm run test:coverage
```

## Component Development

### Creating New Atomic Components

#### 1. Atom Component
```typescript
// lib/table-system/atoms/primitives/new-cell.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface NewCellProps {
  value: unknown;
  className?: string;
}

export function NewCell({ value, className }: NewCellProps) {
  return (
    <div className={cn("text-sm", className)}>
      {/* Implementation */}
    </div>
  );
}
```

#### 2. Molecule Component
```typescript
// lib/table-system/molecules/filters/new-filter.tsx
import { FilterComponentProps } from "./filter-types";

export function NewFilter({
  columnId,
  onApply,
  onClear,
  uniqueValues
}: FilterComponentProps) {
  // Implementation
}
```

#### 3. Organism Component
```typescript
// lib/table-system/organisms/panels/new-panel.tsx
export function NewPanel() {
  // Compose molecules and atoms
}
```

### Adding New Filter Types

1. **Create Filter Component**
```typescript
// lib/table-system/molecules/filters/custom-filter.tsx
import type { FilterComponentProps } from "./filter-types";

export function CustomFilter(props: FilterComponentProps) {
  // Filter UI implementation
}
```

2. **Register in Filter Factory**
```typescript
// lib/table-system/molecules/filters/filter-factory.tsx
import { CustomFilter } from "./custom-filter";

// Add to the switch statement
case "custom":
  return <CustomFilter {...props} />;
```

3. **Add Filter Logic**
```typescript
// lib/table-system/organisms/tables/json-table.tsx
// Add to the filter application logic
case "custom":
  // Custom filter logic
  break;
```

### Adding New Cell Types

1. **Create Cell Component**
```typescript
// lib/table-system/atoms/primitives/special-cell.tsx
export function SpecialCell({ value }: { value: unknown }) {
  // Cell rendering logic
}
```

2. **Register in Cell Factory**
```typescript
// lib/table-system/molecules/table-parts/cell-factory.tsx
import { SpecialCell } from "../../atoms/primitives/special-cell";

// Add type detection
if (isSpecialType(value)) {
  return <SpecialCell value={value} />;
}
```

## Data Processing

### Adding New Type Detectors

```typescript
// lib/table-system/core/utils/type-detector.ts

// Add new type detection function
export function isSpecialType(value: unknown): boolean {
  // Detection logic
}

// Update detectType function
export function detectType(value: unknown): string {
  if (isSpecialType(value)) return "special";
  // ... existing checks
}
```

### Custom Data Processors

```typescript
// lib/table-system/core/utils/data-processor.ts

// Add custom processing function
export function processSpecialData(data: unknown[]): ProcessedData[] {
  return data.map(item => {
    // Processing logic
    return processedItem;
  });
}
```

## Testing Guidelines

### Unit Test Structure

```typescript
// lib/table-system/core/utils/__tests__/feature.test.ts
import { describe, it, expect } from "@jest/globals";
import { featureFunction } from "../feature";

describe("featureFunction", () => {
  describe("normal cases", () => {
    it("should handle basic input", () => {
      expect(featureFunction(input)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("should handle null input", () => {
      expect(featureFunction(null)).toBe(expected);
    });
  });

  describe("error cases", () => {
    it("should throw on invalid input", () => {
      expect(() => featureFunction(invalid)).toThrow();
    });
  });
});
```

### Integration Test Example

```typescript
// lib/table-system/core/filters/__tests__/integration.test.ts
describe("Filter Integration", () => {
  it("should filter data correctly with multiple filters", () => {
    const data = generateTestData();
    const filters = [
      { column: "name", operator: "contains", value: "test" },
      { column: "age", operator: "gte", value: 18 }
    ];

    const result = applyFilters(data, filters);
    expect(result).toHaveLength(expectedCount);
  });
});
```

## Performance Optimization

### 1. Memoization

```typescript
import { useMemo } from "react";

function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  return <div>{/* Use processedData */}</div>;
}
```

### 2. Virtual Scrolling

```typescript
import { useVirtual } from "@tanstack/react-virtual";

function VirtualList({ items }) {
  const parentRef = useRef();
  const virtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: useCallback(() => 35, []),
  });

  // Render only visible items
}
```

### 3. Lazy Loading

```typescript
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Debugging

### 1. Logging Service

```typescript
import { LoggingService } from "@/lib/table-system/core/services/logging-service";

const logger = LoggingService.getInstance();
logger.debug("Debug information", { context: data });
logger.info("Process completed");
logger.warn("Potential issue", { details });
logger.error("Error occurred", error);
```

### 2. React DevTools

Use React DevTools Profiler to identify performance bottlenecks:
1. Open React DevTools
2. Navigate to Profiler tab
3. Start recording
4. Interact with the app
5. Analyze flame graph

### 3. Chrome DevTools

Memory profiling:
1. Open Chrome DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Perform actions
5. Take another snapshot
6. Compare snapshots

## Code Quality

### ESLint Rules

The project enforces strict ESLint rules. Fix issues with:

```bash
# Auto-fix issues
npm run lint -- --fix

# Check specific file
npx eslint path/to/file.tsx
```

### TypeScript Best Practices

1. **Use strict types**
```typescript
// Good
function process(data: string[]): ProcessedData[]

// Avoid
function process(data: any): any
```

2. **Define interfaces**
```typescript
interface TableProps {
  data: unknown[];
  columns: ColumnDef[];
  onSort?: (column: string) => void;
}
```

3. **Use type guards**
```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

## Deployment Preparation

### 1. Pre-deployment Checklist

```bash
# Run complete verification
npm run predeploy
```

This command will:
- Check for missing dependencies
- Run ESLint
- Run TypeScript type checking
- Build the application

### 2. Environment Variables

Required for production:
```env
# Database (if using persistence)
DATABASE_URL=mongodb+srv://...

# Authentication (if enabled)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com

# Optional
NEXT_PUBLIC_API_URL=...
```

### 3. Build Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for unused dependencies
npx depcheck
```

## Troubleshooting

### Common Issues

#### 1. Type Errors
```bash
# Clear TypeScript cache
rm -rf .next
npm run type-check
```

#### 2. Test Failures
```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

#### 3. Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Getting Help

1. Check existing issues in GitHub
2. Review documentation in `/docs`
3. Check test files for usage examples
4. Use the logging service for debugging

## Contributing

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Ensure all tests pass
4. Run `npm run predeploy`
5. Create pull request with description
6. Wait for review

### Code Review Checklist

- [ ] Tests added/updated
- [ ] TypeScript types correct
- [ ] Documentation updated
- [ ] Performance considered
- [ ] Accessibility maintained
- [ ] No console.logs left
- [ ] Follows atomic design pattern
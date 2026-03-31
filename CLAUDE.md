# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development & Build
- `npm run dev` - Start development server with Next.js
- `npm run build` - Build production version (runs `prisma generate` first)
- `npm run start` - Start production server
- `npm run predeploy` - Complete pre-deployment verification (runs dependency check, lint, type-check, and build)

### Testing
- `npm test` - Run all unit/component tests (Jest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests (Playwright)
- `npm run test:e2e:ui` - Run end-to-end tests with Playwright UI mode
- Run a single test file: `npm test -- path/to/test.test.ts`

### Code Quality
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking without emitting files

## High-Level Architecture

This is a Next.js 15 application for visualizing and analyzing JSON data in tabular format with advanced processing capabilities. The codebase uses a modular atomic design pattern in `lib/table-system/`.

### Core Architecture Components

1. **Table System** (`lib/table-system/`)
   - Implements atomic design pattern with atoms, molecules, and organisms
   - **Atoms**: Basic UI components (`primitives/`, `controls/`, `indicators/`)
   - **Molecules**: Composite components (`filters/`, `navigation/`, `table-parts/`)
   - **Organisms**: Complete features (`tables/`, `panels/`, `columns/`)
   - **Core**: Business logic, utilities, services, hooks, filters, contexts, and components
   - **Adapters**: Bridge components for legacy code compatibility

2. **Data Processing System**
   - Located in `lib/table-system/core/utils/data-processor.ts`
   - Handles JSON normalization, nested structure flattening, and batch processing
   - Type detection system in `lib/table-system/core/utils/type-detector.ts` with type cache for performance
   - Date utilities in `lib/table-system/core/utils/date-utils.ts` for multiple format detection
   - Standardized English type names used throughout the system

3. **Filtering System**
   - Advanced filter components in `lib/table-system/molecules/filters/`
   - Adaptive filters that adjust UI based on data patterns
   - Specialized filters for strings, numbers, dates, arrays, and objects
   - Filter logic tests in `lib/table-system/core/filters/__tests__/`
   - **Extracted filter functions**:
     - `lib/table-system/core/filters/processed-value-filter.ts` - Column-level filter logic
     - `lib/table-system/core/filters/global-filter.ts` - Global search filter logic
   - Virtualized filter lists via `@tanstack/react-virtual` for large datasets (200+ items)
   - FilterContext extracted to `lib/table-system/core/contexts/filter-context.ts` (breaks circular dependency between molecules and organisms)

4. **State Management**
   - Custom hooks in `lib/table-system/core/hooks/`
   - `use-table-state.ts` - Main table state management
   - `use-column-management.ts` - Column visibility and configuration
   - `use-data-processing.ts` - Data transformation pipeline
   - `use-filter-tabs.ts` - Filter UI state management
   - **Extracted hooks**:
     - `use-table-persistence.ts` - Saving/loading table configurations
     - `use-column-pinning.ts` - Column pinning logic and TanStack pinning styles
     - `use-secondary-tables.ts` - Secondary (nested) table management

5. **Error Handling & Resilience**
   - Error Boundaries: `lib/table-system/core/components/table-error-boundary.tsx`
   - Centralized error handling: `lib/table-system/core/utils/error-handling.ts`
   - Centralized logging: `lib/table-system/core/services/logging-service.ts`

6. **Services Layer**
   - Centralized logging: `lib/table-system/core/services/logging-service.ts`
   - Export utilities: `lib/table-system/core/utils/export-utils.ts` (CSV/XLSX)

7. **Configuration**
   - Field patterns configuration in `lib/table-system/core/constants/`
   - Type styles mapping in `lib/table-system/core/constants/type-styles.ts`

8. **Persistence Layer**
   - Prisma ORM with MongoDB for storing user views and configurations
   - API routes in `app/api/` for data operations
   - Authentication ready with NextAuth.js

9. **Data Sources** (`app/data-sources/`)
   - Multiple input modes: API, File upload, Database, Holded integration
   - **Demo source** (`app/data-sources/demo/`): Client-side mock data for testing without external dependencies
     - Simple table: 25 flat CRM contacts (text, numbers, dates, booleans)
     - Complex table: 15 salon records with nested objects, arrays, and mixed types
     - Data loaded directly in client via imported functions (no API routes)

10. **Accessibility**
    - ARIA attributes throughout filter components (role, aria-label, aria-selected, aria-pressed, aria-live)
    - Live regions for filter result announcements and row selection changes
    - Toolbar roles on footer and toolbar containers

11. **Testing Strategy**
    - **Unit/Component tests**: Jest with separate environments for Node and JSDOM
    - **End-to-End tests**: Playwright for browser-based testing
    - Test files located alongside implementation in `__tests__` directories
    - Module path mapping: `@/` resolves to root directory
    - Coverage targets: 85% for utilities/services, 80% for UI components

### Key Design Patterns

- **Atomic Design**: Systematic component hierarchy (atoms -> molecules -> organisms)
- **Factory Pattern**: Component factories for dynamic cell and filter creation
- **Strategy Pattern**: Type detection and filter selection
- **Adapter Pattern**: Legacy code compatibility through adapters
- **Observer Pattern**: Event propagation and state changes

### Data Flow

1. JSON input -> Data Processor -> Type Detection (with cache) -> Normalization
2. Normalized Data -> Table State Hook -> Column Configuration
3. Configured Data -> React Table -> Cell Factory -> Type-specific Renderers
4. User Interaction -> Filter Factory -> Adaptive Filters -> Filtered Data -> UI

### Important Technical Details

- Uses Next.js 15 with Turbopack for development
- React 18 with TypeScript strict mode
- Radix UI components with Tailwind CSS (shadcn/ui)
- @tanstack/react-table for table functionality
- @tanstack/react-virtual for virtualized filter lists
- Authentication ready with NextAuth.js
- Supports CSV and XLSX export via xlsx library
- Path alias: `@/` maps to project root (configured in tsconfig.json)
- Canonical UI components live in `components/ui/` (NOT `app/components/ui/`)
- Canonical utility `cn()` lives in `lib/utils.ts` (NOT `app/lib/utils.ts`)

### Development Workflow

1. Always run `npm run type-check` before committing
2. Use `npm run predeploy` for complete verification before deployment
3. Test coverage should meet minimum requirements (85% utils, 80% UI)
4. Follow atomic design pattern when adding new components
5. Place tests in `__tests__` directories next to the code being tested
6. Use the established filter and cell factories for new data types

### Testing Gotchas

- **Jest import for test globals**: Use `@jest/globals`, NOT `@jest/jest-globals`
- **Date tests**: Always use `new Date(Date.UTC(...))` for timezone-independent assertions; `new Date(year, month, day)` creates local-timezone dates that fail in different timezones
- **getByText with composite elements**: When text is split across child elements (e.g. `<h3>Filtro para <span/> {name}</h3>`), use regex: `screen.getByText(/Column Name/)` instead of exact string `screen.getByText("Column Name")`
- **Controlled checkbox mocks**: `fireEvent.click` on controlled `<input type="checkbox">` has unreliable toggle behavior in React 18 + JSDOM. Prefer mocking with `<button role="checkbox" onClick={() => onCheckedChange(!checked)}>`
- **Re-query after re-render**: Components defined as nested functions inside other components (like `VirtualizedOptionsList` inside `StringFilter`) get recreated on every parent render, causing DOM element references to become stale. Always re-query elements with `screen.getByTestId()` between interactions instead of caching references
- **Hidden input onChange**: `fireEvent.change` on `<input type="hidden">` does not reliably trigger `onChange` in JSDOM. Use a `<select>` element in test mocks instead
- **FilterCondition type**: Always include the required `field` property when constructing `FilterCondition` objects; `operator` and `value` alone are not sufficient

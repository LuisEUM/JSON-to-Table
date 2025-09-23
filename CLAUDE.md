# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development & Build
- `npm run dev` - Start development server with Next.js
- `npm run build` - Build production version (runs `prisma generate` first)
- `npm run start` - Start production server
- `npm run predeploy` - Complete pre-deployment verification (runs dependency check, lint, type-check, and build)

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- Run a single test file: `npm test -- path/to/test.test.ts`

### Code Quality
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking without emitting files

## High-Level Architecture

This is a Next.js 15 application for visualizing and analyzing JSON data in tabular format with advanced processing capabilities. The codebase has recently been refactored to use a modular atomic design pattern in `lib/table-system/`.

### Core Architecture Components

1. **Table System** (`lib/table-system/`)
   - Implements atomic design pattern with atoms, molecules, and organisms
   - **Atoms**: Basic UI components (`primitives/`, `controls/`, `indicators/`)
   - **Molecules**: Composite components (`filters/`, `navigation/`, `table-parts/`)
   - **Organisms**: Complete features (`tables/`, `panels/`, `columns/`)
   - **Core**: Business logic, utilities, and services
   - **Adapters**: Bridge components for legacy code compatibility

2. **Data Processing System**
   - Located in `lib/table-system/core/utils/data-processor.ts`
   - Handles JSON normalization, nested structure flattening, and batch processing
   - Type detection system in `lib/table-system/core/utils/type-detector.ts`
   - Date utilities in `lib/table-system/core/utils/date-utils.ts` for multiple format detection

3. **Filtering System**
   - Advanced filter components in `lib/table-system/molecules/filters/`
   - Adaptive filters that adjust UI based on data patterns
   - Specialized filters for strings, numbers, dates, arrays, and objects
   - Filter logic tests in `lib/table-system/core/filters/__tests__/`

4. **State Management**
   - Custom hooks in `lib/table-system/core/hooks/`
   - `use-table-state.ts` - Main table state management
   - `use-column-management.ts` - Column visibility and configuration
   - `use-data-processing.ts` - Data transformation pipeline
   - `use-filter-tabs.ts` - Filter UI state management

5. **Services Layer**
   - Centralized logging: `lib/table-system/core/services/logging-service.ts`
   - Error handling: `lib/table-system/core/utils/error-handling.ts`
   - Export utilities: `lib/table-system/core/utils/export-utils.ts` (CSV/XLSX)

6. **Persistence Layer**
   - Prisma ORM with MongoDB for storing user views and configurations
   - API routes in `app/api/` for data operations
   - Authentication ready with NextAuth.js

7. **Testing Strategy**
   - Jest configuration with separate environments for Node and JSDOM
   - Test files located alongside implementation in `__tests__` directories
   - Module path mapping: `@/` resolves to root directory
   - Coverage requirements: 90% for utilities/services, 85% for UI components

### Key Design Patterns

- **Atomic Design**: Systematic component hierarchy (atoms → molecules → organisms)
- **Factory Pattern**: Component factories for dynamic cell and filter creation
- **Strategy Pattern**: Type detection and filter selection
- **Adapter Pattern**: Legacy code compatibility through adapters
- **Observer Pattern**: Event propagation and state changes

### Data Flow

1. JSON input → Data Processor → Type Detection → Normalization
2. Normalized Data → Table State Hook → Column Configuration
3. Configured Data → React Table → Cell Factory → Type-specific Renderers
4. User Interaction → Filter Factory → Adaptive Filters → Filtered Data → UI

### Important Technical Details

- Uses Next.js 15 with Turbopack for development
- React 18 with TypeScript strict mode
- Radix UI components with Tailwind CSS
- @tanstack/react-table for table functionality
- Authentication ready with NextAuth.js
- Supports CSV and XLSX export via xlsx library
- Path alias: `@/` maps to project root (configured in tsconfig.json)

### Development Workflow

1. Always run `npm run type-check` before committing
2. Use `npm run predeploy` for complete verification before deployment
3. Test coverage should meet minimum requirements (90% utils, 85% UI)
4. Follow atomic design pattern when adding new components
5. Place tests in `__tests__` directories next to the code being tested
6. Use the established filter and cell factories for new data types
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

### Code Quality
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking without emitting files

## High-Level Architecture

This is a Next.js 15 application for visualizing and analyzing JSON data in tabular format with advanced processing capabilities.

### Core Architecture Components

1. **Data Processing System**
   - Located in `app/table/data-processor.ts`
   - Handles JSON normalization, nested structure flattening, and batch processing
   - Implements type detection system in `app/table/utils/type-detection/`
   - Date utilities in `app/table/utils/date-utils.ts` for multiple format detection and normalization

2. **State Management**
   - Uses Zustand for UI state management (filters, column visibility, pagination)
   - Implements hybrid architecture pattern separating heavy data processing from UI state
   - Planned Web Worker integration for processing large datasets (5MB+) without blocking UI

3. **Table Component System**
   - Main component: `app/table/json-table.tsx`
   - Uses @tanstack/react-table for advanced table features
   - Supports nested tables for hierarchical data
   - Column configuration in `app/table/columns/`
   - Custom actions (export, filtering) in `app/table/components/actions/`

4. **Services Layer**
   - Centralized logging: `app/services/logging-service.ts` with configurable levels (DEBUG, INFO, WARN, ERROR)
   - Log streaming: `app/services/log-stream.ts` for SSE real-time log streaming
   - Error handling: `app/utils/error-handling.ts` with custom error classes

5. **Persistence Layer**
   - Prisma ORM with MongoDB for storing user views and configurations
   - Schema defined for User, Account, Session, and View models
   - API routes in `app/api/` for data operations

6. **Testing Strategy**
   - Jest configuration with separate environments for Node and JSDOM
   - Test files in `app/tests/`
   - Coverage requirements: 90% for utilities/services, 85% for UI components
   - Module path mapping: `@/` resolves to `app/` directory

### Key Design Patterns

- **Strategy Pattern**: Type detection system with pluggable detectors
- **Dependency Injection**: Services with singleton instances
- **Factory Method**: Object creation for complex data structures
- **Observer Pattern**: Event propagation and state changes

### Data Flow

1. JSON input → Data Processor → Type Detection → Normalization → Table Structure → React Table → UI
2. For large datasets: JSON → Web Worker → Processing → Cached References → Filtered Data → UI

### Important Technical Details

- Uses Next.js 15 with Turbopack for development
- React 18 with TypeScript
- Radix UI components with Tailwind CSS
- Authentication ready with NextAuth.js
- Supports CSV and XLSX export via xlsx library
- Implements SSR/SSE for real-time features

### Development Workflow

1. Always run `npm run type-check` before committing
2. Use `npm run predeploy` for complete verification before deployment
3. Test coverage should meet minimum requirements (90% utils, 85% UI)
4. Follow existing code conventions and patterns in the codebase
5. When modifying data processing, ensure tests in `app/tests/` are updated
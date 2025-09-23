# Current System Architecture - JSON-to-Table

## Overview

JSON-to-Table is a Next.js 15 application that visualizes and analyzes JSON data in tabular format with advanced processing capabilities. The system has been refactored to use an atomic design pattern with a modular architecture located in `lib/table-system/`.

## Core Architecture

### 1. Atomic Design Structure (`lib/table-system/`)

The system follows atomic design principles with clear separation of concerns:

```
lib/table-system/
├── atoms/              # Basic UI components
│   ├── primitives/     # Cell renderers (text, number, date, boolean, etc.)
│   ├── controls/       # Interactive controls (sort, filter, visibility)
│   └── indicators/     # Visual indicators (TypeBadge, TypeDot, TypeLegend)
├── molecules/          # Composite components
│   ├── filters/        # Advanced filter components
│   ├── navigation/     # Table navigation (pagination, search, export)
│   └── table-parts/    # Table-specific components
├── organisms/          # Complete features
│   ├── tables/         # Main table implementations
│   ├── panels/         # Control panels and toolbars
│   └── columns/        # Column configuration
├── core/              # Business logic and utilities
│   ├── utils/         # Data processing, type detection, date handling
│   ├── services/      # Logging and other services
│   ├── hooks/         # Custom React hooks
│   └── filters/       # Filter logic and tests
└── adapters/          # Legacy code compatibility
```

### 2. Data Processing Pipeline

#### Flow Architecture
```
JSON Input → Data Processor → Type Detection → Normalization → Table State → React Table → UI
```

#### Key Components:

**Data Processor** (`core/utils/data-processor.ts`)
- Handles JSON normalization and flattening
- Manages nested structure processing
- Implements batch processing for large datasets

**Type Detection** (`core/utils/type-detector.ts`)
- Automatic detection of data types
- Support for: string, number, date, boolean, object, array, null
- Smart detection of dates in various formats
- Array content analysis for homogeneous vs heterogeneous arrays

**Date Utilities** (`core/utils/date-utils.ts`)
- Multiple date format detection
- ISO 8601, timestamps, locale-specific formats
- Timezone handling and normalization

### 3. State Management

The system uses custom hooks for state management:

- **`use-table-state.ts`**: Main table state (sorting, pagination, selection)
- **`use-column-management.ts`**: Column visibility and configuration
- **`use-data-processing.ts`**: Data transformation pipeline
- **`use-filter-tabs.ts`**: Filter UI state management
- **`use-table-export.ts`**: Export functionality

### 4. Filter System

#### Advanced Filter Architecture

**Filter Factory** (`molecules/filters/filter-factory.tsx`)
- Dynamic filter component selection based on data type
- Support for adaptive filters that adjust based on data patterns

**Filter Types**:
- **String Filter**: Text search with operators (contains, equals, in)
- **Number Filter**: Range selection with presets
- **Date Filter**: Date range with quick selections
- **Array Filter**: Specialized handling for arrays
- **Object Filter**: Property-based filtering for nested objects
- **Primitive Array Filter**: Atomic component for filtering primitive arrays

**Enhanced Features**:
- Pattern analysis for smart filter suggestions
- Embedded filters for inline filtering
- Filter tabs for organizing multiple filter criteria
- Hover cards showing filter details

### 5. Table System

**Main Table** (`organisms/tables/json-table.tsx`)
- Built on @tanstack/react-table
- Virtual scrolling for performance
- Column resizing and reordering
- Multi-level sorting
- Row selection

**Secondary Tables** (`organisms/tables/secondary-tables.tsx`)
- Nested table rendering for hierarchical data
- Maintains context from parent table
- Recursive rendering support

**Table Features**:
- Skeleton loading states
- Export to CSV/XLSX
- Global search
- Column manager for visibility control
- Details modal for cell inspection

### 6. Cell Rendering System

**Cell Factory** (`molecules/table-parts/cell-factory.tsx`)
- Dynamic cell component selection based on data type
- Optimized rendering for different data types

**Cell Types**:
- Text cells with truncation
- Number cells with formatting
- Date cells with locale formatting
- Boolean cells with visual indicators
- Object/Array cells with expandable views
- Null cells with clear indication
- Reference cells for related data

### 7. Export System

**Export Utils** (`core/utils/export-utils.ts`)
- CSV export with proper escaping
- XLSX export with formatting
- Filtered data export
- Column selection for export

## Performance Optimizations

### 1. Data Processing
- Lazy evaluation of nested structures
- Memoization of expensive computations
- Batch processing for large datasets
- Virtual scrolling for tables

### 2. Rendering
- React.memo for component optimization
- UseMemo for expensive calculations
- UseCallback for event handlers
- Virtual rendering for large lists

### 3. Filter Performance
- Indexed lookups for unique values
- Cached filter results
- Optimized comparison operators
- Debounced search inputs

## Testing Strategy

### Test Organization
Tests are co-located with implementation in `__tests__` directories:
- Unit tests for utilities and services
- Integration tests for filter logic
- Component tests for UI elements

### Test Coverage Requirements
- 90% coverage for utilities and services
- 85% coverage for UI components
- 100% coverage for critical business logic

### Key Test Suites
- **Type Detection**: `core/utils/__tests__/type-detector.test.ts`
- **Date Utils**: `core/utils/__tests__/date-utils.test.ts`
- **Filter Logic**: `core/filters/__tests__/*.test.ts`
- **Error Handling**: `core/utils/__tests__/error-handling.test.ts`

## Technology Stack

### Frontend
- **Next.js 15**: Framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Headless UI components
- **@tanstack/react-table**: Table functionality

### Data Processing
- **date-fns**: Date manipulation
- **xlsx**: Excel file generation
- **nanoid**: Unique ID generation

### Development Tools
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Turbopack**: Development bundler

## API Integration

### Available Endpoints
- `/api/holded-customers`: Customer data integration
- `/api/logs`: SSE for real-time log streaming
- `/api/pokemon`: Demo data endpoint

### Authentication Ready
- NextAuth.js configuration in place
- Prisma adapter for session management
- MongoDB integration for user data

## Future Architecture Considerations

### Web Worker Integration (Planned)
For datasets > 5MB, implement Web Worker processing:
- Offload heavy processing from main thread
- Maintain responsive UI during data operations
- Implement message-based communication

### Persistence Layer (Configured)
- Prisma ORM with MongoDB
- User views and configurations
- Saved filter presets
- Export history

### Real-time Features (Partial)
- SSE for log streaming implemented
- WebSocket support planned for collaborative features
- Real-time data updates capability

## Development Guidelines

### Code Organization
1. Follow atomic design principles
2. Keep components focused and single-purpose
3. Use TypeScript strictly
4. Implement proper error boundaries

### Performance Best Practices
1. Minimize re-renders with proper memoization
2. Use virtual scrolling for large lists
3. Implement progressive data loading
4. Cache expensive computations

### Testing Requirements
1. Write tests alongside implementation
2. Maintain coverage requirements
3. Test edge cases and error conditions
4. Use integration tests for complex flows

## Deployment Considerations

### Build Optimization
- Next.js automatic code splitting
- Image optimization with Sharp
- Font optimization
- Static generation where possible

### Environment Configuration
- Separate development/production configs
- Environment variable validation
- Secure credential management
- Performance monitoring setup
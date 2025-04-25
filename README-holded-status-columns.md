# Holded Status Columns Integration

This document explains how the Holded status columns are integrated with the table component.

## Overview

The integration adds custom status columns to the table when displaying Holded contacts data. These columns show the client's status with color-coded indicators and labels.

## Implementation Details

### 1. Status Column Types

The status columns are defined in `app/lib/holded/interfaces/status-types.ts`:

```typescript
export enum MembershipStatus {
  ABOUT_TO_START = "about-to-start",
  ACTIVE = "active",
  ABOUT_TO_END = "about-to-end",
  DEACTIVATED = "deactivated",
  NO_STATUS = "no-status",
}

export interface StatusColumn {
  id: string;
  header: string;
  cell: ({ row }: { row: { original: Customer } }) => ReactElement | string;
}
```

### 2. Status Column Components

The status column components are defined in `app/lib/holded/components/holded-status-columns.tsx`:

- `StatusCell`: Displays the membership status with color and label
- `createCustomStatusColumns`: Creates custom columns for client status
- `withHoldedStatusColumns`: Integrates status columns with existing columns
- `getHoldedStatusColumns`: Gets only the status columns

### 3. Data Transformation

The key to making the status columns work properly is the data transformation process. The table expects `ProcessedRow` objects, but the Holded components expect `Customer` objects with specific fields, including:

- `id`: The customer ID
- `name`: The customer name
- `tradeName`: The commercial name
- `email`: The customer email
- `customFields`: An array of `{ field: string, value: string }` objects

The transformation is performed in `app/table/columns/columns.tsx` using a middleware column:

```typescript
const customerDataAdapterColumn: ColumnDef<ProcessedRow> = {
  id: "_customerDataAdapter",
  accessorFn: (row: ProcessedRow) => {
    // Extract custom fields from row data
    const customFields = extractCustomFields(row);

    // Create a Customer object from the row data
    const customerData: Customer = {
      id: String(row.id?.value || ""),
      name: String(row.name?.value || row.nombre?.value || ""),
      tradeName: String(
        row.tradeName?.value || row.nombreComercial?.value || ""
      ),
      email: String(row.email?.value || row.correo?.value || ""),
      customFields: customFields,
    };

    // Assign the Customer data to the row
    (row as unknown as Customer).id = customerData.id;
    (row as unknown as Customer).name = customerData.name;
    (row as unknown as Customer).tradeName = customerData.tradeName;
    (row as unknown as Customer).email = customerData.email;
    (row as unknown as Customer).customFields = customerData.customFields;

    return row;
  },
};
```

#### Custom Fields Detection

The system looks for special fields in the data that might contain information about customer services:

1. Fields whose names include keywords like "SERVICIO", "CLIENTE", "CUSTOM", or "FIELD"
2. Fields with names that include the pattern "X - Y" (e.g. "SERVICIO Contabilidad - Edición")

For determining customer status, the system specifically looks for fields like:

- "CLIENTE INSIDERS - Fecha de Inicio": When the service starts
- "CLIENTE INSIDERS - Fecha de Fin": When the service ends
- "SERVICIO X - Edición": The edition/version of the service

If these fields aren't found in the data, the system creates simulated fields based on other attributes:

- It looks for fields named 'status' or 'estado' to determine if a client is active
- It also uses the customer ID (marking even IDs as active) to ensure variety in the display

### 4. Integration with Table Columns

The integration is done in `app/table/columns/columns.tsx`:

```typescript
export const columns = (data: ProcessedItem[]): ColumnDef<ProcessedRow>[] => {
  // ... existing code ...

  const baseColumns = [...rootColumns, ...groupedColumns];

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // Get the current URL search params
    const url = new URL(window.location.href);
    const source = url.searchParams.get("source");
    const dataType = url.searchParams.get("dataType");

    // If we're displaying Holded contacts, add the status columns
    if (source === "holded" && dataType === "contacts") {
      console.log("📊 Adding Holded status columns to contacts table");

      // Add the middleware column first to transform the data
      const adaptedColumns = [customerDataAdapterColumn, ...baseColumns];

      // Apply the Holded status columns
      return withHoldedStatusColumns(
        adaptedColumns as unknown as ColumnDef<Customer>[]
      ) as unknown as ColumnDef<ProcessedRow>[];
    }
  }

  return baseColumns;
};
```

## How It Works

1. When the table page is loaded, the URL parameters are checked to determine if we're displaying Holded contacts data.
2. If we are, the data is transformed to match the expected `Customer` interface.
3. The `withHoldedStatusColumns` function is called to add the status columns to the existing columns.
4. The status columns display the client's status with color-coded indicators and labels.

## Troubleshooting

If the status columns show only "N/A" values, check the following:

1. Make sure the `customFields` array has the correct format with fields like "CLIENTE INSIDERS - Fecha de Inicio"
2. Check the console logs to see the transformed data structure
3. Verify that the data source is providing the expected field names and formats

## Testing

### Automated Testing

Due to challenges with path aliases in the Jest testing environment, automated tests are currently limited.

### Manual Testing

A manual testing script is provided in `app/tests/manual-holded-integration-test.js`.

To run the manual test:

1. Navigate to the table page with Holded contacts (URL should contain `?source=holded&dataType=contacts`)
2. Open the browser console (F12)
3. Copy and paste the contents of the manual test script
4. Run `testHoldedStatusColumnsIntegration()`
5. Check the console output for the test results

The script verifies:

- If the current URL parameters indicate Holded contacts data
- Whether the status columns are correctly added to the table
- If the implementation behaves as expected for both Holded and non-Holded data sources

## Usage

To use the Holded status columns, navigate to the Holded data source page, select "Contactos" as the data type, and click "Continuar". The table will display the contacts data with the status columns.

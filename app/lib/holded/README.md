# Módulo de Holded para JSON-to-Table

Este módulo proporciona funcionalidades para trabajar con datos de clientes de Holded, incluyendo:

- Análisis de campos personalizados
- Extracción de métricas de servicio
- Determinación de estados de membresía
- Visualización de estados en tablas

## Estructura del Módulo

```
app/lib/holded/
├── interfaces/           # Definiciones de tipos
│   ├── customer.ts       # Interfaces de cliente
│   ├── service-types.ts  # Interfaces de servicios
│   └── status-types.ts   # Interfaces de estados
├── utils/                # Funciones de utilidad
│   ├── holded-contacts-service-utils.ts  # Utilidades para servicios
│   └── holded-customer-status-utils.ts   # Utilidades para estados
├── components/           # Componentes reutilizables
│   └── holded-status-columns.tsx         # Columnas para tablas
├── examples/             # Ejemplos de uso
│   └── holded-status-columns-example.tsx # Ejemplo de tabla con estados
└── index.ts              # Punto de entrada principal
```

## Uso Básico

### 1. Importar el módulo

```typescript
import {
  // Interfaces
  Customer,
  MembershipStatus,

  // Utilidades
  getCustomerStatus,
  createCustomStatusColumns,

  // Componentes
  withHoldedStatusColumns,
} from "@/lib/holded";
```

### 2. Analizar estados de clientes

```typescript
const customer: Customer = {
  id: "1",
  name: "Cliente Ejemplo",
  tradeName: "Ejemplo S.L.",
  email: "cliente@ejemplo.com",
  customFields: [
    { field: "SERVICIO Contabilidad - Edición", value: "Premium" },
    { field: "SERVICIO Fiscal - Fecha de Inicio", value: "2023-01-01" },
    { field: "SERVICIO Fiscal - Fecha de Fin", value: "2024-12-31" },
  ],
};

const statusInfo = getCustomerStatus(customer);
console.log("Estado del cliente:", statusInfo.clientStatus);
console.log("Servicios activos:", statusInfo[MembershipStatus.ACTIVE]);
```

### 3. Integrar columnas de estado en tablas

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { withHoldedStatusColumns } from "@/lib/holded";

// Columnas base para los clientes
const baseColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  // ... otras columnas
];

// Combinar con columnas de estado
const columnsWithStatus = withHoldedStatusColumns(baseColumns);

// Usar en un componente de tabla
function CustomersTable({ data }) {
  return <DataTable columns={columnsWithStatus} data={data} />;
}
```

## Pruebas

El módulo incluye pruebas unitarias para todas las funcionalidades principales:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar solo las pruebas de Holded
npm test -- -t "Holded"
```

## Personalización

### Personalizar columnas de estado

Puedes personalizar las columnas de estado creando tu propia implementación basada en `createCustomStatusColumns`:

```typescript
import {
  StatusColumn,
  MembershipStatus,
  getCustomerStatus,
} from "@/lib/holded";

function createMyCustomColumns(): StatusColumn[] {
  return [
    {
      id: "customStatus",
      header: "Estado Personalizado",
      cell: ({ row }) => {
        const customer = row.original;
        const { clientStatus } = getCustomerStatus(customer);
        return clientStatus ? `Estado: ${clientStatus}` : "Sin estado";
      },
    },
    // ... otras columnas personalizadas
  ];
}
```

## Contribución

Para contribuir a este módulo:

1. Asegúrate de seguir la estructura de directorios existente
2. Añade pruebas para cualquier nueva funcionalidad
3. Documenta las nuevas características en este README
4. Mantén la modularidad y la separación de responsabilidades

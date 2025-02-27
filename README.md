# JSON-to-Table

Aplicación para visualizar y analizar datos JSON en formato tabular.

## Mejoras de Arquitectura

Este proyecto ha sido refactorizado para mejorar su arquitectura, siguiendo los principios SOLID y mejores prácticas de desarrollo:

### 1. Módulos Especializados

- **Utilidades de Fecha (`date-utils.ts`)**: Centraliza toda la lógica de detección y normalización de fechas.
- **Sistema de Detección de Tipos (`type-detection/`)**: Implementa el patrón Strategy para la detección de tipos, facilitando la extensión.
- **Manejo de Errores (`error-handling.ts`)**: Proporciona clases de error específicas y utilidades para un manejo consistente.
- **Servicio de Logging (`logging-service.ts`)**: Centraliza y configura los logs de la aplicación.

### 2. Mejoras en el Procesamiento de Datos

- Mejor detección de arrays de objetos, incluso cuando están representados como strings.
- Manejo mejorado de fechas, preservando el objeto `Date` original.
- Implementación de manejo de errores robusto en todas las funciones críticas.

### 3. Pruebas Unitarias

Se han añadido pruebas unitarias para los componentes principales:

- Utilidades de fecha
- Sistema de detección de tipos
- Manejo de errores
- Servicio de logging

## Estructura del Proyecto

```
app/
├── services/
│   └── logging-service.ts       # Servicio centralizado de logging
├── table/
│   ├── data-processor.ts        # Procesamiento principal de datos
│   ├── date-utils.ts            # Utilidades para manejo de fechas
│   └── type-detection/          # Sistema de detección de tipos
│       └── type-detector.ts     # Implementación del patrón Strategy
├── tests/                       # Pruebas unitarias
│   ├── date-utils.test.ts
│   ├── error-handling.test.ts
│   ├── logging-service.test.ts
│   └── type-detector.test.ts
└── utils/
    └── error-handling.ts        # Sistema de manejo de errores
```

## Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## Próximos Pasos

- Implementar caché para mejorar el rendimiento en el procesamiento de grandes conjuntos de datos.
- Añadir más estrategias de detección de tipos para casos específicos.
- Mejorar la documentación con ejemplos de uso.
- Implementar pruebas de integración para el flujo completo de procesamiento de datos.

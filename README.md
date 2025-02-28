# JSON-to-Table

Aplicación para visualizar, analizar y manipular datos JSON en formato tabular, con capacidades avanzadas de procesamiento y detección automática de tipos.

![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg)
![Versión](https://img.shields.io/badge/Versión-0.1.0-green.svg)
![Tests](https://img.shields.io/badge/Tests-Passing-success.svg)

## 📋 Índice

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Arquitectura del Software](#arquitectura-del-software)
  - [Principios de Diseño](#principios-de-diseño)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Componentes Clave](#componentes-clave)
  - [Flujo de Datos](#flujo-de-datos)
- [Componente Principal: JSON Table](#componente-principal-json-table)
  - [Características](#características)
  - [Implementación](#implementación)
  - [API](#api)
- [Sistema de Testing](#sistema-de-testing)
  - [Enfoque de Testing](#enfoque-de-testing)
  - [Suites de Pruebas](#suites-de-pruebas)
  - [Cobertura](#cobertura)
- [Guía de Desarrollo](#guía-de-desarrollo)
  - [Scripts Disponibles](#scripts-disponibles)
  - [Workflow de Desarrollo](#workflow-de-desarrollo)
  - [Sistema de Predeploy](#sistema-de-predeploy)
- [Próximos Pasos](#próximos-pasos)

## 🚀 Descripción del Proyecto

JSON-to-Table es una aplicación web moderna que permite cargar, analizar y visualizar datos JSON complejos en forma tabular. La aplicación implementa algoritmos avanzados para:

- Detección automática de tipos de datos (fechas, números, strings, booleanos, etc.)
- Análisis de estructuras anidadas y normalizarlas para visualización plana
- Procesamiento eficiente de grandes volúmenes de datos
- Exportación de datos en diversos formatos (CSV, XLSX)
- Manipulación y filtrado de datos en tiempo real

La aplicación está construida con Next.js 15, React 18, TypeScript y un conjunto de bibliotecas modernas para UI y procesamiento de datos.

## 🏗️ Arquitectura del Software

### Principios de Diseño

El proyecto sigue estrictamente los principios SOLID y patrones de diseño modernos:

- **Single Responsibility**: Cada módulo tiene una responsabilidad única y bien definida
- **Open/Closed**: El sistema permite extensiones sin modificar código existente (especialmente en detección de tipos)
- **Liskov Substitution**: Las implementaciones concretas son intercambiables
- **Interface Segregation**: Las interfaces son específicas y enfocadas
- **Dependency Inversion**: Las dependencias apuntan hacia abstracciones, no implementaciones

Además, se aplican los siguientes patrones de diseño:

- **Strategy Pattern**: Para el sistema de detección de tipos
- **Dependency Injection**: Para servicios como logging
- **Factory Method**: Para la creación de objetos complejos
- **Observer**: Para la propagación de eventos y cambios de estado

### Estructura del Proyecto

```
app/
├── api/                          # API routes de Next.js
│   ├── holded-customers/         # Endpoint para clientes Holded
│   ├── logs/                     # Servicio SSE para streaming de logs
│   └── pokemon/                  # Demo API con datos de Pokémon
├── services/                     # Servicios compartidos
│   ├── log-stream.ts             # Servicio de streaming de logs
│   └── logging-service.ts        # Servicio centralizado de logging
├── table/                        # Módulo principal de tabla
│   ├── components/               # Componentes UI específicos de la tabla
│   │   └── actions/              # Acciones (exportar, filtrar, etc.)
│   ├── columns/                  # Configuración y formato de columnas
│   ├── json-table.tsx            # Componente principal de tabla
│   ├── data-processor.ts         # Procesamiento de datos JSON
│   └── utils/                    # Utilidades para la tabla
│       ├── date-utils.ts         # Procesamiento de fechas
│       └── type-detection/       # Sistema de detección de tipos
├── tests/                        # Pruebas unitarias
│   ├── date-utils.test.ts        # Tests para utilidades de fecha
│   ├── error-handling.test.ts    # Tests para manejo de errores
│   ├── logging-service.test.ts   # Tests para servicio de logging
│   └── type-detector.test.ts     # Tests para detección de tipos
├── utils/                        # Utilidades generales
│   └── error-handling.ts         # Sistema de manejo de errores
└── scripts/                      # Scripts de utilidad para desarrollo
    └── check-deps.js             # Verificador de dependencias
```

### Componentes Clave

#### 1. Sistema de Detección de Tipos (`type-detection/`)

Implementa el patrón Strategy para identificar y manejar diferentes tipos de datos:

- Cada detector es una implementación concreta de la interfaz `TypeDetector`
- Los detectores se priorizan para manejar casos ambiguos
- Facilita la extensión con nuevos tipos sin modificar código existente

#### 2. Procesador de Datos (`data-processor.ts`)

Kernel principal responsable de transformar JSON en datos tabulares:

- Normaliza estructuras anidadas
- Aplica detección de tipos
- Maneja casos edge como arrays en strings
- Implementa manejo robusto de errores

#### 3. Utilidades de Fecha (`date-utils.ts`)

Sistema especializado en detección y normalización de fechas:

- Identificación de múltiples formatos de fecha
- Preservación de objetos `Date` originales
- Normalización a formato consistente para visualización

#### 4. Sistema de Logging (`logging-service.ts`)

Servicio centralizado que proporciona:

- Niveles configurables de log (DEBUG, INFO, WARN, ERROR)
- Formatos consistentes
- Capacidad de streaming en tiempo real a cliente
- Capacidad de integración con sistemas externos

### Flujo de Datos

```
Entrada JSON →
  Procesador de Datos →
    Detección de Tipos →
      Normalización →
        Estructura Tabular →
          Componente React Table →
            UI
```

## 📊 Componente Principal: JSON Table

### Características

El componente `json-table.tsx` es el núcleo de la aplicación, proporcionando:

- Visualización tabular de datos JSON complejos
- Ordenación y filtrado avanzado
- Paginación eficiente
- Selección de filas
- Personalización de columnas
- Exportación de datos
- Visualización responsiva

### Implementación

El componente está implementado con:

- `@tanstack/react-table` para el manejo de tablas
- Componentes de UI de Radix UI
- Sistema de temas con `next-themes`
- Estado local y caching para optimizar el rendimiento
- Lazy loading para manejar grandes conjuntos de datos

### API

El componente expone la siguiente API:

```typescript
interface JsonTableProps {
  // Datos JSON que se visualizarán (string o objeto)
  jsonData: string | object;

  // Configuración opcional para procesamiento avanzado
  options?: {
    // Especificar tipos de columnas manualmente
    columnTypes?: Record<string, DataType>;

    // Opciones de visualización
    showToolbar?: boolean;
    enableSelection?: boolean;
    initialPageSize?: number;

    // Callbacks
    onRowSelect?: (selectedRows: any[]) => void;
    onDataProcessed?: (processedData: any[]) => void;
    onExport?: (data: any[], format: "csv" | "xlsx") => void;
  };
}
```

## 🧪 Sistema de Testing

### Enfoque de Testing

El proyecto implementa un enfoque de testing exhaustivo y estructurado:

- **Tests Unitarios**: Para componentes individuales y funciones
- **Tests de Integración**: Para interacciones entre módulos
- **Tests End-to-End (planeados)**: Para flujos completos de usuario

### Suites de Pruebas

#### 1. Utilidades de Fecha (`date-utils.test.ts`)

Tests para validar:

- Detección correcta de diferentes formatos de fecha
- Normalización consistente de fechas
- Manejo de casos edge y formatos inválidos
- Preservación de timezone

```javascript
// Ejemplo de test
test("detecta correctamente formato ISO 8601", () => {
  const date = "2023-01-15T12:30:45Z";
  expect(isValidDate(date)).toBe(true);
  expect(normalizeDate(date).toISOString()).toBe(new Date(date).toISOString());
});
```

#### 2. Detección de Tipos (`type-detector.test.ts`)

Tests para verificar:

- Identificación correcta de tipos primitivos
- Manejo de tipos complejos y anidados
- Casos de ambigüedad (string vs fecha, etc.)
- Extensibilidad del sistema de detección

#### 3. Manejo de Errores (`error-handling.test.ts`)

Tests para validar:

- Creación correcta de errores personalizados
- Propagación adecuada de errores
- Recuperación de errores no críticos

#### 4. Servicio de Logging (`logging-service.test.ts`)

Tests para validar:

- Configuración correcta de niveles de log
- Formato consistente de mensajes
- Integración con streams
- Performance

### Cobertura

El proyecto mantiene una cobertura de código objetivo:

- Mínimo 90% de cobertura para utilidades y servicios core
- Mínimo 85% para componentes de UI
- Enfoque prioritario en rutas críticas

Para verificar la cobertura:

```bash
npm run test:coverage
```

## 📝 Guía de Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo con Turbopack

# Testing
npm test             # Ejecuta todos los tests
npm run test:watch   # Ejecuta tests en modo watch
npm run test:coverage # Ejecuta tests con reporte de cobertura

# Verificación y Build
npm run lint         # Ejecuta linter
npm run type-check   # Verifica tipos de TypeScript
npm run build        # Genera build de producción

# Utilidades
npm run predeploy    # Verifica todos los requerimientos para deploy
```

### Workflow de Desarrollo

1. **Desarrollo Local**:

   - Usar `npm run dev` para servidor de desarrollo
   - Implementar cambios con TDD cuando sea posible
   - Verificar tipos con `npm run type-check`

2. **Testing**:

   - Implementar tests junto con nueva funcionalidad
   - Mantener cobertura objetivo
   - Ejecutar tests frecuentemente durante desarrollo

3. **Pre-Commit**:

   - Lint automático de código
   - Verificación de tipos
   - Ejecución de tests críticos

4. **Pre-Deploy**:
   - Ejecutar `npm run predeploy` para verificación completa
   - Resolver cualquier error o warning antes de deploy

### Sistema de Predeploy

El proyecto implementa un sistema avanzado de verificación pre-deploy que:

1. **Verifica dependencias:**

   - Detecta importaciones que no están en package.json
   - Sugiere comandos para instalar dependencias faltantes
   - Previene problemas comunes en deploy relacionados con dependencias

2. **Ejecuta lint:**

   - Verifica que el código cumple con estándares de calidad
   - Identifica problemas potenciales en el código

3. **Verifica tipos:**

   - Ejecuta TypeScript en modo de verificación
   - Garantiza seguridad de tipos en toda la aplicación

4. **Realiza build completo:**
   - Verifica que la aplicación puede construirse correctamente
   - Simula el proceso que ejecutará el servidor de deploy

Para ejecutar la verificación completa:

```bash
npm run predeploy
```

## 🔮 Próximos Pasos

### Mejoras Planificadas

- **Rendimiento**:

  - Implementar mecanismos de caché para grandes conjuntos de datos
  - Optimizar rendering con virtualización para tablas extensas
  - Mejorar algoritmos de procesamiento para JSON extremadamente anidado

- **Funcionalidad**:

  - Añadir visualizaciones y gráficos basados en los datos
  - Implementar sistema de guardado de vistas y configuraciones
  - Añadir capacidades de edición in-line de datos

- **Testing**:

  - Implementar tests E2E con Playwright o Cypress
  - Ampliar cobertura de tests unitarios
  - Añadir pruebas de performance y benchmarking

- **DevOps**:

  - Configurar CI/CD completo
  - Implementar análisis estático de código
  - Automatizar gestión de versiones y changelog

- **Documentación**:
  - Generar documentación API con TypeDoc
  - Implementar Storybook para componentes UI
  - Crear guías detalladas de uso y ejemplos

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulte el archivo LICENSE para más detalles.

# 🔄 Migration Guide - Atomic Design Table System

## 📋 Overview

Esta guía te ayudará a migrar del sistema de tablas actual al nuevo sistema con Atomic Design **sin romper nada existente**.

## 🛡️ Filosofía de Migración: **ZERO BREAKING CHANGES**

- ✅ **No borramos nada** - Todo el código original permanece intacto
- ✅ **Solo copiamos y reorganizamos** - Los componentes se duplican en la nueva estructura
- ✅ **Compatibilidad total** - El adapter mantiene la misma API
- ✅ **Migración gradual** - Puedes migrar un componente a la vez

---

## 📁 Nueva Estructura

```
lib/table-system/               # 🆕 Nuevo sistema atómico
├── atoms/                      # Componentes básicos
│   ├── primitives/            # Celdas individuales
│   └── indicators/            # Indicadores de tipo
├── molecules/                  # Combinaciones funcionales
│   ├── table-parts/          # Partes de tabla
│   ├── filters/              # Sistema de filtros
│   └── navigation/           # Navegación y paginación
├── organisms/                  # Componentes complejos
│   ├── tables/               # Tablas completas
│   └── panels/               # Paneles y modales
├── core/                       # Lógica compartida
│   ├── utils/                # Utilidades
│   └── constants/            # Constantes
└── adapters/                   # 🔄 Compatibilidad
    └── legacy-adapter.tsx     # Adapter sin breaking changes

app/table/                      # 📦 Sistema original (intacto)
├── json-table.tsx            # ✅ No modificado
├── components/               # ✅ No modificado
└── utils/                    # ✅ No modificado
```

---

## 🚀 Cómo Migrar (Paso a Paso)

### PASO 1: Usar el Adapter (Sin Cambios)

```tsx
// ANTES (funcionando)
import { JsonTable } from '@/app/table/json-table'

const MyComponent = () => {
  return <JsonTable data={data} />
}
```

```tsx
// DESPUÉS (misma funcionalidad, nueva arquitectura)
import { JsonTable } from '@/lib/table-system/adapters/legacy-adapter'

const MyComponent = () => {
  return <JsonTable data={data} /> {/* ✅ Mismos props, misma API */}
}
```

### PASO 2: Importaciones Específicas (Opcional)

Si importas componentes específicos:

```tsx
// ANTES
import { TypeDot } from '@/app/table/components/type-indicators'
import { CellFactory } from '@/app/table/components/cells'

// DESPUÉS - Opción A: Desde adapter (recomendado)
import { TypeDot, CellFactory } from '@/lib/table-system/adapters/legacy-adapter'

// DESPUÉS - Opción B: Directo desde átomos
import { TypeDot } from '@/lib/table-system/atoms'
import { CellFactory } from '@/lib/table-system/molecules'
```

### PASO 3: Nuevos Desarrollos (Recomendado)

Para nuevas features, usa directamente el sistema atómico:

```tsx
// NUEVOS COMPONENTES
import { JsonTable } from '@/lib/table-system'
// O importaciones específicas:
import {
  JsonTable,
  CellFactory,
  FilterFactory,
  TypeDot
} from '@/lib/table-system'
```

---

## 🧪 Testing de la Migración

### 1. Test de Compatibilidad

```tsx
// test/migration.test.tsx
import { JsonTable as OriginalTable } from '@/app/table/json-table'
import { JsonTable as AtomicTable } from '@/lib/table-system/adapters/legacy-adapter'

const testData = [{ id: 1, name: 'Test' }]

describe('Migration Compatibility', () => {
  it('should render the same output', () => {
    const original = render(<OriginalTable data={testData} />)
    const atomic = render(<AtomicTable data={testData} />)

    // Verificar que el output sea idéntico
    expect(atomic.container.innerHTML).toBe(original.container.innerHTML)
  })
})
```

### 2. Test Manual

```bash
# 1. Ejecutar el dev server
npm run dev

# 2. Cambiar las importaciones una por una
# 3. Verificar que todo funciona igual
# 4. Si algo falla, revertir inmediatamente
```

---

## 🎯 Beneficios Inmediatos

### Para Desarrolladores

```tsx
// ✅ Importaciones más limpias
import {
  TextCell,           // Átomo específico
  FilterFactory,      // Molécula de filtros
  JsonTable          // Organismo completo
} from '@/lib/table-system'

// ✅ Mejor tree-shaking
import { TextCell } from '@/lib/table-system/atoms/primitives'

// ✅ Storybook ready
import { TypeDot } from '@/lib/table-system/atoms/indicators'
```

### Para el Proyecto

- 🎨 **Storybook**: Cada componente atómico es documentable
- 🧪 **Testing**: Fácil testing unitario por componente
- 📦 **Bundle Size**: Mejor tree-shaking y code splitting
- 🔄 **Reutilización**: Componentes reutilizables en otros proyectos

---

## 📊 Cronograma Sugerido

### Semana 1: Setup y Verificación
- [ ] Verificar que el adapter funciona
- [ ] Ejecutar tests de compatibilidad
- [ ] Migrar 1-2 componentes de prueba

### Semana 2: Migración Gradual
- [ ] Migrar imports en componentes principales
- [ ] Verificar funcionalidad completa
- [ ] Documentar cualquier diferencia encontrada

### Semana 3: Nuevos Desarrollos
- [ ] Usar sistema atómico para nuevas features
- [ ] Crear componentes específicos del proyecto
- [ ] Setup de Storybook

### Semana 4: Cleanup (Opcional)
- [ ] Evaluar si mantener ambos sistemas
- [ ] Renombrar archivos originales a `.backup`
- [ ] Documentación final

---

## 🚨 Troubleshooting

### Problema: Imports no resuelven

```bash
# Verificar que los archivos existen
ls -la lib/table-system/

# Verificar exports en index.ts
cat lib/table-system/index.ts
```

### Problema: Props no compatibles

```tsx
// Si hay diferencias en props, usar el adapter específico
import { JsonTable } from '@/lib/table-system/adapters/legacy-adapter'
// NO usar el directo hasta confirmar compatibilidad:
// import { JsonTable } from '@/lib/table-system'
```

### Problema: Estilos diferentes

Los estilos deberían ser idénticos. Si hay diferencias:

1. Verificar que se copiaron todos los archivos CSS
2. Verificar imports de estilos en los nuevos componentes
3. Usar el adapter hasta resolver las diferencias

---

## 🎉 Ventajas del Nuevo Sistema

### Atomic Design Benefits

```tsx
// ✅ Composición flexible
const CustomTable = () => (
  <div>
    <TypeLegend />
    <JsonTable data={data} />
    <TablePagination />
  </div>
)

// ✅ Reutilización en otros proyectos
const SimpleDataTable = () => (
  <div>
    <TableSearch />
    <JsonTable
      data={data}
      features={{
        filters: false,
        pagination: true
      }}
    />
  </div>
)
```

### Better Developer Experience

```tsx
// ✅ Imports semánticos
import {
  JsonTable,        // "Quiero una tabla completa"
  CellFactory,      // "Quiero solo el factory de celdas"
  TextCell,         // "Quiero solo una celda de texto"
  TypeDot          // "Quiero solo el indicador de tipo"
} from '@/lib/table-system'

// ✅ Tree-shaking automático
// Solo se incluye lo que realmente uses
```

---

## 🤝 Support

Si encuentras cualquier problema durante la migración:

1. **Revierte inmediatamente** al import original
2. **Documenta el problema** encontrado
3. **Continúa con otros componentes** mientras se resuelve
4. **No hay prisa** - la migración puede ser gradual

**¡La prioridad es que nada se rompa!** 🛡️
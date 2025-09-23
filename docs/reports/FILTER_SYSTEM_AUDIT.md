# 🔍 Auditoría del Sistema de Filtros

## 📋 Estado Actual: 22 de Septiembre, 2025

### 🚨 Problemas Identificados

#### 1. **Filtros de Texto - Operador "in"** ⚠️

**Ubicación**: `lib/table-system/organisms/tables/json-table.tsx` (línea 729-733)

**Problema Principal**: El operador `in` está comparando incorrectamente:

```typescript
// ACTUAL (INCORRECTO)
case "in":
  return (
    Array.isArray(filterValue.value) &&
    filterValue.value.includes(String(rawValue))
  );
```

**Análisis**:

- ❌ Está buscando si el valor completo del campo está en la lista de filtros seleccionados
- ❌ No maneja correctamente valores con separadores
- ❌ Para un Pokémon con tipo "grass, bug", no funciona correctamente con checkboxes individuales

**Solución Propuesta**:

```typescript
case "in":
  // Si hay separador, dividir el valor del campo y verificar intersección
  if (filterValue.additionalValue && filterValue.additionalValue !== 'none') {
    const fieldValues = splitBySeparator(String(rawValue), filterValue.additionalValue);
    const filterValues = Array.isArray(filterValue.value) ? filterValue.value : [filterValue.value];

    // Modo exacto: TODOS los valores del campo deben estar en los filtros
    if (filterValue.exactMatch) {
      return fieldValues.every(val => filterValues.includes(val));
    }
    // Modo normal: AL MENOS UN valor del campo debe estar en los filtros
    return fieldValues.some(val => filterValues.includes(val));
  }
  // Sin separador: comparación directa
  return Array.isArray(filterValue.value) && filterValue.value.includes(String(rawValue));
```

---

#### 2. **Filtros de Texto - Operador "contains"** ⚠️

**Ubicación**: `lib/table-system/organisms/tables/json-table.tsx` (línea 743-746)

**Problema**: No respeta el toggle de coincidencia exacta correctamente

**Solución Propuesta**:

```typescript
case "contains":
  const searchTerms = Array.isArray(filterValue.value) ? filterValue.value : [filterValue.value];
  const textValue = String(rawValue).toLowerCase();

  if (filterValue.exactMatch) {
    // Coincidencia exacta de palabra
    return searchTerms.some(term => {
      const regex = new RegExp(`\\b${term.toLowerCase()}\\b`);
      return regex.test(textValue);
    });
  }
  // Contiene el texto
  return searchTerms.some(term =>
    textValue.includes(String(term).toLowerCase())
  );
```

---

#### 3. **Manejo de Separadores** 🔄

**Ubicación**: `lib/table-system/molecules/filters/string-filter.tsx`

**Problemas**:

- ✅ El componente UI maneja bien los separadores
- ❌ Los operadores del filtro no usan el separador al aplicar el filtro
- ❌ No hay distinción clara entre coincidencia exacta y parcial con separadores

---

#### 4. **Filtros Numéricos** 📊

**Ubicación**: `lib/table-system/organisms/tables/json-table.tsx` (línea 781-806)

**Estado**: ✅ Funcionando correctamente para rangos

---

#### 5. **Filtros de Fecha** 📅

**Ubicación**: `lib/table-system/organisms/tables/json-table.tsx` (línea 588-636)

**Estado**: ✅ Funcionando correctamente con formato dd/mm/yyyy

---

### 📐 Arquitectura de Filtros

```
┌─────────────────────────────────────────┐
│         Filter Component (UI)            │
│  - StringFilter                         │
│  - NumberFilter                         │
│  - DateFilter                          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│        FilterCondition Object            │
│  {                                      │
│    field: string                       │
│    operator: FilterOperator            │
│    value: any                          │
│    additionalValue?: any               │
│  }                                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     processedValueFilter Function        │
│  (en json-table.tsx)                   │
│  - Switch por operator                 │
│  - Aplica lógica de filtrado          │
└─────────────────────────────────────────┘
```

---

## 🎯 Plan de Acción

### Fase 1: Tests Unitarios

1. Crear suite de tests para cada tipo de filtro
2. Documentar comportamiento esperado
3. Identificar casos edge

### Fase 2: Correcciones

1. **Filtro de Texto**:

   - Corregir operador "in" para manejar separadores
   - Implementar toggle de coincidencia exacta
   - Simplificar opciones (solo separador + toggle exacto)

2. **Validación**:
   - Asegurar que todos los tests pasen
   - Verificar rendimiento con datasets grandes

### Fase 3: Documentación

1. Actualizar documentación de uso
2. Crear ejemplos de cada tipo de filtro
3. Documentar casos de uso comunes

---

## 🧪 Casos de Test Propuestos

### Filtros de Texto con Separador

| Dato Original      | Separador | Checkboxes Seleccionados | Coincidencia Exacta | Resultado Esperado |
| ------------------ | --------- | ------------------------ | ------------------- | ------------------ |
| "grass, bug"       | coma      | ["grass"]                | false               | ✅ Incluido        |
| "grass, bug"       | coma      | ["grass"]                | true                | ❌ No incluido     |
| "grass"            | coma      | ["grass"]                | true                | ✅ Incluido        |
| "grass, bug, fire" | coma      | ["grass", "bug"]         | false               | ✅ Incluido        |
| "grass, bug, fire" | coma      | ["grass", "bug"]         | true                | ❌ No incluido     |
| "fire"             | coma      | ["grass", "bug"]         | false               | ❌ No incluido     |

### Filtros Numéricos

| Valor | Operador    | Rango    | Resultado Esperado |
| ----- | ----------- | -------- | ------------------ |
| 50    | between     | [0, 100] | ✅ Incluido        |
| 150   | between     | [0, 100] | ❌ No incluido     |
| 0     | greaterThan | 0        | ❌ No incluido     |
| 1     | greaterThan | 0        | ✅ Incluido        |

---

## 📝 Notas Adicionales

- Los filtros de array (`arrIncludesSome`) parecen estar funcionando pero son muy complejos
- Hay mucho código de debug con `console.log` que debería limpiarse
- La función `extractPropertyValues` para objetos anidados podría optimizarse

---

## ✅ Próximos Pasos

1. Implementar tests unitarios
2. Corregir lógica del operador "in"
3. Simplificar UI del filtro de texto
4. Validar con datos reales
5. Limpiar console.logs

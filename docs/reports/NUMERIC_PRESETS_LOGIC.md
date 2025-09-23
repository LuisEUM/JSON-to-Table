# 🎯 Lógica de Presets Dinámicos para Filtros Numéricos

## 📋 Comportamiento Mejorado

### **Principio**: Solo mostrar presets relevantes según los datos disponibles

---

## 🔢 Escenarios de Presets

### **Escenario 1: Solo Valores Positivos**

**Datos**: `[1, 5, 10, 25, 50]`
**Presets mostrados**:

- ✅ Personalizado
- ✅ Valores positivos
- ❌ ~~Valores negativos~~ (oculto - no hay datos negativos)
- ✅ Valores mayores a la media
- ✅ Valores menores a la media
- ✅ Top 25%
- ✅ Último 25%

### **Escenario 2: Solo Valores Negativos**

**Datos**: `[-50, -25, -10, -5, -1]`
**Presets mostrados**:

- ✅ Personalizado
- ❌ ~~Valores positivos~~ (oculto - no hay datos positivos)
- ✅ Valores negativos
- ✅ Valores mayores a la media
- ✅ Valores menores a la media
- ✅ Top 25%
- ✅ Último 25%

### **Escenario 3: Valores Mixtos (Positivos y Negativos)**

**Datos**: `[-10, -5, 0, 5, 10]`
**Presets mostrados**:

- ✅ Personalizado
- ✅ Valores positivos
- ✅ Valores negativos
- ✅ Valores mayores a la media
- ✅ Valores menores a la media
- ✅ Top 25%
- ✅ Último 25%

### **Escenario 4: Solo Cero**

**Datos**: `[0]`
**Presets mostrados**:

- ✅ Personalizado
- ✅ Valores positivos (cero se considera "positivo" para UI)
- ❌ ~~Valores negativos~~ (oculto - no hay datos negativos)
- ✅ Valores mayores a la media
- ✅ Valores menores a la media
- ✅ Top 25%
- ✅ Último 25%

### **Escenario 5: Cero con Negativos**

**Datos**: `[0, -5, -10]`
**Presets mostrados**:

- ✅ Personalizado
- ❌ ~~Valores positivos~~ (oculto - no hay valores > 0)
- ✅ Valores negativos
- ✅ Valores mayores a la media
- ✅ Valores menores a la media
- ✅ Top 25%
- ✅ Último 25%

### **Escenario 6: Pokemon Orders (Caso Real)**

**Datos**: `[76, 77, 78, 81, 82, 83]`
**Presets mostrados**:

- ✅ Personalizado
- ✅ Valores positivos
- ❌ ~~Valores negativos~~ (oculto - no hay datos negativos)
- ✅ Valores mayores a la media
- ✅ Valores menores a la media
- ✅ Top 25%
- ✅ Último 25%

---

## 💻 Lógica de Código

```typescript
// Detectar tipos de valores
const hasNegativeValues = numbers.some((n) => n < 0);
const hasPositiveValues = numbers.some((n) => n > 0);
const hasZero = numbers.some((n) => n === 0);

// Filtrar presets dinámicamente
const PRESETS = BASE_PRESETS.filter((preset) => {
  switch (preset.value) {
    case "negative":
      // Solo mostrar si realmente hay valores negativos
      return hasNegativeValues;
    case "positive":
      // Solo mostrar si hay valores positivos o solo hay cero
      // Si hay tanto positivos como negativos, mostrar ambos
      // Si solo hay cero, considerarlo como "positivo"
      return hasPositiveValues || (hasZero && !hasNegativeValues);
    default:
      return true; // Siempre mostrar otros presets
  }
});
```

---

## 🧪 Casos de Prueba

### **Test 1: Solo Positivos**

```typescript
const numbers = [1, 2, 3, 4, 5];
const presets = generateDynamicPresets(numbers);

expect(presets.some((p) => p.value === "positive")).toBe(true);
expect(presets.some((p) => p.value === "negative")).toBe(false);
```

### **Test 2: Solo Negativos**

```typescript
const numbers = [-5, -4, -3, -2, -1];
const presets = generateDynamicPresets(numbers);

expect(presets.some((p) => p.value === "positive")).toBe(false);
expect(presets.some((p) => p.value === "negative")).toBe(true);
```

### **Test 3: Solo Cero**

```typescript
const numbers = [0];
const presets = generateDynamicPresets(numbers);

expect(presets.some((p) => p.value === "positive")).toBe(true); // Cero = "positivo"
expect(presets.some((p) => p.value === "negative")).toBe(false);
```

### **Test 4: Cero + Negativos**

```typescript
const numbers = [0, -5, -10];
const presets = generateDynamicPresets(numbers);

expect(presets.some((p) => p.value === "positive")).toBe(false); // No hay > 0
expect(presets.some((p) => p.value === "negative")).toBe(true);
```

### **Test 5: Valores Mixtos**

```typescript
const numbers = [-5, 0, 5];
const presets = generateDynamicPresets(numbers);

expect(presets.some((p) => p.value === "positive")).toBe(true);
expect(presets.some((p) => p.value === "negative")).toBe(true);
```

---

## 🎯 Beneficios de UX

1. **Menos Confusión**: No aparecen opciones irrelevantes
2. **Interfaz Limpia**: Solo presets aplicables a los datos
3. **Mejor Performance**: Menos opciones = más rápido de usar
4. **Lógica Intuitiva**: Si no hay negativos, ¿para qué mostrar "Valores negativos"?

---

## 📊 Casos de Uso Reales

### **Pokemon Orders**

- Datos: Solo positivos (76-83)
- Resultado: Solo preset "Valores positivos"

### **Temperaturas**

- Datos: Mixtos (-10 a 30°C)
- Resultado: Ambos presets disponibles

### **Pérdidas Financieras**

- Datos: Solo negativos (-1000 a -100)
- Resultado: Solo preset "Valores negativos"

### **Contadores/IDs**

- Datos: Solo positivos (1, 2, 3...)
- Resultado: Solo preset "Valores positivos"

---

## ✅ Resultado Final

**Presets más inteligentes y relevantes** que se adaptan automáticamente a los datos, proporcionando una mejor experiencia de usuario sin opciones innecesarias.

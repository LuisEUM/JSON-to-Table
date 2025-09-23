# Estrategia para Filtros Coherentes en Datos JSON

## Problema Actual

Cuando filtramos columnas con arrays de objetos o estructuras JSON complejas, el sistema actual:
- ❌ Muestra objetos como strings planos: `{id: customFields, path: customFields, value: ...}`
- ❌ No permite filtrar por propiedades específicas de los objetos
- ❌ Los filtros son poco intuitivos para el usuario final
- ❌ No hay consistencia entre tipos de datos similares

## Análisis del Contexto

### Datos Observados
```json
// Columna customFields contiene arrays de objetos como:
[
  {
    "id": "customFields",
    "path": ["customFields"],
    "value": "CLIENTE VENTAS - Origen del Lead",
    "type": "string"
  }
]
```

### Casos de Uso Identificados
1. **Arrays de objetos estructurados** (customFields, shippingAddresses)
2. **Objetos anidados** (direcciones, configuraciones)  
3. **Arrays mixtos** (primitivos + objetos)
4. **Valores computados** (referencias, fechas procesadas)

---

## 🎯 ALTERNATIVAS DE IMPLEMENTACIÓN

## Alternativa 1: **Sistema de Filtros por Propiedades** ⭐
> **Nivel**: Frontend + Lógica
> **Complejidad**: Media
> **Compatibilidad**: Alta

### Descripción
Crear filtros específicos que permitan filtrar por propiedades de objetos de forma granular.

### Implementación

#### Frontend
```typescript
// 1. Detector de Estructura de Objetos
interface ObjectSchema {
  properties: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      frequency: number; // Cuántas veces aparece esta propiedad
      sampleValues: unknown[];
    }
  };
  isHomogeneous: boolean; // ¿Todos los objetos tienen la misma estructura?
}

// 2. Componente de Filtro Jerárquico
function ObjectPropertyFilter({
  schema,
  onApply
}: {
  schema: ObjectSchema;
  onApply: (filters: PropertyFilter[]) => void;
}) {
  // UI para seleccionar propiedades específicas
  // Ejemplo: customFields.value = "CLIENTE VENTAS"
}

// 3. Lógica de Filtrado
function filterByObjectProperty(
  items: unknown[],
  property: string,
  operator: FilterOperator,
  value: unknown
) {
  return items.filter(item => {
    const propertyValue = getNestedProperty(item, property);
    return applyOperator(propertyValue, operator, value);
  });
}
```

#### Backend (Opcional)
```typescript
// Endpoint para obtener esquemas de columnas
GET /api/table/schema/{columnId}
// Retorna ObjectSchema para optimizar filtros
```

### Pros
- ✅ Filtros granulares por propiedad
- ✅ UI intuitiva para usuarios
- ✅ Compatible con datos existentes
- ✅ No requiere migración de datos

### Contras  
- ❌ Complejidad en UI para objetos muy anidados
- ❌ Performance con arrays grandes

---

## Alternativa 2: **Normalización y Índices Invertidos** 🔥
> **Nivel**: Backend + Frontend
> **Complejidad**: Alta
> **Compatibilidad**: Media

### Descripción
Crear índices invertidos de todas las propiedades de objetos para filtrado ultra-rápido.

### Implementación

#### Backend
```typescript
// 1. Servicio de Indexación
class JsonIndexer {
  async indexDocument(doc: Record<string, unknown>) {
    const indexes = new Map<string, Set<string>>();
    
    // Crear índices para cada propiedad
    this.traverseObject(doc, '', (path, value) => {
      if (!indexes.has(path)) {
        indexes.set(path, new Set());
      }
      indexes.get(path)!.add(String(value));
    });
    
    await this.saveIndexes(indexes);
  }
  
  async query(filters: PropertyFilter[]): Promise<string[]> {
    // Usar índices para consulta super rápida
    return this.intersectIndexes(filters);
  }
}

// 2. API de Consulta Optimizada
POST /api/table/query
{
  "filters": [
    {
      "path": "customFields.value",
      "operator": "contains", 
      "value": "CLIENTE"
    }
  ]
}
```

#### Frontend
```typescript
// Cliente usa query API en lugar de filtrar localmente
const useOptimizedFilter = () => {
  const [results, setResults] = useState([]);
  
  const applyFilters = async (filters: PropertyFilter[]) => {
    const response = await fetch('/api/table/query', {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
    setResults(await response.json());
  };
  
  return { results, applyFilters };
};
```

### Pros
- ✅ Performance excepcional en datasets grandes
- ✅ Consultas complejas soportadas
- ✅ Escalable a millones de registros
- ✅ Cacheable y optimizable

### Contras
- ❌ Requiere infraestructura adicional
- ❌ Complejidad de implementación alta
- ❌ Migración de datos necesaria

---

## Alternativa 3: **Filtros Semánticos con IA** 🤖
> **Nivel**: Backend + IA
> **Complejidad**: Muy Alta  
> **Compatibilidad**: Baja

### Descripción
Usar IA para entender consultas en lenguaje natural y convertirlas a filtros JSON.

### Implementación

#### Backend
```typescript
// 1. Servicio de Procesamiento de Lenguaje Natural
class SemanticFilterService {
  async parseQuery(query: string, schema: ObjectSchema): Promise<FilterCondition[]> {
    // "Mostrar clientes que tengan dirección en Madrid"
    // → filters: [{ path: "shippingAddresses.city", operator: "equals", value: "Madrid" }]
    
    const response = await this.aiService.analyze(query, schema);
    return this.convertToFilters(response);
  }
}

// 2. API de Consulta Natural
POST /api/table/semantic-query
{
  "query": "customFields que contengan CLIENTE y sean de tipo VENTAS",
  "columnId": "customFields"
}
```

#### Frontend
```typescript
// Chat Interface para filtros
function SemanticFilterChat() {
  const [query, setQuery] = useState('');
  
  const handleQuery = async () => {
    const filters = await parseSemanticQuery(query);
    onApplyFilters(filters);
  };
  
  return (
    <div>
      <input 
        placeholder="Describe qué quieres filtrar..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button onClick={handleQuery}>🔍 Filtrar</button>
    </div>
  );
}
```

### Pros
- ✅ Experiencia de usuario revolucionaria
- ✅ No requiere conocimiento técnico
- ✅ Adaptable a cualquier estructura de datos
- ✅ Futuro-proof

### Contras
- ❌ Dependencia de servicios de IA
- ❌ Costo de implementación muy alto
- ❌ Latencia de respuesta
- ❌ Precisión variable

---

## Alternativa 4: **Filtros Dinámicos con Detección Automática** 🎯
> **Nivel**: Frontend
> **Complejidad**: Media-Baja
> **Compatibilidad**: Alta

### Descripción
Sistema que analiza automáticamente la estructura de datos y genera filtros apropiados.

### Implementación

#### Análisis Automático
```typescript
// 1. Analizador de Patrones
class DataPatternAnalyzer {
  analyzeColumn(values: unknown[]): FilterStrategy {
    const sample = values.slice(0, 100);
    
    if (this.isHomogeneousObjectArray(sample)) {
      return this.createObjectPropertyFilters(sample);
    }
    
    if (this.isEnumLike(sample)) {
      return this.createEnumFilter(sample);
    }
    
    if (this.isHierarchical(sample)) {
      return this.createHierarchicalFilter(sample);
    }
    
    return this.createGenericFilter(sample);
  }
  
  private isHomogeneousObjectArray(values: unknown[]): boolean {
    // Detectar si >80% de valores tienen la misma estructura
    const structures = values.map(v => this.getObjectStructure(v));
    return this.calculateSimilarity(structures) > 0.8;
  }
}

// 2. Factory de Filtros Adaptativos
class AdaptiveFilterFactory {
  createFilter(strategy: FilterStrategy, columnData: unknown[]) {
    switch (strategy.type) {
      case 'object-property':
        return new ObjectPropertyFilter(strategy.schema);
      case 'hierarchical':
        return new HierarchicalFilter(strategy.levels);
      case 'enum':
        return new EnumFilter(strategy.values);
      default:
        return new GenericFilter();
    }
  }
}
```

#### UI Adaptativa
```typescript
// 3. Componente de Filtro Inteligente
function SmartFilter({ columnId, data }: SmartFilterProps) {
  const strategy = useMemo(() => 
    DataPatternAnalyzer.analyzeColumn(data), [data]
  );
  
  const FilterComponent = AdaptiveFilterFactory.createFilter(strategy, data);
  
  return (
    <div>
      <h3>Filtro inteligente para {columnId}</h3>
      <p>Tipo detectado: {strategy.type}</p>
      <FilterComponent onApply={handleApply} />
    </div>
  );
}
```

### Pros
- ✅ Zero-config para usuarios
- ✅ Se adapta automáticamente
- ✅ Implementación incremental
- ✅ Mantiene simplicidad actual

### Contras
- ❌ Puede no detectar patrones complejos
- ❌ Requiere heurísticas bien ajustadas

---

## 🏆 **RECOMENDACIÓN: ALTERNATIVA 4** 

### Por qué es la mejor opción:

#### **1. Pragmatismo**
- ✅ Soluciona el problema inmediato
- ✅ No requiere infraestructura adicional
- ✅ Compatible con el sistema actual

#### **2. Escalabilidad**
- ✅ Se puede implementar incrementalmente
- ✅ Preparada para evolucionar hacia alternativas más avanzadas
- ✅ ROI inmediato

#### **3. Experiencia de Usuario**
- ✅ Filtros relevantes automáticamente  
- ✅ Reduce complejidad para el usuario
- ✅ Mantiene la flexibilidad actual

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Análisis Básico (1 semana)
1. Crear `DataPatternAnalyzer` básico
2. Implementar detección de objetos homogéneos
3. Generar filtros de propiedades simples

### Fase 2: Filtros Adaptativos (2 semanas)  
1. Implementar `ObjectPropertyFilter`
2. Crear UI para selección de propiedades
3. Integrar con sistema de filtros existente

### Fase 3: Optimización (1 semana)
1. Cachear análisis de patrones
2. Mejorar performance con memoization
3. Añadir más tipos de patrones

### Fase 4: Evolución (futuro)
- Migrar gradualmente a Alternativa 2 para performance
- Experimentar con Alternativa 3 para UX avanzada

## 🎯 RESULTADO ESPERADO

### Antes
```
Filtro customFields:
☑️ {id: customFields, path: customFields, value: CLIENTE...} 109
☑️ {id: customFields, path: customFields, value: VENTAS...} 1666
```

### Después  
```
Filtro customFields (Propiedades detectadas):
┌─ Por valor del campo:
│  ☑️ CLIENTE VENTAS - Origen del Lead    45
│  ☑️ CLIENTE INSIDERS - Estado           23  
│  ☑️ FORMACIÓN MÁSTER IBM - Edición      89
├─ Por tipo:
│  ☑️ string                              157
└─ Por path:
   ☑️ customFields                        157
```

Esta estrategia transforma filtros confusos en herramientas poderosas e intuitivas para explorar datos JSON complejos.
# Arquitectura del Sistema JSON-to-Table

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Tecnologías Principales](#tecnologías-principales)
- [Arquitectura Híbrida para Datos Extensos](#arquitectura-híbrida-para-datos-extensos)
  - [Problema: Limitaciones con Conjuntos de Datos Grandes](#problema-limitaciones-con-conjuntos-de-datos-grandes)
  - [Solución: Arquitectura de Procesamiento Híbrida](#solución-arquitectura-de-procesamiento-híbrida)
  - [Flujo de Datos](#flujo-de-datos)
- [Componentes Principales](#componentes-principales)
  - [Estado Global con Zustand](#estado-global-con-zustand)
  - [Procesador de Datos en Worker](#procesador-de-datos-en-worker)
  - [Sistema de Filtros](#sistema-de-filtros)
  - [Tablas y Visualizaciones](#tablas-y-visualizaciones)
  - [Vistas Guardadas](#vistas-guardadas)
- [Persistencia con Prisma y MongoDB](#persistencia-con-prisma-y-mongodb)
  - [Modelo de Datos](#modelo-de-datos)
  - [API Routes](#api-routes)
- [Visualizaciones con Recharts](#visualizaciones-con-recharts)
  - [Tipos de Gráficos](#tipos-de-gráficos)
  - [Integración con Filtros](#integración-con-filtros)
- [Guía de Implementación](#guía-de-implementación)
  - [Configuración Inicial](#configuración-inicial)
  - [Fases de Desarrollo](#fases-de-desarrollo)
- [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)

## Visión General

Este sistema permite visualizar, manipular y analizar grandes conjuntos de datos en formato JSON, proporcionando:

1. **Procesamiento eficiente** de archivos JSON de hasta 5MB+ sin afectar la experiencia del usuario
2. **Sistema avanzado de filtros** adaptados por tipo de datos (string, número, fecha, array)
3. **Tablas anidadas** para datos jerárquicos
4. **Visualizaciones gráficas** sincronizadas con filtros de tabla
5. **Persistencia de vistas** personalizadas por usuario
6. **Experiencia de usuario fluida** incluso con grandes volúmenes de datos

## Tecnologías Principales

| Tecnología         | Propósito               | Justificación                                                          |
| ------------------ | ----------------------- | ---------------------------------------------------------------------- |
| **Next.js**        | Framework de aplicación | Renderizado híbrido, API routes, y estructura de proyecto optimizada   |
| **Zustand**        | Gestión de estado       | Ligero, con buen manejo de actualización selectiva y persistencia      |
| **Prisma**         | ORM                     | Tipado fuerte, migraciones automáticas y API intuitiva                 |
| **MongoDB**        | Base de datos           | Flexibilidad para esquemas de vistas y configuraciones variables       |
| **Web Workers**    | Procesamiento paralelo  | Permite operaciones pesadas sin bloquear el hilo principal             |
| **TanStack Table** | Tablas interactivas     | API flexible y potente para tablas con sorting, filtering y paginación |
| **Recharts**       | Visualizaciones         | Biblioteca React para gráficos con buen rendimiento y personalización  |

## Arquitectura Híbrida para Datos Extensos

### Problema: Limitaciones con Conjuntos de Datos Grandes

Cuando se trabaja con archivos JSON de 5MB o más, surgen varios desafíos:

1. **Consumo excesivo de memoria**: Zustand almacena todo el estado en memoria JavaScript
2. **Bloqueo del hilo principal**: El procesamiento de datos grandes puede congelar la UI
3. **Re-renderizado ineficiente**: Cambios en una parte del estado provocan re-renderizado completo
4. **Serialización costosa**: La función `setState` clona el estado completo
5. **Limitaciones con LocalStorage**: Restringido a ~5MB en muchos navegadores

### Solución: Arquitectura de Procesamiento Híbrida

Implementamos una arquitectura que separa:

1. **Estado de UI (Ligero)**: Gestionado por Zustand

   - Filtros activos
   - Configuración de columnas
   - Estado de paginación
   - Vistas guardadas
   - Preferencias de visualización

2. **Datos Procesados (Pesados)**: Gestionados por Web Workers
   - Conjunto de datos original (caché de referencia)
   - Datos procesados y tipados
   - Resultados de filtros aplicados
   - Valores únicos para filtros
   - Datos para visualizaciones

```mermaid
graph TD
    A[Datos JSON Originales] --> B[DataProcessorService]
    B --> C[Web Worker]
    C --> D[Procesamiento Datos]
    D --> E[Datos Procesados]
    E --> F[Caché de Referencias]

    G[UI Estado - Zustand] <--> B
    G --> H[Filtros]
    G --> I[Configuración Tabla]
    G --> J[Vistas Guardadas]

    H --> B
    B --> K[Datos Filtrados]
    K --> L[Componente Tabla]
    K --> M[Componentes Gráficos]

    N[Base de Datos] <--> J
```

### Flujo de Datos

1. **Carga Inicial**:

   ```javascript
   loadData(rawData) {
     // Almacenar referencia sin hacerla reactiva
     this.dataCache = rawData;

     // Delegar procesamiento al worker
     this.worker.postMessage({
       action: 'PROCESS_BATCH_DATA',
       data: rawData,
       options: { sampleSize: 100 }
     });

     // Notificar estado de carga
     this.notifyListeners({ type: 'DATA_LOADING' });
   }
   ```

2. **Procesamiento en Worker**:

   ```javascript
   // En el worker (data-processor.worker.js)
   self.onmessage = function (e) {
     const { action, data, options } = e.data;

     switch (action) {
       case "PROCESS_BATCH_DATA":
         // Usar funciones existentes de data-processor.ts
         const processedRows = processBatchData(data, options);
         const columnTypes = analyzeColumnTypes(data, options.sampleSize);
         const uniqueValues = extractUniqueValues(processedRows);

         self.postMessage({
           type: "PROCESSED_BATCH",
           data: {
             processedRows,
             columnTypes,
             uniqueValues,
           },
         });
         break;

       // Otros casos (filtrado, etc.)
     }
   };
   ```

3. **Aplicación de Filtros**:

   ```javascript
   applyFilters(filters) {
     // No reprocesa datos crudos, solo filtra los ya procesados
     this.worker.postMessage({
       action: 'APPLY_FILTERS',
       filters,
       // Usa los datos ya procesados en el worker
     });
   }
   ```

4. **Actualización de UI**:

   ```javascript
   // Hook para componentes
   function useDataTable() {
     // Estado de UI desde Zustand (ligero)
     const { filters, setFilters, pagination } = useUIStore();

     // Estado local para datos procesados
     const [tableData, setTableData] = useState([]);
     const [isLoading, setIsLoading] = useState(false);

     // Efecto para suscribirse a eventos del procesador
     useEffect(() => {
       const unsubscribe = DataProcessorService.subscribe((message) => {
         switch (message.type) {
           case "DATA_PROCESSED":
           case "FILTERS_APPLIED":
             setTableData(message.data);
             setIsLoading(false);
             break;
         }
       });

       return unsubscribe;
     }, []);

     // Resto del hook...
   }
   ```

## Componentes Principales

### Estado Global con Zustand

Utilizamos Zustand para gestionar el estado de la interfaz de usuario de forma eficiente:

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store principal para la UI
const useUIStore = create(
  persist(
    (set, get) => ({
      // Estado
      filters: {},
      columnVisibility: {},
      sorting: [],
      pagination: { page: 0, pageSize: 50 },
      activeView: null,
      customViews: [],

      // Acciones
      setFilters: (filters) => {
        set({ filters });
        DataProcessorService.applyFilters(filters);
      },

      setPagination: (pagination) => {
        set({ pagination });
      },

      // Acciones para vistas
      saveCurrentView: async (viewName, description) => {
        const state = get();
        const viewConfig = {
          name: viewName,
          description: description || "",
          filters: state.filters,
          columnVisibility: state.columnVisibility,
          sorting: state.sorting,
        };

        try {
          const savedView = await ViewService.saveView(viewConfig);
          set((state) => ({
            customViews: [...state.customViews, savedView],
            activeView: savedView.id,
          }));
          return savedView;
        } catch (error) {
          console.error("Error al guardar vista:", error);
          throw error;
        }
      },

      loadView: async (viewId) => {
        try {
          const view = await ViewService.getView(viewId);
          set({
            filters: view.configuration.filters,
            columnVisibility: view.configuration.columnVisibility,
            sorting: view.configuration.sorting,
            activeView: viewId,
          });

          DataProcessorService.applyFilters(view.configuration.filters);
          return view;
        } catch (error) {
          console.error("Error al cargar vista:", error);
          throw error;
        }
      },

      // Más acciones...
    }),
    { name: "ui-settings" }
  )
);
```

### Procesador de Datos en Worker

La clase DataProcessorService actúa como intermediario entre la UI y el Web Worker:

```javascript
class DataProcessorService {
  static getInstance() {
    if (!this._instance) {
      this._instance = new DataProcessorService();
    }
    return this._instance;
  }

  constructor() {
    this.worker = new Worker(
      new URL("./data-processor.worker.js", import.meta.url)
    );
    this.dataCache = null;
    this.listeners = new Set();
    this.uniqueValues = new Map();
    this.columnTypes = new Map();

    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  handleWorkerMessage(e) {
    const { type, data } = e.data;

    switch (type) {
      case "PROCESSED_BATCH":
        this.processedData = data.processedRows;
        this.columnTypes = new Map(data.columnTypes);
        this.uniqueValues = new Map(data.uniqueValues);

        // Inicializar opciones de filtro en UI
        useUIStore.getState().initFilterOptions(this.getFilterOptions());

        this.notifyListeners({
          type: "DATA_PROCESSED",
          data: this.getVisibleData(),
        });
        break;

      case "FILTERED_DATA":
        this.filteredData = data;
        this.notifyListeners({
          type: "FILTERS_APPLIED",
          data: this.getVisibleData(),
        });
        break;

      // Otros casos...
    }
  }

  loadData(rawData) {
    this.dataCache = rawData;

    this.worker.postMessage({
      action: "PROCESS_BATCH_DATA",
      data: rawData,
      options: { sampleSize: 100 },
    });

    this.notifyListeners({
      type: "DATA_LOADING",
      count: rawData.length,
    });
  }

  applyFilters(filters) {
    this.worker.postMessage({
      action: "APPLY_FILTERS",
      filters,
    });
  }

  // Método para suscribirse a cambios
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(message) {
    this.listeners.forEach((listener) => listener(message));
  }

  // Otros métodos...
}
```

### Sistema de Filtros

Mantenemos el sistema de filtros actual pero con optimizaciones:

```javascript
// Hook para filtros específicos por tipo
function useColumnFilter(columnId) {
  const applyFilter = useContext(FilterContext);
  const columnOptions = useUIStore(
    (state) => state.columnFilterOptions[columnId] || {}
  );

  const [filterValue, setFilterValue] = useState(null);

  // Aplicar filtro de manera optimizada
  const handleFilterChange = useCallback(
    (value) => {
      setFilterValue(value);
      applyFilter(columnId, value);
    },
    [columnId, applyFilter]
  );

  return {
    filterValue,
    columnOptions,
    handleFilterChange,
  };
}
```

Los valores únicos para filtros se extraen durante el procesamiento inicial de datos y están disponibles para todos los componentes de filtro.

### Tablas y Visualizaciones

El componente `JsonTable` utiliza la arquitectura híbrida:

```javascript
function JsonTable({
  data,
  isLoading = false,
  isSecondaryTable = false,
  onArrayColumnsChange,
  parentTableInfo,
}) {
  // Reemplazar el procesamiento directo con el hook de datos
  const {
    tableData, // Datos procesados para la tabla
    isProcessing, // Estado de carga/procesamiento
    filters, // Estado actual de filtros
    columnFilterOptions, // Opciones para filtros
    pagination, // Estado de paginación
    setPagination, // Función para actualizar paginación
    loadData, // Función para cargar datos
  } = useDataTable();

  // Cargar datos cuando cambien los props
  useEffect(() => {
    if (data.length > 0) {
      loadData(data);
    }
  }, [data, loadData]);

  // El resto del componente se mantiene prácticamente igual...
}
```

### Vistas Guardadas

El sistema de vistas guardadas permite a los usuarios guardar y cargar configuraciones:

```javascript
// Componente de gestión de vistas
function ViewsManager() {
  const { customViews, activeView, saveCurrentView, loadView, deleteView } =
    useUIStore();

  const [viewName, setViewName] = useState("");
  const [viewDescription, setViewDescription] = useState("");

  const handleSaveView = async () => {
    try {
      await saveCurrentView(viewName, viewDescription);
      toast.success(`Vista "${viewName}" guardada correctamente`);
      setViewName("");
      setViewDescription("");
    } catch (error) {
      toast.error(`Error al guardar vista: ${error.message}`);
    }
  };

  return <div>{/* UI para guardar, cargar y eliminar vistas */}</div>;
}
```

## Persistencia con Prisma y MongoDB

### Modelo de Datos

Configuramos Prisma con MongoDB para gestionar las vistas guardadas:

```prisma
// schema.prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["mongodb"]
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String?
  views     View[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model View {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  description  String?
  isPublic     Boolean  @default(false)
  configuration Json     // Contiene filtros, visibilidad, ordenación, etc.
  user         User     @relation(fields: [userId], references: [id])
  userId       String   @db.ObjectId
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### API Routes

Implementamos rutas de API para gestionar las vistas:

```javascript
// app/api/views/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const views = await prisma.view.findMany({
    where: {
      OR: [{ userId: user.id }, { isPublic: true }],
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(views);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();

  const view = await prisma.view.create({
    data: {
      name: body.name,
      description: body.description,
      isPublic: body.isPublic || false,
      configuration: body.configuration,
      userId: user.id,
    },
  });

  return NextResponse.json(view);
}
```

## Visualizaciones con Recharts

### Tipos de Gráficos

Implementamos varios tipos de visualizaciones usando Recharts:

```javascript
// Hook para datos de visualización
function useChartData(columnId, chartType) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = DataProcessorService.subscribe((message) => {
      if (
        message.type === "CHART_DATA_READY" &&
        message.columnId === columnId
      ) {
        setChartData(message.data);
        setIsLoading(false);
      }
    });

    // Solicitar datos para el gráfico
    setIsLoading(true);
    DataProcessorService.getChartData(columnId, chartType);

    return unsubscribe;
  }, [columnId, chartType]);

  return { chartData, isLoading };
}

// Componente de gráfico dinámico
function DynamicChart({ columnId, chartType = "bar" }) {
  const { chartData, isLoading } = useChartData(columnId, chartType);

  if (isLoading) {
    return <div>Cargando gráfico...</div>;
  }

  switch (chartType) {
    case "bar":
      return (
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey='value' fill='#8884d8' />
        </BarChart>
      );

    case "pie":
      return (
        <PieChart width={600} height={300}>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            outerRadius={100}
            fill='#8884d8'
            dataKey='value'
            label
          />
          <Tooltip />
        </PieChart>
      );

    // Otros tipos de gráficos...
  }
}
```

### Integración con Filtros

Los gráficos se actualizan automáticamente cuando se aplican filtros a la tabla:

```javascript
// En DataProcessorService
getChartData(columnId, chartType) {
  // Enviar mensaje al worker para procesar datos de gráfico
  this.worker.postMessage({
    action: 'PROCESS_FOR_CHART',
    columnId,
    chartType,
    // Los filtros actuales ya están aplicados en los datos filtrados
    useFilteredData: true
  });
}

// En el worker
case 'PROCESS_FOR_CHART':
  const { columnId, chartType, useFilteredData } = e.data;
  const dataToUse = useFilteredData ? filteredData : processedData;

  // Procesar datos para el formato requerido por el gráfico
  const chartData = processForChartType(dataToUse, columnId, chartType);

  self.postMessage({
    type: 'CHART_DATA_READY',
    columnId,
    data: chartData
  });
  break;
```

## Guía de Implementación

### Configuración Inicial

1. **Instalación de dependencias**:

   ```bash
   npm install zustand recharts next-auth
   npm install prisma @prisma/client
   npm install -D prisma-dbml-generator
   ```

2. **Configuración de Prisma**:

   ```bash
   npx prisma init
   # Editar schema.prisma
   npx prisma db push
   ```

3. **Configuración de MongoDB Atlas**:

   - Crear un cluster en MongoDB Atlas
   - Configurar usuario y contraseña
   - Añadir IP a la lista de acceso
   - Obtener la cadena de conexión

4. **Variables de entorno**:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/json-to-table?retryWrites=true&w=majority
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=http://localhost:3000
   ```

### Fases de Desarrollo

1. **Fase 1: Arquitectura Híbrida**

   - Implementar DataProcessorService y Worker
   - Adaptar componentes existentes
   - Pruebas de rendimiento con datos grandes

2. **Fase 2: Sistema de Vistas**

   - Configurar Prisma y MongoDB
   - Implementar API routes para vistas
   - Desarrollar UI para gestión de vistas

3. **Fase 3: Visualizaciones**
   - Integrar Recharts
   - Crear visualizaciones dinámicas
   - Sincronizar con filtros

## Consideraciones de Rendimiento

Para mantener un rendimiento óptimo con conjuntos de datos grandes:

1. **Muestreo Adaptativo**: Utilizar técnicas de muestreo para visualizaciones con muchos puntos de datos
2. **Carga Progresiva**: Implementar carga progresiva para tablas y gráficos
3. **Caché**: Utilizar estrategias de caché para resultados de filtros comunes
4. **Compresión**: Comprimir datos entre cliente y servidor
5. **Paginación Servidor**: Considerar paginación en servidor para conjuntos extremadamente grandes
6. **Optimización de Memoria**: Implementar limpieza periódica de datos no utilizados

---

Este documento establece las bases para la implementación del sistema JSON-to-Table con soporte para conjuntos de datos extensos, visualizaciones interactivas y persistencia de configuraciones por usuario.

import { DataSourceType } from "../constants/data-sources";

// Tipo base para los parámetros de consulta
export type QueryParams = Record<string, string | number | boolean | undefined>;

// Tipo base para los datos
export type DataRecord = Record<string, unknown>;

// Interfaz base para todos los orígenes de datos
export interface DataSource<T extends DataRecord = DataRecord> {
  type: DataSourceType;
  connect(): Promise<boolean>;
  fetchData(params?: QueryParams): Promise<T[]>;
  disconnect(): Promise<void>;
}

// Interfaces específicas para cada tipo de fuente de datos
export interface FileDataSource<T extends DataRecord = DataRecord>
  extends DataSource<T> {
  type: DataSourceType.JSON_FILE | DataSourceType.CSV_FILE;
  filePath?: string;
  fileContent?: string;
  parseFile(): Promise<T[]>;
}

export interface ApiDataSource<T extends DataRecord = DataRecord>
  extends DataSource<T> {
  type: DataSourceType.HOLDED | DataSourceType.API;
  apiKey?: string;
  baseUrl: string;
  endpoint?: string;
  headers?: Record<string, string>;
}

export interface DatabaseDataSource<T extends DataRecord = DataRecord>
  extends DataSource<T> {
  type: DataSourceType.DATABASE;
  connectionString?: string;
  databaseName?: string;
  query?: string;
}

// Interfaces para las respuestas
export interface DataSourceResponse<T extends DataRecord = DataRecord> {
  success: boolean;
  data?: T[];
  error?: string;
  metadata?: {
    totalCount?: number;
    timestamp: number;
    source: DataSourceType;
  };
}

// Tipo para los parámetros de conexión
export type ConnectionParams = {
  // Parámetros comunes
  name?: string;
  description?: string;

  // Parámetros específicos de archivo
  filePath?: string;
  fileContent?: string;

  // Parámetros específicos de API
  apiKey?: string;
  baseUrl?: string;
  endpoint?: string;
  headers?: Record<string, string>;

  // Parámetros específicos de base de datos
  connectionString?: string;
  databaseName?: string;
  query?: string;
};

// Interfaces para la configuración
export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  connectionParams: ConnectionParams;
  lastUsed?: Date;
  isDefault?: boolean;
}

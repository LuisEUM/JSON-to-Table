import {
  DataSource,
  DataSourceConfig,
  ConnectionParams,
  DataRecord,
} from "../../interfaces/data-source";
import { DataSourceType } from "../../constants/data-sources";
import {
  HoldedDataSourceService,
  HoldedConfig,
} from "./holded-data-source.service";
import {
  JsonFileDataSourceService,
  JsonFileConfig,
} from "./json-file-data-source.service";

// Esta clase implementa el patrón Factory Method para la creación
// de diferentes fuentes de datos según el tipo
export class DataSourceFactory {
  private static instance: DataSourceFactory;

  // Patrón Singleton para acceder a la fábrica desde cualquier parte
  public static getInstance(): DataSourceFactory {
    if (!DataSourceFactory.instance) {
      DataSourceFactory.instance = new DataSourceFactory();
    }
    return DataSourceFactory.instance;
  }

  private constructor() {
    // Constructor privado para Singleton
  }

  // Método factory principal
  public createDataSource<T extends DataRecord = DataRecord>(
    config: DataSourceConfig
  ): DataSource<T> {
    switch (config.type) {
      case DataSourceType.HOLDED:
        return this.createHoldedDataSource<T>(
          config.connectionParams as HoldedConfig
        );
      case DataSourceType.JSON_FILE:
        return this.createJsonFileDataSource<T>(
          config.connectionParams as JsonFileConfig
        );
      case DataSourceType.CSV_FILE:
        // Implementación pendiente
        throw new Error("Fuente de datos CSV no implementada aún");
      case DataSourceType.API:
        // Implementación pendiente
        throw new Error("Fuente de datos API genérica no implementada aún");
      case DataSourceType.DATABASE:
        // Implementación pendiente
        throw new Error("Fuente de datos de base de datos no implementada aún");
      default:
        throw new Error(`Tipo de fuente de datos no soportado: ${config.type}`);
    }
  }

  // Métodos específicos de creación
  private createHoldedDataSource<T extends DataRecord = DataRecord>(
    config: HoldedConfig
  ): HoldedDataSourceService<T> {
    return new HoldedDataSourceService<T>(config);
  }

  private createJsonFileDataSource<T extends DataRecord = DataRecord>(
    config: JsonFileConfig
  ): JsonFileDataSourceService<T> {
    return new JsonFileDataSourceService<T>(config);
  }

  // Método para crear una instancia a partir de parámetros básicos (para UI)
  public createDataSourceFromType<T extends DataRecord = DataRecord>(
    type: DataSourceType,
    params?: ConnectionParams
  ): DataSource<T> {
    const config: DataSourceConfig = {
      id: `temp-${Date.now()}`,
      name: `Temporal ${type}`,
      type: type,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "temp-user",
      connectionParams: params || {},
    };

    return this.createDataSource<T>(config);
  }
}

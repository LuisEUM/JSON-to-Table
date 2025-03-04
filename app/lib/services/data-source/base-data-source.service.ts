import {
  DataSource,
  DataSourceResponse,
  DataRecord,
  QueryParams,
} from "../../interfaces/data-source";
import { DataSourceType } from "../../constants/data-sources";

// Clase base abstracta que implementa la interfaz DataSource
export abstract class BaseDataSourceService<T extends DataRecord = DataRecord>
  implements DataSource<T>
{
  protected isConnected = false;
  protected lastError: string | null = null;

  constructor(public type: DataSourceType) {}

  abstract connect(): Promise<boolean>;
  abstract fetchData(params?: QueryParams): Promise<T[]>;

  async disconnect(): Promise<void> {
    this.isConnected = false;
    return Promise.resolve();
  }

  protected createSuccessResponse(data: T[]): DataSourceResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        totalCount: data.length,
        timestamp: Date.now(),
        source: this.type,
      },
    };
  }

  protected createErrorResponse(error: string): DataSourceResponse<T> {
    this.lastError = error;
    return {
      success: false,
      error,
      metadata: {
        timestamp: Date.now(),
        source: this.type,
      },
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getLastError(): string | null {
    return this.lastError;
  }
}

import { BaseDataSourceService } from "./base-data-source.service";
import {
  ApiDataSource,
  DataSourceResponse,
  DataRecord,
} from "../../interfaces/data-source";
import { DataSourceType } from "../../constants/data-sources";

export interface HoldedConfig {
  apiKey: string;
  endpoint: string;
  moduleType?: string;
  limit?: number;
  offset?: number;
}

export interface HoldedData extends DataRecord {
  id: string;
  [key: string]: unknown;
}

// Definir una interfaz para el resultado de la conexión
export interface ConnectionStatus extends DataRecord {
  connected: boolean;
  timestamp: number;
}

export class HoldedDataSourceService<T extends HoldedData = HoldedData>
  extends BaseDataSourceService
  implements ApiDataSource<T>
{
  public apiKey?: string;
  public baseUrl = "https://api.holded.com/api";
  public endpoint?: string;
  public headers: Record<string, string> = {};
  public override type: DataSourceType.HOLDED = DataSourceType.HOLDED;

  constructor(config?: Partial<HoldedConfig>) {
    super(DataSourceType.HOLDED);

    if (config) {
      this.apiKey = config.apiKey;
      this.endpoint = config.endpoint;
      this.updateHeaders();
    }
  }

  private updateHeaders() {
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.apiKey) {
      this.headers["key"] = this.apiKey;
    }
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error("API Key de Holded no configurada");
      }

      // Verificar conexión haciendo una petición simple
      const response = await fetch(`${this.baseUrl}/invoicing/v1/warehouses`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error al conectar con Holded: ${
            errorData.message || response.statusText
          }`
        );
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error desconocido al conectar con Holded";
      return false;
    }
  }

  async fetchData(params?: Partial<HoldedConfig>): Promise<T[]> {
    try {
      if (!this.isConnected && !(await this.connect())) {
        throw new Error("No se pudo establecer conexión con Holded");
      }

      const moduleType = params?.moduleType || "invoicing";
      const endpoint = params?.endpoint || this.endpoint || "documents";
      const limit = params?.limit || 100;
      const offset = params?.offset || 0;

      const url = `${this.baseUrl}/${moduleType}/v1/${endpoint}?limit=${limit}&offset=${offset}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error al obtener datos de Holded: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? (data as T[]) : [data as T];
    } catch (error) {
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener datos de Holded";
      return [];
    }
  }

  async checkConnection(): Promise<DataSourceResponse<ConnectionStatus>> {
    try {
      const isConnected = await this.connect();
      const connectionStatus: ConnectionStatus = {
        connected: isConnected,
        timestamp: Date.now(),
      };
      return this.createConnectionResponse([connectionStatus]);
    } catch (error) {
      return this.createConnectionErrorResponse(
        error instanceof Error
          ? error.message
          : "Error al verificar conexión con Holded"
      );
    }
  }

  // Métodos específicos para respuestas de conexión
  protected createConnectionResponse(
    data: ConnectionStatus[]
  ): DataSourceResponse<ConnectionStatus> {
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

  protected createConnectionErrorResponse(
    error: string
  ): DataSourceResponse<ConnectionStatus> {
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

  // Métodos específicos de Holded
  async getClients(): Promise<DataSourceResponse<T>> {
    try {
      const clients = await this.fetchData({
        moduleType: "invoicing",
        endpoint: "contacts",
      });
      return {
        success: true,
        data: clients,
        metadata: {
          totalCount: clients.length,
          timestamp: Date.now(),
          source: this.type,
        },
      };
    } catch (error) {
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error al obtener clientes de Holded";
      return {
        success: false,
        error: this.lastError,
        metadata: {
          timestamp: Date.now(),
          source: this.type,
        },
      };
    }
  }

  async getInvoices(): Promise<DataSourceResponse<T>> {
    try {
      const invoices = await this.fetchData({
        moduleType: "invoicing",
        endpoint: "documents/invoice",
      });
      return {
        success: true,
        data: invoices,
        metadata: {
          totalCount: invoices.length,
          timestamp: Date.now(),
          source: this.type,
        },
      };
    } catch (error) {
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error al obtener facturas de Holded";
      return {
        success: false,
        error: this.lastError,
        metadata: {
          timestamp: Date.now(),
          source: this.type,
        },
      };
    }
  }

  async getProducts(): Promise<DataSourceResponse<T>> {
    try {
      const products = await this.fetchData({
        moduleType: "invoicing",
        endpoint: "items",
      });
      return {
        success: true,
        data: products,
        metadata: {
          totalCount: products.length,
          timestamp: Date.now(),
          source: this.type,
        },
      };
    } catch (error) {
      this.lastError =
        error instanceof Error
          ? error.message
          : "Error al obtener productos de Holded";
      return {
        success: false,
        error: this.lastError,
        metadata: {
          timestamp: Date.now(),
          source: this.type,
        },
      };
    }
  }
}
